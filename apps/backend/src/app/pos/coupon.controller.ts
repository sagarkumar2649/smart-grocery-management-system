import type { Request, Response } from "express";
import { z } from "zod";
import { Coupon } from "./coupon.model.js";
import { ok, fail } from "../response/api-response.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

const paiseToRupees = (paise: number) => paise / 100;

function formatCoupon(doc: Record<string, unknown>) {
  return {
    ...doc,
    discountValue:
      (doc["discountType"] as string) === "percentage"
        ? doc["discountValue"]
        : paiseToRupees(doc["discountValue"] as number),
    minOrderAmount: paiseToRupees(doc["minOrderAmount"] as number),
    maxDiscountAmount: paiseToRupees(doc["maxDiscountAmount"] as number),
  };
}

// ── Zod Schemas ──────────────────────────────────────────────────────────────

const couponBaseSchema = z.object({
  code: z.string().min(1, "Code is required").max(30).trim().toUpperCase(),
  description: z.string().min(1, "Description is required").max(200).trim(),
  discountType: z.enum(["percentage", "flat"]),
  discountValue: z.number().positive("Discount value must be positive"),
  minOrderAmount: z.number().nonnegative().optional(),
  maxDiscountAmount: z.number().nonnegative().optional(),
  usageLimit: z.number().int().positive().optional(),
  validFrom: z.string().transform((v) => new Date(v)),
  validUntil: z.string().transform((v) => new Date(v)),
  isActive: z.boolean().optional(),
});

const createCouponSchema = couponBaseSchema.refine(
  (data) => data.validUntil > data.validFrom,
  { message: "Valid until must be after valid from", path: ["validUntil"] },
);

const updateCouponSchema = couponBaseSchema.partial().refine(
  (data) => {
    if (data.validFrom && data.validUntil) {
      return data.validUntil > data.validFrom;
    }
    return true;
  },
  { message: "Valid until must be after valid from", path: ["validUntil"] },
);

// ── Controllers ──────────────────────────────────────────────────────────────

export async function listCoupons(req: Request, res: Response): Promise<void> {
  const { page = "1", limit = "20", status = "" } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const filter: Record<string, unknown> = {};
  if (status === "active") filter["isActive"] = true;
  if (status === "inactive") filter["isActive"] = false;

  const [coupons, total] = await Promise.all([
    Coupon.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Coupon.countDocuments(filter),
  ]);

  res.status(200).json(
    ok(coupons.map((c) => formatCoupon(c as unknown as Record<string, unknown>)), {
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    }),
  );
}

export async function createCoupon(req: Request, res: Response): Promise<void> {
  const parsed = createCouponSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(
      fail("VALIDATION_ERROR", "Invalid input", parsed.error.flatten().fieldErrors as Record<string, unknown>),
    );
    return;
  }

  const data = parsed.data;

  // Validate percentage range
  if (data.discountType === "percentage" && data.discountValue > 100) {
    res.status(400).json(fail("VALIDATION_ERROR", "Percentage discount cannot exceed 100%"));
    return;
  }

  const existing = await Coupon.findOne({ code: data.code });
  if (existing) {
    res.status(409).json(fail("CONFLICT", `Coupon "${data.code}" already exists`));
    return;
  }

  const coupon = await Coupon.create({
    code: data.code,
    description: data.description,
    discountType: data.discountType,
    discountValue:
      data.discountType === "flat" ? Math.round(data.discountValue * 100) : data.discountValue,
    minOrderAmount: Math.round((data.minOrderAmount ?? 0) * 100),
    maxDiscountAmount: Math.round((data.maxDiscountAmount ?? 0) * 100),
    usageLimit: data.usageLimit,
    validFrom: data.validFrom,
    validUntil: data.validUntil,
    isActive: data.isActive ?? true,
  });

  res.status(201).json(ok(formatCoupon(coupon.toObject() as unknown as Record<string, unknown>)));
}

export async function updateCoupon(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const parsed = updateCouponSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(
      fail("VALIDATION_ERROR", "Invalid input", parsed.error.flatten().fieldErrors as Record<string, unknown>),
    );
    return;
  }

  const data = parsed.data;
  const existing = await Coupon.findById(id);
  if (!existing) {
    res.status(404).json(fail("NOT_FOUND", "Coupon not found"));
    return;
  }

  // Ensure code uniqueness if changing
  if (data.code && data.code !== existing.code) {
    const codeExists = await Coupon.exists({ code: data.code, _id: { $ne: id } });
    if (codeExists) {
      res.status(409).json(fail("CONFLICT", `Coupon "${data.code}" already exists`));
      return;
    }
  }

  const updateData: Record<string, unknown> = { ...data };
  if (data.discountType === "flat" && data.discountValue !== undefined) {
    updateData["discountValue"] = Math.round(data.discountValue * 100);
  }
  if (data.minOrderAmount !== undefined) {
    updateData["minOrderAmount"] = Math.round(data.minOrderAmount * 100);
  }
  if (data.maxDiscountAmount !== undefined) {
    updateData["maxDiscountAmount"] = Math.round(data.maxDiscountAmount * 100);
  }

  const updated = await Coupon.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    res.status(404).json(fail("NOT_FOUND", "Coupon not found"));
    return;
  }

  res.status(200).json(ok(formatCoupon(updated.toObject() as unknown as Record<string, unknown>)));
}

export async function deleteCoupon(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) {
    res.status(404).json(fail("NOT_FOUND", "Coupon not found"));
    return;
  }

  res.status(200).json(ok({ message: "Coupon deleted" }));
}
