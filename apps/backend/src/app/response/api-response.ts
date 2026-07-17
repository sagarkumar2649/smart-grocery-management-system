export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    message: string;
    code: string;
    details?: Record<string, unknown>;
  };
};

export function ok<T>(data: T, meta?: Record<string, unknown>): ApiSuccessResponse<T> {
  if (meta) {
    return { success: true, data, meta };
  }

  return { success: true, data };
}

export function fail(
  message: string,
  code: string,
  details?: Record<string, unknown>,
): ApiErrorResponse {
  if (details) {
    return { success: false, error: { message, code, details } };
  }

  return { success: false, error: { message, code } };
}
