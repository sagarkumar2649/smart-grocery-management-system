import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import {
  searchPOSProducts,
  getProductByBarcode,
  checkout,
  listPOSInvoices,
  getPOSInvoice,
  voidPOSInvoice,
  validatePOSCoupon,
  emailPOSInvoice,
  getPOSWhatsAppLink,
  type CheckoutPayload,
} from '../api/pos-api';

export const posKeys = {
  all: ['pos'] as const,
  products: (search: string, category: string) => ['pos', 'products', search, category] as const,
  barcode: (barcode: string) => ['pos', 'barcode', barcode] as const,
  invoices: (params: Record<string, unknown>) => ['pos', 'invoices', params] as const,
  invoiceDetail: (id: string) => ['pos', 'invoices', id] as const,
  couponValidation: (code: string, subtotal: number) => ['pos', 'coupon', code, subtotal] as const,
};

export function usePOSProducts(search: string, category: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: posKeys.products(search, category),
    queryFn: () => searchPOSProducts({ search, category, limit: 100 }, getToken),
    staleTime: 10_000,
    enabled: true,
  });
}

export function useBarcodeLookup(barcode: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: posKeys.barcode(barcode),
    queryFn: () => getProductByBarcode(barcode, getToken),
    enabled: barcode.length > 0,
    retry: false,
    staleTime: 0,
  });
}

export function useCheckout() {
  const qc = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: (payload: CheckoutPayload) => checkout(payload, getToken),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: posKeys.invoices({}) });
    },
  });
}

export function usePOSInvoices(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: posKeys.invoices(params),
    queryFn: () => listPOSInvoices(params, getToken),
    staleTime: 10_000,
  });
}

export function usePOSInvoice(id: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: posKeys.invoiceDetail(id),
    queryFn: () => getPOSInvoice(id, getToken),
    enabled: !!id,
  });
}

export function useVoidInvoice() {
  const qc = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => voidPOSInvoice(id, reason, getToken),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: posKeys.invoices({}) });
      void qc.invalidateQueries({ queryKey: posKeys.invoiceDetail(id) });
    },
  });
}

export function useValidateCoupon() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: ({ code, subtotal }: { code: string; subtotal: number }) =>
      validatePOSCoupon(code, subtotal, getToken),
  });
}

export function useEmailInvoice() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) =>
      emailPOSInvoice(id, email, getToken),
  });
}

export function useWhatsAppLink() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: (id: string) => getPOSWhatsAppLink(id, getToken),
  });
}
