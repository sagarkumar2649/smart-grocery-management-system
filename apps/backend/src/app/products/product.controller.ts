import type { Request, Response } from "express";
import { z } from "zod";
import { Product, PRODUCT_UNITS, GST_RATES } from "./product.model.js";
import { Category } from "../categories/category.model.js";
import { ok, fail } from "../response/api-response.js";
import { deleteCloudinaryImage } from "../../infrastructure/cloudinary/cloudinary.js";

// ── Zod schemas ───────────────────────────────────────────────────────────────

const gstValues = GST_RATES as unknown as readonly [number, ...number[]];

const productBodySchema = z.object({
  name: z.string().min(1, "Product name is required").max(200).trim(),
  sku: z.string().min(1, "SKU is required").max(100).trim().toUpperCase(),
  barcode: z.string().max(100).trim().optional(),
  category: z.string().min(1, "Category is required"),
  brand: z.string().max(100).trim().optional(),
  purchasePrice: z.coerce.number().nonnegative("Purchase price must be ≥ 0"),
  sellingPrice: z.coerce.number().nonnegative("Selling price must be ≥ 0"),
  mrp: z.coerce.number().nonnegative("MRP must be ≥ 0"),
  gstPercent: z.coerce.number().refine((v) => (gstValues as readonly number[]).includes(v), {
    message: "GST % must be one of 0, 5, 12, 18, 28",
  }),
  hsnCode: z.string().max(20).trim().optional(),
  stock: z.coerce.number().int().nonnegative("Stock must be ≥ 0"),
  reservedStock: z.coerce.number().int().nonnegative("Reserved stock must be ≥ 0").optional(),
  minimumStock: z.coerce.number().int().nonnegative("Minimum stock must be ≥ 0"),
  maximumStock: z.coerce.number().int().nonnegative("Maximum stock must be ≥ 0").optional(),
  unit: z.enum(PRODUCT_UNITS as unknown as [string, ...string[]]),
  isActive: z
    .union([z.boolean(), z.string()])
    .transform((v) => (typeof v === "string" ? v === "true" : v))
    .optional(),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert rupees (from request) to paise stored in DB */
const rupeesToPaise = (rupees: number) => Math.round(rupees * 100);
/** Convert paise (from DB) to rupees for response */
const paiseToRupees = (paise: number) => paise / 100;

function formatProduct(doc: Record<string, unknown>) {
  return {
    ...doc,
    purchasePrice: paiseToRupees(doc["purchasePrice"] as number),
    sellingPrice: paiseToRupees(doc["sellingPrice"] as number),
    mrp: paiseToRupees(doc["mrp"] as number),
  };
}

// ── Controllers ───────────────────────────────────────────────────────────────

export async function listProducts(req: Request, res: Response): Promise<void> {
  const {
    page = "1",
    limit = "20",
    search = "",
    category = "",
    status = "",
    sortBy = "createdAt",
    sortOrder = "desc",
    lowStock = "",
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  // Build filter
  const filter: Record<string, unknown> = {};

  if (search.trim()) {
    filter["$text"] = { $search: search.trim() };
  }
  if (category) {
    filter["category"] = category;
  }
  if (status === "active") filter["isActive"] = true;
  if (status === "inactive") filter["isActive"] = false;
  if (lowStock === "true") {
    filter["$expr"] = { $lte: ["$stock", "$minimumStock"] };
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

  const formatted = products.map((p) => formatProduct(p as unknown as Record<string, unknown>));

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

export async function getProduct(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const product = await Product.findById(id).populate("category", "name slug").lean();
  if (!product) {
    res.status(404).json(fail("NOT_FOUND", "Product not found"));
    return;
  }

  res.status(200).json(ok(formatProduct(product as unknown as Record<string, unknown>)));
}

export async function createProduct(req: Request, res: Response): Promise<void> {
  const parsed = productBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(
      fail("VALIDATION_ERROR", "Invalid input", parsed.error.flatten().fieldErrors as Record<string, unknown>),
    );
    return;
  }

  const data = parsed.data;

  // Validate category exists
  const categoryExists = await Category.exists({ _id: data.category });
  if (!categoryExists) {
    res.status(400).json(fail("VALIDATION_ERROR", "Category not found"));
    return;
  }

  // Check SKU uniqueness
  const skuExists = await Product.exists({ sku: data.sku });
  if (skuExists) {
    res.status(409).json(fail("CONFLICT", `SKU "${data.sku}" already exists`));
    return;
  }

  // Handle image upload (multer-cloudinary sets req.file)
  const file = req.file as (Express.Multer.File & { path?: string; filename?: string }) | undefined;
  const imageUrl = file?.path;
  const imagePublicId = file?.filename;

  const product = await Product.create({
    ...data,
    purchasePrice: rupeesToPaise(data.purchasePrice),
    sellingPrice: rupeesToPaise(data.sellingPrice),
    mrp: rupeesToPaise(data.mrp),
    ...(imageUrl !== undefined && { imageUrl }),
    ...(imagePublicId !== undefined && { imagePublicId }),
    isActive: data.isActive ?? true,
  });

  const populated = await product.populate("category", "name slug");
  res.status(201).json(ok(formatProduct(populated.toObject() as unknown as Record<string, unknown>)));
}

export async function updateProduct(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const parsed = productBodySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(
      fail("VALIDATION_ERROR", "Invalid input", parsed.error.flatten().fieldErrors as Record<string, unknown>),
    );
    return;
  }

  const data = parsed.data;
  const existing = await Product.findById(id);
  if (!existing) {
    res.status(404).json(fail("NOT_FOUND", "Product not found"));
    return;
  }

  // Validate category if changing
  if (data.category) {
    const categoryExists = await Category.exists({ _id: data.category });
    if (!categoryExists) {
      res.status(400).json(fail("VALIDATION_ERROR", "Category not found"));
      return;
    }
  }

  // Ensure SKU uniqueness if changing
  if (data.sku && data.sku !== existing.sku) {
    const skuExists = await Product.exists({ sku: data.sku, _id: { $ne: id } });
    if (skuExists) {
      res.status(409).json(fail("CONFLICT", `SKU "${data.sku}" already exists`));
      return;
    }
  }

  // Handle new image upload — delete old one from Cloudinary
  const file = req.file as (Express.Multer.File & { path?: string; filename?: string }) | undefined;
  const updateData: Record<string, unknown> = {
    ...data,
    ...(data.purchasePrice !== undefined && { purchasePrice: rupeesToPaise(data.purchasePrice) }),
    ...(data.sellingPrice !== undefined && { sellingPrice: rupeesToPaise(data.sellingPrice) }),
    ...(data.mrp !== undefined && { mrp: rupeesToPaise(data.mrp) }),
  };

  if (file?.path) {
    if (existing.imagePublicId) {
      await deleteCloudinaryImage(existing.imagePublicId).catch(() => {
        // Non-fatal: log but continue
      });
    }
    updateData["imageUrl"] = file.path;
    updateData["imagePublicId"] = file.filename;
  }

  const updated = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("category", "name slug");

  if (!updated) {
    res.status(404).json(fail("NOT_FOUND", "Product not found"));
    return;
  }

  res.status(200).json(ok(formatProduct(updated.toObject() as unknown as Record<string, unknown>)));
}

export async function deleteProduct(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    res.status(404).json(fail("NOT_FOUND", "Product not found"));
    return;
  }

  // Delete image from Cloudinary
  if (product.imagePublicId) {
    await deleteCloudinaryImage(product.imagePublicId).catch(() => {
      // Non-fatal
    });
  }

  res.status(200).json(ok({ message: "Product deleted" }));
}
