import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import {
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  type CreateCouponPayload,
} from '../api/coupon-api';

export const couponKeys = {
  all: ['coupons'] as const,
  list: (params: Record<string, unknown>) => ['coupons', 'list', params] as const,
};

export function useCoupons(params: { page?: number; limit?: number; status?: string } = {}) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: couponKeys.list(params),
    queryFn: () => listCoupons(params, getToken),
    staleTime: 30_000,
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: (payload: CreateCouponPayload) => createCoupon(payload, getToken),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: couponKeys.all });
    },
  });
}

export function useUpdateCoupon() {
  const qc = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateCouponPayload> }) =>
      updateCoupon(id, payload, getToken),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: couponKeys.all });
    },
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: (id: string) => deleteCoupon(id, getToken),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: couponKeys.all });
    },
  });
}
