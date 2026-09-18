import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { LumoLoader } from './LumoLoader';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const getRoleDashboardRoute = (role: UserRole): string => {
  switch (role) {
    case 'SELLER':
    case 'SELLER_STAFF':
      return '/seller';
    case 'SALESPERSON':
      return '/sales';
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return '/admin';
    case 'FINANCE_ADMIN':
    case 'FINANCE_OFFICER':
    case 'ACCOUNTING_STAFF':
      return '/finance';
    case 'CATALOG_ADMIN':
    case 'CATALOG_SPECIALIST':
      return '/catalog';
    case 'OPERATIONS_ADMIN':
      return '/operations';
    case 'WAREHOUSE_MANAGER':
    case 'WAREHOUSE_STAFF':
      return '/warehouse';
    case 'DELIVERY_AGENT':
      return '/delivery';
    case 'PICKUP_STATION_MANAGER':
    case 'PICKUP_STATION_STAFF':
      return '/pickup';
    case 'CUSTOMER_SUPPORT':
    case 'CUSTOMER_CARE':
      return '/support';
    case 'MODERATOR':
    case 'CONTENT_MODERATOR':
      return '/moderation';
    case 'CUSTOMER':
    default:
      return '/account';
  }
};

export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case 'SELLER':
      return 'Vendor / Seller Center';
    case 'SALESPERSON':
      return 'Field Sales Agent Portal';
    case 'SUPER_ADMIN':
      return 'Super Admin Command Console';
    case 'ADMIN':
      return 'Platform Administration';
    case 'FINANCE_ADMIN':
    case 'FINANCE_OFFICER':
      return 'Finance & Settlements Management';
    case 'ACCOUNTING_STAFF':
      return 'Accounting & Financial Audit Desk';
    case 'CATALOG_ADMIN':
    case 'CATALOG_SPECIALIST':
      return 'Catalog Architecture & Category Hub';
    case 'OPERATIONS_ADMIN':
      return 'Operations & Dispatch Hub';
    case 'WAREHOUSE_MANAGER':
      return 'Warehouse Management Center';
    case 'DELIVERY_AGENT':
      return 'Express Rider Delivery Hub';
    case 'PICKUP_STATION_MANAGER':
      return 'Pickup Station Operations';
    case 'CUSTOMER_SUPPORT':
    case 'CUSTOMER_CARE':
      return 'Customer Care Support Desk';
    case 'MODERATOR':
    case 'CONTENT_MODERATOR':
      return 'Catalog & KYC Moderation';
    case 'CUSTOMER':
    default:
      return 'Customer Account Dashboard';
  }
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, activeRole, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <LumoLoader size="large" text="Verifying security credentials..." />
      </div>
    );
  }

  // 1. If not authenticated, redirect to login with original intended route
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 2. Strict role authorization: Each account is strictly restricted to its assigned role.
  // No role switching or arbitrary bypass allowed. If unauthorized, immediately redirect to user's assigned dashboard.
  const isAuthorized =
    !allowedRoles ||
    allowedRoles.length === 0 ||
    allowedRoles.includes(activeRole);

  if (!isAuthorized) {
    const authorizedRoute = getRoleDashboardRoute(activeRole);
    return <Navigate to={authorizedRoute} replace />;
  }

  return <>{children}</>;
};
