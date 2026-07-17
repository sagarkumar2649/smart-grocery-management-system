import { Router } from "express";
import { requireAdmin } from "../middlewares/auth.middleware.js";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./category.controller.js";

export function buildCategoryRouter(): Router {
  const router = Router();

  // Public read — anyone can fetch categories (e.g. store filter dropdowns).
  router.get("/", listCategories);

  // Admin-only mutations.
  router.post("/", requireAdmin, createCategory);
  router.put("/:id", requireAdmin, updateCategory);
  router.delete("/:id", requireAdmin, deleteCategory);

  return router;
}
