import type { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { Order, type IOrder } from "./order.model.js";
import { Product } from "../products/product.model.js";
import { StockMovement } from "../inventory/stock-movement.model.js";
import { AppUser } from "../users/app-user.model.js";
import { CustomerProfile } from "../customers/customer.model.js";
import { ok, fail } from "../response/api-response.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { logger } from "../../core/logging/logger.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

const rupeesToPaise = (rupees: number) => Math.round(rupees * 100);
const paiseToRupees = (paise: number) => paise / 100;

async function generateOrderId(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const prefix = `ORD-${yy}${mm}-`;

  const lastOrder = await Order.findOne({ orderId: new RegExp(`^${prefix}`) })
    .sort({ createdAt: -1 })
    .lean();

  let seq = 1;
  if (lastOrder) {
    const lastNum = lastOrder.orderId.split("-").pop();
    if (lastNum) {
      seq = parseInt(lastNum, 10) + 1;
    }
  }

  return `${prefix}${String(seq).padStart(4, "0")}`;
}

function formatOrder(doc: IOrder) {
  const obj = doc.toObject();
  return {
    ...obj,
    subtotal: paiseToRupees(obj.subtotal),
    totalGST: paiseToRupees(obj.totalGST),
    deliveryCharges: paiseToRupees(obj.deliveryCharges),
    discount: paiseToRupees(obj.discount),
    grandTotal: paiseToRupees(obj.grandTotal),
    items: obj.items.map((item: (typeof obj.items)[number]) => ({
      ...item,
      unitPrice: paiseToRupees(item.unitPrice),
      mrp: paiseToRupees(item.mrp),
      gstAmount: paiseToRupees(item.gstAmount),
      total: paiseToRupees(item.total),
    })),
  };
}

// ── Zod Schemas ──────────────────────────────────────────────────────────────

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "At least one item required"),
  shippingAddress: z.object({
    line1: z.string().min(1, "Address line 1 is required").max(200),
    line2: z.string().max(200).optional(),
    city: z.string().min(1, "City is required").max(100),
    state: z.string().min(1, "State is required").max(100),
    pincode: z.string().min(1, "Pincode is required").max(10),
  }),
  customerName: z.string().min(1, "Name is required").max(200),
  customerPhone: z.string().min(1, "Phone is required").max(20),
  customerEmail: z.string().email().optional(),
  paymentMethod: z.enum(["cod", "upi", "razorpay", "qr"]),
  deliveryCharges: z.number().nonnegative().optional(),
  discount: z.number().nonnegative().optional(),
  notes: z.string().max(1000).optional(),
});

const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(["placed", "confirmed", "processing", "shipped", "delivered", "cancelled"]),
  cancelReason: z.string().max(500).optional(),
});

const cancelOrderSchema = z.object({
  reason: z.string().min(1, "Reason is required").max(500),
});

const verifyPaymentSchema = z.object({
  action: z.enum(["approve", "reject"]),
});

// ── Customer Controllers ─────────────────────────────────────────────────────

export async function createOrder(req: Request, res: Response): Promise<void> {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const messages = Object.entries(fieldErrors)
      .map(([field, errs]) => `${field}: ${(errs ?? []).join(", ")}`)
      .join("; ");
    res.status(400).json(
      fail(messages || "Please check your input", "VALIDATION_ERROR"),
    );
    return;
  }

  const data = parsed.data;
  const clerkId = (req as AuthenticatedRequest).auth?.userId;

  if (!clerkId) {
    res.status(401).json(fail("Please sign in to place an order", "UNAUTHORIZED"));
    return;
  }

  const appUser = await AppUser.findOne({ clerkId }).lean();
  if (!appUser) {
    res.status(403).json(fail("Your account is not set up. Please contact support.", "FORBIDDEN"));
    return;
  }

  // Fetch all products in one query
  const productIds = data.items.map((item) => new mongoose.Types.ObjectId(item.productId));
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  // Validate items and calculate totals
  let subtotal = 0;
  let totalGST = 0;

  const orderItems = data.items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error(`Product not found. It may have been removed.`);
    }
    if (!product.isActive) {
      throw new Error(`"${product.name}" is no longer available`);
    }
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for "${product.name}". Only ${product.stock} available, but you requested ${item.quantity}.`);
    }

    const unitPrice = product.sellingPrice;
    const lineTotal = unitPrice * item.quantity;
    const gstAmount = Math.round(lineTotal * (product.gstPercent / 100));

    subtotal += lineTotal;
    totalGST += gstAmount;

    return {
      product: product._id,
      name: product.name,
      sku: product.sku,
      imageUrl: product.imageUrl,
      quantity: item.quantity,
      unit: product.unit,
      unitPrice,
      mrp: product.mrp,
      gstPercent: product.gstPercent,
      gstAmount,
      total: lineTotal + gstAmount,
    };
  });

  const deliveryCharges = rupeesToPaise(data.deliveryCharges ?? 0);
  const discount = rupeesToPaise(data.discount ?? 0);
  const grandTotal = subtotal + totalGST + deliveryCharges - discount;

  if (grandTotal < 0) {
    res.status(400).json(fail("Total amount cannot be negative", "VALIDATION_ERROR"));
    return;
  }

  // Execute transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderId = await generateOrderId();

    // Reduce stock for each product
    for (const item of orderItems) {
      const product = await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { new: true, session },
      );

      if (!product) {
        throw new Error(`Failed to update stock for "${item.name}". Please try again.`);
      }

      if (product.stock < 0) {
        throw new Error(`Another customer just bought "${item.name}". Only ${product.stock + item.quantity} were available.`);
      }

      await StockMovement.create(
        [
          {
            product: item.product,
            type: "sale",
            quantity: -item.quantity,
            previousStock: product.stock + item.quantity,
            newStock: product.stock,
            reference: orderId,
            unitCost: item.unitPrice,
            notes: `Online Order - ${orderId}`,
            createdBy: appUser.name,
          },
        ],
        { session },
      );
    }

    const paymentStatus = data.paymentMethod === "cod" ? "pending" : "pending_verification";

    const [order] = await Order.create(
      [
        {
          orderId,
          customer: appUser._id,
          clerkId,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail,
          shippingAddress: data.shippingAddress,
          items: orderItems,
          subtotal,
          totalGST,
          deliveryCharges,
          discount,
          grandTotal,
          paymentMethod: data.paymentMethod,
          paymentStatus,
          orderStatus: "placed",
          notes: data.notes,
        },
      ],
      { session },
    );

    // Update customer profile stats
    await CustomerProfile.findOneAndUpdate(
      { clerkId },
      {
        $inc: {
          totalOrders: 1,
          totalSpending: grandTotal / 100,
        },
      },
      { session },
    );

    await session.commitTransaction();

    res.status(201).json(ok(formatOrder(order!)));
  } catch (err) {
    await session.abortTransaction();
    const message = err instanceof Error ? err.message : "Order creation failed. Please try again.";
    logger.error({ err }, "Order creation failed");
    res.status(400).json(fail(message, "ORDER_ERROR"));
  } finally {
    session.endSession();
  }
}

export async function getMyOrders(req: Request, res: Response): Promise<void> {
  const clerkId = (req as AuthenticatedRequest).auth?.userId;
  if (!clerkId) {
    res.status(401).json(fail("Please sign in", "UNAUTHORIZED"));
    return;
  }

  const { page = "1", limit = "10", status = "" } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const filter: Record<string, unknown> = { clerkId };
  if (status) filter["orderStatus"] = status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.status(200).json(
    ok(orders.map((o) => formatOrder(o as unknown as IOrder)), {
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    }),
  );
}

export async function getMyOrder(req: Request, res: Response): Promise<void> {
  const clerkId = (req as AuthenticatedRequest).auth?.userId;
  if (!clerkId) {
    res.status(401).json(fail("Please sign in", "UNAUTHORIZED"));
    return;
  }

  const { id } = req.params as { id: string };

  const order = await Order.findOne({ _id: id, clerkId }).lean();
  if (!order) {
    res.status(404).json(fail("Order not found", "NOT_FOUND"));
    return;
  }

  res.status(200).json(ok(formatOrder(order as unknown as IOrder)));
}

export async function cancelMyOrder(req: Request, res: Response): Promise<void> {
  const clerkId = (req as AuthenticatedRequest).auth?.userId;
  if (!clerkId) {
    res.status(401).json(fail("Please sign in", "UNAUTHORIZED"));
    return;
  }

  const { id } = req.params as { id: string };
  const parsed = cancelOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(
      fail("Please provide a cancellation reason", "VALIDATION_ERROR"),
    );
    return;
  }

  const order = await Order.findOne({ _id: id, clerkId });
  if (!order) {
    res.status(404).json(fail("Order not found", "NOT_FOUND"));
    return;
  }

  if (!["placed", "confirmed"].includes(order.orderStatus)) {
    res.status(400).json(fail("Only placed or confirmed orders can be cancelled", "VALIDATION_ERROR"));
    return;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Restore stock
    for (const item of order.items) {
      const product = await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } },
        { new: true, session },
      );

      if (product) {
        await StockMovement.create(
          [
            {
              product: item.product,
              type: "return",
              quantity: item.quantity,
              previousStock: product.stock - item.quantity,
              newStock: product.stock,
              reference: order.orderId,
              notes: `Order cancelled - ${order.orderId}: ${parsed.data.reason}`,
            },
          ],
          { session },
        );
      }
    }

    order.orderStatus = "cancelled";
    order.cancelReason = parsed.data.reason;
    order.paymentStatus = order.paymentMethod === "cod" ? "pending" : "refunded";
    await order.save({ session });

    // Update customer stats
    await CustomerProfile.findOneAndUpdate(
      { clerkId },
      {
        $inc: {
          totalOrders: -1,
          totalSpending: -(order.grandTotal / 100),
        },
      },
      { session },
    );

    await session.commitTransaction();

    res.status(200).json(ok(formatOrder(order)));
  } catch (err) {
    await session.abortTransaction();
    const message = err instanceof Error ? err.message : "Failed to cancel order";
    logger.error({ err }, "Order cancellation failed");
    res.status(500).json(fail(message, "INTERNAL_ERROR"));
  } finally {
    session.endSession();
  }
}

// ── Admin Controllers ────────────────────────────────────────────────────────

export async function listAllOrders(req: Request, res: Response): Promise<void> {
  const {
    page = "1",
    limit = "20",
    status = "",
    paymentStatus = "",
    search = "",
    startDate = "",
    endDate = "",
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const filter: Record<string, unknown> = {};
  if (status) filter["orderStatus"] = status;
  if (paymentStatus) filter["paymentStatus"] = paymentStatus;
  if (search.trim()) {
    filter["$or"] = [
      { orderId: new RegExp(search.trim(), "i") },
      { customerName: new RegExp(search.trim(), "i") },
      { customerPhone: new RegExp(search.trim(), "i") },
    ];
  }
  if (startDate || endDate) {
    const dateFilter: Record<string, Date> = {};
    if (startDate) dateFilter["$gte"] = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter["$lte"] = end;
    }
    filter["createdAt"] = dateFilter;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.status(200).json(
    ok(orders.map((o) => formatOrder(o as unknown as IOrder)), {
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    }),
  );
}

export async function getOrderDetail(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const order = await Order.findById(id).lean();
  if (!order) {
    res.status(404).json(fail("Order not found", "NOT_FOUND"));
    return;
  }

  res.status(200).json(ok(formatOrder(order as unknown as IOrder)));
}

export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const parsed = updateOrderStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(
      fail("Invalid order status", "VALIDATION_ERROR"),
    );
    return;
  }

  const order = await Order.findById(id);
  if (!order) {
    res.status(404).json(fail("Order not found", "NOT_FOUND"));
    return;
  }

  // Validate status transitions
  const validTransitions: Record<string, string[]> = {
    placed: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
  };

  const allowed = validTransitions[order.orderStatus] ?? [];
  if (!allowed.includes(parsed.data.orderStatus)) {
    res.status(400).json(
      fail(`Cannot change order status from "${order.orderStatus}" to "${parsed.data.orderStatus}"`, "VALIDATION_ERROR"),
    );
    return;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // If cancelling, restore stock
    if (parsed.data.orderStatus === "cancelled") {
      for (const item of order.items) {
        const product = await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: item.quantity } },
          { new: true, session },
        );

        if (product) {
          await StockMovement.create(
            [
              {
                product: item.product,
                type: "return",
                quantity: item.quantity,
                previousStock: product.stock - item.quantity,
                newStock: product.stock,
                reference: order.orderId,
                notes: `Order cancelled by admin - ${order.orderId}: ${parsed.data.cancelReason ?? "No reason"}`,
                createdBy: "Admin",
              },
            ],
            { session },
          );
        }
      }

      // Update customer stats
      if (order.customer) {
        await CustomerProfile.findOneAndUpdate(
          { clerkId: order.clerkId },
          {
            $inc: {
              totalOrders: -1,
              totalSpending: -(order.grandTotal / 100),
            },
          },
          { session },
        );
      }

      order.paymentStatus = order.paymentMethod === "cod" ? "pending" : "refunded";
    }

    // If delivered, mark payment as paid for COD
    if (parsed.data.orderStatus === "delivered") {
      order.deliveredAt = new Date();
      if (order.paymentMethod === "cod") {
        order.paymentStatus = "paid";
      }
    }

    order.orderStatus = parsed.data.orderStatus;
    if (parsed.data.cancelReason) {
      order.cancelReason = parsed.data.cancelReason;
    }

    await order.save({ session });
    await session.commitTransaction();

    res.status(200).json(ok(formatOrder(order)));
  } catch (err) {
    await session.abortTransaction();
    const message = err instanceof Error ? err.message : "Failed to update order status";
    logger.error({ err }, "Order status update failed");
    res.status(500).json(fail(message, "INTERNAL_ERROR"));
  } finally {
    session.endSession();
  }
}

export async function verifyPayment(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const parsed = verifyPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(fail("Invalid action. Use 'approve' or 'reject'.", "VALIDATION_ERROR"));
    return;
  }

  const order = await Order.findById(id);
  if (!order) {
    res.status(404).json(fail("Order not found", "NOT_FOUND"));
    return;
  }

  if (order.paymentStatus !== "pending_verification") {
    res.status(400).json(fail("This order's payment is not pending verification", "VALIDATION_ERROR"));
    return;
  }

  if (parsed.data.action === "approve") {
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
  } else {
    order.paymentStatus = "failed";
  }

  await order.save();

  res.status(200).json(ok(formatOrder(order)));
}

export async function getOrderStats(_req: Request, res: Response): Promise<void> {
  const stats = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$grandTotal" },
        pendingOrders: {
          $sum: { $cond: [{ $in: ["$orderStatus", ["placed", "confirmed", "processing"]] }, 1, 0] },
        },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, 1, 0] },
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ["$orderStatus", "cancelled"] }, 1, 0] },
        },
        pendingPayments: {
          $sum: { $cond: [{ $in: ["$paymentStatus", ["pending", "pending_verification"]] }, "$grandTotal", 0] },
        },
      },
    },
  ]);

  const result = stats[0] ?? {
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    pendingPayments: 0,
  };

  res.status(200).json(
    ok({
      totalOrders: result.totalOrders,
      totalRevenue: paiseToRupees(result.totalRevenue),
      pendingOrders: result.pendingOrders,
      deliveredOrders: result.deliveredOrders,
      cancelledOrders: result.cancelledOrders,
      pendingPayments: paiseToRupees(result.pendingPayments),
    }),
  );
}
