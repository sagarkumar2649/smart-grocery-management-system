import { SignUp } from '@clerk/clerk-react';
import { useLocation } from 'react-router-dom';

export function SignUpPage() {
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:bg-muted/50">
      <SignUp
        routing="path"
        path="/signup"
        afterSignUpUrl={from || '/store'}
      />
    </div>
  );
}
