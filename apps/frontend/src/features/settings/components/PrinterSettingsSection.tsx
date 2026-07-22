import { SettingsSection } from "./SettingsSection";
import { Toggle } from "./Toggle";
import { cn } from "@/shared/lib/cn";

interface PrinterSettings {
  printerEnabled: boolean;
  printerType: string;
  paperSize: string;
  autoPrint: boolean;
  printCopies: number;
  showLogoOnReceipt: boolean;
  receiptFontSize: string;
}

interface PrinterSettingsSectionProps {
  settings: PrinterSettings;
  onChange: (updates: Partial<PrinterSettings>) => void;
}

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all";

export function PrinterSettingsSection({
  settings,
  onChange,
}: PrinterSettingsSectionProps) {
  return (
    <SettingsSection
      title="Printer Settings"
      description="Configure receipt printer and printing options"
    >
      <div className="space-y-6">
        <Toggle
          checked={settings.printerEnabled}
          onChange={(v) => onChange({ printerEnabled: v })}
          label="Enable Printer"
          description="Enable receipt printing after transactions"
        />

        {settings.printerEnabled && (
          <>
            <div className="rounded-lg border border-border p-4">
              <p className="mb-3 text-sm font-semibold text-foreground">
                Printer Type
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(["thermal", "dot-matrix", "laser"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onChange({ printerType: type })}
                    className={cn(
                      "rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all",
                      settings.printerType === type
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-background text-foreground hover:bg-muted",
                    )}
                  >
                    {type === "dot-matrix"
                      ? "Dot Matrix"
                      : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <p className="mb-3 text-sm font-semibold text-foreground">
                Paper Size
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(["58mm", "80mm", "A4"] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => onChange({ paperSize: size })}
                    className={cn(
                      "rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all",
                      settings.paperSize === size
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-background text-foreground hover:bg-muted",
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <p className="mb-3 text-sm font-semibold text-foreground">
                Receipt Font Size
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(["small", "normal", "large"] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => onChange({ receiptFontSize: size })}
                    className={cn(
                      "rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all",
                      settings.receiptFontSize === size
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-background text-foreground hover:bg-muted",
                    )}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 max-w-md">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Print Copies
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={settings.printCopies}
                  onChange={(e) =>
                    onChange({ printCopies: Number(e.target.value) })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <Toggle
              checked={settings.autoPrint}
              onChange={(v) => onChange({ autoPrint: v })}
              label="Auto Print"
              description="Automatically print receipt after each transaction"
            />
            <Toggle
              checked={settings.showLogoOnReceipt}
              onChange={(v) => onChange({ showLogoOnReceipt: v })}
              label="Show Logo on Receipt"
              description="Include store logo on printed receipts"
            />
          </>
        )}
      </div>
    </SettingsSection>
  );
}
