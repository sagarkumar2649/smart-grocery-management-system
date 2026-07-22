interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function SettingsSection({
  title,
  description,
  children,
  action,
}: SettingsSectionProps) {
  return (
    <div className="rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
