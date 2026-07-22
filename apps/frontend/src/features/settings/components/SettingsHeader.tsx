import { cn } from "@/shared/lib/cn";

interface SettingsHeaderProps {
  onSave: () => void;
  onReset: () => void;
  isSaving: boolean;
  isDirty: boolean;
  successMessage: string;
}

export function SettingsHeader({
  onSave,
  onReset,
  isSaving,
  isDirty,
  successMessage,
}: SettingsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your store configuration and preferences
        </p>
      </div>

      <div className="flex items-center gap-3">
        {successMessage && (
          <div className="rounded-lg bg-success/10 border border-success/20 px-4 py-2 text-sm font-medium text-success animate-in fade-in duration-300">
            {successMessage}
          </div>
        )}

        <button
          type="button"
          onClick={onReset}
          disabled={!isDirty || isSaving}
          className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Reset
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={!isDirty || isSaving}
          className={cn(
            "inline-flex h-9 items-center rounded-lg px-5 text-sm font-semibold text-white shadow-sm transition-all",
            isDirty && !isSaving
              ? "bg-primary hover:bg-teal-800"
              : "bg-primary/50 cursor-not-allowed",
          )}
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Saving...
            </span>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
}
