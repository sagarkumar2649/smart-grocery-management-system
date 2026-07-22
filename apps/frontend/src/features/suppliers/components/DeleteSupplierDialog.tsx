import type { Supplier } from "../api/suppliers-api";
import { useDeleteSupplier } from "../hooks/use-suppliers";

interface Props {
  supplier: Supplier;
  onClose: () => void;
}

export function DeleteSupplierDialog({ supplier, onClose }: Props) {
  const { mutate, isPending } = useDeleteSupplier();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl ring-1 ring-border" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
        </div>
        <h2 className="text-lg font-semibold text-foreground">Delete Supplier</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Are you sure you want to delete <span className="font-medium text-foreground">{supplier.companyName}</span>? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={isPending} className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={() => mutate(supplier._id, { onSuccess: onClose })} disabled={isPending} className="inline-flex h-9 items-center rounded-lg bg-danger px-4 text-sm font-medium text-white transition-colors hover:bg-danger/90 disabled:opacity-50">
            {isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
