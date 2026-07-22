import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import {
  createOrder,
  fetchMyOrders,
  fetchMyOrder,
  cancelMyOrder,
  fetchAllOrders,
  fetchOrderDetail,
  updateOrderStatus,
  fetchOrderStats,
  fetchUpiInfo,
  verifyPayment,
  type OrderPaymentMethod,
  type OrderAddress,
  type OrderStatus,
} from "../api/orders-api";

// ── Query Keys ────────────────────────────────────────────────────────────────

export const orderKeys = {
  all: ["orders"] as const,
  my: () => ["orders", "me"] as const,
  myList: (params: { page?: number; limit?: number; status?: string }) =>
    ["orders", "me", "list", params] as const,
  myDetail: (id: string) => ["orders", "me", id] as const,
  admin: () => ["orders", "admin"] as const,
  adminList: (params: Record<string, unknown>) =>
    ["orders", "admin", "list", params] as const,
  adminDetail: (id: string) => ["orders", "admin", id] as const,
  stats: () => ["orders", "stats"] as const,
};

// ── Customer Hooks ────────────────────────────────────────────────────────────

export function useCreateOrder() {
  const qc = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: (data: {
      items: { productId: string; quantity: number }[];
      shippingAddress: OrderAddress;
      customerName: string;
      customerPhone: string;
      customerEmail?: string;
      paymentMethod: OrderPaymentMethod;
      deliveryCharges?: number;
      discount?: number;
      notes?: string;
    }) => createOrder(data, getToken).then((res) => res.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orderKeys.my() });
    },
  });
}

export function useMyOrders(params: { page?: number; limit?: number; status?: string } = {}) {
  const { getToken, isSignedIn } = useAuth();
  return useQuery({
    queryKey: orderKeys.myList(params),
    queryFn: () => fetchMyOrders(params, getToken),
    enabled: !!isSignedIn,
    staleTime: 30_000,
  });
}

export function useMyOrder(id: string) {
  const { getToken, isSignedIn } = useAuth();
  return useQuery({
    queryKey: orderKeys.myDetail(id),
    queryFn: async () => {
      const res = await fetchMyOrder(id, getToken);
      return res.data;
    },
    enabled: !!isSignedIn && !!id,
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      cancelMyOrder(id, reason, getToken).then((res) => res.data),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: orderKeys.my() });
      void qc.invalidateQueries({ queryKey: orderKeys.myDetail(id) });
    },
  });
}

// ── Admin Hooks ───────────────────────────────────────────────────────────────

export function useAllOrders(
  params: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  } = {},
) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: orderKeys.adminList(params),
    queryFn: () => fetchAllOrders(params, getToken),
    staleTime: 30_000,
  });
}

export function useOrderDetail(id: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: orderKeys.adminDetail(id),
    queryFn: async () => {
      const res = await fetchOrderDetail(id, getToken);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: ({
      id,
      orderStatus,
      cancelReason,
    }: {
      id: string;
      orderStatus: OrderStatus;
      cancelReason?: string;
    }) => updateOrderStatus(id, { orderStatus, cancelReason }, getToken).then((res) => res.data),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: orderKeys.admin() });
      void qc.invalidateQueries({ queryKey: orderKeys.adminDetail(id) });
      void qc.invalidateQueries({ queryKey: orderKeys.stats() });
    },
  });
}

export function useOrderStats() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: orderKeys.stats(),
    queryFn: async () => {
      const res = await fetchOrderStats(getToken);
      return res.data;
    },
    staleTime: 60_000,
  });
}

// ── UPI / Payment Verification Hooks ──────────────────────────────────────────

export function useUpiInfo() {
  return useQuery({
    queryKey: ["upiInfo"] as const,
    queryFn: async () => {
      const res = await fetchUpiInfo();
      return res.data;
    },
    staleTime: 5 * 60_000,
  });
}

export function useVerifyPayment() {
  const qc = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: ({
      id,
      action,
      reason,
    }: {
      id: string;
      action: "approve" | "reject";
      reason?: string;
    }) => verifyPayment(id, { action, reason }, getToken).then((res) => res.data),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: orderKeys.admin() });
      void qc.invalidateQueries({ queryKey: orderKeys.adminDetail(id) });
      void qc.invalidateQueries({ queryKey: orderKeys.stats() });
    },
  });
}
