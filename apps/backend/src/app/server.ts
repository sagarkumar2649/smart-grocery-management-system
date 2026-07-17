import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import { env } from "../core/config/env.js";
import { securityMiddlewares } from "./middlewares/security.js";
import { apiRateLimiter } from "./middlewares/rate-limit.js";
import { requestLogger } from "./middlewares/request-logger.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { buildApiRouter } from "./routes.js";

export function createServer(): Express {
  const app = express();

  app.disable("x-powered-by");

  app.use(requestLogger);
  app.use(securityMiddlewares());

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser());

  app.use(env.API_PREFIX, apiRateLimiter, buildApiRouter());

  app.use(errorHandler);

  return app;
}
