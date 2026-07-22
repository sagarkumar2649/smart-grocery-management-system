import { useState } from "react";
import { SettingsSection } from "./SettingsSection";
import { FieldGroup } from "./FieldGroup";
import { Toggle } from "./Toggle";
import type { ShippingSettings, ShippingZone } from "../types/settings.types";

interface ShippingSettingsSectionProps {
  settings: ShippingSettings;
  onChange: (updates: Partial<ShippingSettings>) => void;
}

export function ShippingSettingsSection({
  settings,
  onChange,
}: ShippingSettingsSectionProps) {
  const [editingZoneIndex, setEditingZoneIndex] = useState<number | null>(null);
  const [zoneForm, setZoneForm] = useState<{
    name: string;
    rate: number;
    estimatedDays: number;
  }>({ name: "", rate: 0, estimatedDays: 5 });

  const handleAddZone = () => {
    const newZone: ShippingZone = {
      id: crypto.randomUUID(),
      name: zoneForm.name,
      rate: Math.round(zoneForm.rate * 100),
      estimatedDays: zoneForm.estimatedDays,
      active: true,
    };
    onChange({
      shippingZones: [...settings.shippingZones, newZone],
    });
    setZoneForm({ name: "", rate: 0, estimatedDays: 5 });
  };

  const handleUpdateZone = () => {
    if (editingZoneIndex === null) return;
    const updated = settings.shippingZones.map((zone, i) =>
      i === editingZoneIndex
        ? {
            ...zone,
            name: zoneForm.name,
            rate: Math.round(zoneForm.rate * 100),
            estimatedDays: zoneForm.estimatedDays,
          }
        : zone
    );
    onChange({ shippingZones: updated });
    setEditingZoneIndex(null);
    setZoneForm({ name: "", rate: 0, estimatedDays: 5 });
  };

  const handleDeleteZone = (index: number) => {
    const updated = settings.shippingZones.filter((_, i) => i !== index);
    onChange({ shippingZones: updated });
  };

  const handleToggleZoneActive = (index: number) => {
    const updated = settings.shippingZones.map((zone, i) =>
      i === index ? { ...zone, active: !zone.active } : zone
    );
    onChange({ shippingZones: updated });
  };

  const startEditing = (index: number) => {
    const zone = settings.shippingZones[index];
    if (!zone) return;
    setEditingZoneIndex(index);
    setZoneForm({
      name: zone.name,
      rate: zone.rate / 100,
      estimatedDays: zone.estimatedDays,
    });
  };

  const cancelEditing = () => {
    setEditingZoneIndex(null);
    setZoneForm({ name: "", rate: 0, estimatedDays: 5 });
  };

  return (
    <SettingsSection
      title="Shipping Settings"
      description="Configure shipping zones, rates, and delivery options"
    >
      <div className="space-y-8">
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            General
          </h4>
          <div className="space-y-1 divide-y divide-border">
            <Toggle
              checked={settings.shippingEnabled}
              onChange={(checked) => onChange({ shippingEnabled: checked })}
              label="Shipping Enabled"
              description="Enable shipping calculations for orders"
            />
            <FieldGroup
              label="Free Shipping Threshold"
              hint="Orders above this amount get free shipping"
              className="pt-3"
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ₹
                </span>
                <input
                  type="number"
                  min={0}
                  value={settings.freeShippingThreshold / 100}
                  onChange={(e) =>
                    onChange({
                      freeShippingThreshold: Math.round(
                        Number(e.target.value) * 100
                      ),
                    })
                  }
                  className="w-full rounded-lg border border-border bg-background py-2 pl-7 pr-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </FieldGroup>
            <FieldGroup
              label="Default Flat Rate"
              hint="Standard shipping rate applied when no zone matches"
              className="pt-3"
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ₹
                </span>
                <input
                  type="number"
                  min={0}
                  value={settings.defaultShippingRate / 100}
                  onChange={(e) =>
                    onChange({
                      defaultShippingRate: Math.round(
                        Number(e.target.value) * 100
                      ),
                    })
                  }
                  className="w-full rounded-lg border border-border bg-background py-2 pl-7 pr-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </FieldGroup>
            <FieldGroup label="Max Weight" className="pt-3">
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={settings.maxWeightKg}
                  onChange={(e) =>
                    onChange({ maxWeightKg: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-border bg-background py-2 pl-3 pr-12 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  kg
                </span>
              </div>
            </FieldGroup>
            <FieldGroup label="Estimated Delivery Days" className="pt-3">
              <input
                type="number"
                min={1}
                value={settings.estimatedDeliveryDays}
                onChange={(e) =>
                  onChange({
                    estimatedDeliveryDays: Number(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-border bg-background py-2 pl-3 pr-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </FieldGroup>
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Cash on Delivery
          </h4>
          <div className="space-y-1 divide-y divide-border">
            <Toggle
              checked={settings.codEnabled}
              onChange={(checked) => onChange({ codEnabled: checked })}
              label="COD Enabled"
              description="Allow customers to pay on delivery"
            />
            {settings.codEnabled && (
              <FieldGroup
                label="Max COD Amount"
                hint="Maximum order value eligible for COD"
                className="pt-3"
              >
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    ₹
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={settings.maxCodAmount / 100}
                    onChange={(e) =>
                      onChange({
                        maxCodAmount: Math.round(Number(e.target.value) * 100),
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background py-2 pl-7 pr-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </FieldGroup>
            )}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Shipping Zones
            </h4>
            {editingZoneIndex === null && (
              <button
                type="button"
                onClick={() => {
                  setEditingZoneIndex(-1);
                  setZoneForm({ name: "", rate: 0, estimatedDays: 5 });
                }}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                + Add Zone
              </button>
            )}
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Zone Name</th>
                  <th className="px-4 py-3 font-medium">Rate (₹)</th>
                  <th className="px-4 py-3 font-medium">Est. Days</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {editingZoneIndex === -1 && (
                  <tr className="bg-muted/20">
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        placeholder="Zone name"
                        value={zoneForm.name}
                        onChange={(e) =>
                          setZoneForm({ ...zoneForm, name: e.target.value })
                        }
                        className="w-full rounded-lg border border-border bg-background py-1.5 px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          ₹
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={zoneForm.rate}
                          onChange={(e) =>
                            setZoneForm({
                              ...zoneForm,
                              rate: Number(e.target.value),
                            })
                          }
                          className="w-full rounded-lg border border-border bg-background py-1.5 pl-6 pr-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={1}
                        value={zoneForm.estimatedDays}
                        onChange={(e) =>
                          setZoneForm({
                            ...zoneForm,
                            estimatedDays: Number(e.target.value),
                          })
                        }
                        className="w-full rounded-lg border border-border bg-background py-1.5 px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={handleAddZone}
                          disabled={!zoneForm.name.trim()}
                          className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {settings.shippingZones.map((zone, index) => (
                  <tr key={zone.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 text-foreground">
                      {editingZoneIndex === index ? (
                        <input
                          type="text"
                          value={zoneForm.name}
                          onChange={(e) =>
                            setZoneForm({
                              ...zoneForm,
                              name: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-border bg-background py-1.5 px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      ) : (
                        zone.name
                      )}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {editingZoneIndex === index ? (
                        <div className="relative">
                          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                            ₹
                          </span>
                          <input
                            type="number"
                            min={0}
                            value={zoneForm.rate}
                            onChange={(e) =>
                              setZoneForm({
                                ...zoneForm,
                                rate: Number(e.target.value),
                              })
                            }
                            className="w-full rounded-lg border border-border bg-background py-1.5 pl-6 pr-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      ) : (
                        `₹${(zone.rate / 100).toFixed(2)}`
                      )}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {editingZoneIndex === index ? (
                        <input
                          type="number"
                          min={1}
                          value={zoneForm.estimatedDays}
                          onChange={(e) =>
                            setZoneForm({
                              ...zoneForm,
                              estimatedDays: Number(e.target.value),
                            })
                          }
                          className="w-full rounded-lg border border-border bg-background py-1.5 px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      ) : (
                        zone.estimatedDays
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleToggleZoneActive(index)}
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          zone.active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {zone.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {editingZoneIndex === index ? (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={handleUpdateZone}
                            disabled={!zoneForm.name.trim()}
                            className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => startEditing(index)}
                            className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteZone(index)}
                            className="rounded-md border border-danger/30 px-2.5 py-1 text-xs font-medium text-danger hover:bg-danger/10"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {settings.shippingZones.length === 0 &&
                  editingZoneIndex !== -1 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-muted-foreground"
                      >
                        No shipping zones configured
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
