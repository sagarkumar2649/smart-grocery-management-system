import { useState } from "react";
import { UserProfile } from "@clerk/clerk-react";
import { useMyProfile, useUpdateMyProfile, useAddAddress, useRemoveAddress } from "@/features/customers/hooks/use-customers";
import { CustomerStatusBadge } from "@/features/customers/components/CustomerStatusBadge";
import { formatINRCompact } from "@/shared/lib/format-currency";

// ── Icons ─────────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);
const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

export function StoreProfilePage() {
  const { data: profileRes, isLoading } = useMyProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateMyProfile();
  const { mutate: addAddress, isPending: isAddingAddress } = useAddAddress();
  const { mutate: removeAddress } = useRemoveAddress();

  const profile = profileRes?.data;

  const [editingProfile, setEditingProfile] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrLabel, setAddrLabel] = useState("");
  const [addrLine1, setAddrLine1] = useState("");
  const [addrLine2, setAddrLine2] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrPincode, setAddrPincode] = useState("");

  const startEditProfile = () => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone ?? "");
    }
    setEditingProfile(true);
  };

  const handleSaveProfile = () => {
    updateProfile(
      { name: name.trim(), phone: phone.trim() || null },
      { onSuccess: () => setEditingProfile(false) },
    );
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const addrPayload: {
      label: string;
      line1: string;
      city: string;
      state: string;
      pincode: string;
      isDefault: boolean;
      line2?: string;
    } = {
      label: addrLabel.trim(),
      line1: addrLine1.trim(),
      city: addrCity.trim(),
      state: addrState.trim(),
      pincode: addrPincode.trim(),
      isDefault: profile?.addresses?.length === 0,
    };
    if (addrLine2.trim()) {
      addrPayload.line2 = addrLine2.trim();
    }
    addAddress(addrPayload, {
        onSuccess: () => {
          setShowAddressForm(false);
          setAddrLabel("");
          setAddrLine1("");
          setAddrLine2("");
          setAddrCity("");
          setAddrState("");
          setAddrPincode("");
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account settings</p>
      </div>

      {/* Clerk Profile */}
      <div className="mb-8 flex justify-center">
        <UserProfile />
      </div>

      {/* Customer Profile Card */}
      {isLoading ? (
        <div className="flex h-32 items-center justify-center rounded-2xl bg-surface ring-1 ring-gray-100">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-200 border-t-teal-600" />
        </div>
      ) : profile ? (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-gray-100 text-center">
              <p className="text-xs text-gray-500">Total Orders</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{profile.totalOrders}</p>
            </div>
            <div className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-gray-100 text-center">
              <p className="text-xs text-gray-500">Total Spent</p>
              <p className="mt-1 text-2xl font-bold text-teal-700">{formatINRCompact(profile.totalSpending)}</p>
            </div>
            <div className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-gray-100 text-center">
              <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                <StarIcon /> Loyalty Points
              </div>
              <p className="mt-1 text-2xl font-bold text-amber-600">{profile.loyaltyPoints}</p>
            </div>
          </div>

          {/* Profile Info */}
          <div className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Personal Information</h2>
              {!editingProfile && (
                <button
                  type="button"
                  onClick={startEditProfile}
                  className="text-sm font-medium text-teal-700 hover:text-teal-800 transition-colors"
                >
                  Edit
                </button>
              )}
            </div>

            {editingProfile ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-foreground focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="block h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-foreground placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingProfile(false)}
                    className="inline-flex h-9 items-center rounded-lg border border-gray-200 bg-surface px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isUpdating}
                    className="inline-flex h-9 items-center rounded-lg bg-teal-700 px-4 text-sm font-medium text-white hover:bg-teal-800 transition-colors disabled:opacity-50"
                  >
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm font-medium text-foreground">{profile.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-foreground">{profile.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-foreground">{profile.phone || "Not set"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <CustomerStatusBadge status={profile.status} />
                </div>
              </div>
            )}
          </div>

          {/* Addresses */}
          <div className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Saved Addresses ({profile.addresses?.length ?? 0})
              </h2>
              {!showAddressForm && (
                <button
                  type="button"
                  onClick={() => setShowAddressForm(true)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:text-teal-800 transition-colors"
                >
                  <PlusIcon /> Add Address
                </button>
              )}
            </div>

            {/* Address Form */}
            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="mb-4 rounded-lg border border-teal-200 bg-teal-50/50 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Label (Home, Office...)</label>
                    <input
                      type="text"
                      value={addrLabel}
                      onChange={(e) => setAddrLabel(e.target.value)}
                      required
                      className="block h-9 w-full rounded-lg border border-gray-200 bg-surface px-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      value={addrPincode}
                      onChange={(e) => setAddrPincode(e.target.value)}
                      required
                      className="block h-9 w-full rounded-lg border border-gray-200 bg-surface px-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Address Line 1</label>
                  <input
                    type="text"
                    value={addrLine1}
                    onChange={(e) => setAddrLine1(e.target.value)}
                    required
                    className="block h-9 w-full rounded-lg border border-gray-200 bg-surface px-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Address Line 2 (optional)</label>
                  <input
                    type="text"
                    value={addrLine2}
                    onChange={(e) => setAddrLine2(e.target.value)}
                    className="block h-9 w-full rounded-lg border border-gray-200 bg-surface px-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      required
                      className="block h-9 w-full rounded-lg border border-gray-200 bg-surface px-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={addrState}
                      onChange={(e) => setAddrState(e.target.value)}
                      required
                      className="block h-9 w-full rounded-lg border border-gray-200 bg-surface px-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="inline-flex h-9 items-center rounded-lg border border-gray-200 bg-surface px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingAddress}
                    className="inline-flex h-9 items-center rounded-lg bg-teal-700 px-4 text-sm font-medium text-white hover:bg-teal-800 transition-colors disabled:opacity-50"
                  >
                    {isAddingAddress ? "Adding..." : "Add Address"}
                  </button>
                </div>
              </form>
            )}

            {/* Address List */}
            {profile.addresses?.length === 0 ? (
              <p className="text-sm text-gray-500">No addresses saved yet</p>
            ) : (
              <div className="space-y-2">
                {profile.addresses?.map((addr: { _id?: string; label: string; line1: string; line2?: string; city: string; state: string; pincode: string; isDefault: boolean }) => (
                  <div
                    key={addr._id}
                    className={`flex items-start justify-between rounded-lg border p-3 ${
                      addr.isDefault
                        ? "border-teal-200 bg-teal-50/50"
                        : "border-gray-100"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        {addr.isDefault && (
                          <span className="text-xs font-medium text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded">Default</span>
                        )}
                        <span className="text-xs text-gray-500">{addr.label}</span>
                      </div>
                      <p className="text-sm text-foreground">
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}
                      </p>
                      <p className="text-sm text-foreground">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addr._id && removeAddress(addr._id)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Remove address"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Wishlist Preview */}
          {profile.wishlist && profile.wishlist.length > 0 && (
            <div className="rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-gray-100">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                My Wishlist ({profile.wishlist.length})
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {profile.wishlist.map((item: { _id: string; name: string; sellingPrice: number; mrp: number; imageUrl?: string; unit: string }) => (
                  <div key={item._id} className="rounded-lg border border-gray-100 p-3">
                    <div className="h-16 w-full overflow-hidden rounded-lg bg-gray-50 mb-2">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect width="18" height="18" x="3" y="3" rx="2" />
                            <circle cx="9" cy="9" r="2" />
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-teal-700 font-medium">{formatINRCompact(item.sellingPrice)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
