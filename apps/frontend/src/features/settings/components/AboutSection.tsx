import { SettingsSection } from "./SettingsSection";
import { cn } from "@/shared/lib/cn";

const techStack = [
  { name: "React", version: "19" },
  { name: "Vite", version: "7" },
  { name: "TypeScript", version: "5.9" },
  { name: "Tailwind CSS", version: "4" },
  { name: "Redux Toolkit", version: "" },
  { name: "React Query", version: "v5" },
  { name: "Express", version: "5" },
  { name: "MongoDB", version: "" },
  { name: "Mongoose", version: "" },
  { name: "Cloudinary", version: "" },
  { name: "Clerk Auth", version: "" },
];

const externalLinks = [
  { label: "Documentation", href: "#" },
  { label: "Support", href: "#" },
  { label: "Privacy Policy", href: "#" },
];

export function AboutSection() {
  const isDev = import.meta.env.MODE === "development";
  const userAgent =
    navigator.userAgent.length > 80
      ? navigator.userAgent.slice(0, 80) + "..."
      : navigator.userAgent;

  return (
    <SettingsSection
      title="About"
      description="Application information and credits"
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-border p-4">
          <h4 className="mb-3 text-sm font-semibold text-foreground">
            App Info
          </h4>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-bold text-foreground">
              Smart Inventory System
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                "bg-primary/10 text-primary"
              )}
            >
              v1.0.0
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                "bg-warning/10 text-warning"
              )}
            >
              {isDev ? "Development" : "Production"}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <h4 className="mb-3 text-sm font-semibold text-foreground">
            Technology Stack
          </h4>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="rounded-lg border border-border p-3"
              >
                <div className="text-sm font-medium text-foreground">
                  {tech.name}
                </div>
                {tech.version && (
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {tech.version}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <h4 className="mb-3 text-sm font-semibold text-foreground">
            System Information
          </h4>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="font-medium text-foreground">Browser:</dt>
              <dd className="text-muted-foreground">{userAgent}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-foreground">Screen:</dt>
              <dd className="text-muted-foreground">
                {screen.width}x{screen.height}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-foreground">Window:</dt>
              <dd className="text-muted-foreground">
                {window.innerWidth}x{window.innerHeight}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-foreground">Current URL:</dt>
              <dd className="text-muted-foreground">
                {window.location.origin}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-border p-4">
          <h4 className="mb-3 text-sm font-semibold text-foreground">
            Credits
          </h4>
          <p className="text-sm text-muted-foreground">
            Built with care for modern inventory management
          </p>
          <p className="mt-1 text-sm text-muted-foreground">&copy; 2026</p>
        </div>

        <div className="rounded-lg border border-border p-4">
          <h4 className="mb-3 text-sm font-semibold text-foreground">Links</h4>
          <div className="flex flex-wrap gap-3">
            {externalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5",
                  "text-sm font-medium text-foreground transition-colors hover:bg-muted"
                )}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
