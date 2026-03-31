
import React from 'react';
import { toast } from 'sonner';
import { 
  Truck, 
  MapPin, 
  Navigation, 
  Package, 
  Clock, 
  DollarSign, 
  Plus,
  ChevronRight,
  ShieldCheck,
  BrainCircuit,
  Loader2
} from 'lucide-react';
import { FreightRoute } from '../types';

const MOCK_ROUTES: FreightRoute[] = [
  { id: '1', driverName: 'João do Caminhão', capacity: 5000, currentLoad: 3200, route: ['Cachoeiras', 'CEASA-RJ', 'Niterói'], pricePerKm: 4.50, status: 'en_route' },
  { id: '2', driverName: 'Maria Transportes', capacity: 2000, currentLoad: 0, route: ['Nova Friburgo', 'Cachoeiras'], pricePerKm: 3.80, status: 'idle' },
  { id: '3', driverName: 'LogAgro Express', capacity: 10000, currentLoad: 8500, route: ['Teresópolis', 'Rio de Janeiro'], pricePerKm: 5.20, status: 'en_route' },
];

const LogisticsView: React.FC = () => {
  const [isOptimizing, setIsOptimizing] = React.useState(false);
  const [optimized, setOptimized] = React.useState(false);

  const runOptimization = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      setOptimized(true);
      toast.success("Rotas otimizadas com sucesso!", {
        description: "Economia de 35% no frete garantida."
      });
    }, 2500);
  };

  return (
    <div className="flex flex-col h-full bg-[#FDFBF7] overflow-hidden">
      <header className="p-6 border-b border-stone-200 bg-white/50 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Truck className="text-blue-500" />
            LOGÍSTICA & FRETE
          </h2>
          <p className="text-stone-500 text-sm font-medium italic">Eliminando o atravessador com rotas inteligentes</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
          <Plus size={18} />
          SOLICITAR COLETA
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* AI Optimization Card */}
        <div className="bg-stone-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-8 -translate-y-8">
            <Navigation size={160} />
          </div>
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-500 rounded-xl">
                <BrainCircuit size={24} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-blue-400">Otimização Autônoma IAC</span>
            </div>
            <h3 className="text-3xl font-black mb-4 leading-tight">Rota Consolidada Detectada!</h3>
            <p className="text-stone-400 text-lg mb-8">
              {optimized 
                ? "Otimização concluída! Encontramos a melhor rota para os 4 produtores. O custo total foi reduzido em 35% e a pegada de carbono em 22%."
                : "Identificamos 4 produtores de **Tomate Orgânico** em um raio de 5km. Podemos consolidar uma carga única para o CEASA-RJ amanhã às 04:00, reduzindo o custo de frete em **35%** para cada um."}
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={runOptimization}
                disabled={isOptimizing}
                className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-500 transition-all flex items-center gap-2"
              >
                {isOptimizing ? <Loader2 className="animate-spin" size={16} /> : <BrainCircuit size={16} />}
                {isOptimizing ? 'Otimizando...' : optimized ? 'Rota Confirmada' : 'Otimizar com IA'}
              </button>
              <button className="px-8 py-3 bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-all backdrop-blur-md border border-white/10">
                Ver Detalhes
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Drivers List */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-sm font-black text-stone-400 uppercase tracking-widest flex items-center gap-2">
              <Navigation size={16} />
              Motoristas Próximos
            </h3>
            <div className="space-y-4">
              {MOCK_ROUTES.map(route => (
                <div key={route.id} className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-blue-500 transition-all group shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <Truck size={28} />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-stone-900">{route.driverName}</h4>
                        <div className="flex items-center gap-2 text-xs text-stone-500 font-bold">
                          <ShieldCheck size={14} className="text-green-500" />
                          VERIFICADO • 4.9 ★
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-blue-600">R$ {route.pricePerKm.toFixed(2)}/km</div>
                      <div className="text-[10px] font-bold text-stone-400 uppercase">Tarifa Transparente</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                      <div className="text-[10px] font-bold text-stone-400 uppercase mb-1">Capacidade</div>
                      <div className="text-sm font-black text-stone-800">{route.capacity}kg</div>
                    </div>
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                      <div className="text-[10px] font-bold text-stone-400 uppercase mb-1">Carga Atual</div>
                      <div className="text-sm font-black text-stone-800">{route.currentLoad}kg</div>
                    </div>
                    <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                      <div className="text-[10px] font-bold text-stone-400 uppercase mb-1">Status</div>
                      <div className={`text-xs font-black uppercase ${route.status === 'idle' ? 'text-green-600' : 'text-orange-500'}`}>
                        {route.status === 'idle' ? 'Disponível' : 'Em Rota'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-medium text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <MapPin size={16} className="text-blue-500" />
                    {route.route.join(' → ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logistics Stats & Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
              <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-6">Resumo Logístico</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-orange-500" />
                    <span className="text-xs font-bold text-stone-600">Tempo Médio Coleta</span>
                  </div>
                  <span className="text-sm font-black">45 min</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <DollarSign size={18} className="text-green-500" />
                    <span className="text-xs font-bold text-stone-600">Economia Acumulada</span>
                  </div>
                  <span className="text-sm font-black text-green-600">R$ 1.240,00</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Package size={18} className="text-blue-500" />
                    <span className="text-xs font-bold text-stone-600">Volume Transportado</span>
                  </div>
                  <span className="text-sm font-black">12.4 Ton</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
              <h3 className="text-sm font-black mb-4">Seja um Transportador</h3>
              <p className="text-xs text-blue-100 leading-relaxed mb-6">
                Tem um caminhão ou utilitário? Ganhe dinheiro transportando a produção local. Pagamento garantido via plataforma.
              </p>
              <button className="w-full py-3 bg-white text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-all">
                Cadastrar Veículo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogisticsView;
