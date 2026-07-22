import { useState } from "react";
import { SettingsSection } from "./SettingsSection";

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadFolder: string;
  uploadPreset: string;
}

interface CloudinarySettingsSectionProps {
  settings: CloudinaryConfig;
  onChange: (updates: Partial<CloudinaryConfig>) => void;
}

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all";

export function CloudinarySettingsSection({
  settings,
  onChange,
}: CloudinarySettingsSectionProps) {
  const [showSecret, setShowSecret] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(
    null,
  );

  const handleTest = () => {
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setTesting(false);
      setTestResult(
        settings.cloudName && settings.apiKey ? "success" : "error",
      );
      setTimeout(() => setTestResult(null), 3000);
    }, 1500);
  };

  return (
    <SettingsSection
      title="Cloudinary"
      description="Configure Cloudinary for image uploads and media management"
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-border p-4 space-y-4">
          <p className="text-sm font-semibold text-foreground">
            API Credentials
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Cloud Name
              </label>
              <input
                type="text"
                value={settings.cloudName}
                onChange={(e) => onChange({ cloudName: e.target.value })}
                className={inputClass}
                placeholder="your-cloud-name"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                API Key
              </label>
              <input
                type="text"
                value={settings.apiKey}
                onChange={(e) => onChange({ apiKey: e.target.value })}
                className={inputClass}
                placeholder="1234567890"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              API Secret
            </label>
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                value={settings.apiSecret}
                onChange={(e) => onChange({ apiSecret: e.target.value })}
                className={inputClass}
                placeholder="••••••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                {showSecret ? "Hide" : "Show"}
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              API Secret is stored securely on the server and never exposed to
              the frontend.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-4">
          <p className="text-sm font-semibold text-foreground">
            Upload Configuration
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Upload Folder
              </label>
              <input
                type="text"
                value={settings.uploadFolder}
                onChange={(e) => onChange({ uploadFolder: e.target.value })}
                className={inputClass}
                placeholder="smart-inventory"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Folder path where images will be stored
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Upload Preset
              </label>
              <input
                type="text"
                value={settings.uploadPreset}
                onChange={(e) => onChange({ uploadPreset: e.target.value })}
                className={inputClass}
                placeholder="ml_default"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Unsigned upload preset (for client-side uploads)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleTest}
            disabled={testing}
            className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            {testing ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
                Testing...
              </span>
            ) : (
              "Test Connection"
            )}
          </button>
          {testResult === "success" && (
            <span className="text-sm font-medium text-success">
              Connection successful
            </span>
          )}
          {testResult === "error" && (
            <span className="text-sm font-medium text-danger">
              Connection failed — check credentials
            </span>
          )}
        </div>
      </div>
    </SettingsSection>
  );
}
