import { useRef, useState } from "react";
import { SettingsSection } from "./SettingsSection";
import { ImageUpload } from "./ImageUpload";
import { ColorPicker } from "./ColorPicker";
import type { StoreSettingsData } from "../types/settings.types";

interface StoreBrandingSectionProps {
  settings: StoreSettingsData;
  onTextChange: (updates: Partial<StoreSettingsData>) => void;
  onImageChange: (field: string, file: File) => void;
  onImageRemove: (field: string) => void;
  onGalleryRemove: (publicId: string) => void;
  onGalleryAdd: (files: FileList) => void;
}

export function StoreBrandingSection({
  settings,
  onTextChange,
  onImageChange,
  onImageRemove,
  onGalleryRemove,
  onGalleryAdd,
}: StoreBrandingSectionProps) {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setPendingFiles((prev) => [...prev, ...Array.from(files)]);
      onGalleryAdd(files);
    }
  };

  return (
    <SettingsSection
      title="Store Branding"
      description="Logo, banner, photos, and brand identity"
    >
      <div className="space-y-8">
        <div className="flex items-start gap-8 flex-wrap">
          <ImageUpload
            value={settings.logo?.url}
            onChange={(f) => onImageChange("logo", f)}
            onRemove={() => onImageRemove("logo")}
            label="Store Logo"
            hint="Square image, at least 200x200px"
            previewClassName="h-24 w-24"
          />

          <ImageUpload
            value={settings.heroBanner?.url}
            onChange={(f) => onImageChange("heroBanner", f)}
            onRemove={() => onImageRemove("heroBanner")}
            label="Hero Banner"
            hint="Wide image, 1600x900px recommended"
            previewClassName="h-32 w-64"
          />

          <ImageUpload
            value={settings.favicon?.url}
            onChange={(f) => onImageChange("favicon", f)}
            onRemove={() => onImageRemove("favicon")}
            label="Favicon"
            hint="Square image, 64x64px"
            previewClassName="h-12 w-12"
          />
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-foreground">
            Store Photos
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 mb-3">
            {settings.interiorGallery.map((img) => (
              <div key={img.publicId} className="relative group">
                <img
                  src={img.url}
                  alt="Store"
                  className="h-24 w-full rounded-lg object-cover ring-1 ring-border"
                />
                <button
                  type="button"
                  onClick={() => onGalleryRemove(img.publicId)}
                  className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900/70 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
            {pendingFiles.map((f, i) => (
              <div key={`pending-${i}`} className="relative">
                <img
                  src={URL.createObjectURL(f)}
                  alt="New"
                  className="h-24 w-full rounded-lg object-cover ring-1 ring-primary"
                />
                <span className="absolute bottom-1 left-1 rounded bg-primary px-1 py-0.5 text-[10px] font-medium text-white">
                  New
                </span>
              </div>
            ))}
          </div>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleGallerySelect}
          />
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Add Photos
          </button>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload up to 10 photos. JPEG, PNG, or WebP.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Tagline
            </label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) =>
                onTextChange({ tagline: e.target.value })
              }
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              placeholder="Your store's tagline"
            />
          </div>

          <ColorPicker
            value={settings.brandColor}
            onChange={(color) => onTextChange({ brandColor: color })}
            label="Brand Color"
          />
        </div>
      </div>
    </SettingsSection>
  );
}
