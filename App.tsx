
import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { UserRole } from './types';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';
import { Bot, AlertCircle, Loader2 } from 'lucide-react';

// Contexts & Hooks
import { useAuth } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { useTheme } from './hooks/useTheme';
import { useNavigation } from './hooks/useNavigation';
import { useLocationWeather } from './hooks/useLocationWeather';

// Components
import MainLayout from './components/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
import AuthCallback from './components/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy loaded components
const ChatView = lazy(() => import('./components/ChatView'));
const CropPlanner = lazy(() => import('./components/CropPlanner'));
const CameraGrid = lazy(() => import('./components/CameraGrid'));
const AutomationControl = lazy(() => import('./components/AutomationControl'));
const FarmDashboard = lazy(() => import('./components/FarmDashboard'));
const LoginScreen = lazy(() => import('./components/LoginScreen'));
const RegistrationScreen = lazy(() => import('./components/RegistrationScreen'));
const EmaterChannel = lazy(() => import('./components/EmaterChannel'));
const SystemPresentation = lazy(() => import('./components/SystemPresentation'));
const Settings = lazy(() => import('./components/Settings'));
const PlantRegistry = lazy(() => import('./components/PlantRegistry'));
const MarketView = lazy(() => import('./components/MarketView'));
const LogisticsView = lazy(() => import('./components/LogisticsView'));
const RetailPOSView = lazy(() => import('./components/RetailPOSView'));
const RetailerInsights = lazy(() => import('./components/RetailerInsights'));
const ConsumerHub = lazy(() => import('./components/ConsumerHub'));
const ProfessionalHub = lazy(() => import('./components/ProfessionalHub'));

const PageLoader = () => (
  <div className="h-full w-full flex items-center justify-center bg-stone-50/50 backdrop-blur-sm">
    <Loader2 className="animate-spin text-farm-600" size={32} />
  </div>
);

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Debug logs in App.tsx
  useEffect(() => {
    console.log('[App] VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL || 'MISSING');
    console.log('[App] VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING');
  }, []);

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
      // But if it returns (e.g. error or already logged in), we navigate
      navigate(getLandingPage(role));
    } catch (error: any) {
      console.error("Erro no login Google:", error.message);
      // The toast is already handled in AuthContext.tsx for specific Supabase errors
      if (!error.message?.includes('provider is not enabled') && !error.message?.includes('identity_provider_not_found')) {
        toast.error("Houve um problema ao entrar com o Google. Tente de novo, companheiro.");
      }
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
    <>
      {!isSupabaseConfigured && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white p-2 text-center text-xs font-bold flex items-center justify-center gap-2">
          <AlertCircle size={14} />
          Supabase não configurado. Verifique as variáveis de ambiente na Vercel.
        </div>
      )}
      <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/chat" replace /> : (
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <LoginScreen 
                onLogin={onLogin} 
                onGoogleLogin={onGoogleLogin}
                onGoToRegister={() => navigate('/register')}
                isLoading={false}
              />
            </Suspense>
          </ErrorBoundary>
        )
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/chat" replace /> : (
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
        )
      } />
      
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      <Route element={<ProtectedRoute><ChatProvider><MainLayout /></ChatProvider></ProtectedRoute>}>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/chat" element={<Suspense fallback={<PageLoader />}><ChatView /></Suspense>} />
        <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><FarmDashboard /></Suspense>} />
        <Route path="/planner" element={<Suspense fallback={<PageLoader />}><CropPlanner userLocation={userLocation} setView={setView} /></Suspense>} />
        <Route path="/cameras" element={<Suspense fallback={<PageLoader />}><CameraGrid /></Suspense>} />
        <Route path="/automations" element={<Suspense fallback={<PageLoader />}><AutomationControl /></Suspense>} />
        <Route path="/emater" element={<Suspense fallback={<PageLoader />}><EmaterChannel /></Suspense>} />
        <Route path="/presentation" element={<Suspense fallback={<PageLoader />}><SystemPresentation /></Suspense>} />
        <Route path="/market" element={<Suspense fallback={<PageLoader />}><MarketView currentUser={currentUser} setView={setView} /></Suspense>} />
        <Route path="/logistics" element={<Suspense fallback={<PageLoader />}><LogisticsView /></Suspense>} />
        <Route path="/pos" element={<Suspense fallback={<PageLoader />}><RetailPOSView /></Suspense>} />
        <Route path="/retail-insights" element={<Suspense fallback={<PageLoader />}><RetailerInsights setView={setView} /></Suspense>} />
        <Route path="/consumer-hub" element={<Suspense fallback={<PageLoader />}><ConsumerHub setView={setView} /></Suspense>} />
        <Route path="/professional-hub" element={<Suspense fallback={<PageLoader />}><ProfessionalHub setView={setView} /></Suspense>} />
        <Route path="/settings" element={<Suspense fallback={<PageLoader />}><Settings isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} /></Suspense>} />
        <Route path="/registry" element={<Suspense fallback={<PageLoader />}><PlantRegistry currentUser={currentUser} /></Suspense>} />
      </Route>

      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
    </>
  );
};

export default App;
