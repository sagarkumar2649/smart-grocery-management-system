import { createAuthedClient, type GetToken } from '@/shared/api/api-client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface POSProduct {
  _id: string;
  name: string;
  sku: string;
  barcode?: string;
  sellingPrice: number;
  mrp: number;
  gstPercent: number;
  stock: number;
  unit: string;
  imageUrl?: string;
  category: { _id: string; name: string; slug: string };
}

export interface POSInvoiceItem {
  product: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountType: 'percentage' | 'flat';
  gstPercent: number;
  gstAmount: number;
  total: number;
}

export interface POSInvoicePayment {
  method: 'cash' | 'upi' | 'card' | 'split';
  amount: number;
  reference?: string;
  upiTransactionId?: string;
  cardLast4?: string;
  cardType?: string;
}

export interface POSInvoice {
  _id: string;
  invoiceNumber: string;
  items: POSInvoiceItem[];
  subtotal: number;
  totalItemDiscount: number;
  couponCode?: string;
  couponDiscount: number;
  totalGST: number;
  gstBreakdown: { cgst: number; sgst: number; igst: number };
  grandTotal: number;
  payments: POSInvoicePayment[];
  paymentStatus: 'paid' | 'partial' | 'pending';
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  cashierName: string;
  status: 'completed' | 'voided' | 'refunded';
  voidReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutItem {
  productId: string;
  quantity: number;
  discount?: number;
  discountType?: 'percentage' | 'flat';
}

export interface CheckoutPayload {
  items: CheckoutItem[];
  payments: POSInvoicePayment[];
  discount?: number;
  discountType?: 'percentage' | 'flat';
  couponCode?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
}

export interface CouponValidation {
  code: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  calculatedDiscount: number;
}

export interface POSPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ── API Functions ─────────────────────────────────────────────────────────────

export async function searchPOSProducts(
  params: { search?: string; category?: string; page?: number; limit?: number },
  getToken: GetToken,
): Promise<{ data: POSProduct[]; meta: { pagination: POSPagination } }> {
  const client = createAuthedClient(getToken);
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.category) query.set('category', params.category);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  return client.get(`/pos/products${qs ? `?${qs}` : ''}`);
}

export async function getProductByBarcode(
  barcode: string,
  getToken: GetToken,
): Promise<{ data: POSProduct }> {
  const client = createAuthedClient(getToken);
  return client.get(`/pos/products/barcode/${encodeURIComponent(barcode)}`);
}

export async function checkout(
  payload: CheckoutPayload,
  getToken: GetToken,
): Promise<{ data: POSInvoice }> {
  const client = createAuthedClient(getToken);
  return client.post('/pos/checkout', payload);
}

export async function listPOSInvoices(
  params: { page?: number; limit?: number; status?: string; search?: string; startDate?: string; endDate?: string },
  getToken: GetToken,
): Promise<{ data: POSInvoice[]; meta: { pagination: POSPagination } }> {
  const client = createAuthedClient(getToken);
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.status) query.set('status', params.status);
  if (params.search) query.set('search', params.search);
  if (params.startDate) query.set('startDate', params.startDate);
  if (params.endDate) query.set('endDate', params.endDate);
  const qs = query.toString();
  return client.get(`/pos/invoices${qs ? `?${qs}` : ''}`);
}

export async function getPOSInvoice(
  id: string,
  getToken: GetToken,
): Promise<{ data: POSInvoice }> {
  const client = createAuthedClient(getToken);
  return client.get(`/pos/invoices/${id}`);
}

export async function voidPOSInvoice(
  id: string,
  reason: string,
  getToken: GetToken,
): Promise<{ data: POSInvoice }> {
  const client = createAuthedClient(getToken);
  return client.post(`/pos/invoices/${id}/void`, { reason });
}

export async function validatePOSCoupon(
  code: string,
  subtotal: number,
  getToken: GetToken,
): Promise<{ data: CouponValidation }> {
  const client = createAuthedClient(getToken);
  return client.post('/pos/validate-coupon', { code, subtotal });
}

export async function emailPOSInvoice(
  id: string,
  email: string,
  getToken: GetToken,
): Promise<{ data: { message: string } }> {
  const client = createAuthedClient(getToken);
  return client.post(`/pos/send-email/${id}`, { email });
}

export async function getPOSWhatsAppLink(
  id: string,
  getToken: GetToken,
): Promise<{ data: { url: string; phone: string } }> {
  const client = createAuthedClient(getToken);
  return client.get(`/pos/send-whatsapp/${id}`);
}

export function getInvoicePDFUrl(id: string): string {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
  return `${BASE_URL}/pos/invoices/${id}/pdf`;
}
