import { useRef } from "react";
import { cn } from "@/shared/lib/cn";

interface ImageUploadProps {
  value?: string | null | undefined;
  onChange: (file: File) => void;
  onRemove?: () => void;
  label: string;
  hint?: string;
  className?: string;
  previewClassName?: string;
  accept?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  label,
  hint,
  className,
  previewClassName,
  accept = "image/jpeg,image/png,image/webp",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onChange(file);
  };

  return (
    <div className={className}>
      <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />

      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt={label}
            className={cn(
              "rounded-lg object-cover ring-1 ring-border",
              previewClassName ?? "h-24 w-24",
            )}
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              Change
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/5"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-background transition-colors hover:border-primary/50 hover:bg-primary/5",
            previewClassName ?? "h-24 w-24",
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mb-1 h-6 w-6 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
          </svg>
          <span className="text-[10px] text-muted-foreground">Upload</span>
        </button>
      )}

      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
