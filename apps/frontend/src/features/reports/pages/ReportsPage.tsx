import { useState } from "react";
import { SalesReportPage } from "./SalesReportPage";
import { PurchaseReportPage } from "./PurchaseReportPage";
import { InventoryReportPage } from "./InventoryReportPage";
import { ProfitLossReportPage } from "./ProfitLossReportPage";
import { TopSellingReportPage } from "./TopSellingReportPage";
import { CustomerReportPage } from "./CustomerReportPage";
import { SupplierReportPage } from "./SupplierReportPage";
import { StockAlertsReportPage } from "./StockAlertsReportPage";

const BarChart = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" />
  </svg>
);

type ReportTab =
  | "sales"
  | "purchases"
  | "inventory"
  | "profit-loss"
  | "top-selling"
  | "customers"
  | "suppliers"
  | "stock-alerts";

interface TabDef {
  key: ReportTab;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabDef[] = [
  { key: "sales", label: "Sales Report", shortLabel: "Sales", icon: BarChart },
  { key: "purchases", label: "Purchase Report", shortLabel: "Purchases", icon: BarChart },
  { key: "inventory", label: "Inventory Report", shortLabel: "Inventory", icon: BarChart },
  { key: "profit-loss", label: "Profit & Loss", shortLabel: "P&L", icon: BarChart },
  { key: "top-selling", label: "Top / Least Selling", shortLabel: "Products", icon: BarChart },
  { key: "customers", label: "Customer Report", shortLabel: "Customers", icon: BarChart },
  { key: "suppliers", label: "Supplier Report", shortLabel: "Suppliers", icon: BarChart },
  { key: "stock-alerts", label: "Stock Alerts", shortLabel: "Alerts", icon: BarChart },
];

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("sales");

  const renderContent = () => {
    switch (activeTab) {
      case "sales": return <SalesReportPage />;
      case "purchases": return <PurchaseReportPage />;
      case "inventory": return <InventoryReportPage />;
      case "profit-loss": return <ProfitLossReportPage />;
      case "top-selling": return <TopSellingReportPage />;
      case "customers": return <CustomerReportPage />;
      case "suppliers": return <SupplierReportPage />;
      case "stock-alerts": return <StockAlertsReportPage />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">Business analytics and data-driven insights</p>
      </div>

      {/* Tab Navigation */}
      <div className="overflow-x-auto scrollbar-thin">
        <div className="flex gap-1 rounded-xl bg-muted p-1 min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-surface text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Report Content */}
      {renderContent()}
    </div>
  );
}
