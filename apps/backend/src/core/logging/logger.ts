import pino from "pino";
import { env } from "../config/env.js";

export type Logger = pino.Logger;

export const logger = pino({
  level: env.LOG_LEVEL,
  base: null,
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "password",
      "token",
      "refreshToken",
      "accessToken",
    ],
    remove: true,
  },
});
