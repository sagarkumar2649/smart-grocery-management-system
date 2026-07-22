import { Router } from "express";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware.js";
import {
  createOrder,
  getMyOrders,
  getMyOrder,
  cancelMyOrder,
  listAllOrders,
  getOrderDetail,
  updateOrderStatus,
  verifyPayment,
  getOrderStats,
} from "./order.controller.js";

export function buildOrderRouter(): Router {
  const router = Router();

  // ── Customer routes ───────────────────────────────────────────────────────
  router.post("/", requireAuth, createOrder);
  router.get("/me", requireAuth, getMyOrders);
  router.get("/me/:id", requireAuth, getMyOrder);
  router.post("/me/:id/cancel", requireAuth, cancelMyOrder);

  // ── Admin routes ──────────────────────────────────────────────────────────
  router.get("/stats", requireAdmin, getOrderStats);
  router.get("/", requireAdmin, listAllOrders);
  router.get("/:id", requireAdmin, getOrderDetail);
  router.patch("/:id/status", requireAdmin, updateOrderStatus);
  router.post("/:id/verify-payment", requireAdmin, verifyPayment);

  return router;
}
