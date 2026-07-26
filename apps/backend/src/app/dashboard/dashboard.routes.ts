import { Router } from "express";
import { requireAdmin } from "../middlewares/auth.middleware.js";
import { getDashboardStats, getRecentActivity } from "./dashboard.controller.js";

export function buildDashboardRouter(): Router {
  const router = Router();

  router.get("/stats", requireAdmin, getDashboardStats);
  router.get("/activity", requireAdmin, getRecentActivity);

  return router;
}
