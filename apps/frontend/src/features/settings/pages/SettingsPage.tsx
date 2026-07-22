import { useState, useEffect, useCallback, useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import {
  useAdminSettings,
  useSaveAdminSettings,
  useResetAdminSettings,
  useStoreSettings,
  useUpdateStoreSettings,
} from "../hooks/use-settings";
import type {
  AdminSettingsData,
  StoreSettingsData,
} from "../types/settings.types";
import { SettingsHeader } from "../components/SettingsHeader";
import { SettingsTabNav } from "../components/SettingsTabNav";
import { StoreSettingsSection } from "../components/StoreSettingsSection";
import { PaymentSettingsSection } from "../components/PaymentSettingsSection";
import { TaxSettingsSection } from "../components/TaxSettingsSection";
import { InvoiceSettingsSection } from "../components/InvoiceSettingsSection";
import { PrinterSettingsSection } from "../components/PrinterSettingsSection";
import { NotificationSettingsSection } from "../components/NotificationSettingsSection";
import { SecuritySection } from "../components/SecuritySection";
import { ThemeSection } from "../components/ThemeSection";
import { BackupSection } from "../components/BackupSection";
import { CloudinarySettingsSection } from "../components/CloudinarySettingsSection";
import { ProfileSection } from "../components/ProfileSection";

export function SettingsPage() {
  const activeTab = useAppSelector((s) => s.settings.activeTab);

  const { data: adminData, isLoading: adminLoading } = useAdminSettings();
  const { data: storeData, isLoading: storeLoading } = useStoreSettings();
  const saveAdminMutation = useSaveAdminSettings();
  const resetAdminMutation = useResetAdminSettings();
  const updateStoreMutation = useUpdateStoreSettings();

  const [adminSettings, setAdminSettings] =
    useState<AdminSettingsData | null>(null);
  const [storeSettings, setStoreSettings] =
    useState<StoreSettingsData | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [initialJson, setInitialJson] = useState("");
  const successTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (adminData && !adminSettings) {
      setAdminSettings(adminData);
      setInitialJson(JSON.stringify(adminData));
    }
  }, [adminData, adminSettings]);

  useEffect(() => {
    if (storeData && !storeSettings) {
      setStoreSettings(storeData);
    }
  }, [storeData, storeSettings]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const showSuccess = useCallback((msg: string) => {
    setSuccessMessage(msg);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => setSuccessMessage(""), 3000);
  }, []);

  const isDirty =
    adminSettings
      ? JSON.stringify(adminSettings) !== initialJson
      : false;

  const handleAdminChange = useCallback(
    (section: keyof AdminSettingsData, updates: Record<string, unknown>) => {
      setAdminSettings((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [section]: { ...(prev[section] as unknown as Record<string, unknown>), ...updates },
        } as AdminSettingsData;
      });
    },
    [],
  );

  const handleStoreChange = useCallback(
    (updates: Partial<StoreSettingsData>) => {
      setStoreSettings((prev) => (prev ? { ...prev, ...updates } : prev));
    },
    [],
  );

  const pendingImagesRef = useRef<Record<string, File | null>>({});
  const pendingGalleryRef = useRef<File[]>([]);
  const removedGalleryIdsRef = useRef<string[]>([]);
  const pendingUpiQrRef = useRef<File | null>(null);
  const removeUpiQrRef = useRef(false);

  const handleStoreImageChange = useCallback(
    (field: string, file: File) => {
      pendingImagesRef.current = {
        ...pendingImagesRef.current,
        [field]: file,
      };
      const previewUrl = URL.createObjectURL(file);
      setStoreSettings((prev) => {
        if (!prev) return prev;
        if (field === "logo")
          return { ...prev, logo: { url: previewUrl, publicId: "" } };
        if (field === "heroBanner")
          return { ...prev, heroBanner: { url: previewUrl, publicId: "" } };
        if (field === "favicon")
          return { ...prev, favicon: { url: previewUrl, publicId: "" } };
        return prev;
      });
    },
    [],
  );

  const handleStoreImageRemove = useCallback((field: string) => {
    setStoreSettings((prev) => {
      if (!prev) return prev;
      if (field === "logo") return { ...prev, logo: null };
      if (field === "heroBanner") return { ...prev, heroBanner: null };
      if (field === "favicon") return { ...prev, favicon: null };
      return prev;
    });
    pendingImagesRef.current[field] = null;
  }, []);

  const handleGalleryRemove = useCallback((publicId: string) => {
    setStoreSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        interiorGallery: prev.interiorGallery.filter(
          (i) => i.publicId !== publicId,
        ),
      };
    });
    removedGalleryIdsRef.current.push(publicId);
  }, []);

  const handleGalleryAdd = useCallback((files: FileList) => {
    pendingGalleryRef.current = [
      ...pendingGalleryRef.current,
      ...Array.from(files),
    ];
  }, []);

  const handleUpiQrChange = useCallback((file: File) => {
    pendingUpiQrRef.current = file;
    removeUpiQrRef.current = false;
  }, []);

  const handleUpiQrRemove = useCallback(() => {
    pendingUpiQrRef.current = null;
    removeUpiQrRef.current = true;
    setAdminSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        payment: { ...prev.payment, upiQrUrl: "", upiQrPublicId: "" },
      } as AdminSettingsData;
    });
  }, []);

  const handleExport = useCallback(() => {
    if (!adminSettings) return;
    const blob = new Blob([JSON.stringify(adminSettings, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "smart-inventory-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [adminSettings]);

  const handleImport = useCallback(
    (json: string) => {
      try {
        const data = JSON.parse(json) as AdminSettingsData;
        setAdminSettings(data);
        setInitialJson(JSON.stringify(data));
        showSuccess("Settings imported successfully");
      } catch {
        showSuccess("Invalid settings file");
      }
    },
    [showSuccess],
  );

  const handleReset = useCallback(() => {
    resetAdminMutation.mutate(undefined, {
      onSuccess: (data) => {
        setAdminSettings(data);
        setInitialJson(JSON.stringify(data));
        showSuccess("Settings reset to defaults");
      },
    });
  }, [resetAdminMutation, showSuccess]);

  const handleSave = useCallback(async () => {
    if (adminSettings && JSON.stringify(adminSettings) !== initialJson) {
      const hasUpiQrChanges =
        pendingUpiQrRef.current !== null || removeUpiQrRef.current;

      if (hasUpiQrChanges) {
        const fd = new FormData();
        const { upiQrUrl, upiQrPublicId, ...restPayment } =
          adminSettings.payment;
        const { payment, ...restSettings } = adminSettings;
        fd.append("payment", JSON.stringify({ ...restPayment, upiQrUrl: "", upiQrPublicId: "" }));
        fd.append("shipping", JSON.stringify(restSettings.shipping));
        fd.append("invoice", JSON.stringify(restSettings.invoice));
        fd.append("theme", JSON.stringify(restSettings.theme));
        fd.append("security", JSON.stringify(restSettings.security));
        fd.append("notifications", JSON.stringify(restSettings.notifications));
        fd.append("backup", JSON.stringify(restSettings.backup));
        fd.append("printer", JSON.stringify(restSettings.printer));
        fd.append("cloudinary", JSON.stringify(restSettings.cloudinary));
        if (pendingUpiQrRef.current) {
          fd.append("upiQr", pendingUpiQrRef.current);
        }
        if (removeUpiQrRef.current) {
          fd.append("removeUpiQr", "true");
        }
        await saveAdminMutation.mutateAsync(fd);
      } else {
        await saveAdminMutation.mutateAsync(adminSettings);
      }
    }

    if (storeSettings) {
      const fd = new FormData();

      const textFields = [
        "storeName", "storeDescription", "storeAddress", "phoneNumber",
        "whatsappNumber", "openingHours", "storeEmail", "city", "state",
        "pincode", "gstNumber", "panNumber", "currency", "timezone",
        "language", "tagline", "brandColor",
      ] as const;

      for (const field of textFields) {
        const val = storeSettings[field];
        if (val !== undefined && val !== null) {
          fd.append(field, String(val));
        }
      }

      for (const [field, file] of Object.entries(pendingImagesRef.current)) {
        if (file) {
          fd.append(field, file);
        }
      }

      for (const file of pendingGalleryRef.current) {
        fd.append("interiorGallery", file);
      }

      if (removedGalleryIdsRef.current.length > 0) {
        fd.append("removeInterior", removedGalleryIdsRef.current.join(","));
      }

      await updateStoreMutation.mutateAsync(fd);
    }

    pendingImagesRef.current = {};
    pendingGalleryRef.current = [];
    removedGalleryIdsRef.current = [];
    pendingUpiQrRef.current = null;
    removeUpiQrRef.current = false;
    setInitialJson(JSON.stringify(adminSettings));
    showSuccess("Settings saved successfully");
  }, [
    adminSettings,
    storeSettings,
    initialJson,
    saveAdminMutation,
    updateStoreMutation,
    showSuccess,
  ]);

  const isLoading = adminLoading || storeLoading;

  if (isLoading || !adminSettings || !storeSettings) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    );
  }

  const renderSection = () => {
    switch (activeTab) {
      case "store":
        return (
          <StoreSettingsSection
            settings={storeSettings}
            onTextChange={handleStoreChange}
            onImageChange={handleStoreImageChange}
            onImageRemove={handleStoreImageRemove}
            onGalleryRemove={handleGalleryRemove}
            onGalleryAdd={handleGalleryAdd}
          />
        );
      case "payment":
        return (
          <PaymentSettingsSection
            settings={adminSettings.payment}
            onChange={(u) => handleAdminChange("payment", u)}
            onImageChange={handleUpiQrChange}
            onImageRemove={handleUpiQrRemove}
          />
        );
      case "tax":
        return (
          <TaxSettingsSection
            settings={adminSettings.payment}
            onChange={(u) => handleAdminChange("payment", u)}
          />
        );
      case "invoice":
        return (
          <InvoiceSettingsSection
            settings={adminSettings.invoice}
            onChange={(u) => handleAdminChange("invoice", u)}
          />
        );
      case "printer":
        return (
          <PrinterSettingsSection
            settings={adminSettings.printer}
            onChange={(u) => handleAdminChange("printer", u)}
          />
        );
      case "notifications":
        return (
          <NotificationSettingsSection
            settings={adminSettings.notifications}
            onChange={(u) => handleAdminChange("notifications", u)}
          />
        );
      case "security":
        return (
          <SecuritySection
            settings={adminSettings.security}
            onChange={(u) => handleAdminChange("security", u)}
          />
        );
      case "appearance":
        return (
          <ThemeSection
            settings={adminSettings.theme}
            onChange={(u) => handleAdminChange("theme", u)}
          />
        );
      case "backup":
        return (
          <BackupSection
            settings={adminSettings.backup}
            onChange={(u) => handleAdminChange("backup", u)}
            onExport={handleExport}
            onImport={handleImport}
            onReset={handleReset}
            isResetting={resetAdminMutation.isPending}
          />
        );
      case "cloudinary":
        return (
          <CloudinarySettingsSection
            settings={adminSettings.cloudinary}
            onChange={(u) => handleAdminChange("cloudinary", u)}
          />
        );
      case "profile":
        return <ProfileSection />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out max-w-5xl">
      <SettingsHeader
        onSave={handleSave}
        onReset={() => {
          setAdminSettings(adminData ?? null);
          setStoreSettings(storeData ?? null);
          setInitialJson(JSON.stringify(adminData));
          pendingImagesRef.current = {};
          pendingGalleryRef.current = [];
          removedGalleryIdsRef.current = [];
        }}
        isSaving={saveAdminMutation.isPending || updateStoreMutation.isPending}
        isDirty={isDirty}
        successMessage={successMessage}
      />

      <SettingsTabNav />

      {renderSection()}
    </div>
  );
}
