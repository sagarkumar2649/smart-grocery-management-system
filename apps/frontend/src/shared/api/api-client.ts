/**
 * Clerk-aware API client helpers.
 *
 * The base HTTP client accepts a `getToken` option on every request.
 * Rather than threading `useAuth().getToken` through every call site,
 * we expose two helpers:
 *
 *  - `createAuthedClient(getToken)` — wraps the base client and forwards
 *    the Clerk token getter to every method automatically.
 *  - `useApiClient()` — a React hook that returns a memoised authed client
 *    bound to the current Clerk session.
 *
 * Usage in hooks:
 *   const api = useApiClient();
 *   const data = await api.get<Foo>('/foo');
 *   const result = await api.post<Bar>('/bar', payload);
 */

import { useAuth } from '@clerk/clerk-react';
import { useMemo } from 'react';
import { createHttpClient, type RequestOptions } from './http-client';

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

// Shared unauthenticated client for public endpoints (e.g. GET /categories).
export const publicClient = createHttpClient(BASE_URL);

export type GetToken = () => Promise<string | null>;

/** Wraps createHttpClient and injects a Clerk `getToken` into every request. */
export function createAuthedClient(getToken: GetToken) {
  const base = createHttpClient(BASE_URL);

  // Build a shared option object that forwards the token getter.
  // Each helper copies it so individual call-site overrides still work.
  function withToken(options?: Omit<RequestOptions, 'method' | 'body'>): typeof options {
    return { ...options, getToken };
  }

  return {
    get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
      base.get<T>(path, withToken(options)),

    post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
      base.post<T>(path, body, withToken(options)),

    put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
      base.put<T>(path, body, withToken(options)),

    patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
      base.patch<T>(path, body, withToken(options)),

    delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
      base.delete<T>(path, withToken(options)),

    /** Expose getToken so callers can attach it to raw fetch() calls (e.g. multipart). */
    getToken,
  };
}

/** React hook — returns a memoised authed client for the current Clerk session. */
export function useApiClient() {
  const { getToken } = useAuth();
  // Re-create only when the Clerk getToken reference changes (i.e. on sign-in/out).
  return useMemo(() => createAuthedClient(getToken), [getToken]);
}
