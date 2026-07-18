import { Router } from "express";
import { requireAdmin } from "../middlewares/auth.middleware.js";
import {
  getInventoryDashboard,
  getCurrentStock,
  getLowStockProducts,
  getOutOfStockProducts,
  getStockMovements,
  adjustStock,
  purchaseStock,
  reportDamagedStock,
  getExpiredProducts,
  updateProductStockSettings,
  getBatchMovements,
} from "./inventory.controller.js";

export function buildInventoryRouter(): Router {
  const router = Router();

  // Dashboard
  router.get("/dashboard", requireAdmin, getInventoryDashboard);

  // Stock views
  router.get("/stock", requireAdmin, getCurrentStock);
  router.get("/stock/low", requireAdmin, getLowStockProducts);
  router.get("/stock/out", requireAdmin, getOutOfStockProducts);

  // Movements
  router.get("/movements", requireAdmin, getStockMovements);
  router.get("/movements/batch/:batchNumber", requireAdmin, getBatchMovements);

  // Expired
  router.get("/expired", requireAdmin, getExpiredProducts);

  // Mutations
  router.post("/adjust", requireAdmin, adjustStock);
  router.post("/purchase", requireAdmin, purchaseStock);
  router.post("/damaged", requireAdmin, reportDamagedStock);

  // Product stock settings
  router.patch("/products/:id/stock-settings", requireAdmin, updateProductStockSettings);

  return router;
}
