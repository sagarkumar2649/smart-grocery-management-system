import { SettingsSection } from "./SettingsSection";
import { Toggle } from "./Toggle";
import type { SecuritySettings } from "../types/settings.types";

interface SecuritySectionProps {
  settings: SecuritySettings;
  onChange: (updates: Partial<SecuritySettings>) => void;
}

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all";

export function SecuritySection({ settings, onChange }: SecuritySectionProps) {
  return (
    <SettingsSection
      title="Security"
      description="Manage authentication and access security"
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-border p-4 space-y-1">
          <p className="mb-3 text-sm font-semibold text-foreground">
            Authentication
          </p>
          <Toggle
            checked={settings.twoFactorEnabled}
            onChange={(v) => onChange({ twoFactorEnabled: v })}
            label="Two-Factor Authentication"
            description="Add an extra layer of security to your account"
          />
          <Toggle
            checked={settings.loginAlerts}
            onChange={(v) => onChange({ loginAlerts: v })}
            label="Login Alerts"
            description="Get notified of new sign-ins to your account"
          />
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">Session</p>
          <div className="max-w-xs">
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Session Timeout
            </label>
            <div className="relative">
              <input
                type="number"
                min={5}
                max={480}
                value={settings.sessionTimeoutMinutes}
                onChange={(e) =>
                  onChange({ sessionTimeoutMinutes: Number(e.target.value) })
                }
                className={inputClass}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                minutes
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-1">
          <p className="mb-3 text-sm font-semibold text-foreground">
            Password Policy
          </p>
          <div className="max-w-xs mb-4">
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Minimum Length
            </label>
            <div className="relative">
              <input
                type="number"
                min={6}
                max={32}
                value={settings.passwordMinLength}
                onChange={(e) =>
                  onChange({ passwordMinLength: Number(e.target.value) })
                }
                className={inputClass}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                characters
              </span>
            </div>
          </div>
          <Toggle
            checked={settings.requireUppercase}
            onChange={(v) => onChange({ requireUppercase: v })}
            label="Require Uppercase Letters"
          />
          <Toggle
            checked={settings.requireNumbers}
            onChange={(v) => onChange({ requireNumbers: v })}
            label="Require Numbers"
          />
          <Toggle
            checked={settings.requireSpecialChars}
            onChange={(v) => onChange({ requireSpecialChars: v })}
            label="Require Special Characters"
          />
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">
            Brute Force Protection
          </p>
          <div className="grid gap-4 sm:grid-cols-2 max-w-lg">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Max Login Attempts
              </label>
              <input
                type="number"
                min={3}
                max={20}
                value={settings.maxLoginAttempts}
                onChange={(e) =>
                  onChange({ maxLoginAttempts: Number(e.target.value) })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Lockout Duration
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={5}
                  max={1440}
                  value={settings.lockoutDurationMinutes}
                  onChange={(e) =>
                    onChange({
                      lockoutDurationMinutes: Number(e.target.value),
                    })
                  }
                  className={inputClass}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  minutes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
