import { createAuthedClient } from "@/shared/api/api-client";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CustomerStatus = "active" | "blocked" | "inactive";

export const CUSTOMER_STATUSES: CustomerStatus[] = [
  "active",
  "blocked",
  "inactive",
];

export interface Address {
  _id?: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface WishlistItem {
  _id: string;
  name: string;
  sellingPrice: number;
  mrp: number;
  imageUrl?: string;
  unit: string;
}

export interface Customer {
  _id: string;
  user: string;
  clerkId: string;
  name: string;
  email: string;
  phone?: string;
  status: CustomerStatus;
  loyaltyPoints: number;
  totalOrders: number;
  totalSpending: number;
  addresses: Address[];
  notes?: string;
  wishlist: WishlistItem[];
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerStats {
  total: number;
  active: number;
  blocked: number;
  inactive: number;
  totalSpending: number;
  totalOrders: number;
  avgSpending: number;
  totalLoyaltyPoints: number;
}

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: CustomerStatus | "";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CustomersListResponse {
  success: true;
  data: Customer[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface CustomerResponse {
  success: true;
  data: Customer;
}

export interface CustomerStatsResponse {
  success: true;
  data: CustomerStats;
}

type GetToken = () => Promise<string | null>;

// ── Admin API functions ───────────────────────────────────────────────────────

export async function fetchCustomers(
  filters: CustomerFilters = {},
  getToken: GetToken,
): Promise<CustomersListResponse> {
  const client = createAuthedClient(getToken);
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);

  const qs = params.toString();
  return client.get<CustomersListResponse>(`/customers${qs ? `?${qs}` : ""}`);
}

export async function fetchCustomer(
  id: string,
  getToken: GetToken,
): Promise<CustomerResponse> {
  const client = createAuthedClient(getToken);
  return client.get<CustomerResponse>(`/customers/${id}`);
}

export async function fetchCustomerStats(
  getToken: GetToken,
): Promise<CustomerStatsResponse> {
  const client = createAuthedClient(getToken);
  return client.get<CustomerStatsResponse>("/customers/stats");
}

export async function updateCustomerStatus(
  id: string,
  status: CustomerStatus,
  getToken: GetToken,
): Promise<CustomerResponse> {
  const client = createAuthedClient(getToken);
  return client.patch<CustomerResponse>(`/customers/${id}/status`, { status });
}

export async function updateCustomerNotes(
  id: string,
  notes: string | null,
  getToken: GetToken,
): Promise<CustomerResponse> {
  const client = createAuthedClient(getToken);
  return client.patch<CustomerResponse>(`/customers/${id}/notes`, { notes });
}

export async function adminUpdateCustomer(
  id: string,
  data: { name?: string; phone?: string | null; loyaltyPoints?: number; notes?: string | null },
  getToken: GetToken,
): Promise<CustomerResponse> {
  const client = createAuthedClient(getToken);
  return client.put<CustomerResponse>(`/customers/${id}`, data);
}

export async function deleteCustomer(
  id: string,
  getToken: GetToken,
): Promise<void> {
  const client = createAuthedClient(getToken);
  await client.delete(`/customers/${id}`);
}

// ── Customer self-service API functions ───────────────────────────────────────

export async function fetchMyProfile(getToken: GetToken): Promise<CustomerResponse> {
  const client = createAuthedClient(getToken);
  return client.get<CustomerResponse>("/customers/me");
}

export async function updateMyProfile(
  data: { name?: string; phone?: string | null },
  getToken: GetToken,
): Promise<CustomerResponse> {
  const client = createAuthedClient(getToken);
  return client.put<CustomerResponse>("/customers/me", data);
}

export async function addAddress(
  address: Omit<Address, "_id">,
  getToken: GetToken,
): Promise<CustomerResponse> {
  const client = createAuthedClient(getToken);
  return client.post<CustomerResponse>("/customers/me/addresses", address);
}

export async function removeAddress(
  addressId: string,
  getToken: GetToken,
): Promise<CustomerResponse> {
  const client = createAuthedClient(getToken);
  return client.delete<CustomerResponse>(`/customers/me/addresses/${addressId}`);
}

export async function toggleWishlistItem(
  productId: string,
  getToken: GetToken,
): Promise<CustomerResponse> {
  const client = createAuthedClient(getToken);
  return client.post<CustomerResponse>(`/customers/me/wishlist/${productId}`);
}
