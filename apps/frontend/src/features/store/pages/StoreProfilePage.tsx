import { UserProfile } from '@clerk/clerk-react';

export function StoreProfilePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account settings</p>
      </div>
      <div className="flex justify-center">
        <UserProfile routing="path" path="/store/profile" />
      </div>
    </div>
  );
}
