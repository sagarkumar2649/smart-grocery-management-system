import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import {
  fetchStoreSettings,
  updateStoreSettings,
} from '../api/store-settings-api';

export const storeSettingsKeys = {
  all: ['storeSettings'] as const,
};

export function useStoreSettings() {
  return useQuery({
    queryKey: storeSettingsKeys.all,
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
      void qc.invalidateQueries({ queryKey: storeSettingsKeys.all });
    },
  });
}
