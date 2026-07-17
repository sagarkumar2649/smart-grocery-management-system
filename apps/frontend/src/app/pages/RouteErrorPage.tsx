import { useRouteError, isRouteErrorResponse } from 'react-router-dom';

export function RouteErrorPage() {
  const error = useRouteError();

  let title = 'Unexpected error';
  let message = 'An unexpected error occurred while loading this page.';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = typeof error.data === 'string' ? error.data : message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div
      role="alert"
      className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      <a
        href="/"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Go to home
      </a>
    </div>
  );
}
