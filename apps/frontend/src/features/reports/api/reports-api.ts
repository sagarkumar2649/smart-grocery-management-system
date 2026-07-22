import { createAuthedClient } from "@/shared/api/api-client";

type GetToken = () => Promise<string | null>;

export interface ReportDateRange {
  period?: "daily" | "weekly" | "monthly" | "yearly" | "custom";
  startDate?: string;
  endDate?: string;
}

export type ReportQueryParams = ReportDateRange & {
  limit?: string;
  sort?: string;
};

function buildParams(filters: ReportQueryParams): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.period) params.set("period", filters.period);
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  if (filters.limit) params.set("limit", filters.limit);
  if (filters.sort) params.set("sort", filters.sort);
  return params;
}

function qs(params: URLSearchParams): string {
  const s = params.toString();
  return s ? `?${s}` : "";
}

// ── Sales Report ──────────────────────────────────────────────────────────────

export interface SalesReport {
  summary: { totalSales: number; totalRevenue: number; avgOrderValue: number; transactions: number };
  trend: { _id: Record<string, number>; quantity: number; revenue: number; transactions: number }[];
  byProduct: { productName: string; sku: string; quantity: number; revenue: number }[];
  dateRange: { start: string; end: string };
  period: string;
}

export async function fetchSalesReport(filters: ReportDateRange, getToken: GetToken) {
  const client = createAuthedClient(getToken);
  return client.get<{ success: true; data: SalesReport }>(`/reports/sales${qs(buildParams(filters))}`);
}

// ── Purchase Report ───────────────────────────────────────────────────────────

export interface PurchaseReport {
  summary: { totalOrders: number; totalAmount: number; totalPaid: number; totalPending: number; totalGST: number; avgOrderValue: number };
  byStatus: { _id: string; count: number; amount: number }[];
  trend: { _id: Record<string, number>; amount: number; orders: number; paid: number }[];
  bySupplier: { companyName: string; orders: number; totalAmount: number; paidAmount: number }[];
  dateRange: { start: string; end: string };
  period: string;
}

export async function fetchPurchaseReport(filters: ReportDateRange, getToken: GetToken) {
  const client = createAuthedClient(getToken);
  return client.get<{ success: true; data: PurchaseReport }>(`/reports/purchases${qs(buildParams(filters))}`);
}

// ── Inventory Report ──────────────────────────────────────────────────────────

export interface InventoryReport {
  summary: { totalProducts: number; totalStockValue: number; totalRetailValue: number; totalStock: number; lowStock: number; outOfStock: number };
  byCategory: { categoryName: string; products: number; totalStock: number; stockValue: number; retailValue: number }[];
  topValue: { name: string; sku: string; stock: number; unit: string; purchasePrice: number; sellingPrice: number; totalValue: number }[];
  movements: { _id: string; count: number; quantity: number }[];
}

export async function fetchInventoryReport(getToken: GetToken) {
  const client = createAuthedClient(getToken);
  return client.get<{ success: true; data: InventoryReport }>("/reports/inventory");
}

// ── Profit & Loss Report ──────────────────────────────────────────────────────

export interface ProfitLossReport {
  summary: { revenue: number; costOfGoods: number; gst: number; grossProfit: number; margin: number; unitsSold: number; totalPurchases: number; totalPaid: number };
  trend: { _id: Record<string, number>; revenue: number; units: number }[];
  purchaseTrend: { _id: Record<string, number>; cost: number }[];
  dateRange: { start: string; end: string };
  period: string;
}

export async function fetchProfitLossReport(filters: ReportDateRange, getToken: GetToken) {
  const client = createAuthedClient(getToken);
  return client.get<{ success: true; data: ProfitLossReport }>(`/reports/profit-loss${qs(buildParams(filters))}`);
}

// ── Top Selling Products ──────────────────────────────────────────────────────

export interface TopSellingReport {
  products: { name: string; sku: string; sellingPrice: number; stock: number; totalSold: number; totalRevenue: number; transactions: number }[];
  dateRange: { start: string; end: string };
  total: number;
}

export async function fetchTopSellingReport(filters: ReportQueryParams, getToken: GetToken) {
  const client = createAuthedClient(getToken);
  return client.get<{ success: true; data: TopSellingReport }>(`/reports/top-selling${qs(buildParams(filters))}`);
}

// ── Customer Report ───────────────────────────────────────────────────────────

export interface CustomerReport {
  summary: { totalCustomers: number; activeCustomers: number; totalSpending: number; totalOrders: number; avgSpending: number; totalLoyaltyPoints: number };
  newCount: number;
  byStatus: { _id: string; count: number }[];
  topSpenders: { name: string; email: string; phone?: string; totalSpending: number; totalOrders: number; loyaltyPoints: number }[];
  spendingTrend: { _id: Record<string, number>; count: number }[];
  dateRange: { start: string; end: string };
}

export async function fetchCustomerReport(filters: ReportDateRange, getToken: GetToken) {
  const client = createAuthedClient(getToken);
  return client.get<{ success: true; data: CustomerReport }>(`/reports/customers${qs(buildParams(filters))}`);
}

// ── Supplier Report ───────────────────────────────────────────────────────────

export interface SupplierReport {
  summary: { totalSuppliers: number; activeSuppliers: number; totalPurchases: number; totalPaid: number; totalPending: number };
  byStatus: { _id: string; count: number }[];
  topSuppliers: { companyName: string; contactPerson: string; totalOrders: number; totalPurchases: number; paidAmount: number; pendingPayments: number; status: string }[];
  paymentMethods: { _id: string; count: number; total: number }[];
  ordersByStatus: { _id: string; count: number; amount: number }[];
  dateRange: { start: string; end: string };
}

export async function fetchSupplierReport(filters: ReportDateRange, getToken: GetToken) {
  const client = createAuthedClient(getToken);
  return client.get<{ success: true; data: SupplierReport }>(`/reports/suppliers${qs(buildParams(filters))}`);
}

// ── Low Stock Report ──────────────────────────────────────────────────────────

export interface LowStockItem {
  name: string;
  sku: string;
  stock: number;
  minimumStock: number;
  maximumStock: number;
  unit: string;
  categoryName: string;
  deficit: number;
}

export async function fetchLowStockReport(getToken: GetToken) {
  const client = createAuthedClient(getToken);
  return client.get<{ success: true; data: { products: LowStockItem[]; count: number } }>("/reports/low-stock");
}

// ── Out of Stock Report ───────────────────────────────────────────────────────

export interface OutOfStockItem {
  name: string;
  sku: string;
  stock: number;
  minimumStock: number;
  unit: string;
  categoryName: string;
  purchasePrice: number;
  sellingPrice: number;
  imageUrl?: string;
}

export async function fetchOutOfStockReport(getToken: GetToken) {
  const client = createAuthedClient(getToken);
  return client.get<{ success: true; data: { products: OutOfStockItem[]; count: number } }>("/reports/out-of-stock");
}

// ── Expired Products Report ───────────────────────────────────────────────────

export interface ExpiredProduct {
  name: string;
  sku: string;
  stock: number;
  unit: string;
  totalExpired: number;
  batches: string[];
  lastExpired: string;
}

export async function fetchExpiredReport(getToken: GetToken) {
  const client = createAuthedClient(getToken);
  return client.get<{ success: true; data: { products: ExpiredProduct[]; summary: { totalExpiredItems: number; totalExpiredQuantity: number } } }>("/reports/expired");
}
