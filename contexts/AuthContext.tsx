
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabaseClient';
import { dbService } from '../services/dbService';
import { UserRole, UserProfile } from '../types';
import { toast } from 'sonner';

interface AuthContextType {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(() => {
    return (localStorage.getItem('agro_userRole') as UserRole) || UserRole.CONSUMER;
  });

  useEffect(() => {
    const checkSession = async () => {
      console.log("[AuthContext] Checking session...");
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("[AuthContext] Session found:", !!session);
        if (session?.user) {
          console.log("[AuthContext] User ID:", session.user.id);
          const savedProfile = localStorage.getItem('agro_currentUser');
          if (savedProfile) {
            console.log("[AuthContext] Loading saved profile from localStorage");
            setCurrentUser(JSON.parse(savedProfile));
          }

          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.warn("[AuthContext] Error fetching profile:", profileError.message);
          }

          if (profileData) {
            console.log("[AuthContext] Profile found in DB, role:", profileData.role);
            const profile: UserProfile = {
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
            setCurrentUser(profile);
            setUserRole(profile.role);
            setIsAuthenticated(true);
          } else {
            console.log("[AuthContext] No profile in DB, creating temporary profile");
            const profile: UserProfile = {
              id: session.user.id,
              email: session.user.email || '',
              role: userRole,
              fullName: session.user.user_metadata?.full_name || 'Usuário',
              document: '',
              createdAt: new Date().toISOString()
            };
            setCurrentUser(profile);
            setIsAuthenticated(true);
          }
        } else {
          console.log("[AuthContext] No session found");
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("[AuthContext] Erro ao verificar sessão inicial:", error);
      } finally {
        console.log("[AuthContext] Auth loading finished");
        setIsAuthLoading(false);
      }
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[AuthContext] onAuthStateChange event:", event);
      if (session?.user) {
        console.log("[AuthContext] onAuthStateChange session user ID:", session.user.id);
        setIsAuthenticated(true);
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          console.log("[AuthContext] SIGNED_IN or INITIAL_SESSION, fetching profile...");
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (profileData) {
            console.log("[AuthContext] Profile found after event, role:", profileData.role);
            const profile: UserProfile = {
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
            setCurrentUser(profile);
            setUserRole(profile.role);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log("[AuthContext] User signed out");
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
        setUserRole(role);
        setIsAuthenticated(true);
        
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileData) {
          const profile: UserProfile = {
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
          setCurrentUser(profile);
          setUserRole(profile.role);
        } else {
          const profile: UserProfile = {
            id: data.user.id,
            email: data.user.email || '',
            role: role,
            fullName: data.user.user_metadata?.full_name || 'Usuário',
            document: '',
            createdAt: new Date().toISOString()
          };
          setCurrentUser(profile);
        }
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
