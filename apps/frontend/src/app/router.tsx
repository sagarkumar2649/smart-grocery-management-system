import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '@/app/layouts/RootLayout';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { StoreLayout } from '@/app/layouts/StoreLayout';
import { RouteErrorPage } from '@/app/pages/RouteErrorPage';
import { LoginPage } from '@/app/pages/LoginPage';
import { SignUpPage } from '@/app/pages/SignUpPage';
import { DashboardPage } from '@/app/pages/DashboardPage';
import { ProfilePage } from '@/app/pages/ProfilePage';
import { PlaceholderPage } from '@/app/pages/PlaceholderPage';
import { ProductsPage } from '@/features/products/pages/ProductsPage';
import { StoreSettingsPage } from '@/features/store/pages/StoreSettingsPage';
import { InventoryPage } from '@/features/inventory/pages/InventoryPage';
import { StoreHomePage } from '@/features/store/pages/StoreHomePage';
import { StoreProductsPage } from '@/features/store/pages/StoreProductsPage';
import { StoreProductDetailPage } from '@/features/store/pages/StoreProductDetailPage';
import { StoreCategoriesPage } from '@/features/store/pages/StoreCategoriesPage';
import { StoreCartPage } from '@/features/store/pages/StoreCartPage';
import { StoreCheckoutPage } from '@/features/store/pages/StoreCheckoutPage';
import { StoreMyOrdersPage } from '@/features/store/pages/StoreMyOrdersPage';
import { StoreProfilePage } from '@/features/store/pages/StoreProfilePage';
import { StoreSearchPage } from '@/features/store/pages/StoreSearchPage';
import { StoreAboutPage } from '@/features/store/pages/StoreAboutPage';
import { PublicRoute, AdminRoute, CustomerRoute } from '@/app/route-guards';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/store" replace />,
      },

      // ── Public routes ──────────────────────────────────────────────────────
      {
        element: <PublicRoute />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'login/*', element: <LoginPage /> },
          { path: 'signup', element: <SignUpPage /> },
          { path: 'signup/*', element: <SignUpPage /> },
        ],
      },

      // ── Admin routes ───────────────────────────────────────────────────────
      {
        element: <AdminRoute />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { path: 'dashboard', element: <DashboardPage /> },
              { path: 'products', element: <ProductsPage /> },
              { path: 'store-settings', element: <StoreSettingsPage /> },
              { path: 'inventory', element: <InventoryPage /> },
              { path: 'customers', element: <PlaceholderPage title="Customers" /> },
              { path: 'suppliers', element: <PlaceholderPage title="Suppliers" /> },
              { path: 'reports', element: <PlaceholderPage title="Reports" /> },
              { path: 'billing', element: <PlaceholderPage title="Billing" /> },
              { path: 'settings', element: <PlaceholderPage title="Settings" /> },
              { path: 'profile', element: <ProfilePage /> },
              { path: 'profile/*', element: <ProfilePage /> },
            ],
          },
        ],
      },

      // ── Customer / Store routes ────────────────────────────────────────────
      {
        element: <CustomerRoute />,
        children: [
          {
            path: 'store',
            element: <StoreLayout />,
            children: [
              { index: true, element: <StoreHomePage /> },
              { path: 'products', element: <StoreProductsPage /> },
              { path: 'products/:id', element: <StoreProductDetailPage /> },
              { path: 'categories', element: <StoreCategoriesPage /> },
              { path: 'cart', element: <StoreCartPage /> },
              { path: 'checkout', element: <StoreCheckoutPage /> },
              { path: 'orders', element: <StoreMyOrdersPage /> },
              { path: 'profile', element: <StoreProfilePage /> },
              { path: 'profile/*', element: <StoreProfilePage /> },
              { path: 'search', element: <StoreSearchPage /> },
              { path: 'about', element: <StoreAboutPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
