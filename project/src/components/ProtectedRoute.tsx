import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'buyer' | 'seller';
  fallbackPath?: string;
  requireEmailConfirmation?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireRole,
  fallbackPath = '/login',
  requireEmailConfirmation = true
}) => {
  const { user, profile, loading, emailConfirmed } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check if email confirmation is required and the user's email is not confirmed
  if (requireEmailConfirmation && emailConfirmed === false && location.pathname !== '/verify-email') {
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  if (requireRole && profile.role !== requireRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};