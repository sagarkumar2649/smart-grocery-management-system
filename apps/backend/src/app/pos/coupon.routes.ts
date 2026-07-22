import { Router } from "express";
import { requireAdmin } from "../middlewares/auth.middleware.js";
import {
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "./coupon.controller.js";

export function buildCouponRouter(): Router {
  const router = Router();

  router.use(requireAdmin);

  router.get("/", listCoupons);
  router.post("/", createCoupon);
  router.put("/:id", updateCoupon);
  router.delete("/:id", deleteCoupon);

  return router;
}
