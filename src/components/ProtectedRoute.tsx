import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'Admin' | 'HR' | 'Interviewer';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user } = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is required and user doesn't have it, redirect to dashboard
  if (requiredRole) {
    console.log('Checking role access:', {
      userRole: user.role,
      requiredRole,
      path: location.pathname
    });
    
    if (user.role !== requiredRole) {
      console.log('Role check failed, redirecting to dashboard');
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Special case for Reports section - only Admin can access
  if (location.pathname.startsWith('/reports') && user.role !== 'Admin') {
    console.log('Reports access denied, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('Access granted to:', location.pathname);
  return <>{children}</>;
};

export default ProtectedRoute;