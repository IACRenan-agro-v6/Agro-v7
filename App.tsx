
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { UserRole } from './types';
import { supabase } from './services/supabaseClient';
import { Bot } from 'lucide-react';

// Contexts & Hooks
import { useAuth } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { useTheme } from './hooks/useTheme';
import { useNavigation } from './hooks/useNavigation';

// Components
import MainLayout from './components/MainLayout';
import ChatView from './components/ChatView';
import CropPlanner from './components/CropPlanner';
import CameraGrid from './components/CameraGrid';
import AutomationControl from './components/AutomationControl';
import FarmDashboard from './components/FarmDashboard';
import LoginScreen from './components/LoginScreen';
import RegistrationScreen from './components/RegistrationScreen';
import EmaterChannel from './components/EmaterChannel';
import SystemPresentation from './components/SystemPresentation';
import Settings from './components/Settings';
import PlantRegistry from './components/PlantRegistry';
import MarketView from './components/MarketView';
import LogisticsView from './components/LogisticsView';
import RetailPOSView from './components/RetailPOSView';
import RetailerInsights from './components/RetailerInsights';
import ConsumerHub from './components/ConsumerHub';
import ProfessionalHub from './components/ProfessionalHub';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

import { useLocationWeather } from './hooks/useLocationWeather';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    isAuthenticated, 
    isAuthLoading, 
    currentUser, 
    login, 
    googleLogin, 
    register 
  } = useAuth();

  const { isDarkMode, setIsDarkMode } = useTheme();
  const { setView } = useNavigation();
  const { userLocation } = useLocationWeather();

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log("Testando conexão com Supabase...");
        const { error } = await supabase.from('plants').select('id').limit(1);
        if (error) console.error("Erro na conexão com Supabase:", error.message);
        else console.log("Conexão com Supabase estabelecida com sucesso.");
      } catch (e) {
        console.error("Falha fatal ao conectar ao Supabase:", e);
      }
    };
    testConnection();
  }, []);

  const getLandingPage = (role: UserRole) => {
    const from = (location.state as any)?.from?.pathname;
    if (from && from !== '/login' && from !== '/register') return from;

    switch (role) {
      case UserRole.PRODUCER: return '/dashboard';
      case UserRole.RETAILER: return '/market';
      case UserRole.CONSUMER: return '/consumer-hub';
      case UserRole.PROFESSIONAL: return '/professional-hub';
      default: return '/chat';
    }
  };

  const onLogin = async (role: UserRole, email?: string, password?: string) => {
    try {
      await login(role, email, password);
      navigate(getLandingPage(role));
    } catch (error: any) {
      console.error("Erro no login:", error.message);
      const friendlyMessage = error.message === 'Invalid login credentials' 
        ? 'E-mail ou senha incorretos. Por favor, confira os dados.' 
        : 'Não conseguimos entrar agora. Tente novamente em instantes.';
      toast.error(friendlyMessage);
    }
  };

  const onGoogleLogin = async (role: UserRole) => {
    try {
      await googleLogin(role);
      // Note: navigate might not run if signInWithOAuth redirects the browser
      navigate(getLandingPage(role));
    } catch (error: any) {
      console.error("Erro no login Google:", error.message);
      toast.error("Houve um problema ao entrar com o Google. Tente de novo, companheiro.");
    }
  };

  const HomeRedirect: React.FC = () => {
    const { userRole } = useAuth();
    return <Navigate to={getLandingPage(userRole)} replace />;
  };

  if (isAuthLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-stone-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-farm-100 border-t-farm-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Bot size={32} className="text-farm-600" />
          </div>
        </div>
        <h2 className="mt-6 text-xl font-black text-farm-900 tracking-tight">IAC Farm</h2>
        <p className="mt-2 text-stone-500 font-medium animate-pulse">Carregando seu ecossistema...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/chat" replace /> : (
          <ErrorBoundary>
            <LoginScreen 
              onLogin={onLogin} 
              onGoogleLogin={onGoogleLogin}
              onGoToRegister={() => navigate('/register')}
              isLoading={false}
            />
          </ErrorBoundary>
        )
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/chat" replace /> : (
          <RegistrationScreen 
            onBack={() => navigate('/login')}
            isLoading={false}
            onRegister={async (role, data) => {
              try {
                await register(role, data);
                navigate(getLandingPage(role));
              } catch (error: any) {
                console.error("Erro no cadastro:", error.message);
                toast.error("Não foi possível criar sua conta. Verifique se os dados estão certinhos.");
              }
            }}
            onGoogleLogin={onGoogleLogin}
          />
        )
      } />
      
      <Route element={<ProtectedRoute><ChatProvider><MainLayout /></ChatProvider></ProtectedRoute>}>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/chat" element={<ChatView />} />
        <Route path="/dashboard" element={<FarmDashboard />} />
        <Route path="/planner" element={<CropPlanner userLocation={userLocation} setView={setView} />} />
        <Route path="/cameras" element={<CameraGrid />} />
        <Route path="/automations" element={<AutomationControl />} />
        <Route path="/emater" element={<EmaterChannel />} />
        <Route path="/presentation" element={<SystemPresentation />} />
        <Route path="/market" element={<MarketView currentUser={currentUser} setView={setView} />} />
        <Route path="/logistics" element={<LogisticsView />} />
        <Route path="/pos" element={<RetailPOSView />} />
        <Route path="/retail-insights" element={<RetailerInsights setView={setView} />} />
        <Route path="/consumer-hub" element={<ConsumerHub setView={setView} />} />
        <Route path="/professional-hub" element={<ProfessionalHub setView={setView} />} />
        <Route path="/settings" element={<Settings isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />} />
        <Route path="/registry" element={<PlantRegistry currentUser={currentUser} />} />
      </Route>

      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  );
};

export default App;
