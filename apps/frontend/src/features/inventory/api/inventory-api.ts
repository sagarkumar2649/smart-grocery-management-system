import { createAuthedClient, type GetToken } from "@/shared/api/api-client";

// ── Types ─────────────────────────────────────────────────────────────────────

export type MovementType =
  | "purchase"
  | "sale"
  | "return"
  | "adjustment"
  | "damaged"
  | "expired"
  | "transfer"
  | "opening";

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  purchase: "Purchase",
  sale: "Sale",
  return: "Return",
  adjustment: "Adjustment",
  damaged: "Damaged",
  expired: "Expired",
  transfer: "Transfer",
  opening: "Opening Stock",
};

export const MOVEMENT_TYPE_COLORS: Record<MovementType, string> = {
  purchase: "bg-success/10 text-success",
  sale: "bg-primary/10 text-primary",
  return: "bg-warning/10 text-warning",
  adjustment: "bg-gray-100 text-gray-600",
  damaged: "bg-danger/10 text-danger",
  expired: "bg-danger/10 text-danger",
  transfer: "bg-teal-100 text-teal-700",
  opening: "bg-primary/10 text-primary",
};

export interface InventoryProduct {
  _id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: { _id: string; name: string; slug: string };
  brand?: string;
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  gstPercent: number;
  stock: number;
  reservedStock: number;
  availableStock: number;
  minimumStock: number;
  maximumStock: number;
  unit: string;
  imageUrl?: string;
  isActive: boolean;
  stockStatus: "in" | "low" | "out";
  createdAt: string;
  updatedAt: string;
}

export interface StockMovementRecord {
  _id: string;
  product: {
    _id: string;
    name: string;
    sku: string;
    imageUrl?: string;
    unit?: string;
  };
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reference?: string;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
  unitCost?: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryDashboardData {
  totalProducts: number;
  totalStockValue: number;
  totalRetailValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  recentMovements: StockMovementRecord[];
  movementsByType: Array<{
    _id: string;
    count: number;
    totalQuantity: number;
  }>;
  stockByCategory: Array<{
    _id: string;
    totalProducts: number;
    totalStock: number;
    totalValue: number;
  }>;
  lowStockProducts: Array<{
    _id: string;
    name: string;
    sku: string;
    stock: number;
    minimumStock: number;
    unit: string;
    imageUrl?: string;
  }>;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface StockAdjustmentPayload {
  productId: string;
  type: MovementType;
  quantity: number;
  reference?: string;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
  unitCost?: number;
}

export interface PurchaseStockPayload {
  productId: string;
  quantity: number;
  unitCost: number;
  batchNumber?: string;
  expiryDate?: string;
  reference?: string;
  notes?: string;
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function fetchInventoryDashboard(
  getToken: GetToken,
): Promise<{ success: true; data: InventoryDashboardData }> {
  const client = createAuthedClient(getToken);
  return client.get("/inventory/dashboard");
}

export async function fetchCurrentStock(
  filters: Record<string, string> = {},
  getToken: GetToken,
): Promise<PaginatedResponse<InventoryProduct>> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  const client = createAuthedClient(getToken);
  return client.get(`/inventory/stock${qs ? `?${qs}` : ""}`);
}

export async function fetchLowStockProducts(
  getToken: GetToken,
): Promise<{ success: true; data: InventoryProduct[] }> {
  const client = createAuthedClient(getToken);
  return client.get("/inventory/stock/low");
}

export async function fetchOutOfStockProducts(
  getToken: GetToken,
): Promise<{ success: true; data: InventoryProduct[] }> {
  const client = createAuthedClient(getToken);
  return client.get("/inventory/stock/out");
}

export async function fetchStockMovements(
  filters: Record<string, string> = {},
  getToken: GetToken,
): Promise<PaginatedResponse<StockMovementRecord>> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  const client = createAuthedClient(getToken);
  return client.get(`/inventory/movements${qs ? `?${qs}` : ""}`);
}

export async function createStockAdjustment(
  payload: StockAdjustmentPayload,
  getToken: GetToken,
): Promise<{ success: true; data: StockMovementRecord }> {
  const client = createAuthedClient(getToken);
  return client.post("/inventory/adjust", payload);
}

export async function createPurchaseStock(
  payload: PurchaseStockPayload,
  getToken: GetToken,
): Promise<{ success: true; data: StockMovementRecord }> {
  const client = createAuthedClient(getToken);
  return client.post("/inventory/purchase", payload);
}

export async function reportDamagedStock(
  payload: { productId: string; quantity: number; notes?: string; batchNumber?: string },
  getToken: GetToken,
): Promise<{ success: true; data: StockMovementRecord }> {
  const client = createAuthedClient(getToken);
  return client.post("/inventory/damaged", payload);
}

export async function fetchExpiredProducts(
  getToken: GetToken,
): Promise<{ success: true; data: StockMovementRecord[] }> {
  const client = createAuthedClient(getToken);
  return client.get("/inventory/expired");
}

export async function fetchBatchMovements(
  batchNumber: string,
  getToken: GetToken,
): Promise<{ success: true; data: StockMovementRecord[] }> {
  const client = createAuthedClient(getToken);
  return client.get(`/inventory/movements/batch/${encodeURIComponent(batchNumber)}`);
}

export async function updateProductStockSettings(
  productId: string,
  settings: { minimumStock?: number; maximumStock?: number; reservedStock?: number },
  getToken: GetToken,
): Promise<{ success: true; data: InventoryProduct }> {
  const client = createAuthedClient(getToken);
  return client.patch(`/inventory/products/${productId}/stock-settings`, settings);
}
