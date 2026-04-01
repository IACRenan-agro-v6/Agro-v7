
import React from 'react';
import { 
  Bot, 
  LayoutDashboard, 
  ClipboardList, 
  ShieldCheck, 
  Zap, 
  Newspaper, 
  Presentation, 
  MapPin, 
  Wind, 
  Droplets, 
  Sun,
  ChevronRight,
  ChevronLeft,
  X,
  Settings,
  Store,
  Truck,
  ShoppingCart,
  LineChart,
  HeartPulse,
  Users,
  LogOut,
  Flower2
} from 'lucide-react';
import { WeatherInfo, ViewMode, UserRole } from '../types';
import { useNavigation } from '../hooks/useNavigation';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (isCollapsed: boolean) => void;
  userLocation: { lat: number; lng: number } | null;
  weatherInfo: WeatherInfo | null;
  userRole: UserRole;
  onLogout: () => void;
}

// Helper for Premium Icons
const PremiumIcon = ({ icon: Icon, mode, isActive }: { icon: any, mode: ViewMode, isActive: boolean }) => {
  const getGradient = () => {
    switch (mode) {
      case 'chat': return 'from-blue-400 to-indigo-600 shadow-indigo-500/40';
      case 'dashboard': return 'from-emerald-400 to-green-600 shadow-green-500/40';
      case 'planner': return 'from-lime-400 to-green-600 shadow-lime-500/40';
      case 'cameras': return 'from-stone-500 to-stone-800 shadow-stone-500/40';
      case 'automations': return 'from-amber-400 to-orange-600 shadow-orange-500/40';
      case 'emater': return 'from-sky-500 to-blue-700 shadow-blue-500/40';
      case 'presentation': return 'from-purple-500 to-pink-600 shadow-purple-500/40';
      case 'market': return 'from-orange-400 to-red-600 shadow-orange-500/40';
      case 'logistics': return 'from-blue-400 to-cyan-600 shadow-blue-500/40';
      case 'pos': return 'from-emerald-500 to-teal-700 shadow-teal-500/40';
      case 'retail_insights': return 'from-indigo-500 to-blue-700 shadow-indigo-500/40';
      case 'consumer_hub': return 'from-rose-400 to-pink-600 shadow-rose-500/40';
      case 'settings': return 'from-stone-600 to-stone-900 shadow-stone-500/40';
      case 'registry': return 'from-green-400 to-emerald-600 shadow-emerald-500/40';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className={`
      relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 flex-shrink-0
      bg-gradient-to-br ${getGradient()}
      ${isActive ? 'scale-110 shadow-lg ring-2 ring-white ring-offset-2 ring-offset-stone-50' : 'opacity-80 grayscale-[0.3] hover:grayscale-0 hover:opacity-100 hover:scale-105'}
    `}>
      <div className="absolute inset-0 bg-white/20 rounded-2xl pointer-events-none border border-white/30"></div>
      <Icon size={20} className="text-white drop-shadow-md relative z-10" strokeWidth={2.5} />
    </div>
  );
};

// Vector Logo Component for AgroBrasil
const AgroBrasilLogo = ({ collapsed }: { collapsed?: boolean }) => (
  <div className="flex items-center gap-3">
    {/* Corn Icon Circle */}
    <div className="w-12 h-12 flex-shrink-0 bg-stone-900 rounded-full flex items-center justify-center shadow-lg ring-2 ring-farm-500 relative overflow-hidden group">
      <div className="absolute inset-0 border-2 border-white rounded-full opacity-20"></div>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform group-hover:scale-110 transition-transform">
        {/* Corn Body */}
        <path d="M7 5C7 3.34315 8.34315 2 10 2H14C15.6569 2 17 3.34315 17 5V16C17 19.3137 14.3137 22 11 22H13C9.68629 22 7 19.3137 7 16V5Z" fill="#FBBF24" />
        {/* Corn Kernels (Grid) */}
        <path d="M7 6H17" stroke="#D97706" strokeWidth="0.5" strokeLinecap="round"/>
        <path d="M7 9H17" stroke="#D97706" strokeWidth="0.5" strokeLinecap="round"/>
        <path d="M7 12H17" stroke="#D97706" strokeWidth="0.5" strokeLinecap="round"/>
        <path d="M7 15H15" stroke="#D97706" strokeWidth="0.5" strokeLinecap="round"/>
        <path d="M10 2V18" stroke="#D97706" strokeWidth="0.5" strokeLinecap="round"/>
        <path d="M14 2V18" stroke="#D97706" strokeWidth="0.5" strokeLinecap="round"/>
        {/* Leaves */}
        <path d="M7 14C5 14 2 16 2 19C2 21 5 22 7 20" fill="#4ADE80" stroke="#16A34A" strokeWidth="1" strokeLinejoin="round"/>
        <path d="M17 14C19 14 22 16 22 19C22 21 19 22 17 20" fill="#4ADE80" stroke="#16A34A" strokeWidth="1" strokeLinejoin="round"/>
      </svg>
    </div>
    
    {/* Text */}
    {!collapsed && (
      <div className="flex flex-col leading-none">
        <h1 className="text-xl font-black tracking-tighter">
          <span className="text-[#35ad73]">AGRO</span>
          <span className="text-[#3b82f6]">BRASIL</span>
        </h1>
      </div>
    )}
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ 
  isSidebarOpen, setIsSidebarOpen, 
  isSidebarCollapsed, setIsSidebarCollapsed, userLocation, weatherInfo, userRole, onLogout
}) => {
  const { view, setView } = useNavigation();

  const NavItem = ({ mode, icon: Icon, label }: { mode: ViewMode | 'registry', icon: any, label: string }) => {
    const isActive = view === mode;

    return (
      <button 
        onClick={() => {
          setIsSidebarOpen(false);
          setView(mode);
        }}
        className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all font-medium group ${
          isActive
          ? 'bg-white dark:bg-stone-800 shadow-sm border border-stone-100 dark:border-stone-700' 
          : 'hover:bg-white/50 dark:hover:bg-stone-800/50 border border-transparent hover:border-stone-100 dark:hover:border-stone-700'
        } ${isSidebarCollapsed ? 'justify-center' : ''}`}
        title={isSidebarCollapsed ? label : undefined}
      >
        <PremiumIcon icon={Icon} mode={mode as ViewMode} isActive={isActive} />
        
        {!isSidebarCollapsed && (
          <>
            <span className={`text-sm tracking-wide transition-colors whitespace-nowrap overflow-hidden text-ellipsis ${isActive ? 'text-stone-900 font-bold' : 'text-stone-500 group-hover:text-stone-800'}`}>
              {label}
            </span>
            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-farm-500 flex-shrink-0"></div>}
          </>
        )}
      </button>
    );
  };

  return (
    <aside className={`
        fixed md:relative z-40 h-full bg-[#FDFBF7]/90 backdrop-blur-xl border-r border-white/50 flex flex-col transition-all duration-300 ease-in-out shadow-2xl shadow-stone-200/50
        dark:bg-stone-900/90 dark:border-stone-800 dark:shadow-none
        ${isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'}
        ${isSidebarCollapsed ? 'md:w-24' : 'md:w-72'}
      `}>
        {/* Toggle Button (Desktop Only) */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden md:flex absolute -right-3 top-10 w-6 h-6 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full items-center justify-center text-stone-400 hover:text-farm-600 shadow-sm z-50 transition-colors"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo Section */}
        <div className={`p-6 flex items-center gap-4 border-b border-stone-100/50 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
          <AgroBrasilLogo collapsed={isSidebarCollapsed} />
          
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden ml-auto text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 px-4 py-6 space-y-3 overflow-y-auto ${isSidebarCollapsed ? 'px-2' : ''}`}>
          {!isSidebarCollapsed && <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-4 mb-4 mt-2">Navegação</div>}
          
          <NavItem mode="chat" icon={Bot} label="Assistente do produtor" />
          
          {(userRole === UserRole.PRODUCER || userRole === UserRole.ADMIN) && (
            <>
              <NavItem mode="dashboard" icon={LayoutDashboard} label="Minha Fazenda" />
              <NavItem mode="registry" icon={Flower2} label="Minhas Plantas" />
              <NavItem mode="planner" icon={ClipboardList} label="Planejamento" />
              <NavItem mode="cameras" icon={ShieldCheck} label="Segurança" />
              <NavItem mode="automations" icon={Zap} label="Acionamentos" />
            </>
          )}

          {(userRole === UserRole.PRODUCER || userRole === UserRole.RETAILER || userRole === UserRole.ADMIN) && (
            <>
              <NavItem mode="market" icon={Store} label="Mercado & Cotações" />
              <NavItem mode="logistics" icon={Truck} label="Logística & Frete" />
            </>
          )}

          {(userRole === UserRole.RETAILER || userRole === UserRole.ADMIN) && (
            <>
              <NavItem mode="pos" icon={ShoppingCart} label="PDV Varejo" />
              {!isSidebarCollapsed ? (
                 <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-4 mb-4 mt-8">Inteligência de Varejo</div>
              ) : (
                 <div className="my-4 border-t border-stone-200 mx-2"></div>
              )}
              <NavItem mode="retail_insights" icon={LineChart} label="Insights Varejo" />
            </>
          )}

          {(userRole === UserRole.CONSUMER || userRole === UserRole.ADMIN) && (
            <>
              {!isSidebarCollapsed ? (
                 <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-4 mb-4 mt-8">Consumidor Final</div>
              ) : (
                 <div className="my-4 border-t border-stone-200 mx-2"></div>
              )}
              <NavItem mode="consumer_hub" icon={HeartPulse} label="Saúde & Nutrição" />
            </>
          )}

          {(userRole === UserRole.PROFESSIONAL || userRole === UserRole.ADMIN) && (
            <>
              {!isSidebarCollapsed ? (
                 <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-4 mb-4 mt-8">Profissionais de Saúde</div>
              ) : (
                 <div className="my-4 border-t border-stone-200 mx-2"></div>
              )}
              <NavItem mode="professional_hub" icon={Users} label="Hub do Profissional" />
            </>
          )}
          
          {!isSidebarCollapsed ? (
             <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-4 mb-4 mt-8">Institucional</div>
          ) : (
             <div className="my-4 border-t border-stone-200 mx-2"></div>
          )}
          
          <NavItem mode="emater" icon={Newspaper} label="Canal EMATER" />
          <NavItem mode="presentation" icon={Presentation} label="Apresentação" />

          {!isSidebarCollapsed && <div className="my-2 border-t border-stone-100 mx-4"></div>}
          <NavItem mode="settings" icon={Settings} label="Configurações" />
          
          <button 
            onClick={onLogout}
            className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all font-medium group hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-100 dark:hover:border-red-900/30 ${isSidebarCollapsed ? 'justify-center' : ''}`}
            title={isSidebarCollapsed ? "Sair" : undefined}
          >
            <div className={`
              relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 flex-shrink-0
              bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/40
              opacity-80 grayscale-[0.3] hover:grayscale-0 hover:opacity-100 hover:scale-105
            `}>
              <div className="absolute inset-0 bg-white/20 rounded-2xl pointer-events-none border border-white/30"></div>
              <LogOut size={20} className="text-white drop-shadow-md relative z-10" strokeWidth={2.5} />
            </div>
            
            {!isSidebarCollapsed && (
              <span className="text-sm tracking-wide transition-colors whitespace-nowrap overflow-hidden text-ellipsis text-red-500 group-hover:text-red-600 font-bold">
                Sair do Sistema
              </span>
            )}
          </button>
        </nav>

        {/* Footer / Weather Widget */}
        <div className={`p-6 border-t border-stone-100 bg-white/40 transition-all duration-300 ${isSidebarCollapsed ? 'px-2 py-4' : ''}`}>
           {/* Location Status */}
           {!isSidebarCollapsed ? (
             <div className="flex items-center gap-2 mb-4 px-2">
               <MapPin size={12} className={userLocation ? "text-green-500 animate-pulse" : "text-gray-400"} />
               <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 leading-none mb-0.5">
                    Localização Atual
                  </span>
                  <span className="text-xs font-bold text-stone-800 truncate max-w-[160px]">
                    {weatherInfo?.locationName ? weatherInfo.locationName.toUpperCase() : (userLocation ? "GPS ATIVO" : "BUSCANDO...")}
                  </span>
               </div>
             </div>
           ) : (
             <div className="flex justify-center mb-4">
                <MapPin size={18} className={userLocation ? "text-green-500" : "text-gray-300"} />
             </div>
           )}

           {!isSidebarCollapsed ? (
             <div className="flex gap-3 justify-between text-farm-800">
               <div className="flex flex-col items-center justify-center flex-1 bg-white p-2 rounded-xl shadow-sm border border-stone-100">
                 <Wind size={18} className="text-farm-500 mb-1"/> 
                 <span className="text-[10px] font-bold text-stone-400">VENTO</span>
                 <span className="text-xs font-bold text-stone-700">
                   {weatherInfo ? `${weatherInfo.windSpeed}km` : '--'}
                 </span>
               </div>
               <div className="flex flex-col items-center justify-center flex-1 bg-white p-2 rounded-xl shadow-sm border border-stone-100">
                 <Droplets size={18} className="text-blue-500 mb-1"/> 
                 <span className="text-[10px] font-bold text-stone-400">UMIDADE</span>
                 <span className="text-xs font-bold text-stone-700">
                   {weatherInfo ? `${weatherInfo.humidity}%` : '--'}
                 </span>
               </div>
               <div className="flex flex-col items-center justify-center flex-1 bg-white p-2 rounded-xl shadow-sm border border-stone-100">
                 <Sun size={18} className="text-amber-500 mb-1"/> 
                 <span className="text-[10px] font-bold text-stone-400">TEMP</span>
                 <span className="text-xs font-bold text-stone-700">
                   {weatherInfo ? `${Math.round(weatherInfo.temperature)}°C` : '--'}
                 </span>
               </div>
             </div>
           ) : (
             <div className="flex flex-col gap-2 items-center">
                 <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-stone-100" title="Temperatura">
                    <Sun size={16} className="text-amber-500"/> 
                 </div>
                 <div className="text-[10px] font-bold text-stone-600">
                    {weatherInfo ? `${Math.round(weatherInfo.temperature)}°` : '--'}
                 </div>
             </div>
           )}
        </div>
      </aside>
  );
};

export default Sidebar;
