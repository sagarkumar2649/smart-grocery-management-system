import { useEffect, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCategories, useCreateProduct, useUpdateProduct } from "../hooks/use-products";
import { PRODUCT_UNITS, GST_RATES, type Product } from "../api/products-api";

// ── Schema ────────────────────────────────────────────────────────────────────

const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  sku: z.string().min(1, "SKU is required").max(100),
  barcode: z.string().max(100).optional(),
  category: z.string().min(1, "Category is required"),
  brand: z.string().max(100).optional(),
  purchasePrice: z.coerce.number().nonnegative("Must be ≥ 0"),
  sellingPrice: z.coerce.number().nonnegative("Must be ≥ 0"),
  mrp: z.coerce.number().nonnegative("Must be ≥ 0"),
  gstPercent: z.coerce.number().refine((v) => (GST_RATES as readonly number[]).includes(v), {
    message: "Select a valid GST rate",
  }),
  hsnCode: z.string().max(20).optional(),
  stock: z.coerce.number().int().nonnegative("Must be ≥ 0"),
  minimumStock: z.coerce.number().int().nonnegative("Must be ≥ 0"),
  unit: z.enum(PRODUCT_UNITS as unknown as [string, ...string[]]),
  isActive: z.boolean(),
});

// Explicitly type the inferred shape to satisfy react-hook-form + exactOptionalPropertyTypes
type FormValues = {
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  brand?: string;
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  gstPercent: number;
  hsnCode?: string;
  stock: number;
  minimumStock: number;
  unit: string;
  isActive: boolean;
};

// ── Field helper ──────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
        {required === true && <span className="ml-1 text-danger">*</span>}
      </label>
      {children}
      {error !== undefined && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

const inputCls =
  "flex h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors disabled:opacity-50";

const selectCls =
  "flex h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors disabled:opacity-50 cursor-pointer";

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  product?: Product | null;
  onClose: () => void;
}

export function ProductFormModal({ product, onClose }: Props) {
  const isEditing = !!product;
  const { data: categoriesRes, isLoading: categoriesLoading, isError: categoriesError } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl ?? null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(productSchema) as Resolver<FormValues>,
    defaultValues: {
      name: product?.name ?? "",
      sku: product?.sku ?? "",
      barcode: product?.barcode ?? "",
      category:
        product?.category != null && typeof product.category === "object"
          ? product.category._id
          : "",
      brand: product?.brand ?? "",
      purchasePrice: product?.purchasePrice ?? 0,
      sellingPrice: product?.sellingPrice ?? 0,
      mrp: product?.mrp ?? 0,
      gstPercent: product?.gstPercent ?? 0,
      hsnCode: product?.hsnCode ?? "",
      stock: product?.stock ?? 0,
      minimumStock: product?.minimumStock ?? 0,
      unit: product?.unit ?? "Piece",
      isActive: product?.isActive ?? true,
    },
  });

  const isActiveVal = watch("isActive");

  useEffect(() => {
    return () => {
      if (imagePreview !== null && imagePreview !== product?.imageUrl) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview, product?.imageUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file === undefined) return;
    if (imagePreview !== null && imagePreview !== product?.imageUrl) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(URL.createObjectURL(file));
  };

  const isPending = createMutation.isPending || updateMutation.isPending || isSubmitting;
  const serverError = createMutation.error?.message ?? updateMutation.error?.message;

  const onSubmit = (values: FormValues) => {
    const fd = new FormData();
    (Object.keys(values) as (keyof FormValues)[]).forEach((key) => {
      const val = values[key];
      if (val !== undefined && val !== "") {
        fd.append(key, String(val));
      }
    });

    const file = fileInputRef.current?.files?.[0];
    if (file !== undefined) {
      fd.append("image", file);
    }

    if (isEditing && product !== null && product !== undefined) {
      updateMutation.mutate(
        { id: product._id, formData: fd },
        {
          onSuccess: () => {
            reset();
            onClose();
          },
        },
      );
    } else {
      createMutation.mutate(fd, {
        onSuccess: () => {
          reset();
          onClose();
        },
      });
    }
  };

  const categories = categoriesRes?.data ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-2xl flex-col max-h-[90vh] rounded-2xl bg-surface shadow-xl ring-1 ring-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            {isEditing ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            void handleSubmit(onSubmit)(e);
          }}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {serverError !== undefined && (
              <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
                {serverError}
              </div>
            )}

            {/* Image */}
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
                {imagePreview !== null ? (
                  <img src={imagePreview} alt="preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  </div>
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  id="product-image-upload"
                  onChange={handleImageChange}
                />
                <label
                  htmlFor="product-image-upload"
                  className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {imagePreview !== null ? "Change Image" : "Upload Image"}
                </label>
                <p className="mt-1 text-xs text-muted-foreground">JPEG, PNG, WebP · Max 5 MB</p>
              </div>
            </div>

            {/* Basic info */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Product Name" required error={errors.name?.message}>
                <input className={inputCls} placeholder="e.g. Tata Salt 1kg" {...register("name")} />
              </Field>
              <Field label="SKU" required error={errors.sku?.message}>
                <input className={inputCls} placeholder="e.g. TATA-SALT-1KG" {...register("sku")} />
              </Field>
              <Field label="Barcode" error={errors.barcode?.message}>
                <input className={inputCls} placeholder="e.g. 8901234567890" {...register("barcode")} />
              </Field>
              <Field label="Brand" error={errors.brand?.message}>
                <input className={inputCls} placeholder="e.g. Tata" {...register("brand")} />
              </Field>
              <Field
                label="Category"
                required
                error={
                  categoriesError
                    ? "Failed to load categories — please refresh and try again"
                    : errors.category?.message
                }
              >
                <select
                  className={selectCls}
                  disabled={categoriesLoading || categoriesError}
                  {...register("category")}
                >
                  {categoriesLoading ? (
                    <option value="">Loading categories…</option>
                  ) : categoriesError ? (
                    <option value="">Unable to load categories</option>
                  ) : (
                    <>
                      <option value="">Select category…</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </Field>
              <Field label="Unit" required error={errors.unit?.message}>
                <select className={selectCls} {...register("unit")}>
                  {PRODUCT_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Pricing */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Pricing (₹)
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Purchase Price" required error={errors.purchasePrice?.message}>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                      ₹
                    </span>
                    <input
                      className={`${inputCls} pl-7`}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...register("purchasePrice")}
                    />
                  </div>
                </Field>
                <Field label="Selling Price" required error={errors.sellingPrice?.message}>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                      ₹
                    </span>
                    <input
                      className={`${inputCls} pl-7`}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...register("sellingPrice")}
                    />
                  </div>
                </Field>
                <Field label="MRP" required error={errors.mrp?.message}>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                      ₹
                    </span>
                    <input
                      className={`${inputCls} pl-7`}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...register("mrp")}
                    />
                  </div>
                </Field>
              </div>
            </div>

            {/* Tax */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="GST %" required error={errors.gstPercent?.message}>
                <select className={selectCls} {...register("gstPercent")}>
                  {GST_RATES.map((r) => (
                    <option key={r} value={r}>
                      {r}%
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="HSN Code" error={errors.hsnCode?.message}>
                <input className={inputCls} placeholder="e.g. 2501" {...register("hsnCode")} />
              </Field>
            </div>

            {/* Stock */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Stock" required error={errors.stock?.message}>
                <input
                  className={inputCls}
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  {...register("stock")}
                />
              </Field>
              <Field label="Minimum Stock" required error={errors.minimumStock?.message}>
                <input
                  className={inputCls}
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  {...register("minimumStock")}
                />
              </Field>
            </div>

            {/* Status toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={isActiveVal}
                onClick={() => setValue("isActive", !isActiveVal)}
                className={`relative inline-flex h-6 w-11 cursor-pointer rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  isActiveVal ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5 ${
                    isActiveVal ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
              <span className="text-sm text-foreground">Active</span>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="inline-flex h-9 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-9 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending ? "Saving…" : isEditing ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
