import { useEffect } from "react";
import { SettingsSection } from "./SettingsSection";
import { FieldGroup } from "./FieldGroup";
import { Toggle } from "./Toggle";
import type { PaymentSettings } from "../types/settings.types";

interface PaymentSettingsSectionProps {
  settings: PaymentSettings;
  onChange: (updates: Partial<PaymentSettings>) => void;
  onImageChange?: (file: File) => void;
  onImageRemove?: () => void;
}

const PAYMENT_METHODS = ["Cash", "UPI", "Card", "Net Banking", "Cheque"] as const;
const DEFAULT_METHODS = ["Cash", "UPI", "Card", "Net Banking"] as const;

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all";

export function PaymentSettingsSection({
  settings,
  onChange,
  onImageChange,
  onImageRemove,
}: PaymentSettingsSectionProps) {
  useEffect(() => {
    const cgstRate = settings.gstRate / 2;
    const sgstRate = settings.gstRate / 2;
    const igstRate = settings.gstRate;

    if (
      settings.cgstRate !== cgstRate ||
      settings.sgstRate !== sgstRate ||
      settings.igstRate !== igstRate
    ) {
      onChange({ cgstRate, sgstRate, igstRate });
    }
  }, [settings.gstRate]);

  const togglePaymentMethod = (method: string) => {
    const current = settings.acceptedPayments;
    const updated = current.includes(method)
      ? current.filter((m) => m !== method)
      : [...current, method];
    onChange({ acceptedPayments: updated });
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageChange) {
      onImageChange(file);
    }
  };

  return (
    <SettingsSection
      title="Payment Settings"
      description="Tax configuration and payment methods"
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-border p-4">
          <h4 className="mb-4 text-sm font-semibold text-foreground">
            Tax Configuration
          </h4>

          <div className="space-y-1">
            <Toggle
              checked={settings.gstEnabled}
              onChange={(checked) => onChange({ gstEnabled: checked })}
              label="GST Enabled"
            />

            {settings.gstEnabled && (
              <div className="space-y-4 pt-2">
                <FieldGroup label="GST Rate (%)">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={settings.gstRate}
                    onChange={(e) =>
                      onChange({ gstRate: Number(e.target.value) })
                    }
                    className={inputClass}
                  />
                </FieldGroup>

                <div className="grid grid-cols-3 gap-4">
                  <FieldGroup label="CGST Rate (%)">
                    <input
                      type="number"
                      value={settings.cgstRate}
                      onChange={(e) =>
                        onChange({ cgstRate: Number(e.target.value) })
                      }
                      className={inputClass}
                    />
                  </FieldGroup>
                  <FieldGroup label="SGST Rate (%)">
                    <input
                      type="number"
                      value={settings.sgstRate}
                      onChange={(e) =>
                        onChange({ sgstRate: Number(e.target.value) })
                      }
                      className={inputClass}
                    />
                  </FieldGroup>
                  <FieldGroup label="IGST Rate (%)">
                    <input
                      type="number"
                      value={settings.igstRate}
                      onChange={(e) =>
                        onChange({ igstRate: Number(e.target.value) })
                      }
                      className={inputClass}
                    />
                  </FieldGroup>
                </div>

                <Toggle
                  checked={settings.taxInclusive}
                  onChange={(checked) => onChange({ taxInclusive: checked })}
                  label="Tax Inclusive"
                  description="When enabled, product prices include tax"
                />

                <FieldGroup label="Tax Label">
                  <input
                    type="text"
                    value={settings.taxLabel}
                    onChange={(e) => onChange({ taxLabel: e.target.value })}
                    placeholder="GST"
                    className={inputClass}
                  />
                </FieldGroup>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <h4 className="mb-4 text-sm font-semibold text-foreground">
            Payment Methods
          </h4>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                Accepted Payment Methods
              </p>
              <div className="flex flex-wrap gap-2">
                {PAYMENT_METHODS.map((method) => {
                  const isActive = settings.acceptedPayments.includes(method);
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => togglePaymentMethod(method)}
                      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {method}
                    </button>
                  );
                })}
              </div>
            </div>

            <FieldGroup label="UPI ID">
              <input
                type="text"
                value={settings.upiId}
                onChange={(e) => onChange({ upiId: e.target.value })}
                placeholder="yourname@upi"
                className={inputClass}
              />
            </FieldGroup>

            <FieldGroup label="UPI QR Code">
              <div className="space-y-3">
                {settings.upiQrUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={settings.upiQrUrl}
                      alt="UPI QR Code"
                      className="h-48 w-48 rounded-lg border border-border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => onImageRemove?.()}
                      className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="flex h-48 w-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-background hover:border-primary/50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-muted-foreground mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                    </svg>
                    <span className="text-xs text-muted-foreground">Upload QR Code</span>
                    <span className="text-[10px] text-muted-foreground/60 mt-0.5">PNG, JPG up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrUpload}
                      className="hidden"
                    />
                  </label>
                )}
                <p className="text-xs text-muted-foreground">
                  Upload your UPI QR code image. Customers will scan this to pay.
                </p>
              </div>
            </FieldGroup>

            <FieldGroup label="Default Payment Method">
              <select
                value={settings.defaultPaymentMethod}
                onChange={(e) =>
                  onChange({ defaultPaymentMethod: e.target.value })
                }
                className={inputClass}
              >
                {DEFAULT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </FieldGroup>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
