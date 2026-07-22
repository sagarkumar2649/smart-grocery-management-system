import { useAppDispatch } from "@/store/hooks";
import { setTheme } from "@/store/slices/app-ui.slice";
import { cn } from "@/shared/lib/cn";
import { SettingsSection } from "./SettingsSection";
import { Toggle } from "./Toggle";
import { ColorPicker } from "./ColorPicker";
import type { ThemeSettings } from "../types/settings.types";

interface ThemeSectionProps {
  settings: ThemeSettings;
  onChange: (updates: Partial<ThemeSettings>) => void;
}

export function ThemeSection({ settings, onChange }: ThemeSectionProps) {
  const dispatch = useAppDispatch();

  const handleDarkMode = (mode: string) => {
    onChange({ darkMode: mode });
    dispatch(setTheme(mode as "light" | "dark" | "system"));
  };

  return (
    <SettingsSection
      title="Theme"
      description="Customize the look and feel of your admin panel"
    >
      <div className="space-y-8">
        <div>
          <p className="mb-3 text-sm font-medium text-foreground">Dark Mode</p>
          <div className="flex rounded-lg bg-background p-1 ring-1 ring-border">
            {(["light", "dark", "system"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => handleDarkMode(mode)}
                className={cn(
                  "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all",
                  settings.darkMode === mode
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <ColorPicker
            value={settings.primaryColor}
            onChange={(color) => onChange({ primaryColor: color })}
            label="Primary Color"
          />
          <ColorPicker
            value={settings.accentColor}
            onChange={(color) => onChange({ accentColor: color })}
            label="Accent Color"
          />
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-foreground">
            Sidebar Style
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(["compact", "comfortable", "spacious"] as const).map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => onChange({ sidebarStyle: style })}
                className={cn(
                  "rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all",
                  settings.sidebarStyle === style
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-background text-foreground hover:bg-muted",
                )}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-foreground">Font Size</p>
          <div className="grid grid-cols-3 gap-2">
            {(["small", "default", "large"] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onChange({ fontSize: size })}
                className={cn(
                  "rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all",
                  settings.fontSize === size
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-background text-foreground hover:bg-muted",
                )}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-foreground">
            Border Radius
          </p>
          <div className="grid grid-cols-4 gap-2">
            {(["none", "small", "default", "large"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onChange({ borderRadius: r })}
                className={cn(
                  "rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all",
                  settings.borderRadius === r
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-background text-foreground hover:bg-muted",
                )}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <Toggle
          checked={settings.compactMode}
          onChange={(checked) => onChange({ compactMode: checked })}
          label="Compact Mode"
          description="Reduce spacing and padding throughout the interface"
        />
      </div>
    </SettingsSection>
  );
}
