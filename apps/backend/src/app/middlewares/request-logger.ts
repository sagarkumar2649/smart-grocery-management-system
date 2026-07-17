import { randomUUID } from "node:crypto";
import { pinoHttp } from "pino-http";
import type { Request, RequestHandler, Response } from "express";
import { logger } from "../../core/logging/logger.js";

export const requestLogger: RequestHandler = pinoHttp({
  logger,
  genReqId: (req: Request, res: Response) => {
    const existing = req.headers["x-request-id"];
    const id = typeof existing === "string" && existing.length > 0 ? existing : randomUUID();
    res.setHeader("x-request-id", id);
    return id;
  },
  customProps: (req: Request) => ({
    requestId: req.id,
    method: req.method,
    url: req.url,
  }),
  customLogLevel: (_req: Request, res: Response, err?: Error) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  redact: ["req.headers.authorization", "req.headers.cookie"],
});
