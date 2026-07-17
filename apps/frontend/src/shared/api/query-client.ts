import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/shared/api/http-client';

const STALE_TIME_MS = 60_000;
const GC_TIME_MS = 5 * 60_000;

function shouldRetry(failureCount: number, error: Error): boolean {
  if (failureCount >= 2) {
    return false;
  }

  if (error instanceof ApiError) {
    if (error.code === 'TIMEOUT' || error.code === 'NETWORK_ERROR') {
      return true;
    }

    if (error.status !== undefined && error.status >= 500) {
      return true;
    }
  }

  return false;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
      gcTime: GC_TIME_MS,
      refetchOnWindowFocus: import.meta.env.PROD,
      retry: shouldRetry,
    },
    mutations: {
      retry: false,
    },
  },
});
