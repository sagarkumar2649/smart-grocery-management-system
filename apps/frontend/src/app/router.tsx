import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '@/app/layouts/RootLayout';
import { DashboardLayout } from '@/app/layouts/DashboardLayout';
import { StoreLayout } from '@/app/layouts/StoreLayout';
import { RouteErrorPage } from '@/app/pages/RouteErrorPage';
import { LoginPage } from '@/app/pages/LoginPage';
import { SignUpPage } from '@/app/pages/SignUpPage';
import { DashboardPage } from '@/app/pages/DashboardPage';
import { ProfilePage } from '@/app/pages/ProfilePage';
import { ProductsPage } from '@/features/products/pages/ProductsPage';
import { InventoryPage } from '@/features/inventory/pages/InventoryPage';
import { StoreHomePage } from '@/features/store/pages/StoreHomePage';
import { StoreProductsPage } from '@/features/store/pages/StoreProductsPage';
import { StoreProductDetailPage } from '@/features/store/pages/StoreProductDetailPage';
import { StoreCategoriesPage } from '@/features/store/pages/StoreCategoriesPage';
import { StoreCartPage } from '@/features/store/pages/StoreCartPage';
import { StoreCheckoutPage } from '@/features/store/pages/StoreCheckoutPage';
import { StoreOrderSuccessPage } from '@/features/store/pages/StoreOrderSuccessPage';
import { StoreMyOrdersPage } from '@/features/store/pages/StoreMyOrdersPage';
import { StoreProfilePage } from '@/features/store/pages/StoreProfilePage';
import { StoreSearchPage } from '@/features/store/pages/StoreSearchPage';
import { StoreAboutPage } from '@/features/store/pages/StoreAboutPage';
import { CustomersPage } from '@/features/customers/pages/CustomersPage';
import { CustomerDetailPage } from '@/features/customers/pages/CustomerDetailPage';
import { SuppliersPage } from '@/features/suppliers/pages/SuppliersPage';
import { SupplierDetailPage } from '@/features/suppliers/pages/SupplierDetailPage';
import { ReportsPage } from '@/features/reports/pages/ReportsPage';
import { POSPage } from '@/features/pos/pages/POSPage';
import { InvoiceHistoryPage } from '@/features/pos/pages/InvoiceHistoryPage';
import { CouponsPage } from '@/features/pos/pages/CouponsPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';
import { OrdersPage } from '@/features/orders/pages/OrdersPage';
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
              { path: 'store-settings', element: <Navigate to="/settings" replace /> },
              { path: 'inventory', element: <InventoryPage /> },
              { path: 'customers', element: <CustomersPage /> },
              { path: 'customers/:id', element: <CustomerDetailPage /> },
              { path: 'suppliers', element: <SuppliersPage /> },
              { path: 'suppliers/:id', element: <SupplierDetailPage /> },
              { path: 'reports', element: <ReportsPage /> },
              { path: 'pos', element: <POSPage /> },
              { path: 'invoices', element: <InvoiceHistoryPage /> },
              { path: 'orders', element: <OrdersPage /> },
              { path: 'coupons', element: <CouponsPage /> },
              { path: 'settings', element: <SettingsPage /> },
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
              { path: 'orders/:id/success', element: <StoreOrderSuccessPage /> },
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
