import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { createAuthedClient, type GetToken } from "@/shared/api/api-client";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  todaySales: number;
  todayOrdersCount: number;
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  totalProfit: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface ActivityItem {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  amount: number | null;
  status: string;
  type: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ── API Functions ─────────────────────────────────────────────────────────────

async function fetchDashboardStats(getToken: GetToken): Promise<ApiResponse<DashboardStats>> {
  const client = createAuthedClient(getToken);
  return client.get<ApiResponse<DashboardStats>>("/dashboard/stats");
}

async function fetchRecentActivity(getToken: GetToken): Promise<ApiResponse<ActivityItem[]>> {
  const client = createAuthedClient(getToken);
  return client.get<ApiResponse<ActivityItem[]>>("/dashboard/activity");
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useDashboardStats() {
  const { getToken, isSignedIn } = useAuth();
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const res = await fetchDashboardStats(getToken);
      return res.data;
    },
    enabled: !!isSignedIn,
    staleTime: 30_000,
  });
}

export function useRecentActivity() {
  const { getToken, isSignedIn } = useAuth();
  return useQuery({
    queryKey: ["dashboard", "activity"],
    queryFn: async () => {
      const res = await fetchRecentActivity(getToken);
      return res.data;
    },
    enabled: !!isSignedIn,
    staleTime: 30_000,
  });
}
