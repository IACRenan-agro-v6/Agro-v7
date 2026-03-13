import React, { useState } from 'react';
import { Lightbulb, Droplets, Zap, Lock, Unlock, RefreshCw, Clock, ShieldAlert, UserCog, X, Power, CloudRain, Waves } from 'lucide-react';
import { AUTOMATION_DEVICES } from '../data/mockData';

type DeviceType = 'light' | 'gate' | 'pump' | 'irrigation';
type UserRole = 'admin' | 'operator';

interface Schedule {
  id: string;
  time: string;
  action: 'on' | 'off';
  days: string[];
}

interface Device {
  id: string;
  name: string;
  type: string;
  category: string;
  location: string;
  isActive: boolean;
  isLoading: boolean;
  restricted: boolean;
  meta?: string;
  schedules: Schedule[];
}

const AutomationControl: React.FC = () => {
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('admin');
  const [activeTab, setActiveTab] = useState<string>('Todos');
  const [devices, setDevices] = useState<Device[]>(AUTOMATION_DEVICES as unknown as Device[]);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const activeCount = devices.filter(d => d.isActive).length;
  const energyEstimate = devices.reduce((acc, dev) => dev.isActive ? acc + (dev.type === 'pump' || dev.type === 'irrigation' ? 2.5 : 0.2) : acc, 0);

  const toggleDevice = (id: string) => {
    const device = devices.find(d => d.id === id);
    if (device?.restricted && currentUserRole !== 'admin') {
      alert("Acesso Negado: Apenas Administradores podem operar este equipamento.");
      return;
    }

    setDevices(prev => prev.map(dev => dev.id === id ? { ...dev, isLoading: true } : dev));
    setTimeout(() => {
      setDevices(prev => prev.map(dev => dev.id === id ? { ...dev, isActive: !dev.isActive, isLoading: false } : dev));
    }, 800);
  };

  const getFilteredDevices = () => {
    if (activeTab === 'Todos') return devices;
    return devices.filter(d => d.category === activeTab);
  };

  const categories = ['Todos', 'Iluminação', 'Acesso', 'Hidráulica', 'Irrigação'];

  const getDeviceIcon = (device: Device) => {
    switch (device.type) {
      case 'light': return <Lightbulb size={28} />;
      case 'gate': return device.isActive ? <Unlock size={28} /> : <Lock size={28} />;
      case 'pump': return <Waves size={28} />;
      case 'irrigation': return <Droplets size={28} />;
      default: return <Zap size={28} />;
    }
  };

  const getDeviceColor = (device: Device) => {
    if (!device.isActive) return 'text-stone-400 bg-stone-100 border-stone-200';
    switch (device.type) {
      case 'light': return 'text-amber-600 bg-amber-100 border-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
      case 'gate': return 'text-rose-600 bg-rose-100 border-rose-200';
      case 'pump': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'irrigation': return 'text-cyan-600 bg-cyan-100 border-cyan-200';
      default: return 'text-stone-600 bg-stone-100';
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-stone-50 p-4 md:p-8 animate-fade-in relative">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <span className="bg-farm-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Smart Farm 2.0</span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider"><Power size={10} className={activeCount > 0 ? "text-green-500 animate-pulse" : ""} /> {activeCount} Dispositivos Ativos</span>
           </div>
           <h2 className="text-3xl font-bold text-stone-900 leading-none">Central de Acionamentos</h2>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-stone-200 shadow-sm">
           <button onClick={() => setCurrentUserRole('admin')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${currentUserRole === 'admin' ? 'bg-stone-800 text-white shadow' : 'text-stone-400 hover:text-stone-600'}`}><UserCog size={14} /> ADMIN</button>
           <button onClick={() => setCurrentUserRole('operator')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${currentUserRole === 'operator' ? 'bg-blue-600 text-white shadow' : 'text-stone-400 hover:text-blue-600'}`}>OPERADOR</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10"><div className="flex items-center gap-2 text-stone-400 text-xs font-bold uppercase tracking-widest mb-4"><Zap size={14} className="text-yellow-400" /> Consumo Estimado</div><div className="flex items-end gap-2 mb-2"><span className="text-4xl font-bold">{energyEstimate.toFixed(1)}</span><span className="text-lg text-stone-400 font-medium mb-1">kW/h</span></div><div className="text-xs text-stone-500">Custo aprox: R$ {(energyEstimate * 0.85).toFixed(2)} / hora</div></div>
            <div className="absolute right-0 bottom-0 opacity-10 p-4"><Zap size={120} /></div>
         </div>
         <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
             <div className="relative z-10"><div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-widest mb-4"><CloudRain size={14} /> Clima & Automação</div><div className="flex items-center justify-between"><div><h3 className="font-bold text-lg leading-tight mb-1">Modo Econômico</h3><p className="text-xs text-blue-100 opacity-80">Previsão de chuva. Irrigação automática pausada.</p></div></div></div>
         </div>
         <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4"><span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Alertas do Sistema</span><span className="w-2 h-2 rounded-full bg-green-500"></span></div>
            <div className="flex items-center gap-4"><div className="p-3 bg-stone-100 rounded-xl text-stone-400"><ShieldAlert size={24} /></div><div><div className="font-bold text-stone-800 text-sm">Nenhum Alerta Crítico</div><div className="text-xs text-stone-500">Todos os sistemas operando normalmente.</div></div></div>
         </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
         {categories.map(cat => (
           <button key={cat} onClick={() => setActiveTab(cat)} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${activeTab === cat ? 'bg-farm-600 text-white border-farm-600 shadow-md shadow-farm-600/20' : 'bg-white text-stone-500 border-stone-200 hover:border-farm-300 hover:text-farm-600'}`}>{cat}</button>
         ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
         {getFilteredDevices().map(device => {
           const isLocked = device.restricted && currentUserRole !== 'admin';
           const colorClass = getDeviceColor(device);
           return (
             <div key={device.id} className={`relative bg-white rounded-3xl p-5 border transition-all duration-300 group ${device.isActive ? 'border-farm-300 shadow-lg' : 'border-stone-200 shadow-sm hover:shadow-md'} ${isLocked ? 'opacity-80' : ''}`}>
                <div className="flex justify-between items-start mb-6">
                   <div className={`p-4 rounded-2xl transition-all duration-500 ${colorClass}`}>{device.isLoading ? <RefreshCw size={28} className="animate-spin" /> : getDeviceIcon(device)}</div>
                   <div className="flex flex-col gap-2 items-end">
                      <button onClick={() => { setSelectedDevice(device); setScheduleModalOpen(true); }} className="p-2 text-stone-300 hover:text-farm-600 hover:bg-stone-50 rounded-full transition-colors"><Clock size={18} /></button>
                      <div className={`w-2 h-2 rounded-full ${device.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-stone-300'}`}></div>
                   </div>
                </div>
                <div className="mb-6"><h3 className="text-lg font-bold text-stone-800 leading-tight mb-1">{device.name}</h3><div className="flex items-center gap-2 text-xs text-stone-500 font-medium"><span>{device.location}</span>{device.restricted && <Lock size={10} className="text-stone-400" />}</div>{device.meta && device.isActive && (<div className="mt-3 inline-block bg-stone-100 px-2 py-1 rounded-md text-[10px] font-bold text-stone-600 border border-stone-200">{device.meta}</div>)}</div>
                <button onClick={() => toggleDevice(device.id)} disabled={isLocked || device.isLoading} className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isLocked ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : device.isActive ? 'bg-white border-2 border-stone-900 text-stone-900 hover:bg-stone-50' : 'bg-stone-900 text-white hover:bg-stone-800 shadow-lg shadow-stone-900/20'}`}>{isLocked ? (<> <Lock size={14} /> Bloqueado </>) : (<> <Power size={14} /> {device.isActive ? 'DESLIGAR' : 'LIGAR'} </>)}</button>
                {device.schedules.length > 0 && (<div className="absolute top-0 right-0 -mt-2 -mr-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md border-2 border-white flex items-center gap-1"><Clock size={10} /> {device.schedules[0].time}</div>)}
             </div>
           );
         })}
      </div>

      {scheduleModalOpen && selectedDevice && (
         <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"><div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-slide-up"><div className="flex justify-between items-center mb-6"><h3 className="font-bold text-lg">Agendar {selectedDevice.name}</h3><button onClick={() => setScheduleModalOpen(false)}><X size={20} className="text-stone-400" /></button></div><div className="bg-stone-50 p-4 rounded-xl border border-stone-100 mb-6"><div className="flex justify-between items-center mb-2"><span className="text-xs font-bold uppercase text-stone-500">Próximo Agendamento</span><span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Diário</span></div><div className="text-3xl font-bold text-stone-800 flex items-baseline gap-1">18:30 <span className="text-sm font-medium text-stone-400">hrs</span></div><div className="text-sm text-green-600 font-bold mt-1">Ação: Ligar</div></div><button className="w-full bg-farm-600 text-white py-3 rounded-xl font-bold hover:bg-farm-700 transition-colors">Adicionar Novo Horário</button></div></div>
      )}
    </div>
  );
};

export default AutomationControl;