import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActiveTab, type InventoryTab } from "@/store/slices/inventory.slice";
import { InventoryDashboardPage } from "./InventoryDashboardPage";
import { InventoryStockPage } from "./InventoryStockPage";
import { InventoryAdjustmentPage } from "./InventoryAdjustmentPage";
import { InventoryPurchasePage } from "./InventoryPurchasePage";
import { InventoryMovementsPage } from "./InventoryMovementsPage";
import { InventoryDamagedPage } from "./InventoryDamagedPage";
import { InventoryExpiredPage } from "./InventoryExpiredPage";

// ── Icons ─────────────────────────────────────────────────────────────────────
const LayoutDashboard = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
);
const Package = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
);
const AlertTriangle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
);
const XCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
);
const History = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
);
const ArrowUpDown = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>
);
const ShoppingCart = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
);
const Shield = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
);
const Clock = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

interface TabItem {
  key: InventoryTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "stock", label: "Current Stock", icon: Package },
  { key: "low-stock", label: "Low Stock", icon: AlertTriangle },
  { key: "out-of-stock", label: "Out of Stock", icon: XCircle },
  { key: "movements", label: "Movements", icon: History },
  { key: "adjustment", label: "Adjust Stock", icon: ArrowUpDown },
  { key: "purchase", label: "Purchase", icon: ShoppingCart },
  { key: "damaged", label: "Damaged", icon: Shield },
  { key: "expired", label: "Expired", icon: Clock },
];

// ── Page Component ────────────────────────────────────────────────────────────

export function InventoryPage() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.inventory.activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <InventoryDashboardPage />;
      case "stock":
        return <InventoryStockPage />;
      case "low-stock":
        return <InventoryStockPage />;
      case "out-of-stock":
        return <InventoryStockPage />;
      case "movements":
        return <InventoryMovementsPage />;
      case "adjustment":
        return <InventoryAdjustmentPage />;
      case "purchase":
        return <InventoryPurchasePage />;
      case "damaged":
        return <InventoryDamagedPage />;
      case "expired":
        return <InventoryExpiredPage />;
      default:
        return <InventoryDashboardPage />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="overflow-x-auto">
        <nav className="flex gap-1 rounded-xl bg-surface p-1 shadow-sm ring-1 ring-border" aria-label="Inventory sections">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => dispatch(setActiveTab(tab.key))}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}
