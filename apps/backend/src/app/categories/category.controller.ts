import type { Request, Response } from "express";
import { z } from "zod";
import { Category } from "./category.model.js";
import { ok, fail } from "../response/api-response.js";

const categoryBodySchema = z.object({
  name: z.string().min(1, "Name is required").max(100).trim(),
  description: z.string().max(500).trim().optional(),
  isActive: z.boolean().optional(),
});

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function listCategories(_req: Request, res: Response): Promise<void> {
  const categories = await Category.find({ isActive: true })
    .select("_id name slug description isActive")
    .sort({ name: 1 })
    .lean();

  res.status(200).json(ok(categories));
}

export async function createCategory(req: Request, res: Response): Promise<void> {
  const parsed = categoryBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(fail("VALIDATION_ERROR", "Invalid input", parsed.error.flatten().fieldErrors as Record<string, unknown>));
    return;
  }

  const { name, description, isActive } = parsed.data;
  const slug = toSlug(name);

  const existing = await Category.findOne({ slug });
  if (existing) {
    res.status(409).json(fail("CONFLICT", `Category "${name}" already exists`));
    return;
  }

  const category = await Category.create({ name, slug, description, isActive });
  res.status(201).json(ok(category));
}

export async function updateCategory(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const parsed = categoryBodySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(fail("VALIDATION_ERROR", "Invalid input", parsed.error.flatten().fieldErrors as Record<string, unknown>));
    return;
  }

  const update: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.name) {
    update["slug"] = toSlug(parsed.data.name);
  }

  const category = await Category.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!category) {
    res.status(404).json(fail("NOT_FOUND", "Category not found"));
    return;
  }

  res.status(200).json(ok(category));
}

export async function deleteCategory(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    res.status(404).json(fail("NOT_FOUND", "Category not found"));
    return;
  }
  res.status(200).json(ok({ message: "Category deleted" }));
}
