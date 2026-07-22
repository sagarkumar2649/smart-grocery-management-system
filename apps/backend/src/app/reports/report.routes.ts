import { Router } from "express";
import { requireAdmin } from "../middlewares/auth.middleware.js";
import {
  getSalesReport,
  getPurchaseReport,
  getInventoryReport,
  getProfitLossReport,
  getTopSellingReport,
  getCustomerReport,
  getSupplierReport,
  getLowStockReport,
  getOutOfStockReport,
  getExpiredProductsReport,
} from "./report.controller.js";

export function buildReportRouter(): Router {
  const router = Router();

  router.get("/sales", requireAdmin, getSalesReport);
  router.get("/purchases", requireAdmin, getPurchaseReport);
  router.get("/inventory", requireAdmin, getInventoryReport);
  router.get("/profit-loss", requireAdmin, getProfitLossReport);
  router.get("/top-selling", requireAdmin, getTopSellingReport);
  router.get("/customers", requireAdmin, getCustomerReport);
  router.get("/suppliers", requireAdmin, getSupplierReport);
  router.get("/low-stock", requireAdmin, getLowStockReport);
  router.get("/out-of-stock", requireAdmin, getOutOfStockReport);
  router.get("/expired", requireAdmin, getExpiredProductsReport);

  return router;
}
