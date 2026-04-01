
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isAuthLoading, isAuthTimeout, userRole } = useAuth();
  const location = useLocation();

  if (isAuthLoading && !isAuthTimeout) {
    console.log("[ProtectedRoute] rendering loading");
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-stone-50">
        <div className="w-12 h-12 border-4 border-farm-100 border-t-farm-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("[ProtectedRoute] rendering login redirect");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    console.log("[ProtectedRoute] rendering role redirect");
    return <Navigate to="/" replace />;
  }

  console.log("[ProtectedRoute] rendering protected route children");
  return <>{children}</>;
};

export default ProtectedRoute;
