import rateLimit from "express-rate-limit";
import { env } from "../../core/config/env.js";

export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: "Too many requests. Please try again later.",
      code: "RATE_LIMITED",
    },
  },
});
