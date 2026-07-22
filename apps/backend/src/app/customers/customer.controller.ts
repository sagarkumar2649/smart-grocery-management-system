import type { Request, Response } from "express";
import { z } from "zod";
import {
  CustomerProfile,
  CUSTOMER_STATUSES,
} from "./customer.model.js";
import { AppUser } from "../users/app-user.model.js";
import { ok, fail } from "../response/api-response.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

// ── Zod schemas ───────────────────────────────────────────────────────────────

const addressSchema = z.object({
  label: z.string().min(1, "Label is required").max(50).trim(),
  line1: z.string().min(1, "Address line 1 is required").max(200).trim(),
  line2: z.string().max(200).trim().optional(),
  city: z.string().min(1, "City is required").max(100).trim(),
  state: z.string().min(1, "State is required").max(100).trim(),
  pincode: z.string().min(1, "Pincode is required").max(10).trim(),
  isDefault: z
    .union([z.boolean(), z.string()])
    .transform((v) => (typeof v === "string" ? v === "true" : v))
    .optional(),
});

const updateProfileSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  phone: z.string().max(20).trim().optional().nullable(),
  addresses: z.array(addressSchema).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(CUSTOMER_STATUSES as unknown as [string, ...string[]]),
});

const updateNotesSchema = z.object({
  notes: z.string().max(1000).trim().optional().nullable(),
});

const adminUpdateSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  phone: z.string().max(20).trim().optional().nullable(),
  loyaltyPoints: z.coerce.number().int().min(0).optional(),
  notes: z.string().max(1000).trim().optional().nullable(),
});

// ── Admin: List all customers ─────────────────────────────────────────────────

export async function listCustomers(req: Request, res: Response): Promise<void> {
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
  if (status && (CUSTOMER_STATUSES as readonly string[]).includes(status)) {
    filter["status"] = status;
  }

  const sortDir = sortOrder === "asc" ? 1 : -1;
  const sort: Record<string, 1 | -1> = {};
  sort[sortBy] = sortDir;

  const [customers, total] = await Promise.all([
    CustomerProfile.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    CustomerProfile.countDocuments(filter),
  ]);

  res.status(200).json(
    ok(customers, {
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    }),
  );
}

// ── Admin: Get single customer ────────────────────────────────────────────────

export async function getCustomer(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const customer = await CustomerProfile.findById(id)
    .populate("wishlist", "name sellingPrice imageUrl")
    .lean();

  if (!customer) {
    res.status(404).json(fail("NOT_FOUND", "Customer not found"));
    return;
  }

  res.status(200).json(ok(customer));
}

// ── Admin: Update customer (name, phone, loyaltyPoints, notes) ────────────────

export async function adminUpdateCustomer(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params as { id: string };

  const parsed = adminUpdateSchema.safeParse(req.body);
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

  const customer = await CustomerProfile.findByIdAndUpdate(id, parsed.data, {
    new: true,
    runValidators: true,
  }).lean();

  if (!customer) {
    res.status(404).json(fail("NOT_FOUND", "Customer not found"));
    return;
  }

  res.status(200).json(ok(customer));
}

// ── Admin: Update customer status (block/activate) ────────────────────────────

export async function updateCustomerStatus(
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

  const customer = await CustomerProfile.findByIdAndUpdate(
    id,
    { status: parsed.data.status },
    { new: true, runValidators: true },
  ).lean();

  if (!customer) {
    res.status(404).json(fail("NOT_FOUND", "Customer not found"));
    return;
  }

  res.status(200).json(ok(customer));
}

// ── Admin: Update customer notes ──────────────────────────────────────────────

export async function updateCustomerNotes(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params as { id: string };

  const parsed = updateNotesSchema.safeParse(req.body);
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

  const customer = await CustomerProfile.findByIdAndUpdate(
    id,
    { notes: parsed.data.notes ?? null },
    { new: true, runValidators: true },
  ).lean();

  if (!customer) {
    res.status(404).json(fail("NOT_FOUND", "Customer not found"));
    return;
  }

  res.status(200).json(ok(customer));
}

// ── Admin: Delete customer ────────────────────────────────────────────────────

export async function deleteCustomer(
  req: Request,
  res: Response,
): Promise<void> {
  const { id } = req.params as { id: string };

  const customer = await CustomerProfile.findByIdAndDelete(id);
  if (!customer) {
    res.status(404).json(fail("NOT_FOUND", "Customer not found"));
    return;
  }

  // Also remove the linked AppUser
  await AppUser.deleteOne({ clerkId: customer.clerkId });

  res.status(200).json(ok({ message: "Customer deleted" }));
}

// ── Customer: Get own profile ─────────────────────────────────────────────────

export async function getMyProfile(
  req: Request,
  res: Response,
): Promise<void> {
  const clerkId = (req as AuthenticatedRequest).auth?.userId;
  if (!clerkId) {
    res.status(401).json(fail("UNAUTHORIZED", "Not authenticated"));
    return;
  }

  const customer = await CustomerProfile.findOne({ clerkId })
    .populate("wishlist", "name sellingPrice mrp imageUrl unit")
    .lean();

  if (!customer) {
    res.status(404).json(fail("NOT_FOUND", "Customer profile not found"));
    return;
  }

  // Update last active timestamp
  await CustomerProfile.updateOne(
    { clerkId },
    { $set: { lastActiveAt: new Date() } },
  );

  res.status(200).json(ok(customer));
}

// ── Customer: Update own profile ──────────────────────────────────────────────

export async function updateMyProfile(
  req: Request,
  res: Response,
): Promise<void> {
  const clerkId = (req as AuthenticatedRequest).auth?.userId;
  if (!clerkId) {
    res.status(401).json(fail("UNAUTHORIZED", "Not authenticated"));
    return;
  }

  const parsed = updateProfileSchema.safeParse(req.body);
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

  const customer = await CustomerProfile.findOneAndUpdate(
    { clerkId },
    { $set: parsed.data },
    { new: true, runValidators: true },
  ).lean();

  if (!customer) {
    res.status(404).json(fail("NOT_FOUND", "Customer profile not found"));
    return;
  }

  res.status(200).json(ok(customer));
}

// ── Customer: Add address ─────────────────────────────────────────────────────

export async function addAddress(
  req: Request,
  res: Response,
): Promise<void> {
  const clerkId = (req as AuthenticatedRequest).auth?.userId;
  if (!clerkId) {
    res.status(401).json(fail("UNAUTHORIZED", "Not authenticated"));
    return;
  }

  const parsed = addressSchema.safeParse(req.body);
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

  const customer = await CustomerProfile.findOne({ clerkId });
  if (!customer) {
    res.status(404).json(fail("NOT_FOUND", "Customer profile not found"));
    return;
  }

  // If this address is default, unset other defaults
  if (parsed.data.isDefault) {
    customer.addresses.forEach((a) => {
      a.isDefault = false;
    });
  }

  // Strip undefined optional fields to satisfy exactOptionalPropertyTypes
  const addrData = {
    label: parsed.data.label,
    line1: parsed.data.line1,
    city: parsed.data.city,
    state: parsed.data.state,
    pincode: parsed.data.pincode,
    isDefault: parsed.data.isDefault ?? false,
    ...(parsed.data.line2 !== undefined && { line2: parsed.data.line2 }),
  } as never;

  customer.addresses.push(addrData);
  await customer.save();

  res.status(201).json(ok(customer.toObject()));
}

// ── Customer: Remove address ──────────────────────────────────────────────────

export async function removeAddress(
  req: Request,
  res: Response,
): Promise<void> {
  const clerkId = (req as AuthenticatedRequest).auth?.userId;
  if (!clerkId) {
    res.status(401).json(fail("UNAUTHORIZED", "Not authenticated"));
    return;
  }

  const { addressId } = req.params as { addressId: string };

  const customer = await CustomerProfile.findOne({ clerkId });
  if (!customer) {
    res.status(404).json(fail("NOT_FOUND", "Customer profile not found"));
    return;
  }

  const addressIndex = customer.addresses.findIndex(
    (a) => (a as unknown as { _id?: { toString(): string } })._id?.toString() === addressId,
  );
  if (addressIndex === -1) {
    res.status(404).json(fail("NOT_FOUND", "Address not found"));
    return;
  }

  customer.addresses.splice(addressIndex, 1);
  await customer.save();

  res.status(200).json(ok(customer.toObject()));
}

// ── Customer: Toggle wishlist item ────────────────────────────────────────────

export async function toggleWishlist(
  req: Request,
  res: Response,
): Promise<void> {
  const clerkId = (req as AuthenticatedRequest).auth?.userId;
  if (!clerkId) {
    res.status(401).json(fail("UNAUTHORIZED", "Not authenticated"));
    return;
  }

  const { productId } = req.params as { productId: string };

  const customer = await CustomerProfile.findOne({ clerkId });
  if (!customer) {
    res.status(404).json(fail("NOT_FOUND", "Customer profile not found"));
    return;
  }

  const idx = customer.wishlist.findIndex(
    (id) => id.toString() === productId,
  );

  if (idx === -1) {
    customer.wishlist.push(productId as unknown as never);
  } else {
    customer.wishlist.splice(idx, 1);
  }

  await customer.save();

  const updated = await CustomerProfile.findOne({ clerkId })
    .populate("wishlist", "name sellingPrice mrp imageUrl unit")
    .lean();

  res.status(200).json(ok(updated));
}

// ── Admin: Dashboard stats ────────────────────────────────────────────────────

export async function getCustomerStats(
  _req: Request,
  res: Response,
): Promise<void> {
  const [total, active, blocked, inactive, spendingAgg] = await Promise.all([
    CustomerProfile.countDocuments(),
    CustomerProfile.countDocuments({ status: "active" }),
    CustomerProfile.countDocuments({ status: "blocked" }),
    CustomerProfile.countDocuments({ status: "inactive" }),
    CustomerProfile.aggregate([
      {
        $group: {
          _id: null,
          totalSpending: { $sum: "$totalSpending" },
          totalOrders: { $sum: "$totalOrders" },
          avgSpending: { $avg: "$totalSpending" },
          totalLoyaltyPoints: { $sum: "$loyaltyPoints" },
        },
      },
    ]),
  ]);

  const agg = spendingAgg[0] ?? {
    totalSpending: 0,
    totalOrders: 0,
    avgSpending: 0,
    totalLoyaltyPoints: 0,
  };

  res.status(200).json(
    ok({
      total,
      active,
      blocked,
      inactive,
      totalSpending: agg.totalSpending,
      totalOrders: agg.totalOrders,
      avgSpending: Math.round(agg.avgSpending),
      totalLoyaltyPoints: agg.totalLoyaltyPoints,
    }),
  );
}
