import { SettingsSection } from "./SettingsSection";
import { Toggle } from "./Toggle";
import type { PaymentSettings } from "../types/settings.types";

interface TaxSettingsSectionProps {
  settings: PaymentSettings;
  onChange: (updates: Partial<PaymentSettings>) => void;
}

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all";

export function TaxSettingsSection({
  settings,
  onChange,
}: TaxSettingsSectionProps) {
  return (
    <SettingsSection
      title="Tax Settings"
      description="Configure tax rates and GST configuration"
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-border p-4 space-y-1">
          <p className="mb-3 text-sm font-semibold text-foreground">
            GST Configuration
          </p>
          <Toggle
            checked={settings.gstEnabled}
            onChange={(v) => onChange({ gstEnabled: v })}
            label="Enable GST"
            description="Enable Goods and Services Tax on invoices"
          />

          {settings.gstEnabled && (
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 max-w-lg">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    GST Rate (%)
                  </label>
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
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Tax Label
                  </label>
                  <input
                    type="text"
                    value={settings.taxLabel}
                    onChange={(e) => onChange({ taxLabel: e.target.value })}
                    className={inputClass}
                    placeholder="GST"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 max-w-lg">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    CGST Rate (%)
                  </label>
                  <input
                    type="number"
                    value={settings.cgstRate}
                    onChange={(e) =>
                      onChange({ cgstRate: Number(e.target.value) })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    SGST Rate (%)
                  </label>
                  <input
                    type="number"
                    value={settings.sgstRate}
                    onChange={(e) =>
                      onChange({ sgstRate: Number(e.target.value) })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    IGST Rate (%)
                  </label>
                  <input
                    type="number"
                    value={settings.igstRate}
                    onChange={(e) =>
                      onChange({ igstRate: Number(e.target.value) })
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <Toggle
                checked={settings.taxInclusive}
                onChange={(v) => onChange({ taxInclusive: v })}
                label="Tax Inclusive Pricing"
                description="When enabled, product prices include tax"
              />
            </div>
          )}
        </div>
      </div>
    </SettingsSection>
  );
}
