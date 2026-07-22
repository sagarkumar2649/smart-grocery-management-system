import { Router } from "express";
import { ok } from "./response/api-response.js";
import { env } from "../core/config/env.js";
import { getMongoConnectionState } from "../infrastructure/db/mongoose.js";
import { buildAuthRouter } from "./auth/auth.routes.js";
import { buildCategoryRouter } from "./categories/category.routes.js";
import { buildProductRouter } from "./products/product.routes.js";
import { buildUserRouter } from "./users/user.routes.js";
import { buildStoreSettingsRouter } from "./store-settings/store-settings.routes.js";
import { buildInventoryRouter } from "./inventory/inventory.routes.js";
import { buildCustomerRouter } from "./customers/customer.routes.js";
import { buildSupplierRouter } from "./suppliers/supplier.routes.js";
import { buildReportRouter } from "./reports/report.routes.js";
import { buildPOSRouter } from "./pos/pos.routes.js";
import { buildCouponRouter } from "./pos/coupon.routes.js";
import { buildAdminSettingsRouter } from "./admin-settings/admin-settings.routes.js";
import { buildOrderRouter } from "./orders/order.routes.js";
import { AdminSettings } from "./admin-settings/admin-settings.model.js";
import { StoreSettings } from "./store-settings/store-settings.model.js";

export function buildApiRouter(): Router {
  const router = Router();

  router.use("/auth", buildAuthRouter());
  router.use("/categories", buildCategoryRouter());
  router.use("/products", buildProductRouter());
  router.use("/users", buildUserRouter());
  router.use("/store-settings", buildStoreSettingsRouter());
  router.use("/inventory", buildInventoryRouter());
  router.use("/customers", buildCustomerRouter());
  router.use("/suppliers", buildSupplierRouter());
  router.use("/reports", buildReportRouter());
  router.use("/pos", buildPOSRouter());
  router.use("/coupons", buildCouponRouter());
  router.use("/admin/settings", buildAdminSettingsRouter());
  router.use("/orders", buildOrderRouter());

  // ── Public: UPI payment info (no auth required) ─────────────────────────
  router.get("/payment/upi-info", async (_req, res) => {
    try {
      const adminSettings = await AdminSettings.findOne().lean();
      const storeSettings = await StoreSettings.findOne().lean();

      res.status(200).json(
        ok({
          upiId: adminSettings?.payment?.upiId ?? "",
          upiQrUrl: adminSettings?.payment?.upiQrUrl ?? "",
          storeName: storeSettings?.storeName ?? "SmartStore",
        }),
      );
    } catch {
      res.status(200).json(
        ok({ upiId: "", upiQrUrl: "", storeName: "SmartStore" }),
      );
    }
  });

  router.get("/health", async (_req, res) => {
    const mongo = getMongoConnectionState();
    res.status(200).json(
      ok({
        status: "ok",
        service: "smart-inventory-backend",
        environment: env.NODE_ENV,
        mongo,
      }),
    );
  });

  return router;
}
