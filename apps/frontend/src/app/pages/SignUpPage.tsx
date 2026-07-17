import { SignUp } from '@clerk/clerk-react';

export function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:bg-muted/50">
      <SignUp routing="path" path="/signup" />
    </div>
  );
}
