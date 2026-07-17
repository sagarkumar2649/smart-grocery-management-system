import cors, { type CorsOptions } from "cors";
import helmet from "helmet";
import type { RequestHandler } from "express";
import { env } from "../../core/config/env.js";

export function securityMiddlewares(): RequestHandler[] {
  const corsOptions: CorsOptions = {
    origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
  };

  const helmetOptions = {
    crossOriginResourcePolicy: { policy: "cross-origin" as const },
    ...(env.NODE_ENV === "production" ? {} : { contentSecurityPolicy: false }),
  };

  return [
    helmet(helmetOptions),
    cors(corsOptions),
  ];
}
