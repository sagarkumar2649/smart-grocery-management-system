import { SignIn } from '@clerk/clerk-react';

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:bg-muted/50">
      <SignIn routing="path" path="/login" />
    </div>
  );
}
