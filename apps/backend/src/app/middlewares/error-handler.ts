import type { ErrorRequestHandler } from "express";
import { isAppError } from "../../core/errors/app-error.js";
import { errorCodes } from "../../core/errors/error-codes.js";
import { logger } from "../../core/logging/logger.js";
import { fail } from "../response/api-response.js";

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const requestId = req.id;

  if (isAppError(err)) {
    if (err.statusCode >= 500) {
      logger.error({ err, requestId }, "Operational AppError");
    }

    res.status(err.statusCode).json(
      fail(err.message, err.code, {
        requestId,
        ...(err.details ?? {}),
      }),
    );

    return;
  }

  logger.error({ err, requestId }, "Unhandled error");

  res.status(500).json(
    fail("Internal server error", errorCodes.INTERNAL_ERROR, {
      requestId,
    }),
  );
};
