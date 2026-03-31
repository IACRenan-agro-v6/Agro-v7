
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

import { UserRole } from '../types';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { userRole } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log("[AuthCallback] Handling OAuth callback...");
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("[AuthCallback] Error getting session:", error.message);
        navigate('/login');
        return;
      }

      if (data.session) {
        console.log("[AuthCallback] Session established, redirecting to landing page for role:", userRole);
        
        // Determine landing page based on role
        let landingPage = '/chat';
        switch (userRole) {
          case UserRole.PRODUCER: landingPage = '/dashboard'; break;
          case UserRole.RETAILER: landingPage = '/market'; break;
          case UserRole.CONSUMER: landingPage = '/consumer-hub'; break;
          case UserRole.PROFESSIONAL: landingPage = '/professional-hub'; break;
        }
        
        navigate(landingPage, { replace: true });
      } else {
        console.warn("[AuthCallback] No session found after callback");
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, userRole]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-stone-50">
      <Loader2 className="w-12 h-12 text-farm-600 animate-spin" />
      <p className="mt-4 text-stone-600 font-medium">Finalizando login...</p>
    </div>
  );
};

export default AuthCallback;
