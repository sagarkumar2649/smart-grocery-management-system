import { formatINRCompact } from '@/shared/lib/format-currency';
import { useDashboardStats, useRecentActivity } from '@/shared/hooks/use-dashboard';

const TrendingUp = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const Package = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>;
const AlertTriangle = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>;
const Users = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ShoppingCart = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>;
const IndianRupee = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/></svg>;
const Truck = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>;
const CheckCircle = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>;
const XCircle = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>;
const Clock = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;

function formatTimeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const STATUS_STYLES: Record<string, string> = {
  Completed: 'bg-green-50 text-green-700',
  Info: 'bg-blue-50 text-blue-700',
  Warning: 'bg-amber-50 text-amber-700',
  Refunded: 'bg-red-50 text-red-700',
};

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activities, isLoading: activitiesLoading } = useRecentActivity();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your store performance.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="mt-3 h-8 w-20 animate-pulse rounded bg-gray-200" />
            </div>
          ))
        ) : stats ? (
          <>
            <StatCard
              name="Today's Sales"
              value={formatINRCompact(stats.todaySales)}
              subtitle={`${stats.todayOrdersCount} order${stats.todayOrdersCount !== 1 ? 's' : ''} today`}
              icon={IndianRupee}
              color="text-teal-600 bg-teal-50"
            />
            <StatCard
              name="Total Revenue"
              value={formatINRCompact(stats.totalRevenue)}
              subtitle={`Profit: ${formatINRCompact(stats.totalProfit)}`}
              icon={TrendingUp}
              color="text-green-600 bg-green-50"
            />
            <StatCard
              name="Products"
              value={String(stats.totalProducts)}
              subtitle={`${stats.lowStockCount} low stock, ${stats.outOfStockCount} out of stock`}
              icon={Package}
              color="text-blue-600 bg-blue-50"
            />
            <StatCard
              name="Customers"
              value={String(stats.totalCustomers)}
              subtitle={`${stats.totalOrders} total orders`}
              icon={Users}
              color="text-purple-600 bg-purple-50"
            />
          </>
        ) : null}
      </div>

      {/* Secondary Stats Row */}
      {stats && !statsLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SecondaryStatCard
            name="Pending Orders"
            value={String(stats.pendingOrders)}
            icon={Clock}
            color="text-amber-600"
          />
          <SecondaryStatCard
            name="Delivered Orders"
            value={String(stats.deliveredOrders)}
            icon={CheckCircle}
            color="text-green-600"
          />
          <SecondaryStatCard
            name="Cancelled Orders"
            value={String(stats.cancelledOrders)}
            icon={XCircle}
            color="text-red-600"
          />
          <SecondaryStatCard
            name="Low Stock Items"
            value={String(stats.lowStockCount)}
            icon={AlertTriangle}
            color="text-orange-600"
          />
        </div>
      )}

      {/* Recent Activity Table */}
      <div className="rounded-xl bg-surface shadow-sm ring-1 ring-border">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="text-lg font-semibold leading-6 text-foreground">Recent Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-muted/50">
                <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Action
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Time
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="py-3.5 pl-3 pr-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {activitiesLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-4 animate-pulse rounded bg-gray-200" />
                    </td>
                  </tr>
                ))
              ) : activities && activities.length > 0 ? (
                activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-muted/30 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-foreground">
                      {activity.action}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                      {activity.user}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                      {formatTimeAgo(activity.timestamp)}
                    </td>
                    <td className={`whitespace-nowrap px-3 py-4 text-sm font-medium ${activity.status === 'Refunded' ? 'text-red-600' : 'text-foreground'}`}>
                      {activity.amount !== null ? (
                        activity.status === 'Refunded' ? `−${formatINRCompact(activity.amount)}` : formatINRCompact(activity.amount)
                      ) : '—'}
                    </td>
                    <td className="whitespace-nowrap py-4 pl-3 pr-6 text-sm">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[activity.status] ?? 'bg-gray-50 text-gray-700'}`}>
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                    No recent activity
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  name,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  name: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border transition-all hover:shadow-md">
      <dt>
        <div className={`absolute rounded-lg p-3 ${color}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="ml-16 truncate text-sm font-medium text-muted-foreground">{name}</p>
      </dt>
      <dd className="ml-16">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      </dd>
    </div>
  );
}

function SecondaryStatCard({
  name,
  value,
  icon: Icon,
  color,
}: {
  name: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-surface p-4 shadow-sm ring-1 ring-border">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg bg-gray-50 p-2`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{name}</p>
          <p className="text-lg font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}
