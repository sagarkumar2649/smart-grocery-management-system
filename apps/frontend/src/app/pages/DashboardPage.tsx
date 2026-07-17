import { formatINRCompact } from '@/shared/lib/format-currency';

const TrendingUp = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
const Package = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>;
const AlertTriangle = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>;
const Users = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ArrowUpRight = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>;
const ArrowDownRight = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7 17h10V7"/><path d="M7 7l10 10"/></svg>;

// All monetary values are in Indian Rupees (INR)
const stats = [
  { name: "Today's Sales", amount: 12426, previousAmount: 11200, change: '12%', changeType: 'increase', icon: TrendingUp },
  { name: 'Products', stat: '2,405', previousStat: '2,350', change: '2.3%', changeType: 'increase', icon: Package },
  { name: 'Low Stock', stat: '14', previousStat: '10', change: '40%', changeType: 'decrease', icon: AlertTriangle },
  { name: 'Customers', stat: '842', previousStat: '820', change: '2.6%', changeType: 'increase', icon: Users },
] as const;

// Amounts in rupees; null means non-monetary row
const recentActivity = [
  { id: 1, action: 'Order #3422 placed',               user: 'Jane Doe',      time: '2 hours ago', amount: 120,   refund: false,  status: 'Completed' },
  { id: 2, action: 'New product added: Wireless Mouse', user: 'Admin',         time: '4 hours ago', amount: null,  refund: false,  status: 'Info' },
  { id: 3, action: 'Low stock alert: Keyboard X1',      user: 'System',        time: '5 hours ago', amount: null,  refund: false,  status: 'Warning' },
  { id: 4, action: 'Order #3421 placed',               user: 'John Smith',    time: '6 hours ago', amount: 45.50, refund: false,  status: 'Completed' },
  { id: 5, action: 'Order #3420 refunded',             user: 'Alice Johnson', time: '8 hours ago', amount: 30,    refund: true,   status: 'Refunded' },
] as const;

function formatActivityAmount(amount: number | null, refund: boolean): string {
  if (amount === null) return '—';
  const formatted = formatINRCompact(amount);
  return refund ? `−${formatted}` : formatted;
}

export function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, Admin. Here's what's happening today.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            Export Report
          </button>
          <button className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            New Order
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
          // Monetary cards use the INR formatter; non-monetary cards display raw stat
          const displayStat =
            'amount' in item ? formatINRCompact(item.amount) : item.stat;

          return (
            <div
              key={item.name}
              className="group relative overflow-hidden rounded-xl bg-surface p-6 shadow-sm ring-1 ring-border transition-all hover:shadow-md"
            >
              <dt>
                <div className="absolute rounded-lg bg-primary/10 p-3">
                  <item.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-muted-foreground">{item.name}</p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
                <p className="text-2xl font-bold text-foreground">{displayStat}</p>
                <p
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    item.changeType === 'increase' ? 'text-success' : 'text-danger'
                  }`}
                >
                  {item.changeType === 'increase' ? (
                    <ArrowUpRight className="h-4 w-4 flex-shrink-0 self-center" aria-hidden="true" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 flex-shrink-0 self-center" aria-hidden="true" />
                  )}
                  <span className="sr-only">
                    {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                  </span>
                  {item.change}
                </p>
              </dd>
            </div>
          );
        })}
      </div>

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
                  Amount (₹)
                </th>
                <th scope="col" className="py-3.5 pl-3 pr-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {recentActivity.map((activity) => (
                <tr key={activity.id} className="hover:bg-muted/30 transition-colors">
                  <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-foreground">
                    {activity.action}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                    {activity.user}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                    {activity.time}
                  </td>
                  <td className={`whitespace-nowrap px-3 py-4 text-sm font-medium ${activity.refund ? 'text-danger' : 'text-foreground'}`}>
                    {formatActivityAmount(activity.amount, activity.refund)}
                  </td>
                  <td className="whitespace-nowrap py-4 pl-3 pr-6 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        activity.status === 'Completed'
                          ? 'bg-success/10 text-success'
                          : activity.status === 'Warning'
                          ? 'bg-warning/10 text-warning'
                          : activity.status === 'Refunded'
                          ? 'bg-danger/10 text-danger'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {activity.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
