import { publicClient, createAuthedClient } from "@/shared/api/api-client";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

export type ProductUnit =
  | "Piece"
  | "Kg"
  | "Gram"
  | "Litre"
  | "ml"
  | "Packet"
  | "Box"
  | "Bottle";

export const PRODUCT_UNITS: ProductUnit[] = [
  "Piece",
  "Kg",
  "Gram",
  "Litre",
  "ml",
  "Packet",
  "Box",
  "Bottle",
];

export const GST_RATES = [0, 5, 12, 18, 28] as const;
export type GstRate = (typeof GST_RATES)[number];

export interface Product {
  _id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: Category;
  brand?: string;
  /** Prices in rupees (converted from paise by backend) */
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  gstPercent: GstRate;
  hsnCode?: string;
  stock: number;
  minimumStock: number;
  unit: ProductUnit;
  imageUrl?: string;
  imagePublicId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsListResponse {
  success: true;
  data: Product[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ProductResponse {
  success: true;
  data: Product;
}

export interface CategoriesResponse {
  success: true;
  data: Category[];
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: "active" | "inactive" | "";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  lowStock?: boolean;
}

// ── Token type alias ──────────────────────────────────────────────────────────

type GetToken = () => Promise<string | null>;

// ── API functions ─────────────────────────────────────────────────────────────

/** Public — no auth required. */
export async function fetchCategories(): Promise<CategoriesResponse> {
  return publicClient.get<CategoriesResponse>("/categories");
}

/** Public — listing products does not require auth. */
export async function fetchProducts(filters: ProductFilters = {}): Promise<ProductsListResponse> {
  const params = new URLSearchParams();
  if (filters.page)      params.set("page",      String(filters.page));
  if (filters.limit)     params.set("limit",     String(filters.limit));
  if (filters.search)    params.set("search",    filters.search);
  if (filters.category)  params.set("category",  filters.category);
  if (filters.status)    params.set("status",    filters.status);
  if (filters.sortBy)    params.set("sortBy",    filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
  if (filters.lowStock)  params.set("lowStock",  "true");

  const qs = params.toString();
  return publicClient.get<ProductsListResponse>(`/products${qs ? `?${qs}` : ""}`);
}

export async function fetchProduct(id: string): Promise<ProductResponse> {
  return publicClient.get<ProductResponse>(`/products/${id}`);
}

// ── Protected mutations ───────────────────────────────────────────────────────

/**
 * Create a product.  Uses raw fetch so multer receives a proper multipart
 * body; we manually add the Authorization header from the Clerk token.
 */
export async function createProduct(
  formData: FormData,
  getToken: GetToken,
): Promise<ProductResponse> {
  const token = await getToken();

  const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
  const response = await fetch(`${BASE_URL}/products`, {
    method: "POST",
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const data = (await response.json()) as
    | ProductResponse
    | { success: false; error: { message: string } };

  if (!response.ok || !data.success) {
    throw new Error(
      (data as { success: false; error: { message: string } }).error?.message ??
        "Failed to create product",
    );
  }
  return data as ProductResponse;
}

/**
 * Update a product.  Same multipart approach as createProduct.
 */
export async function updateProduct(
  id: string,
  formData: FormData,
  getToken: GetToken,
): Promise<ProductResponse> {
  const token = await getToken();

  const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
  const response = await fetch(`${BASE_URL}/products/${id}`, {
    method: "PUT",
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const data = (await response.json()) as
    | ProductResponse
    | { success: false; error: { message: string } };

  if (!response.ok || !data.success) {
    throw new Error(
      (data as { success: false; error: { message: string } }).error?.message ??
        "Failed to update product",
    );
  }
  return data as ProductResponse;
}

/** Delete a product — uses the authed JSON client. */
export async function deleteProduct(id: string, getToken: GetToken): Promise<void> {
  const client = createAuthedClient(getToken);
  await client.delete(`/products/${id}`);
}

/** Create a category (admin action) — uses the authed JSON client. */
export async function createCategory(
  name: string,
  getToken: GetToken,
  description?: string,
): Promise<Category> {
  const client = createAuthedClient(getToken);
  const res = await client.post<{ success: true; data: Category }>("/categories", {
    name,
    description,
  });
  return res.data;
}
