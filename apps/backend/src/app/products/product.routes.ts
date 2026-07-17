import { Router } from "express";
import { requireAdmin } from "../middlewares/auth.middleware.js";
import { uploadProductImage } from "../middlewares/upload.js";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./product.controller.js";

export function buildProductRouter(): Router {
  const router = Router();

  // Public reads — any authenticated or anonymous user can browse products.
  router.get("/", listProducts);
  router.get("/:id", getProduct);

  // Admin-only mutations — requireAdmin verifies Clerk token + MongoDB role.
  router.post("/", requireAdmin, uploadProductImage, createProduct);
  router.put("/:id", requireAdmin, uploadProductImage, updateProduct);
  router.delete("/:id", requireAdmin, deleteProduct);

  return router;
}
