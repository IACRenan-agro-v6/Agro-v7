
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabaseClient';
import { dbService } from '../services/dbService';
import { UserRole, UserProfile } from '../types';
import { toast } from 'sonner';

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isAuthTimeout: boolean;
  isProfileLoading: boolean;
  currentUser: UserProfile | null;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  login: (role: UserRole, email?: string, password?: string) => Promise<void>;
  googleLogin: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  register: (role: UserRole, data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('agro_isAuthenticated');
    console.log("[AuthContext] Initial optimistic auth from localStorage:", saved === 'true');
    return saved === 'true';
  });
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthTimeout, setIsAuthTimeout] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('agro_currentUser');
    if (savedUser) {
      try {
        console.log("[AuthContext] Initial user from localStorage found");
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [userRole, setUserRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('agro_userRole');
    console.log("[AuthContext] Initial role from localStorage:", savedRole);
    return (savedRole as UserRole) || UserRole.CONSUMER;
  });

  useEffect(() => {
    console.time('app-bootstrap');
    console.log("[AuthContext] App bootstrap start");
  }, []);

  const fetchOrCreateProfile = async (user: any, preferredRole: UserRole): Promise<UserProfile> => {
    console.log(`[AuthContext] Fetching profile for user ${user.id}...`);
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      if (profileError) {
        console.error("[AuthContext] Error fetching profile:", profileError.message);
        throw profileError;
      }

      if (profileData) {
        console.log("[AuthContext] Profile found in DB, role:", profileData.role);
        return {
          id: profileData.id,
          email: profileData.email,
          role: profileData.role as UserRole,
          fullName: profileData.full_name,
          document: profileData.document,
          phone: profileData.phone,
          createdAt: profileData.created_at,
          producerData: profileData.producer_data,
          retailerData: profileData.retailer_data,
          professionalData: profileData.professional_data,
          consumerData: profileData.consumer_data
        };
      }

      console.log("[AuthContext] Profile missing, creating new profile...");
      const newProfile: UserProfile = {
        id: user.id,
        email: user.email || '',
        role: preferredRole,
        fullName: user.user_metadata?.full_name || user.user_metadata?.name || 'Usuário',
        document: '',
        createdAt: new Date().toISOString()
      };

      const success = await dbService.saveUserProfile(newProfile);
      if (success) {
        console.log("[AuthContext] Profile created successfully");
        return newProfile;
      } else {
        console.error("[AuthContext] Failed to create profile in DB");
        return newProfile; // Return anyway to allow app to function
      }
    } catch (error) {
      console.error("[AuthContext] Exception in fetchOrCreateProfile:", error);
      // Fallback to a temporary profile to prevent app crash
      return {
        id: user.id,
        email: user.email || '',
        role: preferredRole,
        fullName: user.user_metadata?.full_name || 'Usuário',
        document: '',
        createdAt: new Date().toISOString()
      };
    }
  };

  const checkSession = async () => {
    console.log("[AuthContext] Checking session...");
    const sessionStart = performance.now();
    
    // Safety timeout for session check
    const timeoutId = setTimeout(() => {
      if (isAuthLoading) {
        console.warn("[AuthContext] Session check timeout reached, releasing UI");
        setIsAuthLoading(false);
        setIsAuthTimeout(true);
      }
    }, 3000);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      clearTimeout(timeoutId);
      
      console.log("[AuthContext] Session check took:", (performance.now() - sessionStart).toFixed(2), "ms");
      console.log("[AuthContext] Session found:", !!session);
      
      if (session?.user) {
        console.log("[AuthContext] session ready");
        setIsAuthenticated(true);
        localStorage.setItem('agro_isAuthenticated', 'true');
        
        // Don't block auth loading for profile fetching
        setIsAuthLoading(false);
        
        // Fetch fresh profile in background
        setIsProfileLoading(true);
        console.log("[AuthContext] profile pending");
        
        const roleToUse = (localStorage.getItem('agro_userRole') as UserRole) || userRole;
        fetchOrCreateProfile(session.user, roleToUse).then(profile => {
          console.log("[AuthContext] profile ready");
          setCurrentUser(profile);
          setUserRole(profile.role);
          setIsProfileLoading(false);
          localStorage.setItem('agro_currentUser', JSON.stringify(profile));
          localStorage.setItem('agro_userRole', profile.role);
          console.timeEnd('app-bootstrap');
        }).catch(err => {
          console.error("[AuthContext] Background profile fetch failed:", err);
          setIsProfileLoading(false);
          console.timeEnd('app-bootstrap');
        });
      } else {
        console.log("[AuthContext] No session found");
        setIsAuthenticated(false);
        setCurrentUser(null);
        setIsAuthLoading(false);
        localStorage.removeItem('agro_isAuthenticated');
        localStorage.removeItem('agro_currentUser');
        console.timeEnd('app-bootstrap');
      }
    } catch (error) {
      console.error("[AuthContext] Erro ao verificar sessão inicial:", error);
      clearTimeout(timeoutId);
      setIsAuthLoading(false);
      console.timeEnd('app-bootstrap');
    }
  };
  
  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[AuthContext] onAuthStateChange event:", event);
      if (session?.user) {
        setIsAuthenticated(true);
        localStorage.setItem('agro_isAuthenticated', 'true');
        
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          const roleToUse = (localStorage.getItem('agro_userRole') as UserRole) || userRole;
          const profile = await fetchOrCreateProfile(session.user, roleToUse);
          setCurrentUser(profile);
          setUserRole(profile.role);
          localStorage.setItem('agro_currentUser', JSON.stringify(profile));
          localStorage.setItem('agro_userRole', profile.role);
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setCurrentUser(null);
        localStorage.removeItem('agro_isAuthenticated');
        localStorage.removeItem('agro_currentUser');
        localStorage.removeItem('agro_messages');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('agro_userRole', userRole);
    if (currentUser) {
      localStorage.setItem('agro_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('agro_currentUser');
    }
    localStorage.setItem('agro_isAuthenticated', isAuthenticated.toString());
  }, [userRole, currentUser, isAuthenticated]);

  const login = async (role: UserRole, email?: string, password?: string) => {
    if (email && password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        console.log("[AuthContext] Login successful, user ID:", data.user.id);
        setIsAuthenticated(true);
        
        const profile = await fetchOrCreateProfile(data.user, role);
        setCurrentUser(profile);
        setUserRole(profile.role);
      }
      return;
    }

    // Mock login for dev
    setUserRole(role);
    setIsAuthenticated(true);
    setCurrentUser({
      id: 'dev-user',
      email: 'dev@agrobrasil.com',
      role: role,
      fullName: 'Produtor Rural',
      document: '123.456.789-00',
      createdAt: new Date().toISOString()
    });
  };

  const googleLogin = async (role: UserRole) => {
    try {
      // Save role to localStorage immediately because the browser will redirect
      localStorage.setItem('agro_userRole', role);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
      setUserRole(role);
    } catch (error: any) {
      console.error('Erro no login com Google:', error);
      
      let message = 'Ocorreu um erro ao tentar entrar com o Google.';
      if (error.message?.includes('provider is not enabled')) {
        message = 'O login com Google ainda não foi ativado no painel do Supabase. Por favor, use e-mail e senha por enquanto.';
      } else if (error.message?.includes('identity_provider_not_found')) {
        message = 'Configuração do Google no Supabase está incompleta. Verifique o Client ID e Secret.';
      }
      
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setCurrentUser(null);
    
    // Clear all app-related storage
    const keysToRemove = [
      'agro_isAuthenticated',
      'agro_isRegistering',
      'agro_currentUser',
      'agro_userRole',
      'agro_currentView',
      'agro_messages',
      'agro_planner_searchTerm',
      'agro_planner_plan',
      'agro_planner_plantingDate',
      'agro_market_activeTab',
      'agro_market_searchTerm',
      'agro_market_quotes',
      'agro_market_offers',
      'agro_market_showAnalysis',
      'agro_market_showMap',
      'agro_market_filters',
      'agro_consumer_activeTab',
      'agro_consumer_products',
      'agro_dashboard_activeTab'
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  };

  const register = async (role: UserRole, data: any) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          role: role
        }
      }
    });

    if (authError) throw authError;

    if (authData.user) {
      const profile: UserProfile = {
        id: authData.user.id,
        email: data.email,
        role: role,
        fullName: data.fullName,
        document: data.document,
        phone: data.phone,
        createdAt: new Date().toISOString(),
        producerData: role === UserRole.PRODUCER ? {
          farmName: data.farmName,
          totalArea: Number(data.totalArea),
          mainCrops: data.mainCrops?.split(',') || [],
          location: data.location
        } : undefined,
        retailerData: role === UserRole.RETAILER ? {
          storeName: data.storeName,
          cnpj: data.document,
          address: data.address
        } : undefined,
        professionalData: role === UserRole.PROFESSIONAL ? {
          specialty: data.specialty,
          registryNumber: data.registryNumber
        } : undefined
      };

      const success = await dbService.saveUserProfile(profile);
      if (success) {
        setCurrentUser(profile);
        setUserRole(role);
        setIsAuthenticated(true);
      } else {
        throw new Error("Erro ao salvar dados do perfil no banco de dados.");
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isAuthLoading,
      isAuthTimeout,
      isProfileLoading,
      currentUser,
      userRole,
      setUserRole,
      login,
      googleLogin,
      logout,
      register
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
