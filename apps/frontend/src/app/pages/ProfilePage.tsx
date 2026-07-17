import { UserProfile } from '@clerk/clerk-react';

export function ProfilePage() {
  return (
    <div className="flex justify-center py-8">
      <UserProfile routing="path" path="/profile" />
    </div>
  );
}
