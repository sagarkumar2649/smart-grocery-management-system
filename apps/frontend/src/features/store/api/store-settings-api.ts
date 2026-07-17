import { publicClient } from '@/shared/api/api-client';

export interface StoreImage {
  url: string;
  publicId: string;
}

export interface StoreSettings {
  _id: string;
  storeName: string;
  storeDescription: string;
  storeAddress: string;
  phoneNumber: string;
  whatsappNumber: string;
  openingHours: string;
  logo?: StoreImage;
  heroBanner?: StoreImage;
  storeFront?: StoreImage;
  interiorGallery: StoreImage[];
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettingsResponse {
  success: true;
  data: StoreSettings;
}

type GetToken = () => Promise<string | null>;

export async function fetchStoreSettings(): Promise<StoreSettingsResponse> {
  return publicClient.get<StoreSettingsResponse>('/store-settings');
}

export async function updateStoreSettings(
  formData: FormData,
  getToken: GetToken,
): Promise<StoreSettingsResponse> {
  const token = await getToken();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

  const response = await fetch(`${BASE_URL}/store-settings`, {
    method: 'PUT',
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const data = (await response.json()) as
    | StoreSettingsResponse
    | { success: false; error: { message: string } };

  if (!response.ok || !data.success) {
    throw new Error(
      (data as { success: false; error: { message: string } }).error?.message ??
        'Failed to update store settings',
    );
  }

  return data as StoreSettingsResponse;
}
