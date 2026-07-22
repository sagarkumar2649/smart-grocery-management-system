import { SettingsSection } from "./SettingsSection";
import { Toggle } from "./Toggle";
import type { NotificationSettings } from "../types/settings.types";

interface NotificationSettingsSectionProps {
  settings: NotificationSettings;
  onChange: (updates: Partial<NotificationSettings>) => void;
}

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all";

export function NotificationSettingsSection({
  settings,
  onChange,
}: NotificationSettingsSectionProps) {
  return (
    <SettingsSection
      title="Notifications"
      description="Configure alerts and email notifications"
    >
      <div className="space-y-6">
        <div>
          <Toggle
            checked={settings.emailNotifications}
            onChange={(v) => onChange({ emailNotifications: v })}
            label="Email Notifications"
            description="Enable or disable all email notifications"
          />
        </div>

        {!settings.emailNotifications ? (
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            Email notifications are currently disabled. Enable them above to
            configure notification preferences.
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Alerts</p>
              <Toggle
                checked={settings.lowStockAlert}
                onChange={(v) => onChange({ lowStockAlert: v })}
                label="Low Stock Alert"
                description="Get alerted when product stock falls below threshold"
              />
              {settings.lowStockAlert && (
                <div className="ml-6 max-w-xs pb-2">
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Stock Threshold
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={settings.stockThreshold}
                    onChange={(e) =>
                      onChange({ stockThreshold: Number(e.target.value) })
                    }
                    className={inputClass}
                  />
                </div>
              )}
              <Toggle
                checked={settings.newOrderAlert}
                onChange={(v) => onChange({ newOrderAlert: v })}
                label="New Order Alert"
                description="Get notified when a new order is placed"
              />
              <Toggle
                checked={settings.paymentReceived}
                onChange={(v) => onChange({ paymentReceived: v })}
                label="Payment Received"
                description="Get notified when payment is received"
              />
              <Toggle
                checked={settings.customerSignup}
                onChange={(v) => onChange({ customerSignup: v })}
                label="Customer Signup"
                description="Get notified when a new customer registers"
              />
              <Toggle
                checked={settings.couponUsage}
                onChange={(v) => onChange({ couponUsage: v })}
                label="Coupon Usage"
                description="Get notified when a coupon is redeemed"
              />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Reports</p>
              <Toggle
                checked={settings.dailyReport}
                onChange={(v) => onChange({ dailyReport: v })}
                label="Daily Report"
                description="Receive a daily summary of sales and activity"
              />
              <Toggle
                checked={settings.weeklyReport}
                onChange={(v) => onChange({ weeklyReport: v })}
                label="Weekly Report"
                description="Receive a weekly summary of sales and activity"
              />
            </div>

            <div className="max-w-md">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Report Email
              </label>
              <input
                type="email"
                value={settings.reportEmail}
                onChange={(e) => onChange({ reportEmail: e.target.value })}
                className={inputClass}
                placeholder="reports@example.com"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Email address where reports will be sent
              </p>
            </div>
          </>
        )}
      </div>
    </SettingsSection>
  );
}
