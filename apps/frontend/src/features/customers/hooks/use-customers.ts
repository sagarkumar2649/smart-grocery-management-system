import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import {
  fetchCustomers,
  fetchCustomer,
  fetchCustomerStats,
  updateCustomerStatus,
  updateCustomerNotes,
  adminUpdateCustomer,
  deleteCustomer,
  fetchMyProfile,
  updateMyProfile,
  addAddress,
  removeAddress,
  toggleWishlistItem,
  type CustomerFilters,
  type CustomerStatus,
} from "../api/customers-api";

export const customerKeys = {
  all: ["customers"] as const,
  list: (filters: CustomerFilters) => ["customers", "list", filters] as const,
  detail: (id: string) => ["customers", "detail", id] as const,
  stats: () => ["customers", "stats"] as const,
  me: () => ["customers", "me"] as const,
};

// ── Admin hooks ───────────────────────────────────────────────────────────────

export function useCustomers(filters: CustomerFilters = {}) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: () => fetchCustomers(filters, getToken),
    staleTime: 30_000,
  });
}

export function useCustomer(id: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => fetchCustomer(id, getToken),
    enabled: !!id,
  });
}

export function useCustomerStats() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: customerKeys.stats(),
    queryFn: () => fetchCustomerStats(getToken),
    staleTime: 60_000,
  });
}

export function useUpdateCustomerStatus() {
  const qc = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CustomerStatus }) =>
      updateCustomerStatus(id, status, getToken),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: customerKeys.all });
      void qc.invalidateQueries({ queryKey: customerKeys.detail(id) });
    },
  });
}

export function useUpdateCustomerNotes() {
  const qc = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string | null }) =>
      updateCustomerNotes(id, notes, getToken),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: customerKeys.all });
      void qc.invalidateQueries({ queryKey: customerKeys.detail(id) });
    },
  });
}

export function useAdminUpdateCustomer() {
  const qc = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; phone?: string | null; loyaltyPoints?: number; notes?: string | null };
    }) => adminUpdateCustomer(id, data, getToken),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: customerKeys.all });
      void qc.invalidateQueries({ queryKey: customerKeys.detail(id) });
    },
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id, getToken),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
}

// ── Customer self-service hooks ───────────────────────────────────────────────

export function useMyProfile() {
  const { getToken, isSignedIn } = useAuth();
  return useQuery({
    queryKey: customerKeys.me(),
    queryFn: () => fetchMyProfile(getToken),
    enabled: !!isSignedIn,
    staleTime: 30_000,
  });
}

export function useUpdateMyProfile() {
  const qc = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: (data: { name?: string; phone?: string | null }) =>
      updateMyProfile(data, getToken),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: customerKeys.me() });
    },
  });
}

export function useAddAddress() {
  const qc = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: (address: {
      label: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      pincode: string;
      isDefault?: boolean;
    }) => addAddress(address as never, getToken),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: customerKeys.me() });
    },
  });
}

export function useRemoveAddress() {
  const qc = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: (addressId: string) => removeAddress(addressId, getToken),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: customerKeys.me() });
    },
  });
}

export function useToggleWishlist() {
  const qc = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: (productId: string) => toggleWishlistItem(productId, getToken),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: customerKeys.me() });
    },
  });
}
