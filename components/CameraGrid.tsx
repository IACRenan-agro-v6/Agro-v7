import React, { useState, useEffect } from 'react';
import { Maximize2, Activity, WifiOff, X, ZoomIn, ZoomOut, RefreshCw, History, Search, Grid, CheckCircle2, Video, Cctv, ShieldCheck, ShieldAlert, ArrowLeft, Bell, BellRing, Siren, Power, ArrowUp, ArrowDown, ArrowRight, List, AlertTriangle, Smartphone, Lock, Unlock, DoorOpen, Radio } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CAMERAS, MOCK_EVENTS } from '../data/mockData';

export interface Camera {
  id: string;
  label: string;
  isOnline: boolean;
  seed: number;
  location: string;
}

export interface CameraEvent {
  id: string;
  time: string;
  type: 'motion' | 'person' | 'vehicle' | 'animal' | 'system';
  description: string;
  severity: 'low' | 'medium' | 'high';
  camLabel: string;
}

const CameraGrid: React.FC = () => {
  const [viewMode, setViewMode] = useState<'dashboard' | 'cameras' | 'alarms'>('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [activeSlots, setActiveSlots] = useState<string[]>(['CAM-01', 'CAM-02', 'CAM-03', 'CAM-04']);
  const [focusedSlotIndex, setFocusedSlotIndex] = useState<number>(0);
  const [sidebarMode, setSidebarMode] = useState<'cameras' | 'events'>('cameras');
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [events, setEvents] = useState<CameraEvent[]>(MOCK_EVENTS as unknown as CameraEvent[]);

  // Alarm States
  const [systemArmed, setSystemArmed] = useState(true);
  const [sirenActive, setSirenActive] = useState(false);
  const [perimeterActive, setPerimeterActive] = useState(true);
  const [smartLocksLocked, setSmartLocksLocked] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, [selectedCamera]);

  const formatTime = (date: Date) => date.toLocaleTimeString('pt-BR', { hour12: false });

  // Zoom/Pan logic
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setZoomLevel(prev => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) setPanPosition({ x: 0, y: 0 });
      return newZoom;
    });
  const handlePan = (direction: 'up' | 'down' | 'left' | 'right') => {
      const step = 50;
      setPanPosition(prev => {
          switch(direction) {
              case 'up': return { ...prev, y: prev.y + step };
              case 'down': return { ...prev, y: prev.y - step };
              case 'left': return { ...prev, x: prev.x + step };
              case 'right': return { ...prev, x: prev.x - step };
              default: return prev;
          }
      });
  };
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleCameraSelectFromList = (camId: string) => {
    const existingIndex = activeSlots.indexOf(camId);
    if (existingIndex !== -1) {
      setFocusedSlotIndex(existingIndex);
    } else {
      const newSlots = [...activeSlots];
      newSlots[focusedSlotIndex] = camId;
      setActiveSlots(newSlots);
    }
  };

  const filteredCameras = CAMERAS.filter(c => 
    c.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderDashboard = () => {
    const data = [
      { name: 'Online', value: 16, color: '#35ad73' },
      { name: 'Offline', value: 1, color: '#ef4444' },
      { name: 'Manutenção', value: 0, color: '#f59e0b' },
    ];

    return (
      <div className="w-full h-full bg-stone-50 overflow-y-auto p-4 lg:p-8 animate-fade-in flex flex-col">
           <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
              <div>
                <h2 className="text-3xl font-bold text-stone-900 mb-2 flex items-center gap-3"><ShieldCheck className="text-farm-600" size={32} /> Segurança & Monitoramento</h2>
                <p className="text-stone-500 font-medium">Central unificada de controle de perímetro e vigilância.</p>
              </div>
              <div className="flex items-center gap-2 bg-white border border-stone-200 px-3 py-1.5 rounded-lg shadow-sm">
                 <div className={`w-2 h-2 rounded-full ${systemArmed ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                 <span className="text-xs font-bold text-stone-600">{systemArmed ? 'SISTEMA ARMADO' : 'SISTEMA DESARMADO'}</span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
                 <div><div className="text-xs text-stone-400 font-bold uppercase tracking-wider mb-1">Status Geral</div><div className={`text-xl font-bold flex items-center gap-2 ${systemArmed ? 'text-green-600' : 'text-red-500'}`}>{systemArmed ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />} {systemArmed ? 'Protegido' : 'Vulnerável'}</div></div>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center ${systemArmed ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}><ShieldCheck size={20} /></div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
                 <div><div className="text-xs text-stone-400 font-bold uppercase tracking-wider mb-1">Câmeras Ativas</div><div className="text-xl font-bold text-stone-800">16 <span className="text-sm text-stone-400 font-medium">/ 17</span></div></div>
                 <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Cctv size={20} /></div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
                 <div><div className="text-xs text-stone-400 font-bold uppercase tracking-wider mb-1">Último Evento</div><div className="text-sm font-bold text-stone-800 truncate max-w-[150px]">Movimento Detectado</div><div className="text-[10px] text-stone-400">Há 15 minutos</div></div>
                 <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center"><Bell size={20} /></div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-6">
                 <button onClick={() => setViewMode('cameras')} className="w-full bg-[#858545] hover:bg-[#70703a] p-8 rounded-3xl text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-500"><Cctv size={100} /></div>
                    <div className="relative z-10 flex items-center gap-4 mb-4">
                       <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl"><Cctv size={32} /></div>
                       <span className="bg-green-500/80 px-2 py-0.5 rounded text-[10px] font-bold border border-green-400/50 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> AO VIVO</span>
                    </div>
                    <div className="relative z-10 text-left"><h3 className="text-2xl font-bold mb-1">Câmeras IP</h3><p className="text-white/80 text-sm font-medium">Acessar Video Wall e Gravações</p></div>
                 </button>
                 <button onClick={() => setViewMode('alarms')} className={`w-full p-8 rounded-3xl text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[220px] ${sirenActive ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-[#3b7ba8] hover:bg-[#326a91]'}`}>
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-500"><BellRing size={100} /></div>
                    <div className="relative z-10 flex items-center gap-4 mb-4">
                       <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl"><Siren size={32} /></div>
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${sirenActive ? 'bg-red-900/40 border-red-200' : 'bg-blue-900/40 border-blue-400/30'}`}>{sirenActive ? 'DISPARADO' : 'MONITORANDO'}</span>
                    </div>
                    <div className="relative z-10 text-left"><h3 className="text-2xl font-bold mb-1">Central de Alarmes</h3><p className="text-white/80 text-sm font-medium">Controle de Sirene e Perímetro</p></div>
                 </button>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm flex flex-col items-center justify-center relative min-h-[400px]">
                 <h3 className="absolute top-6 left-6 font-bold text-lg text-stone-800">Integridade do Sistema</h3>
                 <div className="w-64 h-64 relative">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie data={data} innerRadius={60} outerRadius={80} dataKey="value" stroke="none" paddingAngle={5}>
                             {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                          </Pie>
                          <Tooltip />
                       </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"><span className="text-4xl font-bold text-stone-800">94%</span><span className="text-xs font-bold text-stone-400 uppercase">Operacional</span></div>
                 </div>
                 <div className="flex flex-wrap justify-center gap-4 mt-4 w-full">
                    {data.map((item, idx) => (<div key={idx} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div><span className="text-sm font-bold text-stone-600">{item.name}</span><span className="text-xs text-stone-400 font-medium">({item.value})</span></div>))}
                 </div>
              </div>

              <div className="bg-white rounded-3xl border border-stone-200 shadow-sm flex flex-col h-full min-h-[400px]">
                 <div className="p-6 border-b border-stone-100 flex justify-between items-center"><h3 className="font-bold text-lg text-stone-800">Histórico Recente</h3><button className="p-2 hover:bg-stone-50 rounded-full text-stone-400 transition-colors"><Search size={18} /></button></div>
                 <div className="flex-1 overflow-y-auto p-2">
                    {events.map((evt, idx) => (
                       <div key={idx} className="flex items-start gap-4 p-4 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer border-b border-stone-50 last:border-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${evt.type === 'motion' ? 'bg-red-50 text-red-500' : evt.type === 'system' && evt.severity === 'medium' ? 'bg-amber-50 text-amber-500' : evt.type === 'animal' ? 'bg-purple-50 text-purple-500' : 'bg-blue-50 text-blue-500'}`}>
                             {evt.type === 'motion' && <Activity size={20} />} {evt.type === 'system' && <AlertTriangle size={20} />} {evt.type === 'animal' && <AlertTriangle size={20} />} 
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="flex justify-between items-start"><span className="text-xs font-bold text-stone-400">{evt.time}</span>{evt.severity === 'high' && <span className="w-2 h-2 rounded-full bg-red-500"></span>}</div>
                             <div className="font-bold text-stone-800 text-sm leading-tight mt-0.5">{evt.description}</div>
                             <div className="text-xs text-stone-500 mt-1 flex items-center gap-1"><Video size={10} /> {evt.camLabel}</div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
      </div>
    );
  };

  const renderAlarmControl = () => {
    return (
      <div className="w-full h-full bg-stone-50 overflow-y-auto p-4 md:p-8 animate-fade-in">
        <div className="flex items-center gap-4 mb-8">
           <button onClick={() => setViewMode('dashboard')} className="bg-white hover:bg-stone-100 text-stone-600 p-3 rounded-full shadow-sm border border-stone-200 transition-colors"><ArrowLeft size={20} /></button>
           <div><h2 className="text-3xl font-bold text-stone-900 leading-none">Central de Alarmes</h2><span className="text-stone-500 text-sm font-medium">Painel de Controle de Segurança</span></div>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
           <div className={`rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden transition-all duration-500 shadow-2xl ${sirenActive ? 'bg-gradient-to-br from-red-600 to-red-800 shadow-red-500/40' : systemArmed ? 'bg-gradient-to-br from-green-600 to-emerald-800 shadow-green-500/40' : 'bg-gradient-to-br from-stone-500 to-stone-700 shadow-stone-500/40'}`}>
               <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none"><ShieldCheck size={400} /></div>
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                     <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 border-white/20 backdrop-blur-md shadow-inner ${sirenActive ? 'bg-red-500 animate-pulse' : systemArmed ? 'bg-green-500' : 'bg-stone-400'}`}>
                        {sirenActive ? <Siren size={48} className="animate-wiggle"/> : systemArmed ? <ShieldCheck size={48} /> : <ShieldAlert size={48} />}
                     </div>
                     <div>
                        <div className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Status do Sistema</div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight">{sirenActive ? 'ALERTA MÁXIMO' : systemArmed ? 'TOTALMENTE PROTEGIDO' : 'DESARMADO'}</h1>
                        <p className="text-white/80 mt-2 font-medium">{sirenActive ? 'Sirenes ativas. Autoridades notificadas.' : systemArmed ? 'Todos os sensores periféricos estão ativos.' : 'Atenção: Monitoramento pausado.'}</p>
                     </div>
                  </div>
                  <button onClick={() => setSystemArmed(!systemArmed)} className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 rounded-2xl px-8 py-6 flex flex-col items-center gap-2 min-w-[160px] transition-all active:scale-95">
                     <Power size={32} /><span className="font-bold">{systemArmed ? 'DESARMAR' : 'ARMAR'}</span>
                  </button>
               </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <button onClick={() => setSirenActive(!sirenActive)} className={`col-span-1 md:col-span-2 lg:col-span-1 rounded-[2rem] p-6 relative overflow-hidden group transition-all duration-300 shadow-lg flex flex-col justify-between ${sirenActive ? 'bg-red-500 text-white shadow-red-500/30 ring-4 ring-red-200' : 'bg-white hover:bg-red-50 text-stone-800 shadow-stone-200/50'}`}>
                  <div className="flex justify-between items-start w-full relative z-10">
                    <div className={`p-3 rounded-2xl ${sirenActive ? 'bg-white/20' : 'bg-red-100 text-red-600'}`}><BellRing size={28} className={sirenActive ? 'animate-wiggle' : ''} /></div>
                    <div className={`w-3 h-3 rounded-full ${sirenActive ? 'bg-white animate-ping' : 'bg-stone-200'}`}></div>
                  </div>
                  <div className="text-left mt-6 relative z-10"><h3 className="text-xl font-bold mb-1">Sirene de Pânico</h3><p className={`text-xs font-bold uppercase tracking-wider ${sirenActive ? 'text-white/80' : 'text-stone-400'}`}>{sirenActive ? 'Tocando Agora' : 'Toque para Ativar'}</p></div>
               </button>

               <button onClick={() => setPerimeterActive(!perimeterActive)} className={`rounded-[2rem] p-6 relative overflow-hidden group transition-all duration-300 shadow-lg border-2 flex flex-col justify-between ${perimeterActive ? 'bg-white border-green-400/30' : 'bg-white border-transparent'}`}>
                   <div className="flex justify-between items-start w-full">
                      <div className={`p-3 rounded-2xl ${perimeterActive ? 'bg-green-100 text-green-600' : 'bg-stone-100 text-stone-400'}`}><Radio size={28} /></div>
                      <div className={`w-12 h-7 rounded-full p-1 transition-colors ${perimeterActive ? 'bg-green-500' : 'bg-stone-200'}`}><div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${perimeterActive ? 'translate-x-5' : 'translate-x-0'}`}></div></div>
                   </div>
                   <div className="text-left mt-6"><h3 className="text-lg font-bold text-stone-800">Perímetro</h3><p className="text-xs text-stone-400 font-bold uppercase">{perimeterActive ? 'Monitorando' : 'Desligado'}</p></div>
               </button>

               <button onClick={() => setSmartLocksLocked(!smartLocksLocked)} className={`rounded-[2rem] p-6 relative overflow-hidden group transition-all duration-300 shadow-lg border-2 flex flex-col justify-between ${smartLocksLocked ? 'bg-white border-blue-400/30' : 'bg-white border-amber-400/30'}`}>
                   <div className="flex justify-between items-start w-full">
                      <div className={`p-3 rounded-2xl ${smartLocksLocked ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>{smartLocksLocked ? <Lock size={28} /> : <Unlock size={28} />}</div>
                      <div className={`w-12 h-7 rounded-full p-1 transition-colors ${smartLocksLocked ? 'bg-blue-500' : 'bg-amber-400'}`}><div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${smartLocksLocked ? 'translate-x-5' : 'translate-x-0'}`}></div></div>
                   </div>
                   <div className="text-left mt-6"><h3 className="text-lg font-bold text-stone-800">Trancas</h3><p className="text-xs text-stone-400 font-bold uppercase">{smartLocksLocked ? 'Fechadas' : 'Abertas'}</p></div>
               </button>

               <div className="rounded-[2rem] bg-white p-6 shadow-lg border border-stone-100 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                     <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl"><Smartphone size={28} /></div>
                     <div className="p-1 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase px-2">Online</div>
                  </div>
                  <div><h3 className="text-lg font-bold text-stone-800">Notificações</h3><p className="text-xs text-stone-400 font-bold uppercase">Push Ativado</p></div>
               </div>
           </div>
        </div>
      </div>
    );
  };

  const renderCameraGrid = () => (
    <div className="w-full h-full flex flex-col md:flex-row bg-stone-900 text-stone-200 overflow-hidden relative animate-fade-in">
      <div className="flex-1 flex flex-col h-full relative">
        <div className="h-16 border-b border-stone-800 bg-stone-900 flex items-center justify-between px-6 shrink-0 z-20">
           <div className="flex items-center gap-3">
              <button onClick={() => setViewMode('dashboard')} className="p-1 hover:bg-stone-800 rounded-full mr-2"><ArrowLeft size={20} className="text-stone-400" /></button>
              <Activity className="text-farm-500 animate-pulse" size={20} />
              <div><h2 className="text-lg font-bold text-white leading-none">Video Wall</h2><span className="text-[10px] text-stone-500 font-mono uppercase tracking-widest">Monitoramento em Tempo Real</span></div>
           </div>
           
           <div className="flex items-center gap-4">
              <button onClick={() => setSidebarMode(sidebarMode === 'events' ? 'cameras' : 'events')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all border ${sidebarMode === 'events' ? 'bg-farm-900 border-farm-700 text-farm-400' : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-white'}`}>
                <History size={16} /><span className="hidden md:inline">Eventos</span>
              </button>
              <div className="flex items-center gap-6 font-mono text-sm pl-4 border-l border-stone-700">
                  <div className="hidden md:flex items-center gap-2 text-green-500"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> ONLINE</div>
                  <div className="text-stone-400">{formatTime(currentTime)}</div>
              </div>
           </div>
        </div>

        <div className="flex-1 p-4 grid grid-cols-2 grid-rows-2 gap-4 h-full overflow-hidden">
           {activeSlots.map((camId, index) => {
              const cam = CAMERAS.find(c => c.id === camId);
              const isFocused = focusedSlotIndex === index;
              return (
                 <div key={index} onClick={() => setFocusedSlotIndex(index)} className={`relative rounded-xl overflow-hidden bg-black border-2 transition-all duration-200 group ${isFocused ? 'border-farm-500 shadow-[0_0_20px_rgba(53,173,115,0.3)] z-10' : 'border-stone-800 hover:border-stone-600'}`}>
                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white/20 rounded-tl-sm pointer-events-none"></div>
                    {cam ? (
                       <>
                         {cam.isOnline ? (<img src={`https://picsum.photos/seed/${cam.seed}/800/600?grayscale`} alt={cam.label} className="w-full h-full object-cover opacity-90"/>) : (<div className="w-full h-full flex flex-col items-center justify-center text-stone-600 bg-stone-900/50"><WifiOff size={40} className="mb-2 opacity-50" /><span className="text-xs font-mono">SINAL PERDIDO</span></div>)}
                         <div className="absolute top-0 left-0 w-full p-3 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start pointer-events-none">
                            <div><div className="text-white font-bold text-sm drop-shadow-md">{cam.label}</div><div className="text-stone-400 text-[10px] font-mono">{cam.id}</div></div>
                            {cam.isOnline ? (<div className="flex items-center gap-1.5 bg-farm-900/80 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-green-400 border border-green-900"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> REC</div>) : (<div className="bg-red-900/80 px-2 py-0.5 rounded text-[10px] font-bold text-red-400 border border-red-900">OFF</div>)}
                         </div>
                         <button onClick={(e) => { e.stopPropagation(); setSelectedCamera(cam); }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-farm-600 hover:scale-110"><Maximize2 size={24} /></button>
                       </>
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-stone-700"><span className="text-xs uppercase tracking-widest font-bold">Slot Vazio</span></div>
                    )}
                 </div>
              );
           })}
        </div>
      </div>

      <div className="w-full md:w-80 bg-stone-950 border-l border-stone-800 flex flex-col h-full z-30 shadow-2xl">
         <div className="p-4 border-b border-stone-800">
            <div className="flex bg-stone-900 p-1 rounded-lg mb-4">
                <button onClick={() => setSidebarMode('cameras')} className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-2 ${sidebarMode === 'cameras' ? 'bg-stone-800 text-white shadow' : 'text-stone-500 hover:text-stone-300'}`}><Grid size={14} /> Câmeras</button>
                <button onClick={() => setSidebarMode('events')} className={`flex-1 py-1.5 text-xs font-bold rounded flex items-center justify-center gap-2 ${sidebarMode === 'events' ? 'bg-stone-800 text-white shadow' : 'text-stone-500 hover:text-stone-300'}`}><List size={14} /> Histórico</button>
            </div>
            {sidebarMode === 'cameras' && (
                <div className="relative"><Search className="absolute left-3 top-2.5 text-stone-500" size={14} /><input type="text" placeholder="Buscar câmera..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:border-farm-600 focus:outline-none placeholder-stone-600"/></div>
            )}
         </div>
         <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sidebarMode === 'cameras' && filteredCameras.map(cam => {
               const isActive = activeSlots.includes(cam.id);
               return (
                  <div key={cam.id} onClick={() => handleCameraSelectFromList(cam.id)} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border border-transparent ${isActive ? 'bg-stone-900 border-stone-800' : 'hover:bg-stone-900 hover:border-stone-800'}`}>
                     <div className={`w-12 h-8 rounded bg-black flex items-center justify-center shrink-0 relative overflow-hidden border border-stone-800`}>
                        {cam.isOnline ? (<img src={`https://picsum.photos/seed/${cam.seed}/100/100?grayscale`} className="w-full h-full object-cover opacity-60" />) : (<WifiOff size={14} className="text-stone-600" />)}
                        {isActive && <div className="absolute inset-0 border-2 border-farm-500 shadow-inner"></div>}
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5"><span className={`text-sm font-bold truncate ${isActive ? 'text-farm-400' : 'text-stone-300'}`}>{cam.label}</span>{isActive && <CheckCircle2 size={12} className="text-farm-500" />}</div>
                        <div className="flex items-center gap-2 text-[10px] text-stone-500 font-mono"><span>{cam.id}</span><span>•</span><span className={cam.isOnline ? 'text-green-600' : 'text-red-600'}>{cam.isOnline ? 'ONLINE' : 'OFF'}</span></div>
                     </div>
                  </div>
               );
            })}
            {sidebarMode === 'events' && events.map((evt, idx) => (
                <div key={idx} className="p-3 bg-stone-900/50 rounded-lg border border-stone-800 mb-2">
                   <div className="flex justify-between items-start mb-1"><span className="text-[10px] font-mono text-stone-500">{evt.time}</span><span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${evt.severity === 'high' ? 'bg-red-900/50 text-red-400 border border-red-900' : evt.severity === 'medium' ? 'bg-amber-900/50 text-amber-400 border border-amber-900' : 'bg-blue-900/50 text-blue-400 border border-blue-900'}`}>{evt.type}</span></div>
                   <p className="text-xs font-bold text-stone-300 mb-0.5">{evt.description}</p>
                   <p className="text-[10px] text-stone-500 flex items-center gap-1"><Video size={10} /> {evt.camLabel}</p>
                </div>
            ))}
         </div>
      </div>

      {/* FULLSCREEN MODAL */}
      {selectedCamera && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center">
           <div className="w-full h-full p-4 md:p-8 flex flex-col relative">
              <button onClick={() => setSelectedCamera(null)} className="absolute top-4 right-4 z-50 p-3 bg-stone-800 hover:bg-stone-700 rounded-full text-white transition-colors border border-stone-700"><X size={24} /></button>
              <div className="flex-1 rounded-2xl overflow-hidden border border-stone-800 relative bg-black flex items-center justify-center">
                 <div className="w-full h-full overflow-hidden relative">
                    <img src={`https://picsum.photos/seed/${selectedCamera.seed}/1920/1080?grayscale`} className="w-full h-full object-contain transition-transform duration-200" alt={selectedCamera.label} style={{ transform: `scale(${zoomLevel}) translate(${panPosition.x}px, ${panPosition.y}px)` }} />
                 </div>
                 <div className="absolute top-0 left-0 w-full p-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                    <h1 className="text-2xl font-bold text-white mb-1">{selectedCamera.label}</h1>
                    <div className="flex items-center gap-3 text-stone-400 text-sm font-mono"><span className="bg-farm-600 px-2 py-0.5 rounded text-white">{selectedCamera.id}</span><span>Zoom: {Math.round(zoomLevel * 100)}%</span></div>
                 </div>
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-stone-900/90 backdrop-blur-md border border-stone-700 p-2 rounded-2xl flex items-center gap-4 shadow-2xl">
                     <div className="flex items-center gap-1 border-r border-stone-700 pr-4">
                        <button onClick={handleZoomOut} className="p-2 hover:bg-stone-800 rounded-lg text-white" title="Zoom Out"><ZoomOut size={20} /></button>
                        <span className="text-xs font-mono w-12 text-center text-farm-500 font-bold">{zoomLevel.toFixed(1)}x</span>
                        <button onClick={handleZoomIn} className="p-2 hover:bg-stone-800 rounded-lg text-white" title="Zoom In"><ZoomIn size={20} /></button>
                     </div>
                     {zoomLevel > 1 && (
                         <div className="flex items-center gap-1 border-r border-stone-700 pr-4 animate-fade-in">
                            <button onClick={() => handlePan('left')} className="p-2 hover:bg-stone-800 rounded-lg text-white"><ArrowLeft size={18} /></button>
                            <div className="flex flex-col gap-1">
                                <button onClick={() => handlePan('up')} className="p-1 hover:bg-stone-800 rounded-lg text-white"><ArrowUp size={14} /></button>
                                <button onClick={() => handlePan('down')} className="p-1 hover:bg-stone-800 rounded-lg text-white"><ArrowDown size={14} /></button>
                            </div>
                            <button onClick={() => handlePan('right')} className="p-2 hover:bg-stone-800 rounded-lg text-white"><ArrowRight size={18} /></button>
                         </div>
                     )}
                     <button onClick={handleResetZoom} className="p-2 hover:bg-red-900/50 hover:text-red-400 rounded-lg text-stone-400 transition-colors" title="Reset View"><RefreshCw size={20} /></button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {viewMode === 'dashboard' && renderDashboard()}
      {viewMode === 'alarms' && renderAlarmControl()}
      {viewMode === 'cameras' && renderCameraGrid()}
    </>
  );
};

export default CameraGrid;