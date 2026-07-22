import type { Request, Response } from "express";
import { z } from "zod";
import {
  Supplier,
  SUPPLIER_STATUSES,
  PAYMENT_TERMS,
} from "./supplier.model.js";
import {
  PurchaseOrder,
  PO_STATUSES,
  PAYMENT_METHODS,
} from "./purchase-order.model.js";
import { Product } from "../products/product.model.js";
import { StockMovement } from "../inventory/stock-movement.model.js";
import { ok, fail } from "../response/api-response.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

// ── Zod schemas ───────────────────────────────────────────────────────────────

const addressSchema = z.object({
  line1: z.string().min(1, "Address line 1 is required").max(200).trim(),
  line2: z.string().max(200).trim().optional(),
  city: z.string().min(1, "City is required").max(100).trim(),
  state: z.string().min(1, "State is required").max(100).trim(),
  pincode: z.string().min(1, "Pincode is required").max(10).trim(),
});

const createSupplierSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(300).trim(),
  contactPerson: z.string().min(1, "Contact person is required").max(200).trim(),
  phone: z.string().min(1, "Phone is required").max(20).trim(),
  email: z.string().email("Invalid email").max(200).trim(),
  gstNumber: z.string().max(20).trim().optional(),
  address: addressSchema,
  paymentTerms: z.enum(PAYMENT_TERMS as unknown as [string, ...string[]]),
  customPaymentDays: z.coerce.number().int().min(0).optional(),
  notes: z.string().max(1000).trim().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(SUPPLIER_STATUSES as unknown as [string, ...string[]]),
});

const createPOSchema = z.object({
  supplier: z.string().min(1, "Supplier is required"),
  items: z
    .array(
      z.object({
        product: z.string().min(1),
        productName: z.string().min(1),
        quantity: z.coerce.number().int().min(1),
        unitCost: z.coerce.number().min(0),
      }),
    )
    .min(1, "At least one item is required"),
  expectedDeliveryDate: z.string().optional(),
  gstAmount: z.coerce.number().min(0).optional(),
  invoiceNumber: z.string().max(100).trim().optional(),
  notes: z.string().max(1000).trim().optional(),
});

const updatePOStatusSchema = z.object({
  status: z.enum(PO_STATUSES as unknown as [string, ...string[]]),
});

const addPaymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.string().optional(),
  method: z.enum(PAYMENT_METHODS as unknown as [string, ...string[]]),
  reference: z.string().max(200).trim().optional(),
  notes: z.string().max(500).trim().optional(),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function paiseToRupees(paise: number): number {
  return paise / 100;
}

function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

function formatSupplier(doc: Record<string, unknown>) {
  return {
    ...doc,
    totalPurchases: paiseToRupees(doc["totalPurchases"] as number),
    pendingPayments: paiseToRupees(doc["pendingPayments"] as number),
    paidAmount: paiseToRupees(doc["paidAmount"] as number),
  };
}

function formatPO(doc: Record<string, unknown>) {
  const items = (doc["items"] as Array<Record<string, unknown>>).map((item) => ({
    ...item,
    unitCost: paiseToRupees(item["unitCost"] as number),
    total: paiseToRupees(item["total"] as number),
  }));
  const payments = (doc["payments"] as Array<Record<string, unknown>>).map((p) => ({
    ...p,
    amount: paiseToRupees(p["amount"] as number),
  }));
  return {
    ...doc,
    items,
    payments,
    subtotal: paiseToRupees(doc["subtotal"] as number),
    gstAmount: paiseToRupees(doc["gstAmount"] as number),
    totalAmount: paiseToRupees(doc["totalAmount"] as number),
    paidAmount: paiseToRupees(doc["paidAmount"] as number),
    remainingBalance: paiseToRupees(doc["remainingBalance"] as number),
  };
}

async function generateOrderNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const count = await PurchaseOrder.countDocuments();
  const seq = (count + 1).toString().padStart(4, "0");
  return `PO-${year}${month}-${seq}`;
}

// ── Supplier CRUD ─────────────────────────────────────────────────────────────

export async function listSuppliers(req: Request, res: Response): Promise<void> {
  const {
    page = "1",
    limit = "20",
    search = "",
    status = "",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const filter: Record<string, unknown> = {};
  if (search.trim()) {
    filter["$text"] = { $search: search.trim() };
  }
  if (status && (SUPPLIER_STATUSES as readonly string[]).includes(status)) {
    filter["status"] = status;
  }

  const sortDir = sortOrder === "asc" ? 1 : -1;
  const sort: Record<string, 1 | -1> = {};
  sort[sortBy] = sortDir;

  const [suppliers, total] = await Promise.all([
    Supplier.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
    Supplier.countDocuments(filter),
  ]);

  res.status(200).json(
    ok(suppliers.map(formatSupplier), {
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    }),
  );
}

export async function getSupplier(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const supplier = await Supplier.findById(id).lean();
  if (!supplier) {
    res.status(404).json(fail("NOT_FOUND", "Supplier not found"));
    return;
  }

  // Fetch recent POs for this supplier
  const recentPOs = await PurchaseOrder.find({ supplier: id })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  res.status(200).json(
    ok({
      ...formatSupplier(supplier as unknown as Record<string, unknown>),
      recentPurchaseOrders: recentPOs.map(formatPO),
    }),
  );
}

export async function createSupplier(req: Request, res: Response): Promise<void> {
  const parsed = createSupplierSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(
      fail(
        "VALIDATION_ERROR",
        "Invalid input",
        parsed.error.flatten().fieldErrors as Record<string, unknown>,
      ),
    );
    return;
  }

  // Check GST uniqueness if provided
  if (parsed.data.gstNumber) {
    const exists = await Supplier.exists({ gstNumber: parsed.data.gstNumber });
    if (exists) {
      res.status(409).json(fail("CONFLICT", "GST number already registered"));
      return;
    }
  }

  // Check email uniqueness
  const emailExists = await Supplier.exists({ email: parsed.data.email });
  if (emailExists) {
    res.status(409).json(fail("CONFLICT", "Email already registered"));
    return;
  }

  const supplier = await Supplier.create(parsed.data);
  res.status(201).json(ok(formatSupplier(supplier.toObject() as unknown as Record<string, unknown>)));
}

export async function updateSupplier(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const parsed = createSupplierSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(
      fail(
        "VALIDATION_ERROR",
        "Invalid input",
        parsed.error.flatten().fieldErrors as Record<string, unknown>,
      ),
    );
    return;
  }

  const existing = await Supplier.findById(id);
  if (!existing) {
    res.status(404).json(fail("NOT_FOUND", "Supplier not found"));
    return;
  }

  // Check GST uniqueness if changing
  if (parsed.data.gstNumber && parsed.data.gstNumber !== existing.gstNumber) {
    const gstExists = await Supplier.exists({
      gstNumber: parsed.data.gstNumber,
      _id: { $ne: id },
    });
    if (gstExists) {
      res.status(409).json(fail("CONFLICT", "GST number already registered"));
      return;
    }
  }

  // Check email uniqueness if changing
  if (parsed.data.email && parsed.data.email !== existing.email) {
    const emailExists = await Supplier.exists({
      email: parsed.data.email,
      _id: { $ne: id },
    });
    if (emailExists) {
      res.status(409).json(fail("CONFLICT", "Email already registered"));
      return;
    }
  }

  const updated = await Supplier.findByIdAndUpdate(id, parsed.data, {
    new: true,
    runValidators: true,
  }).lean();

  res.status(200).json(ok(formatSupplier(updated as unknown as Record<string, unknown>)));
}

export async function updateSupplierStatus(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params as { id: string };
  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(
      fail(
        "VALIDATION_ERROR",
        "Invalid input",
        parsed.error.flatten().fieldErrors as Record<string, unknown>,
      ),
    );
    return;
  }

  const supplier = await Supplier.findByIdAndUpdate(
    id,
    { status: parsed.data.status },
    { new: true, runValidators: true },
  ).lean();

  if (!supplier) {
    res.status(404).json(fail("NOT_FOUND", "Supplier not found"));
    return;
  }

  res.status(200).json(ok(formatSupplier(supplier as unknown as Record<string, unknown>)));
}

export async function deleteSupplier(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  // Check if supplier has active POs
  const activePOs = await PurchaseOrder.exists({
    supplier: id,
    status: { $in: ["pending", "confirmed"] },
  });
  if (activePOs) {
    res.status(400).json(
      fail("VALIDATION_ERROR", "Cannot delete supplier with active purchase orders"),
    );
    return;
  }

  const supplier = await Supplier.findByIdAndDelete(id);
  if (!supplier) {
    res.status(404).json(fail("NOT_FOUND", "Supplier not found"));
    return;
  }

  res.status(200).json(ok({ message: "Supplier deleted" }));
}

// ── Purchase Orders ───────────────────────────────────────────────────────────

export async function listPurchaseOrders(
  req: Request,
  res: Response,
): Promise<void> {
  const {
    page = "1",
    limit = "20",
    supplier = "",
    status = "",
    search = "",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const filter: Record<string, unknown> = {};
  if (supplier) filter["supplier"] = supplier;
  if (status && (PO_STATUSES as readonly string[]).includes(status)) {
    filter["status"] = status;
  }
  if (search.trim()) {
    filter["$or"] = [
      { orderNumber: { $regex: search.trim(), $options: "i" } },
      { invoiceNumber: { $regex: search.trim(), $options: "i" } },
    ];
  }

  const sortDir = sortOrder === "asc" ? 1 : -1;
  const sort: Record<string, 1 | -1> = {};
  sort[sortBy] = sortDir;

  const [orders, total] = await Promise.all([
    PurchaseOrder.find(filter)
      .populate("supplier", "companyName contactPerson")
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    PurchaseOrder.countDocuments(filter),
  ]);

  res.status(200).json(
    ok(orders.map(formatPO), {
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    }),
  );
}

export async function getPurchaseOrder(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params as { id: string };
  const order = await PurchaseOrder.findById(id)
    .populate("supplier", "companyName contactPerson phone email gstNumber address paymentTerms")
    .populate("items.product", "name sku unit imageUrl")
    .populate("payments.createdBy", "name email")
    .lean();

  if (!order) {
    res.status(404).json(fail("NOT_FOUND", "Purchase order not found"));
    return;
  }

  res.status(200).json(ok(formatPO(order as unknown as Record<string, unknown>)));
}

export async function createPurchaseOrder(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = createPOSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(
      fail(
        "VALIDATION_ERROR",
        "Invalid input",
        parsed.error.flatten().fieldErrors as Record<string, unknown>,
      ),
    );
    return;
  }

  const clerkId = (req as AuthenticatedRequest).auth?.userId;
  if (!clerkId) {
    res.status(401).json(fail("UNAUTHORIZED", "Not authenticated"));
    return;
  }

  // Validate supplier exists
  const supplier = await Supplier.findById(parsed.data.supplier);
  if (!supplier) {
    res.status(400).json(fail("VALIDATION_ERROR", "Supplier not found"));
    return;
  }

  // Calculate totals (prices in paise)
  let subtotalPaise = 0;
  for (const item of parsed.data.items) {
    const unitCostPaise = rupeesToPaise(item.unitCost);
    const totalPaise = unitCostPaise * item.quantity;
    subtotalPaise += totalPaise;
  }

  const gstAmountPaise = rupeesToPaise(parsed.data.gstAmount ?? 0);
  const totalAmountPaise = subtotalPaise + gstAmountPaise;

  const orderNumber = await generateOrderNumber();

  const order = await PurchaseOrder.create({
    orderNumber,
    supplier: parsed.data.supplier,
    items: parsed.data.items.map((item) => ({
      product: item.product,
      productName: item.productName,
      quantity: item.quantity,
      unitCost: rupeesToPaise(item.unitCost),
      total: rupeesToPaise(item.unitCost) * item.quantity,
    })),
    orderDate: new Date(),
    expectedDeliveryDate: parsed.data.expectedDeliveryDate
      ? new Date(parsed.data.expectedDeliveryDate)
      : undefined,
    status: "draft",
    subtotal: subtotalPaise,
    gstAmount: gstAmountPaise,
    totalAmount: totalAmountPaise,
    paidAmount: 0,
    remainingBalance: totalAmountPaise,
    invoiceNumber: parsed.data.invoiceNumber,
    notes: parsed.data.notes,
    createdBy: clerkId as unknown as never,
  });

  // Update supplier stats
  await Supplier.findByIdAndUpdate(parsed.data.supplier, {
    $inc: { totalOrders: 1 },
  });

  const populated = await order.populate(
    "supplier",
    "companyName contactPerson",
  );

  res.status(201).json(ok(formatPO(populated.toObject() as unknown as Record<string, unknown>)));
}

export async function updatePOStatus(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params as { id: string };
  const parsed = updatePOStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(
      fail(
        "VALIDATION_ERROR",
        "Invalid input",
        parsed.error.flatten().fieldErrors as Record<string, unknown>,
      ),
    );
    return;
  }

  const order = await PurchaseOrder.findById(id);
  if (!order) {
    res.status(404).json(fail("NOT_FOUND", "Purchase order not found"));
    return;
  }

  const oldStatus = order.status;
  order.status = parsed.data.status as typeof order.status;

  // When received, add stock to products
  if (parsed.data.status === "received" && oldStatus !== "received") {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });

      // Create stock movement
      const product = await Product.findById(item.product).lean();
      await StockMovement.create({
        product: item.product,
        type: "purchase",
        quantity: item.quantity,
        previousStock: product ? product.stock - item.quantity : 0,
        newStock: product ? product.stock : item.quantity,
        reference: order.orderNumber,
        batchNumber: order.orderNumber,
        unitCost: item.unitCost,
        notes: `Purchase from ${order.supplier}`,
        createdBy: (req as AuthenticatedRequest).auth?.userId as unknown as never,
      });
    }

    // Update supplier total purchases
    await Supplier.findByIdAndUpdate(order.supplier, {
      $inc: { totalPurchases: order.totalAmount },
    });
  }

  await order.save();

  res.status(200).json(ok(formatPO(order.toObject() as unknown as Record<string, unknown>)));
}

// ── Payments ──────────────────────────────────────────────────────────────────

export async function addPayment(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params as { id: string };
  const parsed = addPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(
      fail(
        "VALIDATION_ERROR",
        "Invalid input",
        parsed.error.flatten().fieldErrors as Record<string, unknown>,
      ),
    );
    return;
  }

  const clerkId = (req as AuthenticatedRequest).auth?.userId;
  if (!clerkId) {
    res.status(401).json(fail("UNAUTHORIZED", "Not authenticated"));
    return;
  }

  const order = await PurchaseOrder.findById(id);
  if (!order) {
    res.status(404).json(fail("NOT_FOUND", "Purchase order not found"));
    return;
  }

  const amountPaise = rupeesToPaise(parsed.data.amount);

  if (amountPaise > order.remainingBalance) {
    res.status(400).json(
      fail("VALIDATION_ERROR", "Payment amount exceeds remaining balance"),
    );
    return;
  }

  order.payments.push({
    amount: amountPaise,
    date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
    method: parsed.data.method as "cash" | "upi" | "bank_transfer" | "cheque" | "card" | "other",
    ...(parsed.data.reference !== undefined && { reference: parsed.data.reference }),
    ...(parsed.data.notes !== undefined && { notes: parsed.data.notes }),
    createdBy: clerkId as unknown as never,
  } as never);

  order.paidAmount += amountPaise;
  order.remainingBalance -= amountPaise;

  await order.save();

  // Update supplier payment stats
  await Supplier.findByIdAndUpdate(order.supplier, {
    $inc: {
      paidAmount: amountPaise,
      pendingPayments: -amountPaise,
    },
  });

  res.status(200).json(ok(formatPO(order.toObject() as unknown as Record<string, unknown>)));
}

export async function listPayments(
  req: Request,
  res: Response,
): Promise<void> {
  const {
    page = "1",
    limit = "20",
    supplier = "",
    sortOrder = "desc",
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  // Build aggregate pipeline to unwind payments
  const matchFilter: Record<string, unknown> = {};
  if (supplier) matchFilter["supplier"] = supplier;

  const [payments, totalAgg] = await Promise.all([
    PurchaseOrder.aggregate([
      { $match: matchFilter },
      { $unwind: "$payments" },
      {
        $lookup: {
          from: "suppliers",
          localField: "supplier",
          foreignField: "_id",
          as: "supplierInfo",
        },
      },
      { $unwind: "$supplierInfo" },
      {
        $project: {
          _id: "$payments._id",
          orderId: "$_id",
          orderNumber: 1,
          supplierId: "$supplier",
          supplierName: "$supplierInfo.companyName",
          amount: "$payments.amount",
          date: "$payments.date",
          method: "$payments.method",
          reference: "$payments.reference",
          notes: "$payments.notes",
        },
      },
      { $sort: { date: sortOrder === "asc" ? 1 : -1 } },
      { $skip: skip },
      { $limit: limitNum },
    ]),
    PurchaseOrder.aggregate([
      { $match: matchFilter },
      { $unwind: "$payments" },
      { $count: "total" },
    ]),
  ]);

  const total = totalAgg[0]?.total ?? 0;
  const formattedPayments = payments.map((p: Record<string, unknown>) => ({
    ...p,
    amount: paiseToRupees(p["amount"] as number),
  }));

  res.status(200).json(
    ok(formattedPayments, {
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    }),
  );
}

// ── Dashboard Stats ───────────────────────────────────────────────────────────

export async function getSupplierStats(
  _req: Request,
  res: Response,
): Promise<void> {
  const [total, active, inactive, blacklisted, purchaseAgg, pendingAgg] =
    await Promise.all([
      Supplier.countDocuments(),
      Supplier.countDocuments({ status: "active" }),
      Supplier.countDocuments({ status: "inactive" }),
      Supplier.countDocuments({ status: "blacklisted" }),
      Supplier.aggregate([
        {
          $group: {
            _id: null,
            totalPurchases: { $sum: "$totalPurchases" },
            totalPaid: { $sum: "$paidAmount" },
            totalPending: { $sum: "$pendingPayments" },
          },
        },
      ]),
      PurchaseOrder.aggregate([
        { $match: { status: { $in: ["pending", "confirmed"] } } },
        {
          $group: {
            _id: null,
            pendingOrders: { $sum: 1 },
            pendingAmount: { $sum: "$remainingBalance" },
          },
        },
      ]),
    ]);

  const pAgg = purchaseAgg[0] ?? {
    totalPurchases: 0,
    totalPaid: 0,
    totalPending: 0,
  };
  const pendingAggData = pendingAgg[0] ?? {
    pendingOrders: 0,
    pendingAmount: 0,
  };

  res.status(200).json(
    ok({
      total,
      active,
      inactive,
      blacklisted,
      totalPurchases: pAgg.totalPurchases,
      totalPaid: pAgg.totalPaid,
      totalPending: pAgg.totalPending,
      pendingOrders: pendingAggData.pendingOrders,
      pendingAmount: pendingAggData.pendingAmount,
    }),
  );
}
