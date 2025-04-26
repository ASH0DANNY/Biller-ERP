import { lazy } from 'react';

// project-imports
import MainLayout from 'layout/MainLayout';
import CommonLayout from 'layout/CommonLayout';
import Loadable from 'components/Loadable';
import AuthGuard from 'utils/route-guard/AuthGuard';
import MyBillsPage from 'pages/dashboard/MyBillsPage';
import ReportPage from 'pages/report/ReportPage';
import MyExamplePage from 'pages/report/MyExamplePage';
import AddProduct from 'pages/product/AddProduct';
import ViewProduct from 'pages/product/ViewProduct';
import BarcodePage from 'pages/product/BarcodePage';
import BillingPage from 'pages/BillingInterface/BillingPage';
import CreditDebit from 'pages/management/creditManagment/CreditDebitPage';
import StaffManagementPage from 'pages/management/StaffManagementPage';
import DashboardSettingsPage from 'pages/settings/DashboardSettingsPage';
import ReportSettingsPage from 'pages/settings/ReportSettingsPage';
import GenerateTagPage from 'pages/product/GenerateTagPage';
import StockManagementPage from 'pages/management/StockManagementPage';

const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/error/404')));
const MaintenanceError500 = Loadable(lazy(() => import('pages/maintenance/error/500')));
const MaintenanceUnderConstruction = Loadable(lazy(() => import('pages/maintenance/under-construction/under-construction')));
const MaintenanceComingSoon = Loadable(lazy(() => import('pages/maintenance/coming-soon/coming-soon')));

// render - sample page
const DashboardPage = Loadable(lazy(() => import('pages/dashboard/DashboardPage')));

// ==============================|| MAIN ROUTES ||============================== //

const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: (
        <AuthGuard>
          <MainLayout />
        </AuthGuard>
      ),
      children: [
        {
          path: 'dashboard',
          element: <DashboardPage />
        },
        {
          path: 'billing',
          element: <BillingPage />
        },
        {
          path: 'my-bills',
          element: <MyBillsPage />
        },

        // Product Sections
        {
          path: 'add-product',
          element: <AddProduct />
        },
        {
          path: 'view-product',
          element: <ViewProduct />
        },
        {
          path: 'printables/generate-barcode',
          element: <BarcodePage />
        },
        {
          path: 'printables/generate-tags',
          element: <GenerateTagPage />
        },

        // Reports Section
        {
          path: 'reports',
          element: <ReportPage />
        },
        {
          path: 'my-example',
          element: <MyExamplePage />
        },

        //Management Section
        {
          path: 'stock-management',
          element: <StockManagementPage />
        },
        {
          path: 'credit-management',
          element: <CreditDebit />
        },
        {
          path: 'staff-management',
          element: <StaffManagementPage />
        },

        //Settings Section
        {
          path: 'settings/dashboard-settings',
          element: <DashboardSettingsPage />
        },
        {
          path: 'settings/report-settings',
          element: <ReportSettingsPage />
        }
      ]
    },
    {
      path: '/maintenance',
      element: <CommonLayout />,
      children: [
        {
          path: '404',
          element: <MaintenanceError />
        },
        {
          path: '500',
          element: <MaintenanceError500 />
        },
        {
          path: 'under-construction',
          element: <MaintenanceUnderConstruction />
        },
        {
          path: 'coming-soon',
          element: <MaintenanceComingSoon />
        }
      ]
    }
  ]
};

export default MainRoutes;
