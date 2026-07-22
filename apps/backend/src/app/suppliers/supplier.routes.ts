import { Router } from "express";
import { requireAdmin } from "../middlewares/auth.middleware.js";
import {
  listSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  updateSupplierStatus,
  deleteSupplier,
  listPurchaseOrders,
  getPurchaseOrder,
  createPurchaseOrder,
  updatePOStatus,
  addPayment,
  listPayments,
  getSupplierStats,
} from "./supplier.controller.js";

export function buildSupplierRouter(): Router {
  const router = Router();

  // ── Stats ──────────────────────────────────────────────────────────────
  router.get("/stats", requireAdmin, getSupplierStats);

  // ── Supplier CRUD ──────────────────────────────────────────────────────
  router.get("/", requireAdmin, listSuppliers);
  router.get("/:id", requireAdmin, getSupplier);
  router.post("/", requireAdmin, createSupplier);
  router.put("/:id", requireAdmin, updateSupplier);
  router.patch("/:id/status", requireAdmin, updateSupplierStatus);
  router.delete("/:id", requireAdmin, deleteSupplier);

  // ── Purchase Orders ────────────────────────────────────────────────────
  router.get("/pos/list", requireAdmin, listPurchaseOrders);
  router.get("/pos/:id", requireAdmin, getPurchaseOrder);
  router.post("/pos", requireAdmin, createPurchaseOrder);
  router.patch("/pos/:id/status", requireAdmin, updatePOStatus);

  // ── Payments ───────────────────────────────────────────────────────────
  router.get("/payments/list", requireAdmin, listPayments);
  router.post("/pos/:id/payments", requireAdmin, addPayment);

  return router;
}
