import { createAuthedClient } from "@/shared/api/api-client";

// ── Types ─────────────────────────────────────────────────────────────────────

export type SupplierStatus = "active" | "inactive" | "blacklisted";
export const SUPPLIER_STATUSES: SupplierStatus[] = ["active", "inactive", "blacklisted"];

export type PaymentTerm = "COD" | "Net 15" | "Net 30" | "Net 45" | "Net 60" | "Net 90" | "Advance" | "Custom";
export const PAYMENT_TERMS: PaymentTerm[] = ["COD", "Net 15", "Net 30", "Net 45", "Net 60", "Net 90", "Advance", "Custom"];

export type POStatus = "draft" | "pending" | "confirmed" | "received" | "cancelled";
export const PO_STATUSES: POStatus[] = ["draft", "pending", "confirmed", "received", "cancelled"];

export type PaymentMethod = "cash" | "upi" | "bank_transfer" | "cheque" | "card" | "other";
export const PAYMENT_METHODS: PaymentMethod[] = ["cash", "upi", "bank_transfer", "cheque", "card", "other"];

export interface SupplierAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Supplier {
  _id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstNumber?: string;
  address: SupplierAddress;
  paymentTerms: PaymentTerm;
  customPaymentDays?: number;
  notes?: string;
  status: SupplierStatus;
  totalOrders: number;
  totalPurchases: number;
  pendingPayments: number;
  paidAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierDetail extends Supplier {
  recentPurchaseOrders: PurchaseOrder[];
}

export interface SupplierStats {
  total: number;
  active: number;
  inactive: number;
  blacklisted: number;
  totalPurchases: number;
  totalPaid: number;
  totalPending: number;
  pendingOrders: number;
  pendingAmount: number;
}

export interface POItem {
  product: string | { _id: string; name: string; sku: string; unit: string; imageUrl?: string };
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface POPayment {
  _id?: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  createdBy?: { name: string; email: string };
}

export interface PurchaseOrder {
  _id: string;
  orderNumber: string;
  supplier: string | { _id: string; companyName: string; contactPerson: string; phone?: string; email?: string; gstNumber?: string; address?: SupplierAddress; paymentTerms?: string };
  items: POItem[];
  orderDate: string;
  expectedDeliveryDate?: string;
  status: POStatus;
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingBalance: number;
  payments: POPayment[];
  invoiceNumber?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  _id: string;
  orderId: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface SupplierFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: SupplierStatus | "";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface POFilters {
  page?: number;
  limit?: number;
  supplier?: string;
  status?: POStatus | "";
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  supplier?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

type GetToken = () => Promise<string | null>;

// ── Supplier API ──────────────────────────────────────────────────────────────

export async function fetchSuppliers(filters: SupplierFilters = {}, getToken: GetToken) {
  const client = createAuthedClient(getToken);
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
  const qs = params.toString();
  return client.get<{ success: true; data: Supplier[]; meta: { pagination: { page: number; limit: number; total: number; pages: number } } }>(`/suppliers${qs ? `?${qs}` : ""}`);
}

export async function fetchSupplier(id: string, getToken: GetToken) {
  const client = createAuthedClient(getToken);
  return client.get<{ success: true; data: SupplierDetail }>(`/suppliers/${id}`);
}

export async function fetchSupplierStats(getToken: GetToken) {
  const client = createAuthedClient(getToken);
  return client.get<{ success: true; data: SupplierStats }>("/suppliers/stats");
}

export async function createSupplier(data: {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstNumber?: string;
  address: SupplierAddress;
  paymentTerms: PaymentTerm;
  customPaymentDays?: number;
  notes?: string;
}, getToken: GetToken) {
  const client = createAuthedClient(getToken);
  return client.post<{ success: true; data: Supplier }>("/suppliers", data);
}

export async function updateSupplier(id: string, data: Partial<{
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstNumber: string;
  address: SupplierAddress;
  paymentTerms: PaymentTerm;
  customPaymentDays: number;
  notes: string;
}>, getToken: GetToken) {
  const client = createAuthedClient(getToken);
  return client.put<{ success: true; data: Supplier }>(`/suppliers/${id}`, data);
}

export async function updateSupplierStatus(id: string, status: SupplierStatus, getToken: GetToken) {
  const client = createAuthedClient(getToken);
  return client.patch<{ success: true; data: Supplier }>(`/suppliers/${id}/status`, { status });
}

export async function deleteSupplier(id: string, getToken: GetToken) {
  const client = createAuthedClient(getToken);
  await client.delete(`/suppliers/${id}`);
}

// ── Purchase Order API ────────────────────────────────────────────────────────

export async function fetchPurchaseOrders(filters: POFilters = {}, getToken: GetToken) {
  const client = createAuthedClient(getToken);
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.supplier) params.set("supplier", filters.supplier);
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
  const qs = params.toString();
  return client.get<{ success: true; data: PurchaseOrder[]; meta: { pagination: { page: number; limit: number; total: number; pages: number } } }>(`/suppliers/pos/list${qs ? `?${qs}` : ""}`);
}

export async function fetchPurchaseOrder(id: string, getToken: GetToken) {
  const client = createAuthedClient(getToken);
  return client.get<{ success: true; data: PurchaseOrder }>(`/suppliers/pos/${id}`);
}

export async function createPurchaseOrder(data: {
  supplier: string;
  items: { product: string; productName: string; quantity: number; unitCost: number }[];
  expectedDeliveryDate?: string;
  gstAmount?: number;
  invoiceNumber?: string;
  notes?: string;
}, getToken: GetToken) {
  const client = createAuthedClient(getToken);
  return client.post<{ success: true; data: PurchaseOrder }>("/suppliers/pos", data);
}

export async function updatePOStatus(id: string, status: POStatus, getToken: GetToken) {
  const client = createAuthedClient(getToken);
  return client.patch<{ success: true; data: PurchaseOrder }>(`/suppliers/pos/${id}/status`, { status });
}

// ── Payments API ──────────────────────────────────────────────────────────────

export async function fetchPayments(filters: PaymentFilters = {}, getToken: GetToken) {
  const client = createAuthedClient(getToken);
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.supplier) params.set("supplier", filters.supplier);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
  const qs = params.toString();
  return client.get<{ success: true; data: PaymentRecord[]; meta: { pagination: { page: number; limit: number; total: number; pages: number } } }>(`/suppliers/payments/list${qs ? `?${qs}` : ""}`);
}

export async function addPayment(orderId: string, data: {
  amount: number;
  date?: string;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}, getToken: GetToken) {
  const client = createAuthedClient(getToken);
  return client.post<{ success: true; data: PurchaseOrder }>(`/suppliers/pos/${orderId}/payments`, data);
}
