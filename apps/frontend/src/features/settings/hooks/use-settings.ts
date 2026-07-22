import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import {
  fetchAdminSettings,
  updateAdminSettings,
  resetAdminSettings,
  fetchStoreSettings,
  updateStoreSettings,
} from "../api/settings-api";
import type { AdminSettingsData } from "../types/settings.types";

export const settingsKeys = {
  admin: ["adminSettings"] as const,
  store: ["storeSettings"] as const,
};

// ── Admin Settings ──────────────────────────────────────────────────────────

export function useAdminSettings() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: settingsKeys.admin,
    queryFn: () => fetchAdminSettings(getToken),
    staleTime: 5 * 60_000,
  });
}

export function useSaveAdminSettings() {
  const qc = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: (data: Partial<AdminSettingsData> | FormData) =>
      updateAdminSettings(data, getToken),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: settingsKeys.admin });
    },
  });
}

export function useResetAdminSettings() {
  const qc = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: () => resetAdminSettings(getToken),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: settingsKeys.admin });
    },
  });
}

// ── Store Settings ──────────────────────────────────────────────────────────

export function useStoreSettings() {
  return useQuery({
    queryKey: settingsKeys.store,
    queryFn: fetchStoreSettings,
    staleTime: 5 * 60_000,
  });
}

export function useUpdateStoreSettings() {
  const qc = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: (formData: FormData) => updateStoreSettings(formData, getToken),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: settingsKeys.store });
    },
  });
}
