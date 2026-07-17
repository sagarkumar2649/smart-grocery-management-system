import { useClerk, useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { toggleSidebar } from '@/store/slices/app-ui.slice';

// ── Icons ────────────────────────────────────────────────────────────────────
const Menu = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
);
const Bell = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
);
const Search = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
const LogOut = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
);

// ── Component ─────────────────────────────────────────────────────────────────
export function TopNavbar() {
  const dispatch = useAppDispatch();
  const { signOut } = useClerk();
  const { user } = useUser();

  const displayName = user?.fullName ?? user?.firstName ?? 'User';
  const email = user?.primaryEmailAddress?.emailAddress ?? '';
  const avatarUrl = user?.imageUrl;
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    void signOut({ redirectUrl: '/login' });
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center gap-x-4 border-b border-border bg-surface/80 px-4 shadow-sm backdrop-blur-md sm:gap-x-6 sm:px-6 lg:px-8 transition-colors">
      {/* Mobile sidebar toggle */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-muted-foreground hover:text-foreground lg:hidden"
        onClick={() => dispatch(toggleSidebar())}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="h-6 w-px bg-border lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Search */}
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">Search</label>
          <div className="relative w-full max-w-md flex items-center">
            <Search className="absolute left-3 h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <input
              id="search-field"
              className="block h-10 w-full rounded-full border border-border bg-muted/50 pl-10 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              placeholder="Search inventory, sales, customers..."
              type="search"
              name="search"
            />
          </div>
        </form>

        {/* Right side */}
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Notifications */}
          <button
            type="button"
            className="-m-2.5 p-2.5 text-muted-foreground hover:text-foreground relative transition-colors"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
            <span className="absolute right-2 top-2 block h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-surface" />
          </button>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" aria-hidden="true" />

          {/* User info + logout */}
          <div className="flex items-center gap-x-3">
            {/* Avatar — links to profile */}
            <Link to="/profile" className="flex-shrink-0" aria-label="View profile">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-border hover:ring-primary transition-all"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm ring-2 ring-border hover:ring-primary transition-all">
                  {initial}
                </div>
              )}
            </Link>

            {/* Name + email */}
            <div className="hidden lg:flex lg:flex-col lg:leading-tight">
              <span className="text-sm font-semibold text-foreground">{displayName}</span>
              <span className="text-xs text-muted-foreground">{email}</span>
            </div>

            <div className="hidden lg:block lg:h-5 lg:w-px lg:bg-border" aria-hidden="true" />

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-danger transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              <span className="hidden lg:block">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
