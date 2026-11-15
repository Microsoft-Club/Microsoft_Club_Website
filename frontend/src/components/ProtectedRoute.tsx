import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { getAdminRole } from '../utils/auth';

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // No valid token, expired token, or old token without a role -> back to login
  if (!getAdminRole()) {
    localStorage.removeItem('mcg_admin_token');
    localStorage.removeItem('mcg_admin_email');
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
