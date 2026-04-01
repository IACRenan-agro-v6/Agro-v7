
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isAuthLoading, isAuthTimeout, isProfileLoading, userRole } = useAuth();
  const location = useLocation();

  if ((isAuthLoading && !isAuthTimeout) || (isAuthenticated && isProfileLoading)) {
    console.log("[ProtectedRoute] rendering loading (auth or profile pending)");
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-stone-50">
        <div className="w-12 h-12 border-4 border-farm-100 border-t-farm-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-stone-500 font-medium animate-pulse">Carregando seu perfil...</p>
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
