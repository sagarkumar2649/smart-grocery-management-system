/**
 * useAppUser
 *
 * Syncs the signed-in Clerk user to our MongoDB AppUser on first load,
 * then returns the user record including their role (ADMIN | CUSTOMER).
 *
 * Call this once near the top of the app (e.g. inside ProtectedRoute or a
 * top-level provider) so every component can read role without re-fetching.
 */
import { useAuth, useUser } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export interface AppUserData {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
}

async function syncUserToBackend(
  getToken: () => Promise<string | null>,
  name: string,
  email: string,
): Promise<AppUserData> {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/users/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ name, email }),
  });

  const body = (await res.json()) as { success: true; data: AppUserData } | { success: false; error: { message: string } };

  if (!res.ok || !body.success) {
    throw new Error((body as { success: false; error: { message: string } }).error?.message ?? 'Failed to sync user');
  }

  return (body as { success: true; data: AppUserData }).data;
}

export function useAppUser() {
  const { getToken, isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();

  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const name = user?.fullName ?? user?.firstName ?? email;

  const query = useQuery({
    queryKey: ['appUser', email],
    queryFn: () => syncUserToBackend(getToken, name, email),
    // Only run once the Clerk session is ready and we have an email
    enabled: !!isSignedIn && isLoaded && !!email,
    staleTime: 10 * 60_000, // 10 min — role rarely changes
    retry: 2,
  });

  return {
    appUser: query.data ?? null,
    role: query.data?.role ?? null,
    isAdmin: query.data?.role === 'ADMIN',
    isCustomer: query.data?.role === 'CUSTOMER',
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
