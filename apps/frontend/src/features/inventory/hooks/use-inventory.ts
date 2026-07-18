import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import {
  fetchInventoryDashboard,
  fetchCurrentStock,
  fetchLowStockProducts,
  fetchOutOfStockProducts,
  fetchStockMovements,
  createStockAdjustment,
  createPurchaseStock,
  reportDamagedStock,
  fetchExpiredProducts,
  fetchBatchMovements,
  updateProductStockSettings,
  type StockAdjustmentPayload,
  type PurchaseStockPayload,
} from "../api/inventory-api";

export const inventoryKeys = {
  all: ["inventory"] as const,
  dashboard: () => [...inventoryKeys.all, "dashboard"] as const,
  stock: (filters: Record<string, string>) => [...inventoryKeys.all, "stock", filters] as const,
  lowStock: () => [...inventoryKeys.all, "stock", "low"] as const,
  outOfStock: () => [...inventoryKeys.all, "stock", "out"] as const,
  movements: (filters: Record<string, string>) => [...inventoryKeys.all, "movements", filters] as const,
  expired: () => [...inventoryKeys.all, "expired"] as const,
  batch: (batchNumber: string) => [...inventoryKeys.all, "batch", batchNumber] as const,
};

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function useInventoryDashboard() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: inventoryKeys.dashboard(),
    queryFn: () => fetchInventoryDashboard(getToken),
    staleTime: 30_000,
  });
}

// ── Current Stock ─────────────────────────────────────────────────────────────

export function useCurrentStock(filters: Record<string, string> = {}) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: inventoryKeys.stock(filters),
    queryFn: () => fetchCurrentStock(filters, getToken),
    staleTime: 30_000,
  });
}

export function useLowStockProducts() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: inventoryKeys.lowStock(),
    queryFn: () => fetchLowStockProducts(getToken),
    staleTime: 30_000,
  });
}

export function useOutOfStockProducts() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: inventoryKeys.outOfStock(),
    queryFn: () => fetchOutOfStockProducts(getToken),
    staleTime: 30_000,
  });
}

// ── Movements ─────────────────────────────────────────────────────────────────

export function useStockMovements(filters: Record<string, string> = {}) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: inventoryKeys.movements(filters),
    queryFn: () => fetchStockMovements(filters, getToken),
    staleTime: 30_000,
  });
}

// ── Expired ───────────────────────────────────────────────────────────────────

export function useExpiredProducts() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: inventoryKeys.expired(),
    queryFn: () => fetchExpiredProducts(getToken),
    staleTime: 30_000,
  });
}

// ── Batch ─────────────────────────────────────────────────────────────────────

export function useBatchMovements(batchNumber: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: inventoryKeys.batch(batchNumber),
    queryFn: () => fetchBatchMovements(batchNumber, getToken),
    enabled: !!batchNumber,
    staleTime: 30_000,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useAdjustStock() {
  const qc = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: (payload: StockAdjustmentPayload) =>
      createStockAdjustment(payload, getToken),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}

export function usePurchaseStock() {
  const qc = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: (payload: PurchaseStockPayload) =>
      createPurchaseStock(payload, getToken),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}

export function useReportDamaged() {
  const qc = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: (payload: { productId: string; quantity: number; notes?: string; batchNumber?: string }) =>
      reportDamagedStock(payload, getToken),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}

export function useUpdateStockSettings() {
  const qc = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: ({
      productId,
      settings,
    }: {
      productId: string;
      settings: { minimumStock?: number; maximumStock?: number; reservedStock?: number };
    }) => updateProductStockSettings(productId, settings, getToken),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}
