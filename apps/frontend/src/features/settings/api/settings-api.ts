import { createAuthedClient } from "@/shared/api/api-client";
import type {
  AdminSettingsData,
  AdminSettingsResponse,
  StoreSettingsData,
  StoreSettingsResponse,
} from "../types/settings.types";

type GetToken = () => Promise<string | null>;

function getClient(getToken: GetToken) {
  return createAuthedClient(getToken);
}

// ── Admin Settings (payment, shipping, invoice, theme, security, etc.) ──────

export async function fetchAdminSettings(
  getToken: GetToken,
): Promise<AdminSettingsData> {
  const client = getClient(getToken);
  const res = await client.get<AdminSettingsResponse>("/admin/settings");
  return res.data;
}

export async function updateAdminSettings(
  data: Partial<AdminSettingsData> | FormData,
  getToken: GetToken,
): Promise<AdminSettingsData> {
  if (data instanceof FormData) {
    const token = await getToken();
    const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
    const response = await fetch(`${BASE_URL}/admin/settings`, {
      method: "PUT",
      body: data,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const json = (await response.json()) as
      | AdminSettingsResponse
      | { success: false; error: { message: string } };
    if (!response.ok || !json.success) {
      throw new Error(
        (json as { success: false; error: { message: string } }).error
          ?.message ?? "Failed to update admin settings",
      );
    }
    return (json as AdminSettingsResponse).data;
  }
  const client = getClient(getToken);
  const res = await client.put<AdminSettingsResponse>("/admin/settings", data);
  return res.data;
}

export async function resetAdminSettings(
  getToken: GetToken,
): Promise<AdminSettingsData> {
  const client = getClient(getToken);
  const res = await client.post<AdminSettingsResponse>(
    "/admin/settings/reset",
  );
  return res.data;
}

// ── Store Settings (info + branding images) ─────────────────────────────────

export async function fetchStoreSettings(): Promise<StoreSettingsData> {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
  const response = await fetch(`${BASE_URL}/store-settings`);
  const json = (await response.json()) as StoreSettingsResponse;
  return json.data;
}

export async function updateStoreSettings(
  formData: FormData,
  getToken: GetToken,
): Promise<StoreSettingsData> {
  const token = await getToken();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

  const response = await fetch(`${BASE_URL}/store-settings`, {
    method: "PUT",
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const json = (await response.json()) as
    | StoreSettingsResponse
    | { success: false; error: { message: string } };

  if (!response.ok || !json.success) {
    throw new Error(
      (json as { success: false; error: { message: string } }).error
        ?.message ?? "Failed to update store settings",
    );
  }

  return (json as StoreSettingsResponse).data;
}
