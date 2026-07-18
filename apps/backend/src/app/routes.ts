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

export function buildApiRouter(): Router {
  const router = Router();

  router.use("/auth", buildAuthRouter());
  router.use("/categories", buildCategoryRouter());
  router.use("/products", buildProductRouter());
  router.use("/users", buildUserRouter());
  router.use("/store-settings", buildStoreSettingsRouter());
  router.use("/inventory", buildInventoryRouter());

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
