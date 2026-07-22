import { useUser } from "@clerk/clerk-react";
import { SettingsSection } from "./SettingsSection";

export function ProfileSection() {
  const { user } = useUser();

  const displayName = user?.fullName ?? user?.firstName ?? "User";
  const email =
    user?.emailAddresses?.[0]?.emailAddress ?? "No email";
  const phone = user?.phoneNumbers?.[0]?.phoneNumber ?? "No phone";
  const avatarUrl = user?.imageUrl;
  const createdAt = user?.createdAt;

  return (
    <SettingsSection
      title="Profile"
      description="Your account information and preferences"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-6">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-20 w-20 rounded-full object-cover ring-2 ring-border"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {displayName}
            </h3>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">
            Account Details
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Name</span>
              <span className="text-sm font-medium text-foreground">
                {displayName}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium text-foreground">
                {email}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Phone</span>
              <span className="text-sm font-medium text-foreground">
                {phone}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">
                Member Since
              </span>
              <span className="text-sm font-medium text-foreground">
                {createdAt
                  ? new Date(createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          To update your profile details, visit your{" "}
          <a
            href="/profile"
            className="text-primary underline underline-offset-2 hover:text-primary/80"
          >
            profile page
          </a>
          .
        </p>
      </div>
    </SettingsSection>
  );
}
