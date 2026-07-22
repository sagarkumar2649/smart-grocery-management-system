import { SettingsSection } from "./SettingsSection";
import { FieldGroup } from "./FieldGroup";
import { Toggle } from "./Toggle";
import type { InvoiceSettings } from "../types/settings.types";

interface InvoiceSettingsSectionProps {
  settings: InvoiceSettings;
  onChange: (updates: Partial<InvoiceSettings>) => void;
}

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all";

const TEMPLATES = ["Standard", "Compact", "Detailed"] as const;

export function InvoiceSettingsSection({
  settings,
  onChange,
}: InvoiceSettingsSectionProps) {
  return (
    <SettingsSection
      title="Invoice Settings"
      description="Configure invoice format, numbering, and content"
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-border p-4">
          <h4 className="mb-4 text-sm font-semibold text-foreground">
            Numbering
          </h4>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="Invoice Prefix" hint="e.g. INV-, BILL-">
                <input
                  type="text"
                  value={settings.invoicePrefix}
                  onChange={(e) => onChange({ invoicePrefix: e.target.value })}
                  placeholder="INV-"
                  className={inputClass}
                />
              </FieldGroup>

              <FieldGroup label="Invoice Start Number">
                <input
                  type="number"
                  min={1}
                  value={settings.invoiceStartNumber}
                  onChange={(e) =>
                    onChange({ invoiceStartNumber: Number(e.target.value) })
                  }
                  className={inputClass}
                />
              </FieldGroup>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                Invoice Template
              </p>
              <div className="grid grid-cols-3 gap-3">
                {TEMPLATES.map((template) => {
                  const isActive = settings.invoiceTemplate === template;
                  return (
                    <button
                      key={template}
                      type="button"
                      onClick={() => onChange({ invoiceTemplate: template })}
                      className={`rounded-lg border p-3 text-center text-sm font-medium transition-all ${
                        isActive
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {template}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <h4 className="mb-4 text-sm font-semibold text-foreground">
            Display Options
          </h4>

          <div className="space-y-1">
            <Toggle
              checked={settings.showTaxBreakdown}
              onChange={(checked) => onChange({ showTaxBreakdown: checked })}
              label="Show Tax Breakdown"
              description="Display detailed tax split on invoices"
            />
            <Toggle
              checked={settings.showBankDetails}
              onChange={(checked) => onChange({ showBankDetails: checked })}
              label="Show Bank Details"
              description="Include bank account information on invoices"
            />
            <Toggle
              checked={settings.showQrCode}
              onChange={(checked) => onChange({ showQrCode: checked })}
              label="Show QR Code"
              description="Add a payment QR code to invoices"
            />
            <Toggle
              checked={settings.showSignature}
              onChange={(checked) => onChange({ showSignature: checked })}
              label="Show Signature"
              description="Display authorized signature on invoices"
            />
          </div>
        </div>

        <div
          className={`overflow-hidden rounded-lg border border-border transition-all ${
            settings.showBankDetails
              ? "max-h-[500px] opacity-100"
              : "max-h-0 border-0 opacity-0"
          }`}
        >
          <div className="p-4">
            <h4 className="mb-4 text-sm font-semibold text-foreground">
              Bank Details
            </h4>

            <div className="space-y-4">
              <FieldGroup label="Bank Name">
                <input
                  type="text"
                  value={settings.bankName}
                  onChange={(e) => onChange({ bankName: e.target.value })}
                  placeholder="State Bank of India"
                  className={inputClass}
                />
              </FieldGroup>

              <div className="grid grid-cols-2 gap-4">
                <FieldGroup label="Account Number">
                  <input
                    type="text"
                    value={settings.bankAccountNumber}
                    onChange={(e) =>
                      onChange({ bankAccountNumber: e.target.value })
                    }
                    placeholder="1234567890"
                    className={inputClass}
                  />
                </FieldGroup>

                <FieldGroup label="IFSC Code">
                  <input
                    type="text"
                    value={settings.bankIfsc}
                    onChange={(e) => onChange({ bankIfsc: e.target.value })}
                    placeholder="SBIN0001234"
                    className={inputClass}
                  />
                </FieldGroup>
              </div>

              <FieldGroup label="Branch">
                <input
                  type="text"
                  value={settings.bankBranch}
                  onChange={(e) => onChange({ bankBranch: e.target.value })}
                  placeholder="Main Branch"
                  className={inputClass}
                />
              </FieldGroup>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <h4 className="mb-4 text-sm font-semibold text-foreground">
            Content
          </h4>

          <div className="space-y-4">
            <FieldGroup label="Terms & Conditions">
              <textarea
                rows={3}
                value={settings.termsAndConditions}
                onChange={(e) =>
                  onChange({ termsAndConditions: e.target.value })
                }
                placeholder="Enter terms and conditions..."
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </FieldGroup>

            <FieldGroup label="Footer Note">
              <textarea
                rows={2}
                value={settings.footerNote}
                onChange={(e) => onChange({ footerNote: e.target.value })}
                placeholder="Thank you for your business!"
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </FieldGroup>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
