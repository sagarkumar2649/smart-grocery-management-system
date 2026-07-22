import { Router } from "express";
import { requireAdmin, requireAuth } from "../middlewares/auth.middleware.js";
import {
  listCustomers,
  getCustomer,
  adminUpdateCustomer,
  updateCustomerStatus,
  updateCustomerNotes,
  deleteCustomer,
  getMyProfile,
  updateMyProfile,
  addAddress,
  removeAddress,
  toggleWishlist,
  getCustomerStats,
} from "./customer.controller.js";

export function buildCustomerRouter(): Router {
  const router = Router();

  // ── Customer self-service (requireAuth) ──────────────────────────────────
  router.get("/me", requireAuth, getMyProfile);
  router.put("/me", requireAuth, updateMyProfile);
  router.post("/me/addresses", requireAuth, addAddress);
  router.delete("/me/addresses/:addressId", requireAuth, removeAddress);
  router.post("/me/wishlist/:productId", requireAuth, toggleWishlist);

  // ── Admin-only (requireAdmin) ────────────────────────────────────────────
  router.get("/stats", requireAdmin, getCustomerStats);
  router.get("/", requireAdmin, listCustomers);
  router.get("/:id", requireAdmin, getCustomer);
  router.put("/:id", requireAdmin, adminUpdateCustomer);
  router.patch("/:id/status", requireAdmin, updateCustomerStatus);
  router.patch("/:id/notes", requireAdmin, updateCustomerNotes);
  router.delete("/:id", requireAdmin, deleteCustomer);

  return router;
}
