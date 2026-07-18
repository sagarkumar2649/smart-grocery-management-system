import type { Request, Response } from "express";
import { z } from "zod";
import { Product } from "../products/product.model.js";
import { StockMovement, MOVEMENT_TYPES } from "./stock-movement.model.js";
import { ok, fail } from "../response/api-response.js";

// ── Zod schemas ───────────────────────────────────────────────────────────────

const adjustStockSchema = z.object({
  productId: z.string().min(1),
  type: z.enum(MOVEMENT_TYPES as unknown as [string, ...string[]]),
  quantity: z.coerce.number().refine((v) => v !== 0, "Quantity cannot be zero"),
  reference: z.string().max(100).trim().optional(),
  batchNumber: z.string().max(100).trim().optional(),
  expiryDate: z.string().optional(),
  notes: z.string().max(500).trim().optional(),
  unitCost: z.coerce.number().nonnegative().optional(),
});

const purchaseStockSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().positive("Quantity must be positive"),
  unitCost: z.coerce.number().nonnegative("Unit cost must be ≥ 0"),
  batchNumber: z.string().max(100).trim().optional(),
  expiryDate: z.string().optional(),
  reference: z.string().max(100).trim().optional(),
  notes: z.string().max(500).trim().optional(),
});

const adjustProductSettingsSchema = z.object({
  minimumStock: z.coerce.number().int().nonnegative().optional(),
  maximumStock: z.coerce.number().int().nonnegative().optional(),
  reservedStock: z.coerce.number().int().nonnegative().optional(),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const paiseToRupees = (paise: number) => paise / 100;

function formatMovement(doc: Record<string, unknown>) {
  return {
    ...doc,
    unitCost: doc["unitCost"] != null ? paiseToRupees(doc["unitCost"] as number) : null,
  };
}

// ── Dashboard Stats ───────────────────────────────────────────────────────────

export async function getInventoryDashboard(
  _req: Request,
  res: Response,
): Promise<void> {
  const [
    totalProducts,
    totalStockValue,
    lowStockProducts,
    outOfStockProducts,
    recentMovements,
    movementsByType,
    stockByCategory,
  ] = await Promise.all([
    Product.countDocuments({ isActive: true }),

    Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: { $multiply: ["$stock", "$purchasePrice"] },
          },
          totalRetailValue: {
            $sum: { $multiply: ["$stock", "$sellingPrice"] },
          },
        },
      },
    ]),

    Product.countDocuments({
      isActive: true,
      $and: [
        { stock: { $gt: 0 } },
        { $expr: { $lte: ["$stock", "$minimumStock"] } },
      ],
    }),

    Product.countDocuments({ isActive: true, stock: 0 }),

    StockMovement.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("product", "name sku imageUrl")
      .lean(),

    StockMovement.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          totalQuantity: { $sum: { $abs: "$quantity" } },
        },
      },
    ]),

    Product.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "cat",
        },
      },
      { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$cat.name",
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$stock" },
          totalValue: {
            $sum: { $multiply: ["$stock", "$purchasePrice"] },
          },
        },
      },
      { $sort: { totalValue: -1 } },
    ]),
  ]);

  const lowStock = await Product.find({
    isActive: true,
    $and: [
      { stock: { $gt: 0 } },
      { $expr: { $lte: ["$stock", "$minimumStock"] } },
    ],
  })
    .select("name sku stock minimumStock unit imageUrl")
    .limit(5)
    .lean();

  res.status(200).json(
    ok({
      totalProducts,
      totalStockValue: paiseToRupees(
        (totalStockValue[0] as { totalValue?: number } | undefined)?.totalValue ?? 0,
      ),
      totalRetailValue: paiseToRupees(
        (totalStockValue[0] as { totalRetailValue?: number } | undefined)?.totalRetailValue ?? 0,
      ),
      lowStockCount: lowStockProducts,
      outOfStockCount: outOfStockProducts,
      recentMovements: recentMovements.map((m) =>
        formatMovement(m as unknown as Record<string, unknown>),
      ),
      movementsByType,
      stockByCategory,
      lowStockProducts: lowStock,
    }),
  );
}

// ── Current Stock (all products with stock info) ──────────────────────────────

export async function getCurrentStock(
  req: Request,
  res: Response,
): Promise<void> {
  const {
    page = "1",
    limit = "20",
    search = "",
    category = "",
    stockStatus = "",
    sortBy = "name",
    sortOrder = "asc",
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const filter: Record<string, unknown> = { isActive: true };

  if (search.trim()) {
    filter["$text"] = { $search: search.trim() };
  }
  if (category) {
    filter["category"] = category;
  }

  if (stockStatus === "out") {
    filter["stock"] = 0;
  } else if (stockStatus === "low") {
    filter["$and"] = [
      { stock: { $gt: 0 } },
      { $expr: { $lte: ["$stock", "$minimumStock"] } },
    ];
  } else if (stockStatus === "in") {
    filter["$expr"] = { $gt: ["$stock", "$minimumStock"] };
  }

  const sortDir = sortOrder === "asc" ? 1 : -1;
  const sort: Record<string, 1 | -1> = {};
  sort[sortBy] = sortDir;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(filter),
  ]);

  const formatted = products.map((p) => {
    const doc = p as unknown as Record<string, unknown>;
    return {
      ...doc,
      purchasePrice: paiseToRupees(doc["purchasePrice"] as number),
      sellingPrice: paiseToRupees(doc["sellingPrice"] as number),
      mrp: paiseToRupees(doc["mrp"] as number),
      availableStock:
        (doc["stock"] as number) - (doc["reservedStock"] as number),
      stockStatus:
        (doc["stock"] as number) <= 0
          ? "out"
          : (doc["stock"] as number) <= (doc["minimumStock"] as number)
            ? "low"
            : "in",
    };
  });

  res.status(200).json(
    ok(formatted, {
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    }),
  );
}

// ── Low Stock Products ────────────────────────────────────────────────────────

export async function getLowStockProducts(
  _req: Request,
  res: Response,
): Promise<void> {
  const products = await Product.find({
    isActive: true,
    $and: [
      { stock: { $gt: 0 } },
      { $expr: { $lte: ["$stock", "$minimumStock"] } },
    ],
  })
    .populate("category", "name slug")
    .sort({ stock: 1 })
    .lean();

  const formatted = products.map((p) => {
    const doc = p as unknown as Record<string, unknown>;
    return {
      ...doc,
      purchasePrice: paiseToRupees(doc["purchasePrice"] as number),
      sellingPrice: paiseToRupees(doc["sellingPrice"] as number),
      mrp: paiseToRupees(doc["mrp"] as number),
      availableStock:
        (doc["stock"] as number) - (doc["reservedStock"] as number),
    };
  });

  res.status(200).json(ok(formatted));
}

// ── Out of Stock Products ─────────────────────────────────────────────────────

export async function getOutOfStockProducts(
  _req: Request,
  res: Response,
): Promise<void> {
  const products = await Product.find({
    isActive: true,
    stock: 0,
  })
    .populate("category", "name slug")
    .sort({ name: 1 })
    .lean();

  const formatted = products.map((p) => {
    const doc = p as unknown as Record<string, unknown>;
    return {
      ...doc,
      purchasePrice: paiseToRupees(doc["purchasePrice"] as number),
      sellingPrice: paiseToRupees(doc["sellingPrice"] as number),
      mrp: paiseToRupees(doc["mrp"] as number),
    };
  });

  res.status(200).json(ok(formatted));
}

// ── Stock Movements (history) ─────────────────────────────────────────────────

export async function getStockMovements(
  req: Request,
  res: Response,
): Promise<void> {
  const {
    page = "1",
    limit = "20",
    productId = "",
    type = "",
    startDate = "",
    endDate = "",
    batchNumber = "",
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const filter: Record<string, unknown> = {};

  if (productId) filter["product"] = productId;
  if (type) filter["type"] = type;
  if (batchNumber) filter["batchNumber"] = batchNumber;
  if (startDate || endDate) {
    filter["createdAt"] = {};
    if (startDate) (filter["createdAt"] as Record<string, unknown>)["$gte"] = new Date(startDate);
    if (endDate) (filter["createdAt"] as Record<string, unknown>)["$lte"] = new Date(endDate + "T23:59:59.999Z");
  }

  const [movements, total] = await Promise.all([
    StockMovement.find(filter)
      .populate("product", "name sku imageUrl unit")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    StockMovement.countDocuments(filter),
  ]);

  res.status(200).json(
    ok(
      movements.map((m) => formatMovement(m as unknown as Record<string, unknown>)),
      {
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    ),
  );
}

// ── Stock Adjustment ──────────────────────────────────────────────────────────

export async function adjustStock(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = adjustStockSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(
      fail("VALIDATION_ERROR", "Invalid input", parsed.error.flatten().fieldErrors as Record<string, unknown>),
    );
    return;
  }

  const { productId, type, quantity, reference, batchNumber, expiryDate, notes, unitCost } =
    parsed.data;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404).json(fail("NOT_FOUND", "Product not found"));
    return;
  }

  const previousStock = product.stock;
  let newStock: number;

  if (type === "purchase" || type === "return" || type === "opening") {
    newStock = previousStock + Math.abs(quantity);
  } else if (type === "sale" || type === "damaged" || type === "expired") {
    newStock = Math.max(0, previousStock - Math.abs(quantity));
  } else {
    // adjustment or transfer — quantity can be positive or negative
    newStock = Math.max(0, previousStock + quantity);
  }

  const movement = await StockMovement.create({
    product: productId,
    type,
    quantity: type === "sale" || type === "damaged" || type === "expired"
      ? -Math.abs(quantity)
      : quantity,
    previousStock,
    newStock,
    reference,
    batchNumber,
    expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    notes,
    unitCost: unitCost != null ? Math.round(unitCost * 100) : undefined,
  });

  await Product.findByIdAndUpdate(productId, { stock: newStock });

  res.status(201).json(ok(formatMovement(movement.toObject() as unknown as Record<string, unknown>)));
}

// ── Purchase Stock ────────────────────────────────────────────────────────────

export async function purchaseStock(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = purchaseStockSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(
      fail("VALIDATION_ERROR", "Invalid input", parsed.error.flatten().fieldErrors as Record<string, unknown>),
    );
    return;
  }

  const { productId, quantity, unitCost, batchNumber, expiryDate, reference, notes } =
    parsed.data;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404).json(fail("NOT_FOUND", "Product not found"));
    return;
  }

  const previousStock = product.stock;
  const newStock = previousStock + quantity;

  const movement = await StockMovement.create({
    product: productId,
    type: "purchase",
    quantity,
    previousStock,
    newStock,
    batchNumber,
    expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    reference,
    notes,
    unitCost: Math.round(unitCost * 100),
  });

  await Product.findByIdAndUpdate(productId, { stock: newStock });

  res.status(201).json(ok(formatMovement(movement.toObject() as unknown as Record<string, unknown>)));
}

// ── Damaged Stock ─────────────────────────────────────────────────────────────

export async function reportDamagedStock(
  req: Request,
  res: Response,
): Promise<void> {
  const parsed = adjustStockSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(
      fail("VALIDATION_ERROR", "Invalid input", parsed.error.flatten().fieldErrors as Record<string, unknown>),
    );
    return;
  }

  const { productId, quantity, reference, batchNumber, notes } = parsed.data;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404).json(fail("NOT_FOUND", "Product not found"));
    return;
  }

  if (Math.abs(quantity) > product.stock) {
    res.status(400).json(
      fail("VALIDATION_ERROR", `Cannot mark ${Math.abs(quantity)} items as damaged. Only ${product.stock} in stock.`),
    );
    return;
  }

  const previousStock = product.stock;
  const newStock = previousStock - Math.abs(quantity);

  const movement = await StockMovement.create({
    product: productId,
    type: "damaged",
    quantity: -Math.abs(quantity),
    previousStock,
    newStock,
    reference,
    batchNumber,
    notes,
  });

  await Product.findByIdAndUpdate(productId, { stock: newStock });

  res.status(201).json(ok(formatMovement(movement.toObject() as unknown as Record<string, unknown>)));
}

// ── Expired Products ──────────────────────────────────────────────────────────

export async function getExpiredProducts(
  _req: Request,
  res: Response,
): Promise<void> {
  const movements = await StockMovement.find({
    type: { $in: ["damaged", "expired"] },
    expiryDate: { $lte: new Date() },
  })
    .populate("product", "name sku imageUrl unit barcode")
    .sort({ expiryDate: -1 })
    .lean();

  res.status(200).json(
    ok(movements.map((m) => formatMovement(m as unknown as Record<string, unknown>))),
  );
}

// ── Update Product Stock Settings ─────────────────────────────────────────────

export async function updateProductStockSettings(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params as { id: string };

  const parsed = adjustProductSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(
      fail("VALIDATION_ERROR", "Invalid input", parsed.error.flatten().fieldErrors as Record<string, unknown>),
    );
    return;
  }

  const product = await Product.findByIdAndUpdate(id, parsed.data, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    res.status(404).json(fail("NOT_FOUND", "Product not found"));
    return;
  }

  const doc = product.toObject() as unknown as Record<string, unknown>;
  res.status(200).json(
    ok({
      ...doc,
      purchasePrice: paiseToRupees(doc["purchasePrice"] as number),
      sellingPrice: paiseToRupees(doc["sellingPrice"] as number),
      mrp: paiseToRupees(doc["mrp"] as number),
    }),
  );
}

// ── Batch Number Lookup ───────────────────────────────────────────────────────

export async function getBatchMovements(
  req: Request,
  res: Response,
): Promise<void> {
  const { batchNumber } = req.params as { batchNumber: string };

  const movements = await StockMovement.find({ batchNumber })
    .populate("product", "name sku imageUrl unit")
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json(
    ok(movements.map((m) => formatMovement(m as unknown as Record<string, unknown>))),
  );
}
