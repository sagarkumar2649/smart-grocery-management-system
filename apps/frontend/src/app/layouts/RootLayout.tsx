import { Outlet } from 'react-router-dom';

export function RootLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main id="main-content" className="min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
