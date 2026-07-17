import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import {
  fetchProducts,
  fetchProduct,
  fetchCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductFilters,
} from "../api/products-api";

export const productKeys = {
  all: ["products"] as const,
  list: (filters: ProductFilters) => ["products", "list", filters] as const,
  detail: (id: string) => ["products", "detail", id] as const,
  categories: () => ["categories"] as const,
};

// ── Read queries (public — no token needed) ───────────────────────────────────

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => fetchProducts(filters),
    staleTime: 30_000,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => fetchProduct(id),
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  });
}

// ── Write mutations (protected — Clerk token injected) ────────────────────────

export function useCreateProduct() {
  const qc = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: (formData: FormData) => createProduct(formData, getToken),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateProduct(id, formData, getToken),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: productKeys.all });
      void qc.invalidateQueries({ queryKey: productKeys.detail(id) });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id, getToken),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
