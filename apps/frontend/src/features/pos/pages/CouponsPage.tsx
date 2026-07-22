import { useState } from 'react';
import { useCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from '../hooks/use-coupons';
import type { Coupon, CreateCouponPayload } from '../api/coupon-api';

export function CouponsPage() {
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useCoupons({ page, limit: 20 });
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const coupons = data?.data ?? [];
  const pagination = data?.meta?.pagination;

  const handleDelete = () => {
    if (!deleteId) return;
    deleteCoupon.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Coupons</h1>
        <button
          onClick={() => { setEditing(null); setShowCreate(true); }}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700"
        >
          + Create Coupon
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Min Order</th>
              <th className="px-4 py-3">Usage</th>
              <th className="px-4 py-3">Valid</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">Loading...</td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">No coupons found</td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-bold text-teal-700">{coupon.code}</td>
                  <td className="px-4 py-3 text-gray-600">{coupon.description}</td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {coupon.minOrderAmount > 0 ? `₹${coupon.minOrderAmount}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(coupon.validFrom).toLocaleDateString('en-IN')} - {new Date(coupon.validUntil).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditing(coupon); setShowCreate(true); }}
                        className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(coupon._id)}
                        className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {pagination.page} of {pagination.pages}</span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page >= pagination.pages}
            className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreate && (
        <CouponFormModal
          editing={editing}
          onClose={() => { setShowCreate(false); setEditing(null); }}
          onSubmit={(payload) => {
            if (editing) {
              updateCoupon.mutate(
                { id: editing._id, payload },
                { onSuccess: () => { setShowCreate(false); setEditing(null); } },
              );
            } else {
              createCoupon.mutate(payload, { onSuccess: () => { setShowCreate(false); } });
            }
          }}
          isPending={createCoupon.isPending || updateCoupon.isPending}
        />
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl bg-surface p-6 shadow-xl">
            <h3 className="mb-3 text-lg font-bold text-foreground">Delete Coupon</h3>
            <p className="mb-4 text-sm text-gray-500">Are you sure you want to delete this coupon?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteCoupon.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Coupon Form Modal ─────────────────────────────────────────────────────────

function CouponFormModal({
  editing,
  onClose,
  onSubmit,
  isPending,
}: {
  editing: Coupon | null;
  onClose: () => void;
  onSubmit: (payload: CreateCouponPayload) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState({
    code: editing?.code ?? '',
    description: editing?.description ?? '',
    discountType: editing?.discountType ?? 'percentage' as const,
    discountValue: editing?.discountValue ?? 0,
    minOrderAmount: editing?.minOrderAmount ?? 0,
    maxDiscountAmount: editing?.maxDiscountAmount ?? 0,
    usageLimit: editing?.usageLimit ?? 0,
    validFrom: editing?.validFrom ? editing.validFrom.split('T')[0]! : new Date().toISOString().split('T')[0]!,
    validUntil: editing?.validUntil ? editing.validUntil.split('T')[0]! : '',
    isActive: editing?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateCouponPayload = {
      code: form.code,
      description: form.description,
      discountType: form.discountType,
      discountValue: form.discountValue,
      minOrderAmount: form.minOrderAmount,
      maxDiscountAmount: form.maxDiscountAmount,
      validFrom: form.validFrom,
      validUntil: form.validUntil,
      isActive: form.isActive,
    };
    if (form.usageLimit > 0) {
      payload.usageLimit = form.usageLimit;
    }
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-surface p-6 shadow-xl"
      >
        <h3 className="mb-4 text-lg font-bold text-foreground">
          {editing ? 'Edit Coupon' : 'Create Coupon'}
        </h3>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Code</label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase focus:border-teal-500 focus:outline-none"
              required
              maxLength={30}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Type</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value as 'percentage' | 'flat' })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
              >
                <option value="percentage">Percentage</option>
                <option value="flat">Flat Amount</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                {form.discountType === 'percentage' ? 'Percent (%)' : 'Amount (₹)'}
              </label>
              <input
                type="number"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                required
                min="0"
                max={form.discountType === 'percentage' ? 100 : undefined}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Min Order (₹)</label>
              <input
                type="number"
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                min="0"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Max Discount (₹)</label>
              <input
                type="number"
                value={form.maxDiscountAmount}
                onChange={(e) => setForm({ ...form, maxDiscountAmount: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Valid From</label>
              <input
                type="date"
                value={form.validFrom}
                onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Valid Until</label>
              <input
                type="date"
                value={form.validUntil}
                onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Usage Limit (blank = unlimited)</label>
              <input
                type="number"
                value={form.usageLimit || ''}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value ? Number(e.target.value) : 0 })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                min="1"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-gray-300"
                />
                Active
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {isPending ? 'Saving...' : editing ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
