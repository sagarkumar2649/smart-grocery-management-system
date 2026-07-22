import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import {
  fetchSuppliers,
  fetchSupplier,
  fetchSupplierStats,
  createSupplier,
  updateSupplier,
  updateSupplierStatus,
  deleteSupplier,
  fetchPurchaseOrders,
  fetchPurchaseOrder,
  createPurchaseOrder,
  updatePOStatus,
  fetchPayments,
  addPayment,
  type SupplierFilters,
  type POFilters,
  type PaymentFilters,
  type SupplierStatus,
  type POStatus,
  type PaymentMethod,
} from "../api/suppliers-api";

export const supplierKeys = {
  all: ["suppliers"] as const,
  list: (filters: SupplierFilters) => ["suppliers", "list", filters] as const,
  detail: (id: string) => ["suppliers", "detail", id] as const,
  stats: () => ["suppliers", "stats"] as const,
  poAll: ["purchaseOrders"] as const,
  poList: (filters: POFilters) => ["purchaseOrders", "list", filters] as const,
  poDetail: (id: string) => ["purchaseOrders", "detail", id] as const,
  payments: (filters: PaymentFilters) => ["payments", filters] as const,
};

// ── Supplier hooks ────────────────────────────────────────────────────────────

export function useSuppliers(filters: SupplierFilters = {}) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: supplierKeys.list(filters),
    queryFn: () => fetchSuppliers(filters, getToken),
    staleTime: 30_000,
  });
}

export function useSupplier(id: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: supplierKeys.detail(id),
    queryFn: () => fetchSupplier(id, getToken),
    enabled: !!id,
  });
}

export function useSupplierStats() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: supplierKeys.stats(),
    queryFn: () => fetchSupplierStats(getToken),
    staleTime: 60_000,
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: (data: Parameters<typeof createSupplier>[0]) => createSupplier(data, getToken),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: supplierKeys.all });
    },
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateSupplier>[1] }) =>
      updateSupplier(id, data, getToken),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: supplierKeys.all });
      void qc.invalidateQueries({ queryKey: supplierKeys.detail(id) });
    },
  });
}

export function useUpdateSupplierStatus() {
  const qc = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SupplierStatus }) =>
      updateSupplierStatus(id, status, getToken),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: supplierKeys.all });
      void qc.invalidateQueries({ queryKey: supplierKeys.detail(id) });
    },
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteSupplier(id, getToken),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: supplierKeys.all });
    },
  });
}

// ── Purchase Order hooks ──────────────────────────────────────────────────────

export function usePurchaseOrders(filters: POFilters = {}) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: supplierKeys.poList(filters),
    queryFn: () => fetchPurchaseOrders(filters, getToken),
    staleTime: 30_000,
  });
}

export function usePurchaseOrder(id: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: supplierKeys.poDetail(id),
    queryFn: () => fetchPurchaseOrder(id, getToken),
    enabled: !!id,
  });
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: (data: Parameters<typeof createPurchaseOrder>[0]) => createPurchaseOrder(data, getToken),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: supplierKeys.poAll });
      void qc.invalidateQueries({ queryKey: supplierKeys.all });
    },
  });
}

export function useUpdatePOStatus() {
  const qc = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: POStatus }) =>
      updatePOStatus(id, status, getToken),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: supplierKeys.poAll });
      void qc.invalidateQueries({ queryKey: supplierKeys.poDetail(id) });
      void qc.invalidateQueries({ queryKey: supplierKeys.all });
    },
  });
}

// ── Payment hooks ─────────────────────────────────────────────────────────────

export function usePayments(filters: PaymentFilters = {}) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: supplierKeys.payments(filters),
    queryFn: () => fetchPayments(filters, getToken),
    staleTime: 30_000,
  });
}

export function useAddPayment() {
  const qc = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: ({
      orderId,
      data,
    }: {
      orderId: string;
      data: { amount: number; date?: string; method: PaymentMethod; reference?: string; notes?: string };
    }) => addPayment(orderId, data, getToken),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: supplierKeys.poAll });
      void qc.invalidateQueries({ queryKey: supplierKeys.all });
      void qc.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}
