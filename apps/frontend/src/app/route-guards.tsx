import { useAuth } from '@clerk/clerk-react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppUser } from '@/shared/hooks/use-app-user';

// ── Shared spinner ────────────────────────────────────────────────────────────
function AuthLoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}

// ── PublicRoute — redirect signed-in users away from login/signup ─────────────
export function PublicRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  const { role, isLoading } = useAppUser();

  if (!isLoaded || (isSignedIn && isLoading)) return <AuthLoadingSpinner />;

  if (isSignedIn) {
    // Send to the right home based on role
    return <Navigate to={role === 'ADMIN' ? '/dashboard' : '/store'} replace />;
  }

  return <Outlet />;
}

// ── ProtectedRoute — any signed-in user ──────────────────────────────────────
export function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!isLoaded) return <AuthLoadingSpinner />;

  if (!isSignedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

// ── AdminRoute — ADMIN role only ──────────────────────────────────────────────
export function AdminRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  const { role, isLoading, isError } = useAppUser();
  const location = useLocation();

  if (!isLoaded || isLoading) return <AuthLoadingSpinner />;

  if (!isSignedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isError || role === null) {
    // Sync hasn't completed yet — wait for it; show spinner briefly
    return <AuthLoadingSpinner />;
  }

  if (role !== 'ADMIN') {
    // Authenticated but not admin — send to store
    return <Navigate to="/store" replace />;
  }

  return <Outlet />;
}

// ── CustomerRoute — CUSTOMER role only ───────────────────────────────────────
export function CustomerRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  const { role, isLoading, isError } = useAppUser();
  const location = useLocation();

  if (!isLoaded || isLoading) return <AuthLoadingSpinner />;

  if (!isSignedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isError || role === null) return <AuthLoadingSpinner />;

  if (role !== 'CUSTOMER') {
    // Admin visiting customer routes — redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
