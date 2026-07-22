import { createAuthedClient, type GetToken } from "@/shared/api/api-client";

// ── Types ─────────────────────────────────────────────────────────────────────

export type OrderPaymentMethod = "cod" | "upi" | "razorpay" | "qr";
export type OrderPaymentStatus = "pending" | "pending_verification" | "paid" | "failed" | "refunded";
export type OrderStatus =
  | "placed"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItem {
  product: string;
  name: string;
  sku: string;
  imageUrl?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  mrp: number;
  gstPercent: number;
  gstAmount: number;
  total: number;
}

export interface Order {
  _id: string;
  orderId: string;
  customer?: string;
  clerkId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: OrderAddress;
  items: OrderItem[];
  subtotal: number;
  totalGST: number;
  deliveryCharges: number;
  discount: number;
  grandTotal: number;
  paymentMethod: OrderPaymentMethod;
  paymentStatus: OrderPaymentStatus;
  orderStatus: OrderStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  notes?: string;
  cancelReason?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  pendingPayments: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { pagination?: Pagination };
}

// ── API Functions ─────────────────────────────────────────────────────────────

export async function createOrder(
  data: {
    items: { productId: string; quantity: number }[];
    shippingAddress: OrderAddress;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    paymentMethod: OrderPaymentMethod;
    deliveryCharges?: number;
    discount?: number;
    notes?: string;
  },
  getToken: GetToken,
): Promise<ApiResponse<Order>> {
  const client = createAuthedClient(getToken);
  return client.post<ApiResponse<Order>>("/orders", data);
}

export async function fetchMyOrders(
  params: { page?: number; limit?: number; status?: string },
  getToken: GetToken,
): Promise<ApiResponse<Order[]>> {
  const client = createAuthedClient(getToken);
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.status) searchParams.set("status", params.status);
  const query = searchParams.toString();
  return client.get<ApiResponse<Order[]>>(`/orders/me${query ? `?${query}` : ""}`);
}

export async function fetchMyOrder(
  id: string,
  getToken: GetToken,
): Promise<ApiResponse<Order>> {
  const client = createAuthedClient(getToken);
  return client.get<ApiResponse<Order>>(`/orders/me/${id}`);
}

export async function cancelMyOrder(
  id: string,
  reason: string,
  getToken: GetToken,
): Promise<ApiResponse<Order>> {
  const client = createAuthedClient(getToken);
  return client.post<ApiResponse<Order>>(`/orders/me/${id}/cancel`, { reason });
}

// ── Admin API Functions ───────────────────────────────────────────────────────

export async function fetchAllOrders(
  params: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  },
  getToken: GetToken,
): Promise<ApiResponse<Order[]>> {
  const client = createAuthedClient(getToken);
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  if (params.status) searchParams.set("status", params.status);
  if (params.paymentStatus) searchParams.set("paymentStatus", params.paymentStatus);
  if (params.search) searchParams.set("search", params.search);
  if (params.startDate) searchParams.set("startDate", params.startDate);
  if (params.endDate) searchParams.set("endDate", params.endDate);
  const query = searchParams.toString();
  return client.get<ApiResponse<Order[]>>(`/orders${query ? `?${query}` : ""}`);
}

export async function fetchOrderDetail(
  id: string,
  getToken: GetToken,
): Promise<ApiResponse<Order>> {
  const client = createAuthedClient(getToken);
  return client.get<ApiResponse<Order>>(`/orders/${id}`);
}

export async function updateOrderStatus(
  id: string,
  data: { orderStatus: OrderStatus; cancelReason?: string },
  getToken: GetToken,
): Promise<ApiResponse<Order>> {
  const client = createAuthedClient(getToken);
  return client.patch<ApiResponse<Order>>(`/orders/${id}/status`, data);
}

export async function fetchOrderStats(
  getToken: GetToken,
): Promise<ApiResponse<OrderStats>> {
  const client = createAuthedClient(getToken);
  return client.get<ApiResponse<OrderStats>>("/orders/stats");
}

// ── Public API Functions ──────────────────────────────────────────────────────

export interface UpiInfo {
  upiId: string;
  upiQrUrl: string;
  storeName: string;
}

export async function fetchUpiInfo(): Promise<ApiResponse<UpiInfo>> {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
  const response = await fetch(`${BASE_URL}/payment/upi-info`);
  return response.json();
}

// ── Admin Payment Verification ────────────────────────────────────────────────

export async function verifyPayment(
  id: string,
  data: { action: "approve" | "reject"; reason?: string },
  getToken: GetToken,
): Promise<ApiResponse<Order>> {
  const client = createAuthedClient(getToken);
  return client.post<ApiResponse<Order>>(`/orders/${id}/verify-payment`, data);
}
