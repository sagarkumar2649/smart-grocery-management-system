import { createAuthedClient, type GetToken } from '@/shared/api/api-client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Coupon {
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponPayload {
  code: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  validFrom: string;
  validUntil: string;
  isActive?: boolean;
}

export interface POSPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ── API Functions ─────────────────────────────────────────────────────────────

export async function listCoupons(
  params: { page?: number; limit?: number; status?: string } = {},
  getToken: GetToken,
): Promise<{ data: Coupon[]; meta: { pagination: POSPagination } }> {
  const client = createAuthedClient(getToken);
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.status) query.set('status', params.status);
  const qs = query.toString();
  return client.get(`/coupons${qs ? `?${qs}` : ''}`);
}

export async function createCoupon(
  payload: CreateCouponPayload,
  getToken: GetToken,
): Promise<{ data: Coupon }> {
  const client = createAuthedClient(getToken);
  return client.post('/coupons', payload);
}

export async function updateCoupon(
  id: string,
  payload: Partial<CreateCouponPayload>,
  getToken: GetToken,
): Promise<{ data: Coupon }> {
  const client = createAuthedClient(getToken);
  return client.put(`/coupons/${id}`, payload);
}

export async function deleteCoupon(
  id: string,
  getToken: GetToken,
): Promise<{ data: { message: string } }> {
  const client = createAuthedClient(getToken);
  return client.delete(`/coupons/${id}`);
}
