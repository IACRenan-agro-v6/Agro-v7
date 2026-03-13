
import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  Search, 
  Leaf, 
  MapPin, 
  Calendar, 
  Utensils, 
  ArrowRight, 
  Star, 
  Info,
  BrainCircuit,
  Apple,
  Zap
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { ConsumerProduct } from '../types';

const MOCK_NUTRITION_PLAN = {
  title: "Plano Detox & Energia",
  goal: "Aumentar imunidade e disposição com produtos da estação",
  dailyMeals: [
    { time: "Café da Manhã", suggestion: "Suco Verde com Couve e Maçã", ingredients: ["Couve Orgânica", "Maçã", "Gengibre", "Limão"] },
    { time: "Almoço", suggestion: "Salada de Grão de Bico com Tomate Cereja", ingredients: ["Tomate Cereja", "Grão de Bico", "Pepino", "Azeite"] },
    { time: "Lanche", suggestion: "Mix de Frutas da Estação", ingredients: ["Banana Prata", "Mamão", "Granola"] },
    { time: "Jantar", suggestion: "Sopa de Abóbora com Gengibre", ingredients: ["Abóbora Cabotiá", "Gengibre", "Cebola", "Salsa"] },
  ],
  seasonalFocus: ["Couve", "Abóbora", "Banana", "Tomate"]
};

interface ConsumerHubProps {
  setView?: (view: any) => void;
}

const ConsumerHub: React.FC<ConsumerHubProps> = ({ setView }) => {
  const [activeTab, setActiveTab] = useState<'find' | 'nutrition'>('find');
  const [products, setProducts] = useState<ConsumerProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const data = await dbService.getConsumerProducts();
      if (data.length === 0) {
        setProducts([
          { id: '1', name: 'Cesta Orgânica Família', price: 'R$ 85,00', producer: 'Sítio Recanto Verde', rating: 4.9, category: 'Cestas', isOrganic: true },
          { id: '2', name: 'Mel de Flor de Laranjeira', price: 'R$ 32,00', producer: 'Apicultura Macacu', rating: 5.0, category: 'Mel', isOrganic: true },
          { id: '3', name: 'Ovos Caipira (Dúzia)', price: 'R$ 18,00', producer: 'Fazenda Boa Vista', rating: 4.8, category: 'Ovos', isOrganic: true },
          { id: '4', name: 'Kombucha de Morango', price: 'R$ 15,00', producer: 'BioBebidas Local', rating: 4.7, category: 'Bebidas', isOrganic: true },
        ]);
      } else {
        setProducts(data);
      }
      setIsLoading(false);
    };
    fetchProducts();
  }, []);

  const handleSavePlan = async () => {
    setIsLoading(true);
    const success = await dbService.saveNutritionPlan(MOCK_NUTRITION_PLAN, 'demo-user-123');
    setIsLoading(false);
    if (success) {
      setFeedback({ message: 'Plano nutricional salvo com sucesso no seu perfil!', type: 'success' });
    } else {
      setFeedback({ message: 'Opa, não conseguimos salvar o plano agora. Tente novamente mais tarde.', type: 'error' });
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleTalkToAI = () => {
    if (setView) {
      setView('chat');
      // Note: In a real app we might pass a pre-filled message state
    } else {
      setFeedback({ message: 'Iniciando chat com Nutricionista IA...', type: 'success' });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FDFBF7] overflow-hidden">
      {/* Feedback Toast */}
      {feedback && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-in ${feedback.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          {feedback.type === 'success' ? <Star size={20} /> : <Info size={20} />}
          <p className="font-bold text-sm">{feedback.message}</p>
        </div>
      )}

      <header className="p-6 border-b border-stone-200 bg-white/50 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <HeartPulse className="text-rose-500" />
            SAÚDE & NUTRIÇÃO
          </h2>
          <p className="text-stone-500 text-sm font-medium italic">O melhor do campo direto para a sua mesa</p>
        </div>
        <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button 
            onClick={() => setActiveTab('find')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'find' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            ENCONTRAR PRODUTOS
          </button>
          <button 
            onClick={() => setActiveTab('nutrition')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'nutrition' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            PLANO NUTRICIONAL IA
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {activeTab === 'find' ? (
          <div className="space-y-8">
            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                <input 
                  type="text" 
                  placeholder="O que você quer comer de saudável hoje?"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-rose-500/20 outline-none shadow-sm"
                />
              </div>
              <button className="px-6 py-3.5 bg-stone-900 text-white rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-stone-800 transition-all">
                <MapPin size={18} />
                VER MAPA
              </button>
            </div>

            {/* Featured Products */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest flex items-center gap-2">
                  <Star size={18} className="text-amber-500" />
                  Destaques Orgânicos da Região
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {isLoading ? (
                    <div className="col-span-2 flex justify-center py-10">
                      <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    products.map((item) => (
                      <div key={item.id} className="bg-white border border-stone-200 rounded-2xl p-4 hover:border-rose-500 transition-all cursor-pointer group shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-rose-500 group-hover:bg-rose-50 transition-colors">
                            <Leaf size={24} />
                          </div>
                          <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                            <Star size={12} fill="currentColor" /> {item.rating}
                          </div>
                        </div>
                        <h4 className="font-black text-stone-900 mb-1">{item.name}</h4>
                        <p className="text-xs text-stone-500 mb-4">{item.producer}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-black text-rose-600">{item.price}</span>
                          <button className="p-2 bg-stone-50 rounded-xl text-stone-400 group-hover:text-rose-600 group-hover:bg-rose-50 transition-all">
                            <ArrowRight size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Seasonal Info */}
              <div className="space-y-6">
                <div className="bg-stone-900 rounded-2xl p-6 text-white shadow-xl">
                  <h3 className="text-xs font-black text-white/50 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Calendar size={14} className="text-rose-400" />
                    Super Alimentos de Março
                  </h3>
                  <div className="space-y-4">
                    {['Abóbora', 'Banana', 'Couve', 'Gengibre'].map(food => (
                      <div key={food} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-sm font-bold">{food}</span>
                        <div className="flex items-center gap-1 text-[10px] font-black text-green-400">
                          <Zap size={10} /> ALTA QUALIDADE
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-6 text-xs text-stone-400 leading-relaxed italic">
                    "Consumir produtos da estação garante mais nutrientes e menor preço. A IA do IAC Farm recomenda focar em verdes escuros este mês."
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Nutrition Plan Content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
                    <Utensils size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-stone-900 tracking-tight">{MOCK_NUTRITION_PLAN.title}</h3>
                    <p className="text-stone-500 text-sm font-medium">{MOCK_NUTRITION_PLAN.goal}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {MOCK_NUTRITION_PLAN.dailyMeals.map((meal, idx) => (
                    <div key={idx} className="flex gap-6 group">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-rose-500 group-hover:scale-150 transition-transform"></div>
                        <div className="w-0.5 flex-1 bg-stone-100 my-2"></div>
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">{meal.time}</div>
                        <h4 className="text-lg font-black text-stone-900 mb-2">{meal.suggestion}</h4>
                        <div className="flex flex-wrap gap-2">
                          {meal.ingredients.map(ing => (
                            <span key={ing} className="px-2 py-1 bg-stone-50 border border-stone-100 rounded-lg text-[10px] font-bold text-stone-600">
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleSavePlan}
                  disabled={isLoading}
                  className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 mt-4 disabled:opacity-50"
                >
                  {isLoading ? 'SALVANDO...' : 'SALVAR PLANO NO PERFIL'}
                </button>
                <button 
                  onClick={handleTalkToAI}
                  className="w-full py-4 mt-3 bg-white border-2 border-rose-500 text-rose-600 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-rose-50 transition-all"
                >
                  FALAR COM NUTRICIONISTA IA
                </button>
              </div>
            </div>

            {/* AI Nutritionist Sidebar */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
                  <BrainCircuit size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                      <BrainCircuit size={20} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Nutricionista IA</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4">Por que este plano?</h3>
                  <p className="text-rose-50 text-sm leading-relaxed mb-6">
                    Este plano foi criado com base nos produtos colhidos HOJE em Cachoeiras de Macacu. A **Couve** e a **Abóbora** estão no pico de densidade nutricional, garantindo o melhor para sua saúde.
                  </p>
                  <div className="flex items-center gap-2 text-xs font-bold bg-white/10 p-3 rounded-xl border border-white/10">
                    <Info size={16} />
                    Rastreabilidade 100% Garantida
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-4">Dica de Saúde</h3>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Apple size={20} />
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed font-medium">
                    "O tomate orgânico da nossa região tem 3x mais licopeno que o industrial. Aproveite a safra desta semana!"
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsumerHub;
