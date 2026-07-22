import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import {
  fetchSalesReport,
  fetchPurchaseReport,
  fetchInventoryReport,
  fetchProfitLossReport,
  fetchTopSellingReport,
  fetchCustomerReport,
  fetchSupplierReport,
  fetchLowStockReport,
  fetchOutOfStockReport,
  fetchExpiredReport,
  type ReportDateRange,
} from "../api/reports-api";

export const reportKeys = {
  all: ["reports"] as const,
  sales: (filters: ReportDateRange) => ["reports", "sales", filters] as const,
  purchases: (filters: ReportDateRange) => ["reports", "purchases", filters] as const,
  inventory: () => ["reports", "inventory"] as const,
  profitLoss: (filters: ReportDateRange) => ["reports", "profit-loss", filters] as const,
  topSelling: (filters: ReportDateRange & { limit?: string; sort?: string }) => ["reports", "top-selling", filters] as const,
  customers: (filters: ReportDateRange) => ["reports", "customers", filters] as const,
  suppliers: (filters: ReportDateRange) => ["reports", "suppliers", filters] as const,
  lowStock: () => ["reports", "low-stock"] as const,
  outOfStock: () => ["reports", "out-of-stock"] as const,
  expired: () => ["reports", "expired"] as const,
};

export function useSalesReport(filters: ReportDateRange) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: reportKeys.sales(filters),
    queryFn: () => fetchSalesReport(filters, getToken),
    staleTime: 60_000,
  });
}

export function usePurchaseReport(filters: ReportDateRange) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: reportKeys.purchases(filters),
    queryFn: () => fetchPurchaseReport(filters, getToken),
    staleTime: 60_000,
  });
}

export function useInventoryReport() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: reportKeys.inventory(),
    queryFn: () => fetchInventoryReport(getToken),
    staleTime: 60_000,
  });
}

export function useProfitLossReport(filters: ReportDateRange) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: reportKeys.profitLoss(filters),
    queryFn: () => fetchProfitLossReport(filters, getToken),
    staleTime: 60_000,
  });
}

export function useTopSellingReport(filters: ReportDateRange & { limit?: string; sort?: string }) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: reportKeys.topSelling(filters),
    queryFn: () => fetchTopSellingReport(filters, getToken),
    staleTime: 60_000,
  });
}

export function useCustomerReport(filters: ReportDateRange) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: reportKeys.customers(filters),
    queryFn: () => fetchCustomerReport(filters, getToken),
    staleTime: 60_000,
  });
}

export function useSupplierReport(filters: ReportDateRange) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: reportKeys.suppliers(filters),
    queryFn: () => fetchSupplierReport(filters, getToken),
    staleTime: 60_000,
  });
}

export function useLowStockReport() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: reportKeys.lowStock(),
    queryFn: () => fetchLowStockReport(getToken),
    staleTime: 60_000,
  });
}

export function useOutOfStockReport() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: reportKeys.outOfStock(),
    queryFn: () => fetchOutOfStockReport(getToken),
    staleTime: 60_000,
  });
}

export function useExpiredReport() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: reportKeys.expired(),
    queryFn: () => fetchExpiredReport(getToken),
    staleTime: 60_000,
  });
}
