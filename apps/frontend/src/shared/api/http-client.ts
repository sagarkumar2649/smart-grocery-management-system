export type ApiErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'PARSE_ERROR'
  | 'HTTP_ERROR'
  | 'UNKNOWN';

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number | undefined;
  readonly details: unknown;

  constructor(
    message: string,
    options: {
      code: ApiErrorCode;
      status?: number;
      details?: unknown;
      cause?: unknown;
    },
  ) {
    super(message, { cause: options.cause });
    this.name = 'ApiError';
    this.code = options.code;
    this.status = options.status;
    this.details = options.details;
  }
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: Record<string, unknown>;
  };
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions extends Omit<RequestInit, 'method' | 'body'> {
  method?: HttpMethod;
  body?: unknown;
  timeoutMs?: number;
  /** A static token string to attach as `Authorization: Bearer <token>`. */
  accessToken?: string;
  /**
   * An async function that resolves to a fresh token on every request.
   * When provided it takes precedence over `accessToken`.
   * Pass `useAuth().getToken` from Clerk here.
   */
  getToken?: () => Promise<string | null>;
}

const DEFAULT_TIMEOUT_MS = 30_000;

function buildUrl(path: string, baseUrl: string): string {
  if (path.startsWith('http')) {
    return path;
  }

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch (cause) {
      throw new ApiError('Failed to parse JSON response', {
        code: 'PARSE_ERROR',
        status: response.status,
        cause,
      });
    }
  }

  const text = await response.text();
  return text.length > 0 ? text : null;
}

export function createHttpClient(baseUrl: string) {
  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      body,
      headers,
      timeoutMs = DEFAULT_TIMEOUT_MS,
      accessToken,
      getToken,
      ...rest
    } = options;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    const requestHeaders = new Headers(headers);

    if (body !== undefined && !requestHeaders.has('Content-Type')) {
      requestHeaders.set('Content-Type', 'application/json');
    }

    // getToken (async, e.g. Clerk) takes precedence over a static accessToken
    const resolvedToken = getToken ? await getToken() : accessToken;
    if (resolvedToken) {
      requestHeaders.set('Authorization', `Bearer ${resolvedToken}`);
    }

    try {
      const fetchInit: RequestInit = {
        ...rest,
        method,
        headers: requestHeaders,
        signal: controller.signal,
      };

      if (body !== undefined) {
        fetchInit.body = JSON.stringify(body);
      }

      const response = await fetch(buildUrl(path, baseUrl), fetchInit);

      const responseBody = await parseResponseBody(response);

      if (!response.ok) {
        const errorPayload = responseBody as ApiErrorResponse | null;
        const message =
          errorPayload?.error?.message ?? `Request failed with status ${response.status}`;

        throw new ApiError(message, {
          code: 'HTTP_ERROR',
          status: response.status,
          details: responseBody,
        });
      }

      return responseBody as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('Request timed out', {
          code: 'TIMEOUT',
          cause: error,
        });
      }

      throw new ApiError('Network request failed', {
        code: 'NETWORK_ERROR',
        cause: error,
      });
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  return {
    get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
      request<T>(path, { ...options, method: 'GET' }),
    post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
      request<T>(path, { ...options, method: 'POST', body }),
    put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
      request<T>(path, { ...options, method: 'PUT', body }),
    patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
      request<T>(path, { ...options, method: 'PATCH', body }),
    delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
      request<T>(path, { ...options, method: 'DELETE' }),
  };
}
