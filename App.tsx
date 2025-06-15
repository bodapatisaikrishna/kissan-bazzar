
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './contexts';
import { UserRole } from './types';
import { ROUTES } from './constants';
import { Layout, LoadingSpinner } from './components';
import { 
  HomePage, LoginPage, RegisterPage, ProductsPage, ProductDetailsPage, CartPage, CheckoutPage, 
  OrderConfirmationPage, OrderHistoryPage, OrderDetailsPage, NotFoundPage,
  FarmerDashboardPage, FarmerProductsPage, AddEditProductPage, FarmerOrdersPage,
  AdminDashboardPage, AdminUsersPage, AdminProductsPage, AdminOrdersPage, AdminFarmerRequestsPage,
  CustomerDashboardPage
} from './pages';

// Protected Route Component
interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children?: React.ReactNode; // For element prop
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner message="Authenticating..." />;
  }

  if (!currentUser) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    // Redirect to a generic "access denied" page or home
    // For simplicity, redirecting to home or their respective dashboards
    let fallbackRoute = ROUTES.HOME;
    if (currentUser.role === UserRole.FARMER) fallbackRoute = ROUTES.FARMER_DASHBOARD;
    if (currentUser.role === UserRole.CUSTOMER) fallbackRoute = ROUTES.PRODUCTS; // or customer dashboard
    if (currentUser.role === UserRole.ADMIN) fallbackRoute = ROUTES.ADMIN_DASHBOARD;
    
    return <Navigate to={fallbackRoute} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};


const App: React.FC = () => {
  const { currentUser, logout, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <LoadingSpinner message="Loading Kissan Bazzar..." />
      </div>
    );
  }

  return (
    <HashRouter>
      <Layout currentUser={currentUser} onLogout={logout}>
        <Routes>
          {/* Public Routes */}
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
          <Route path={ROUTES.PRODUCT_DETAIL} element={<ProductDetailsPage />} />

          {/* Customer Routes (also accessible to logged-in users of other roles for browsing) */}
          <Route path={ROUTES.CART} element={<ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}><CartPage /></ProtectedRoute>} />
          <Route path={ROUTES.CHECKOUT} element={<ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}><CheckoutPage /></ProtectedRoute>} />
          <Route path={ROUTES.ORDER_CONFIRMATION} element={<ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}><OrderConfirmationPage /></ProtectedRoute>} />
          
          {/* Common Authenticated Routes (e.g., order history accessible to customer, farmer for their sales, admin for all) */}
          <Route 
            path={ROUTES.ORDER_HISTORY} 
            element={<ProtectedRoute allowedRoles={[UserRole.CUSTOMER, UserRole.FARMER, UserRole.ADMIN]}><OrderHistoryPage /></ProtectedRoute>} 
          />
          <Route 
            path={ROUTES.ORDER_DETAIL} // Note: This route will render OrderDetailsPage, which has internal logic for role-based access
            element={<ProtectedRoute allowedRoles={[UserRole.CUSTOMER, UserRole.FARMER, UserRole.ADMIN]}><OrderDetailsPage /></ProtectedRoute>} 
          />
          
          {/* Customer Specific Dashboard */}
           <Route 
            path="/customer/dashboard" // Example, can be expanded
            element={<ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}><CustomerDashboardPage /></ProtectedRoute>} 
          />


          {/* Farmer Routes */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.FARMER]} />}>
            <Route path={ROUTES.FARMER_DASHBOARD} element={<FarmerDashboardPage />} />
            <Route path={ROUTES.FARMER_PRODUCTS} element={<FarmerProductsPage />} />
            <Route path={ROUTES.FARMER_ADD_PRODUCT} element={<AddEditProductPage />} />
            <Route path={ROUTES.FARMER_EDIT_PRODUCT} element={<AddEditProductPage />} />
            <Route path={ROUTES.FARMER_ORDERS} element={<FarmerOrdersPage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
            <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
            <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
            <Route path={ROUTES.ADMIN_PRODUCTS} element={<AdminProductsPage />} />
            <Route path={ROUTES.ADMIN_ORDERS} element={<AdminOrdersPage />} />
            <Route path={ROUTES.ADMIN_FARMER_REQUESTS} element={<AdminFarmerRequestsPage />} />
          </Route>
          
          {/* Fallback / Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
