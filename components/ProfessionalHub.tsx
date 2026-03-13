
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  Leaf, 
  Calendar, 
  ChevronRight, 
  Search, 
  Filter,
  Activity,
  Award,
  Apple,
  Dumbbell,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { dbService } from '../services/dbService';
import { ProfessionalClient, SeasonalRecommendation } from '../types';

interface ProfessionalHubProps {
  setView?: (view: any) => void;
}

const ProfessionalHub: React.FC<ProfessionalHubProps> = ({ setView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'clients' | 'recommendations' | 'analytics'>('clients');
  const [clients, setClients] = useState<ProfessionalClient[]>([]);
  const [recommendations, setRecommendations] = useState<SeasonalRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', goal: '' });
  const [feedback, setFeedback] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    const professionalId = 'demo-prof-123';
    const [clientsData, recsData] = await Promise.all([
      dbService.getProfessionalClients(professionalId),
      dbService.getSeasonalRecommendations()
    ]);
    
    if (clientsData.length === 0) {
      setClients([
        { id: '1', name: 'João Silva', goal: 'Hipertrofia', lastUpdate: '2 dias atrás', status: 'Em progresso', score: 85, professionalId },
        { id: '2', name: 'Maria Oliveira', goal: 'Emagrecimento', lastUpdate: 'Hoje', status: 'Excelente', score: 92, professionalId },
        { id: '3', name: 'Carlos Santos', goal: 'Performance (Maratona)', lastUpdate: '1 semana atrás', status: 'Atenção', score: 68, professionalId },
        { id: '4', name: 'Ana Costa', goal: 'Saúde Geral', lastUpdate: '3 dias atrás', status: 'Estável', score: 75, professionalId },
      ]);
    } else {
      setClients(clientsData);
    }

    if (recsData.length === 0) {
      setRecommendations([
        { id: 's1', product: 'Batata Doce Roxa', benefit: 'Baixo índice glicêmico, ideal para pré-treino de longa duração.', season: 'Alta Safra (Março)', source: 'Fazenda Santa Maria', tags: ['Energia', 'Resistência'] },
        { id: 's2', product: 'Espinafre Orgânico', benefit: 'Rico em nitratos, melhora a eficiência mitocondrial e oxigenação.', season: 'Safra Local', source: 'Horta Comunitária IAC', tags: ['Performance', 'Recuperação'] },
        { id: 's3', product: 'Abacate Hass', benefit: 'Gorduras boas para suporte hormonal e saciedade prolongada.', season: 'Início de Safra', source: 'Pomar Vale Verde', tags: ['Hormonal', 'Saciedade'] },
      ]);
    } else {
      setRecommendations(recsData);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddClient = async () => {
    if (!newClient.name) return;
    setIsLoading(true);
    const client: ProfessionalClient = {
      id: Date.now().toString(),
      name: newClient.name,
      goal: newClient.goal || 'Objetivo não definido',
      lastUpdate: 'Agora',
      status: 'Estável',
      score: 0,
      professionalId: 'demo-prof-123'
    };
    
    const success = await dbService.saveProfessionalClient(client);
    if (success) {
      setClients(prev => [client, ...prev]);
      setIsAddingClient(false);
      setNewClient({ name: '', goal: '' });
      setFeedback({ message: 'Cliente adicionado com sucesso!', type: 'success' });
    } else {
      setFeedback({ message: 'Erro ao salvar cliente no banco de dados.', type: 'error' });
    }
    setIsLoading(false);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handlePrescribe = (product: string) => {
    setFeedback({ message: `Recomendação de ${product} adicionada ao rascunho.`, type: 'success' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const PERFORMANCE_DATA = [
    { month: 'Jan', performance: 65, compliance: 70 },
    { month: 'Fev', performance: 72, compliance: 75 },
    { month: 'Mar', performance: 85, compliance: 82 },
    { month: 'Abr', performance: 80, compliance: 88 },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-stone-50 dark:bg-stone-950 animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Feedback Toast */}
        {feedback && (
          <div className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-in ${feedback.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
            {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p className="font-bold text-sm">{feedback.message}</p>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-stone-900 dark:text-white tracking-tight">Hub do Profissional</h1>
            <p className="text-stone-500 dark:text-stone-400 font-medium">Gestão de performance baseada na inteligência do campo</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsAddingClient(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
            >
              <Plus size={18} /> Novo Cliente
            </button>
            <div className="bg-white dark:bg-stone-900 p-3 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center">
                <Users size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Meus Clientes</p>
                <p className="text-lg font-black text-stone-800 dark:text-white leading-none">24</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex p-1 bg-stone-200/50 dark:bg-stone-900/50 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('clients')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'clients' ? 'bg-white dark:bg-stone-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
          >
            <Users size={18} /> Clientes
          </button>
          <button 
            onClick={() => setActiveTab('recommendations')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'recommendations' ? 'bg-white dark:bg-stone-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
          >
            <Leaf size={18} /> Recomendações de Safra
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-white dark:bg-stone-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
          >
            <TrendingUp size={18} /> Analytics
          </button>
        </div>

        {activeTab === 'clients' && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex items-center gap-4 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm">
              <Search className="text-stone-400" size={20} />
              <input 
                type="text" 
                placeholder="Buscar cliente por nome ou objetivo..." 
                className="flex-1 bg-transparent outline-none text-stone-800 dark:text-white font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors text-stone-500">
                <Filter size={20} />
              </button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-stone-500 font-bold animate-pulse">Sincronizando com o campo...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map(client => (
                  <div key={client.id} className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center text-stone-600 dark:text-stone-400 font-bold text-xl">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-stone-900 dark:text-white text-lg">{client.name}</h3>
                          <p className="text-xs text-stone-500 font-medium">{client.goal}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        client.status === 'Excelente' ? 'bg-emerald-100 text-emerald-700' : 
                        client.status === 'Atenção' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {client.status}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Compliance Nutricional</p>
                          <p className="text-2xl font-black text-stone-800 dark:text-white">{client.score}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">Última Atualização</p>
                          <p className="text-xs font-bold text-stone-600 dark:text-stone-300">{client.lastUpdate}</p>
                        </div>
                      </div>
                      <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${client.score > 80 ? 'bg-emerald-500' : client.score > 70 ? 'bg-blue-500' : 'bg-amber-500'}`}
                          style={{ width: `${client.score}%` }}
                        />
                      </div>
                    </div>

                    <button className="w-full mt-6 py-3 bg-stone-50 dark:bg-stone-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:text-white">
                      Ver Prontuário Completo <ChevronRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6 animate-slide-up">
            <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-600/20">
              <div className="relative z-10 max-w-2xl">
                <h2 className="text-2xl font-black mb-2 tracking-tight">Inteligência de Safra para Performance</h2>
                <p className="text-indigo-100 font-medium">
                  Cruzamos os dados de colheita local com as necessidades nutricionais dos seus clientes. 
                  Prescreva alimentos com maior densidade de nutrientes e menor pegada de carbono.
                </p>
              </div>
              <div className="absolute right-[-20px] top-[-20px] opacity-10 transform rotate-12">
                <Leaf size={200} />
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-stone-500 font-bold animate-pulse">Buscando melhores safras...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendations.map(rec => (
                  <div key={rec.id} className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                        <Apple size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900 dark:text-white">{rec.product}</h3>
                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{rec.season}</p>
                      </div>
                    </div>
                    <p className="text-sm text-stone-600 dark:text-stone-400 mb-6 flex-1">{rec.benefit}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {rec.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">{tag}</span>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center">
                          <Calendar size={12} className="text-stone-400" />
                        </div>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{rec.source}</span>
                      </div>
                      <button 
                        onClick={() => handlePrescribe(rec.product)}
                        className="text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:underline"
                      >
                        Prescrever
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center">
                  <Award size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-900 dark:text-white">Dica do Agrônomo para Performance</h3>
                  <p className="text-sm text-stone-500">Otimize a biodisponibilidade com produtos da época</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-bold text-stone-800 dark:text-white flex items-center gap-2"><Activity size={18} className="text-indigo-500" /> Recuperação Muscular</h4>
                  <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                    A safra atual de **Cúrcuma** da região sul está com concentração de curcumina 15% superior à média. 
                    Excelente para protocolos anti-inflamatórios pós-treino intenso.
                  </p>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-stone-800 dark:text-white flex items-center gap-2"><Dumbbell size={18} className="text-indigo-500" /> Explosão & Força</h4>
                  <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                    A **Beterraba** colhida no Talhão 04 apresenta alto teor de nitrato. Recomende o suco concentrado 
                    2h antes de sessões de HIIT para seus atletas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm">
                <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-6">Performance Média da Carteira</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={PERFORMANCE_DATA}>
                      <defs>
                        <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="performance" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorPerf)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm">
                <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-6">Adesão ao Plano Nutricional</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={PERFORMANCE_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="compliance" fill="#35ad73" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Taxa de Retenção', value: '94%', trend: '+2.4%', color: 'emerald' },
                { label: 'Novos Clientes', value: '12', trend: '+4', color: 'indigo' },
                { label: 'Avg. Score', value: '78.5', trend: '+5.2', color: 'amber' },
                { label: 'Prescrições Ativas', value: '156', trend: '+18', color: 'blue' },
              ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-100 dark:border-stone-800 shadow-sm">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">{stat.label}</p>
                  <div className="flex items-end justify-between">
                    <h4 className="text-2xl font-black text-stone-800 dark:text-white">{stat.value}</h4>
                    <span className={`text-[10px] font-bold text-${stat.color}-600 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 px-2 py-1 rounded-lg`}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Client Modal */}
        {isAddingClient && (
          <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-scale-in">
              <h3 className="text-2xl font-black text-stone-900 dark:text-white mb-6">Novo Cliente</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Nome Completo</label>
                  <input 
                    type="text" 
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Ex: João da Silva"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Objetivo Principal</label>
                  <input 
                    type="text" 
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Ex: Emagrecimento, Hipertrofia..."
                    value={newClient.goal}
                    onChange={(e) => setNewClient({...newClient, goal: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setIsAddingClient(false)}
                  className="flex-1 py-4 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 rounded-2xl font-bold"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleAddClient}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProfessionalHub;
