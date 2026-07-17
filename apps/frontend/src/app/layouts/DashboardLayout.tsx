import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { TopNavbar } from '@/shared/components/layout/TopNavbar';

export function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div>
      
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopNavbar />
        
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="relative py-6 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
