import type { ErrorCode } from "./error-codes.js";

export type AppErrorDetails = Record<string, unknown>;

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly details?: AppErrorDetails;
  readonly isOperational: boolean;

  constructor(
    message: string,
    options: {
      code: ErrorCode;
      statusCode: number;
      details?: AppErrorDetails;
      cause?: unknown;
      isOperational?: boolean;
    },
  ) {
    super(message, { cause: options.cause });
    this.name = "AppError";
    this.code = options.code;
    this.statusCode = options.statusCode;
    if (options.details !== undefined) {
      this.details = options.details;
    }
    this.isOperational = options.isOperational ?? true;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
