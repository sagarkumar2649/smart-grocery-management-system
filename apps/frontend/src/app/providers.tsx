import { Provider as ReduxProvider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/app/router';
import { queryClient } from '@/shared/api/query-client';
import { ErrorBoundary } from '@/shared/components/feedback/ErrorBoundary';
import { store } from '@/store';

export function AppProviders() {
  return (
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ReduxProvider>
    </ErrorBoundary>
  );
}
