
import React from 'react';
import { 
  LineChart as LucideLineChart, 
  TrendingUp, 
  Calendar, 
  Package, 
  AlertTriangle, 
  BrainCircuit, 
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Search,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { MarketQuote, MarketOffer, UserProfile, ViewMode } from '../types';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { X, MapPin, Plus, Minus } from 'lucide-react';

const FORECAST_DATA = [
  { name: 'Sem 1', demanda: 400, oferta: 450 },
  { name: 'Sem 2', demanda: 300, oferta: 320 },
  { name: 'Sem 3', demanda: 500, oferta: 480 },
  { name: 'Sem 4', demanda: 450, oferta: 550 },
  { name: 'Sem 5', demanda: 600, oferta: 580 },
  { name: 'Sem 6', demanda: 550, oferta: 600 },
];

const CATEGORY_DATA = [
  { name: 'Legumes', value: 45, color: '#10b981' },
  { name: 'Frutas', value: 30, color: '#f59e0b' },
  { name: 'Folhas', value: 15, color: '#3b82f6' },
  { name: 'Raízes', value: 10, color: '#8b5cf6' },
];

interface RetailerInsightsProps {
  setView?: (view: ViewMode) => void;
}

const RetailerInsights: React.FC<RetailerInsightsProps> = ({ setView }) => {
  const [showMap, setShowMap] = React.useState(false);
  const [userLocation, setUserLocation] = React.useState<{lat: number, lng: number} | null>(null);
  const [isPredicting, setIsPredicting] = React.useState(false);
  const [showPrediction, setShowPrediction] = React.useState(false);

  const runPrediction = () => {
    setIsPredicting(true);
    setTimeout(() => {
      setIsPredicting(false);
      setShowPrediction(true);
    }, 2000);
  };

  const chartData = React.useMemo(() => {
    if (!showPrediction) return FORECAST_DATA;
    return FORECAST_DATA.map((d, i) => ({
      ...d,
      predicao: i > 3 ? d.demanda * (1 + Math.random() * 0.2) : undefined
    }));
  }, [showPrediction]);

  // Get user location for map
  React.useEffect(() => {
    if (showMap && !userLocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Fallback to Cachoeiras de Macacu
          setUserLocation({ lat: -22.4626, lng: -42.6538 });
        }
      );
    }
  }, [showMap, userLocation]);

  return (
    <div className="flex flex-col h-full bg-[#FDFBF7] overflow-hidden relative">
      <header className="p-6 border-b border-stone-200 bg-white/50 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <LucideLineChart className="text-indigo-600" />
            INSIGHTS DE VAREJO
          </h2>
          <p className="text-stone-500 text-sm font-medium italic">Previsibilidade de oferta e demanda para o seu Hortifruti</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <input 
              type="text" 
              placeholder="Previsão por produto..."
              className="pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* AI Business Advisor Card */}
        <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-8 -translate-y-8">
            <BarChart3 size={160} />
          </div>
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-indigo-500 rounded-xl">
                <BrainCircuit size={24} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-indigo-300">Consultor de Negócios IAC</span>
            </div>
            <h3 className="text-3xl font-black mb-4 leading-tight">Otimização de Estoque Sugerida</h3>
            <p className="text-indigo-100 text-lg mb-8">
              Detectamos uma queda na oferta de **Alface Americana** para a próxima semana devido a chuvas em Cachoeiras de Macacu. Sugerimos aumentar o pedido de **Couve** e **Espinafre** para suprir a demanda de folhosas.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={runPrediction}
                disabled={isPredicting}
                className="px-8 py-3 bg-white text-indigo-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-stone-100 transition-all flex items-center gap-2"
              >
                {isPredicting ? <Loader2 className="animate-spin" size={16} /> : <BrainCircuit size={16} />}
                {isPredicting ? 'Analisando...' : showPrediction ? 'Atualizar Previsão' : 'Rodar Previsão de IA'}
              </button>
              <button 
                onClick={() => setView?.('market')}
                className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-500 transition-all"
              >
                Ajustar Pedidos
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Supply & Demand Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={14} className="text-indigo-500" />
                Previsão de Oferta vs Demanda (6 Semanas)
              </h3>
              <div className="flex gap-4 text-[10px] font-bold">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> DEMANDA</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> OFERTA</div>
                {showPrediction && <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div> PREVISÃO IA</div>}
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorDemanda" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOferta" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPredicao" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#a8a29e'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#a8a29e'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="demanda" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorDemanda)" />
                  <Area type="monotone" dataKey="oferta" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorOferta)" />
                  {showPrediction && <Area type="monotone" dataKey="predicao" stroke="#f43f5e" strokeWidth={3} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorPredicao)" />}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-500" />
                Alertas de Ruptura
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-black text-amber-900">Tomate Saladete</span>
                    <span className="text-[10px] font-black bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full">ALTO RISCO</span>
                  </div>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Oferta regional cairá 40% na próxima quarta-feira. Garanta seu estoque hoje.
                  </p>
                </div>
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-black text-indigo-900">Batata Doce</span>
                    <span className="text-[10px] font-black bg-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full">OPORTUNIDADE</span>
                  </div>
                  <p className="text-xs text-indigo-700 leading-relaxed">
                    Excesso de oferta em Nova Friburgo. Preço 20% abaixo da média do CEASA.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-6">Mix de Vendas</h3>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CATEGORY_DATA} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} width={60} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                      {CATEGORY_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Supply Calendar */}
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest flex items-center gap-2">
              <Calendar size={18} className="text-indigo-500" />
              Calendário de Colheita Regional (Próximos 15 dias)
            </h3>
            <button 
              onClick={() => setShowMap(true)}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Ver Mapa de Produtores
            </button>
          </div>
          <div className="divide-y divide-stone-100">
            {[
              { date: '12 Mar', product: 'Brócolis Ninja', producer: 'Sítio das Flores', qty: '200kg', status: 'Confirmado' },
              { date: '14 Mar', product: 'Cenoura Baby', producer: 'Fazenda Sol Nascente', qty: '150kg', status: 'Previsão' },
              { date: '15 Mar', product: 'Morango Orgânico', producer: 'Recanto Verde', qty: '80kg', status: 'Previsão' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-stone-100 rounded-xl flex flex-col items-center justify-center">
                    <span className="text-[10px] font-black text-stone-400 uppercase">{item.date.split(' ')[1]}</span>
                    <span className="text-sm font-black text-stone-800">{item.date.split(' ')[0]}</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-stone-900">{item.product}</div>
                    <div className="text-xs text-stone-500">{item.producer}</div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="text-xs font-black text-stone-800">{item.qty}</div>
                    <div className="text-[10px] font-bold text-stone-400 uppercase">Volume Est.</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.status === 'Confirmado' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {item.status}
                  </div>
                  <ChevronRight size={18} className="text-stone-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showMap && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-black text-stone-900 uppercase tracking-tight">Mapa de Produtores Regionais</h3>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Cachoeiras de Macacu & Região</p>
                </div>
              </div>
              <button onClick={() => setShowMap(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                <X size={20} className="text-stone-400" />
              </button>
            </div>
            
            <div className="flex-1 bg-stone-100 relative min-h-[500px] overflow-hidden">
              {/* Stylized Map Background */}
              <div className="absolute inset-0 bg-[#e5e7eb] opacity-50">
                <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" className="opacity-20">
                  <path d="M0,0 L800,0 L800,600 L0,600 Z" fill="#d1d5db" />
                  <path d="M100,100 Q200,50 300,150 T500,100 T700,200" stroke="#9ca3af" strokeWidth="20" fill="none" />
                  <path d="M50,400 Q150,350 250,450 T450,400 T650,500" stroke="#9ca3af" strokeWidth="15" fill="none" />
                  <circle cx="400" cy="300" r="200" fill="#93c5fd" opacity="0.2" />
                </svg>
              </div>

              {/* Map Content */}
              <div className="absolute inset-0 p-8">
                {/* User Location Marker */}
                {userLocation && (
                  <div 
                    className="absolute transition-all duration-1000 ease-out"
                    style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                  >
                    <div className="relative">
                      <div className="absolute -inset-4 bg-indigo-500/20 rounded-full animate-ping"></div>
                      <div className="w-6 h-6 bg-indigo-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center z-10 relative">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white px-2 py-1 rounded-md shadow-sm border border-stone-200 whitespace-nowrap">
                        <span className="text-[8px] font-black uppercase text-indigo-600">Sua Localização</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Producer Markers */}
                {[
                  { id: 1, name: 'Sítio das Flores', product: 'Brócolis', top: '30%', left: '40%', color: 'bg-green-600' },
                  { id: 2, name: 'Fazenda Sol Nascente', product: 'Milho', top: '60%', left: '35%', color: 'bg-orange-600' },
                  { id: 3, name: 'Recanto Verde', product: 'Morango', top: '45%', left: '65%', color: 'bg-red-600' },
                  { id: 4, name: 'Horta do Vale', product: 'Alface', top: '25%', left: '70%', color: 'bg-emerald-600' },
                  { id: 5, name: 'Agro Macacu', product: 'Tomate', top: '70%', left: '55%', color: 'bg-red-500' },
                ].map((producer) => (
                  <div 
                    key={producer.id}
                    className="absolute cursor-pointer group"
                    style={{ top: producer.top, left: producer.left }}
                  >
                    <div className="relative">
                      <div className={`w-8 h-8 ${producer.color} rounded-xl border-2 border-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <MapPin size={16} className="text-white" />
                      </div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-white p-3 rounded-2xl shadow-xl border border-stone-100 min-w-[150px]">
                          <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">{producer.product}</div>
                          <div className="text-sm font-black text-stone-900">{producer.name}</div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-green-600">Disponível</span>
                            <ChevronRight size={12} className="text-stone-400" />
                          </div>
                        </div>
                        <div className="w-2 h-2 bg-white border-r border-b border-stone-100 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map Controls */}
              <div className="absolute bottom-6 left-6 space-y-2">
                <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl max-w-xs">
                  <h4 className="text-xs font-black text-stone-900 uppercase tracking-widest mb-3">Legenda</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      <span className="text-[10px] font-bold text-stone-600">Hortaliças</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                      <span className="text-[10px] font-bold text-stone-600">Grãos & Cereais</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                      <span className="text-[10px] font-bold text-stone-600">Frutas</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute top-6 right-6 flex flex-col gap-2">
                <button className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-stone-600 hover:text-stone-900 transition-all">
                  <Plus size={20} />
                </button>
                <button className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-stone-600 hover:text-stone-900 transition-all">
                  <Minus size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 bg-stone-50 border-t border-stone-100 flex justify-end">
              <button 
                onClick={() => setShowMap(false)}
                className="px-8 py-3 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 transition-all"
              >
                Fechar Mapa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetailerInsights;
