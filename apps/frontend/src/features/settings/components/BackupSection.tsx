import { useState, useRef } from "react";
import { SettingsSection } from "./SettingsSection";
import { Toggle } from "./Toggle";
import type { BackupSettings } from "../types/settings.types";

interface BackupSectionProps {
  settings: BackupSettings;
  onChange: (updates: Partial<BackupSettings>) => void;
  onExport: () => void;
  onImport: (json: string) => void;
  onReset: () => void;
  isExporting?: boolean;
  isImporting?: boolean;
  isResetting?: boolean;
}

const FREQUENCIES = ["Daily", "Weekly", "Monthly"] as const;

export function BackupSection({
  settings,
  onChange,
  onExport,
  onImport,
  onReset,
  isExporting,
  isImporting,
  isResetting,
}: BackupSectionProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError("");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        JSON.parse(text);
        onImport(text);
      } catch {
        setImportError("Invalid JSON file. Please select a valid backup file.");
      }
    };
    reader.onerror = () => {
      setImportError("Failed to read the file. Please try again.");
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <SettingsSection
      title="Backup & Restore"
      description="Export, import, or reset your settings"
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-border p-4">
          <h4 className="mb-1 text-sm font-semibold text-foreground">
            Export
          </h4>
          <p className="mb-4 text-xs text-muted-foreground">
            Download all your settings as a JSON file
          </p>
          <button
            type="button"
            onClick={onExport}
            disabled={isExporting}
            className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting ? "Exporting..." : "Export Settings"}
          </button>
        </div>

        <div className="rounded-lg border border-border p-4">
          <h4 className="mb-1 text-sm font-semibold text-foreground">
            Import
          </h4>
          <p className="mb-4 text-xs text-muted-foreground">
            Restore settings from a previously exported JSON file
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isImporting ? "Importing..." : "Import Settings"}
          </button>
          {importError && (
            <p className="mt-3 text-sm text-danger">{importError}</p>
          )}
        </div>

        <div className="rounded-lg border border-border p-4">
          <h4 className="mb-1 text-sm font-semibold text-foreground">Reset</h4>
          <p className="mb-4 text-xs text-muted-foreground">
            Reset all settings to their default values. This cannot be undone.
          </p>
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            disabled={isResetting}
            className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset to Defaults
          </button>
        </div>

        <div className="rounded-lg border border-border p-4">
          <h4 className="mb-1 text-sm font-semibold text-foreground">
            Auto-Backup
          </h4>
          <p className="text-xs text-muted-foreground">
            Automatically back up your settings on a schedule
          </p>

          <div className="space-y-1">
            <Toggle
              checked={settings.autoBackupEnabled}
              onChange={(checked) => onChange({ autoBackupEnabled: checked })}
              label="Enable Auto-Backup"
              description="Automatically create backups at regular intervals"
            />
          </div>

          {settings.autoBackupEnabled && (
            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="backup-frequency"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Frequency
                </label>
                <select
                  id="backup-frequency"
                  value={settings.autoBackupFrequency}
                  onChange={(e) =>
                    onChange({ autoBackupFrequency: e.target.value })
                  }
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                >
                  {FREQUENCIES.map((freq) => (
                    <option key={freq} value={freq}>
                      {freq}
                    </option>
                  ))}
                </select>
              </div>

              <Toggle
                checked={settings.backupIncludeImages}
                onChange={(checked) =>
                  onChange({ backupIncludeImages: checked })
                }
                label="Include Images in Backup"
                description="Include uploaded images in the backup file"
              />
            </div>
          )}
        </div>

        {settings.lastBackupAt && (
          <div className="rounded-lg border border-border p-4">
            <h4 className="mb-1 text-sm font-semibold text-foreground">
              Last Backup
            </h4>
            <p className="text-sm text-muted-foreground">
              {new Date(settings.lastBackupAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl ring-1 ring-border">
            <h3 className="text-lg font-semibold text-foreground">
              Reset All Settings
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to reset all settings to their defaults?
              This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onReset();
                  setShowResetConfirm(false);
                }}
                disabled={isResetting}
                className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isResetting ? "Resetting..." : "Reset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </SettingsSection>
  );
}
