import { useState } from "react";
import { useCreateSupplier, useUpdateSupplier } from "../hooks/use-suppliers";
import {
  PAYMENT_TERMS,
  type Supplier,
  type SupplierAddress,
  type PaymentTerm,
} from "../api/suppliers-api";

interface Props {
  supplier?: Supplier | null;
  onClose: () => void;
}

export function SupplierFormModal({ supplier, onClose }: Props) {
  const isEditing = !!supplier;
  const { mutate: createMutate, isPending: isCreating } = useCreateSupplier();
  const { mutate: updateMutate, isPending: isUpdating } = useUpdateSupplier();
  const isPending = isCreating || isUpdating;

  const [companyName, setCompanyName] = useState(supplier?.companyName ?? "");
  const [contactPerson, setContactPerson] = useState(supplier?.contactPerson ?? "");
  const [phone, setPhone] = useState(supplier?.phone ?? "");
  const [email, setEmail] = useState(supplier?.email ?? "");
  const [gstNumber, setGstNumber] = useState(supplier?.gstNumber ?? "");
  const [addressLine1, setAddressLine1] = useState(supplier?.address?.line1 ?? "");
  const [addressLine2, setAddressLine2] = useState(supplier?.address?.line2 ?? "");
  const [city, setCity] = useState(supplier?.address?.city ?? "");
  const [state, setState] = useState(supplier?.address?.state ?? "");
  const [pincode, setPincode] = useState(supplier?.address?.pincode ?? "");
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm>(supplier?.paymentTerms ?? "Net 30");
  const [notes, setNotes] = useState(supplier?.notes ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const address: SupplierAddress = {
      line1: addressLine1.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
    };
    if (addressLine2.trim()) address.line2 = addressLine2.trim();

    const payload = {
      companyName: companyName.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      ...(gstNumber.trim() && { gstNumber: gstNumber.trim() }),
      address,
      paymentTerms,
      ...(notes.trim() && { notes: notes.trim() }),
    };

    if (isEditing) {
      updateMutate(
        { id: supplier._id, data: payload },
        { onSuccess: onClose },
      );
    } else {
      createMutate(payload, { onSuccess: onClose });
    }
  };

  const inputCls = "block h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all";
  const labelCls = "block text-sm font-medium text-foreground mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface p-6 shadow-xl ring-1 ring-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {isEditing ? "Edit Supplier" : "Add Supplier"}
          </h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Company Name *</label>
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Contact Person *</label>
              <input type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Phone *</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>GST Number</label>
              <input type="text" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} placeholder="Optional" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Payment Terms *</label>
              <select value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value as PaymentTerm)} className={`${inputCls} cursor-pointer`}>
                {PAYMENT_TERMS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-semibold text-foreground">Address</h4>
            <div>
              <label className={labelCls}>Address Line 1 *</label>
              <input type="text" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Address Line 2</label>
              <input type="text" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} className={inputCls} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>City *</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>State *</label>
                <input type="text" value={state} onChange={(e) => setState(e.target.value)} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Pincode *</label>
                <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} required className={inputCls} />
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={1000} placeholder="Additional notes..." className={`${inputCls} resize-none h-auto py-2`} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={isPending} className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50">
              {isPending ? "Saving..." : isEditing ? "Save Changes" : "Add Supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
