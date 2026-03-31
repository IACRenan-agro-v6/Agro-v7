
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Menu, WifiOff, RefreshCw } from 'lucide-react';
import Sidebar from './Sidebar';
import ErrorBoundary from './ErrorBoundary';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { useLocationWeather } from '../hooks/useLocationWeather';
import { useNavigation } from '../hooks/useNavigation';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { ViewMode } from '../types';

import { useChatContext } from '../contexts/ChatContext';

const MainLayout: React.FC = () => {
  const { userRole, logout } = useAuth();
  const { isDarkMode, setIsDarkMode } = useTheme();
  const { userLocation, weatherInfo } = useLocationWeather();
  const { view, setView, getHeaderTitle } = useNavigation();
  const isOnline = useOnlineStatus();
  const { isSyncing } = useChatContext();
  const navigate = useNavigate();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <ErrorBoundary>
      <Toaster position="top-center" richColors />
      <div className={`flex h-screen w-full relative overflow-hidden font-sans animate-fade-in ${isDarkMode ? 'bg-stone-950 text-stone-100' : 'bg-white text-stone-900'}`}>
      
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white py-1 px-4 text-center text-xs font-bold z-[100] flex items-center justify-center gap-2 animate-slide-down">
          <WifiOff size={14} />
          <span>MODO OFFLINE ATIVO - Suas ações serão sincronizadas quando a conexão voltar</span>
        </div>
      )}

      {isSyncing && (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white py-1 px-4 text-center text-xs font-bold z-[100] flex items-center justify-center gap-2 animate-slide-down">
          <RefreshCw size={14} className="animate-spin" />
          <span>SINCRONIZANDO DADOS COM O SERVIDOR...</span>
        </div>
      )}

      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        userLocation={userLocation}
        weatherInfo={weatherInfo}
        userRole={userRole}
        onLogout={handleLogout}
      />

      {isSidebarOpen && <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <main className="flex-1 flex flex-col h-full relative z-10 w-full bg-transparent transition-all duration-300">
        <div className="md:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-20">
          <button onClick={() => setIsSidebarOpen(true)} className="text-farm-800 p-2 hover:bg-stone-100 rounded-lg"><Menu size={24} /></button>
          <span className="text-farm-900 font-bold text-lg tracking-tight">{getHeaderTitle()}</span>
          <div className="w-6" />
        </div>

        <div className="flex-1 h-full overflow-hidden">
          <Outlet />
        </div>
      </main>
    </div>
    </ErrorBoundary>
  );
};

export default MainLayout;
