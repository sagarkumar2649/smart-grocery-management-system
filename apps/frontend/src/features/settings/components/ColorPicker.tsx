import { cn } from "@/shared/lib/cn";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label: string;
  swatches?: string[];
}

const DEFAULT_SWATCHES = [
  "#0F766E",
  "#0D9488",
  "#2563EB",
  "#4F46E5",
  "#7C3AED",
  "#DB2777",
  "#DC2626",
  "#EA580C",
  "#D97706",
  "#16A34A",
  "#374151",
  "#000000",
];

export function ColorPicker({
  value,
  onChange,
  label,
  swatches = DEFAULT_SWATCHES,
}: ColorPickerProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-10 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-28 rounded-lg border border-border bg-background px-3 text-sm font-mono text-foreground uppercase focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {swatches.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={cn(
              "h-7 w-7 rounded-full border-2 transition-all hover:scale-110",
              value === color
                ? "border-foreground ring-2 ring-foreground/20"
                : "border-transparent",
            )}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
}
