import { useInventoryDashboard, useLowStockProducts } from "../hooks/use-inventory";
import { formatINRCompact } from "@/shared/lib/format-currency";
import { StockStatusBadge } from "../components/StockStatusBadge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// ── Icons ─────────────────────────────────────────────────────────────────────
const Package = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
  </svg>
);
const IndianRupee = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 3h12" /><path d="M6 8h12" /><path d="m6 13 8.5 8" /><path d="M6 13h3" /><path d="M9 13c6.667 0 6.667-10 0-10" />
  </svg>
);
const AlertTriangle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" />
  </svg>
);
const XCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
  </svg>
);
const TrendingUp = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
  </svg>
);

const PIE_COLORS = ["#059669", "#0F766E", "#D97706", "#DC2626", "#6B7280", "#8B5CF6", "#EC4899", "#0EA5E9"];

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

function StatCard({ title, value, subtitle, icon: Icon, iconBg, iconColor }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border transition-all hover:shadow-md">
      <div className="absolute rounded-lg p-3" style={{ backgroundColor: iconBg }}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <div className="ml-16">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function InventoryDashboardPage() {
  const { data: dashboardRes, isLoading } = useInventoryDashboard();
  const { data: lowStockRes } = useLowStockProducts();

  const dashboard = dashboardRes?.data;
  const lowStockProducts = lowStockRes?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    );
  }

  const stats = [
    {
      title: "Total Products",
      value: String(dashboard?.totalProducts ?? 0),
      subtitle: "Active products in inventory",
      icon: Package,
      iconBg: "rgba(15,118,110,0.1)",
      iconColor: "text-primary",
    },
    {
      title: "Stock Value (Cost)",
      value: formatINRCompact(dashboard?.totalStockValue ?? 0),
      subtitle: "Total investment in stock",
      icon: IndianRupee,
      iconBg: "rgba(5,150,105,0.1)",
      iconColor: "text-success",
    },
    {
      title: "Low Stock Items",
      value: String(dashboard?.lowStockCount ?? 0),
      subtitle: "Products below minimum level",
      icon: AlertTriangle,
      iconBg: "rgba(217,119,6,0.1)",
      iconColor: "text-warning",
    },
    {
      title: "Out of Stock",
      value: String(dashboard?.outOfStockCount ?? 0),
      subtitle: "Products needing restock",
      icon: XCircle,
      iconBg: "rgba(220,38,38,0.1)",
      iconColor: "text-danger",
    },
  ];

  const movementChartData = (dashboard?.movementsByType ?? []).map((item) => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    count: item.count,
    quantity: item.totalQuantity,
  }));

  const categoryChartData = (dashboard?.stockByCategory ?? [])
    .filter((item) => item._id)
    .map((item) => ({
      name: item._id,
      value: item.totalValue / 100,
      products: item.totalProducts,
      stock: item.totalStock,
    }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Inventory Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your inventory health and stock movements
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Movement Types Chart */}
        <div className="rounded-xl bg-surface shadow-sm ring-1 ring-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Stock Movements (30 Days)</h2>
          {movementChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={movementChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6B7280" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
                <Bar dataKey="quantity" fill="#0F766E" radius={[4, 4, 0, 0]} name="Quantity" />
                <Bar dataKey="count" fill="#9CA3AF" radius={[4, 4, 0, 0]} name="Transactions" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              No movement data yet
            </div>
          )}
        </div>

        {/* Stock by Category Pie Chart */}
        <div className="rounded-xl bg-surface shadow-sm ring-1 ring-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Stock Value by Category</h2>
          {categoryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {categoryChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length] ?? "#6B7280"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                  formatter={(value: unknown) => formatINRCompact(Number(value))}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px" }}
                  formatter={(value: string) => value}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              No category data yet
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Alert + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Low Stock Alert */}
        <div className="rounded-xl bg-surface shadow-sm ring-1 ring-border">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h2 className="text-lg font-semibold text-foreground">Low Stock Alert</h2>
            </div>
            {lowStockProducts.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
                {lowStockProducts.length} items
              </span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {lowStockProducts.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                All products are well-stocked
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {lowStockProducts.slice(0, 8).map((product) => (
                  <li key={product._id} className="flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors">
                    <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Package className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.stock} / {product.minimumStock} min · {product.unit}
                      </p>
                    </div>
                    <StockStatusBadge
                      status={product.stock <= 0 ? "out" : "low"}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl bg-surface shadow-sm ring-1 ring-border">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {(dashboard?.recentMovements ?? []).length === 0 ? (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                No recent activity
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {dashboard?.recentMovements.map((movement) => (
                  <li key={movement._id} className="flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors">
                    <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border">
                      {movement.product?.imageUrl ? (
                        <img src={movement.product.imageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Package className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {movement.product?.name ?? "Product"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className={`font-medium ${movement.quantity > 0 ? "text-success" : "text-danger"}`}>
                          {movement.quantity > 0 ? "+" : ""}{movement.quantity}
                        </span>
                        {" · "}
                        {movement.type.charAt(0).toUpperCase() + movement.type.slice(1)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {new Date(movement.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Retail Value Summary */}
      <div className="rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 p-6 ring-1 ring-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Inventory Valuation</h3>
            <p className="text-sm text-muted-foreground">Stock value at cost vs. retail price</p>
          </div>
          <div className="flex items-center gap-6 text-right">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Cost Value</p>
              <p className="text-xl font-bold text-foreground">{formatINRCompact(dashboard?.totalStockValue ?? 0)}</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Retail Value</p>
              <p className="text-xl font-bold text-success">{formatINRCompact(dashboard?.totalRetailValue ?? 0)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
