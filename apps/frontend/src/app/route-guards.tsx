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
  const location = useLocation();

  if (!isLoaded || (isSignedIn && isLoading)) return <AuthLoadingSpinner />;

  if (isSignedIn) {
    // Admin always goes to the dashboard
    if (role === 'ADMIN') {
      return <Navigate to="/dashboard" replace />;
    }
    // Customer: return to the page they were redirected from, or store home
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
    if (from && from.startsWith('/store')) {
      return <Navigate to={from} replace />;
    }
    return <Navigate to="/store" replace />;
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

// ── StorefrontGuard — lets guests & customers through, blocks admins ─────────
export function StorefrontGuard() {
  const { isLoaded, isSignedIn } = useAuth();
  const { role, isLoading, isError } = useAppUser();

  if (!isLoaded) return <AuthLoadingSpinner />;

  if (isSignedIn) {
    // Wait for role to resolve before rendering the storefront
    if (isLoading || isError || role === null) return <AuthLoadingSpinner />;

    // Admin must never see the storefront
    if (role === 'ADMIN') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}

// ── ProtectedStoreRoute — CUSTOMER-only for checkout / orders / profile ───────
export function ProtectedStoreRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  const { role, isLoading, isError } = useAppUser();
  const location = useLocation();

  if (!isLoaded || (isSignedIn && isLoading)) return <AuthLoadingSpinner />;

  if (!isSignedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isError || role === null) return <AuthLoadingSpinner />;

  // Admin must never access customer store routes
  if (role === 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
