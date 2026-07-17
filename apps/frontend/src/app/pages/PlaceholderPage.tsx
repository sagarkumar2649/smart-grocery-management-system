interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This section is under construction.
        </p>
      </div>
      <div className="flex h-64 items-center justify-center rounded-xl bg-surface ring-1 ring-border">
        <p className="text-muted-foreground text-sm">Coming soon</p>
      </div>
    </div>
  );
}
