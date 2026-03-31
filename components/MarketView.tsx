
import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Store, 
  Truck, 
  Search, 
  Plus, 
  Calendar,
  ArrowRight,
  Info,
  BrainCircuit,
  Filter,
  X,
  MapPin,
  Leaf,
  Wheat,
  Apple
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { MarketQuote, MarketOffer, UserProfile, UserRole, ViewMode } from '../types';
import { getCEASAQuotes } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { Loader2 } from 'lucide-react';

interface MarketViewProps {
  currentUser?: UserProfile | null;
  setView?: (view: ViewMode) => void;
}

const HISTORICAL_DATA = [
  { date: '01/03', price: 78 },
  { date: '02/03', price: 80 },
  { date: '03/03', price: 85 },
  { date: '04/03', price: 82 },
  { date: '05/03', price: 88 },
  { date: '06/03', price: 92 },
  { date: '07/03', price: 90 },
  { date: '08/03', price: 95 },
];

const MarketView: React.FC<MarketViewProps> = ({ currentUser, setView }) => {
  const [activeTab, setActiveTab] = useState<'quotes' | 'marketplace'>(() => {
    return (localStorage.getItem('agro_market_activeTab') as 'quotes' | 'marketplace') || 'quotes';
  });
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem('agro_market_searchTerm') || '';
  });
  const [quotes, setQuotes] = useState<MarketQuote[]>(() => {
    const saved = localStorage.getItem('agro_market_quotes');
    return saved ? JSON.parse(saved) : [];
  });
  const [offers, setOffers] = useState<MarketOffer[]>(() => {
    const saved = localStorage.getItem('agro_market_offers');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingOffer, setIsAddingOffer] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(() => {
    return localStorage.getItem('agro_market_showAnalysis') === 'true';
  });
  const [showMap, setShowMap] = useState(() => {
    return localStorage.getItem('agro_market_showMap') === 'true';
  });
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem('agro_market_filters');
    return saved ? JSON.parse(saved) : {
      type: 'all', // all, organic, conventional
      status: 'all', // all, available, sold
      maxDistance: 100 // km
    };
  });

  // Persist state
  useEffect(() => {
    localStorage.setItem('agro_market_activeTab', activeTab);
    localStorage.setItem('agro_market_searchTerm', searchTerm);
    localStorage.setItem('agro_market_quotes', JSON.stringify(quotes));
    localStorage.setItem('agro_market_offers', JSON.stringify(offers));
    localStorage.setItem('agro_market_showAnalysis', showAnalysis.toString());
    localStorage.setItem('agro_market_showMap', showMap.toString());
    localStorage.setItem('agro_market_filters', JSON.stringify(filters));
  }, [activeTab, searchTerm, quotes, offers, showAnalysis, showMap, filters]);

  // Get user location for map
  useEffect(() => {
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

  // Fetch quotes
  useEffect(() => {
    const fetchQuotes = async () => {
      setIsLoading(true);
      const data = await getCEASAQuotes(searchTerm);
      if (data && data.length > 0) {
        setQuotes(data);
      } else {
        // Fallback to mock if API fails
        const mockQuotes: MarketQuote[] = [
          { product: 'Tomate Saladete', price: 85.00, unit: 'Cx 20kg', trend: 'up', lastUpdate: '13/03/2026', source: 'CEASA-RJ' },
          { product: 'Batata Inglesa', price: 120.00, unit: 'Sc 50kg', trend: 'down', lastUpdate: '13/03/2026', source: 'CEASA-RJ' },
          { product: 'Cebola Nacional', price: 65.00, unit: 'Sc 20kg', trend: 'stable', lastUpdate: '13/03/2026', source: 'CEASA-RJ' },
          { product: 'Milho Verde', price: 55.00, unit: 'Sc 50un', trend: 'up', lastUpdate: '13/03/2026', source: 'CEASA-RJ' },
          { product: 'Cenoura Especial', price: 45.00, unit: 'Cx 20kg', trend: 'up', lastUpdate: '13/03/2026', source: 'CEASA-RJ' },
        ];
        
        if (searchTerm) {
          const filtered = mockQuotes.filter(q => q.product.toLowerCase().includes(searchTerm.toLowerCase()));
          setQuotes(filtered.length > 0 ? filtered : mockQuotes);
        } else {
          setQuotes(mockQuotes);
        }
      }
      setIsLoading(false);
    };
    
    const timeoutId = setTimeout(() => {
      fetchQuotes();
    }, 500); // Debounce search
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Fetch offers
  useEffect(() => {
    const fetchOffers = async () => {
      const data = await dbService.getMarketOffers();
      setOffers(data);
    };
    fetchOffers();
  }, [activeTab]);

  const handleAddOffer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) return;

    const formData = new FormData(e.currentTarget);
    const newOffer: Omit<MarketOffer, 'id' | 'createdAt'> = {
      producerId: currentUser.id,
      product: formData.get('product') as string,
      quantity: Number(formData.get('quantity')),
      unit: formData.get('unit') as string,
      price: Number(formData.get('price')),
      location: formData.get('location') as string,
      isOrganic: formData.get('isOrganic') === 'on',
      status: 'available'
    };

    const success = await dbService.saveMarketOffer(newOffer);
    if (success) {
      setIsAddingOffer(false);
      // Refresh offers
      const data = await dbService.getMarketOffers();
      setOffers(data);
      toast.success("Oferta publicada com sucesso! Bons negócios.");
    } else {
      toast.error("Não conseguimos salvar sua oferta. Tente de novo em instantes.");
    }
  };

  const filteredQuotes = useMemo(() => {
    return quotes.filter(q => q.product.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, quotes]);

  const filteredOffers = useMemo(() => {
    return offers.filter(offer => {
      // Search term
      const matchesSearch = offer.product.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           offer.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Type filter
      const matchesType = filters.type === 'all' || 
                         (filters.type === 'organic' && offer.isOrganic) || 
                         (filters.type === 'conventional' && !offer.isOrganic);
      
      // Status filter
      const matchesStatus = filters.status === 'all' || offer.status === filters.status;
      
      // Distance filter (Mocking distance since we don't have real coords for all)
      // In a real app, we'd calculate this using Haversine formula
      const mockDistance = (offer.id.length % 50) + 5; // Deterministic mock distance
      const matchesDistance = mockDistance <= filters.maxDistance;

      return matchesSearch && matchesType && matchesStatus && matchesDistance;
    });
  }, [searchTerm, offers, filters]);

  return (
    <div className="flex flex-col h-full bg-[#FDFBF7] overflow-hidden">
      {/* Add Offer Modal */}
      {isAddingOffer && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <h3 className="font-black text-stone-900 uppercase tracking-widest">Anunciar Safra</h3>
              <button onClick={() => setIsAddingOffer(false)} className="text-stone-400 hover:text-stone-600 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddOffer} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Produto</label>
                <input name="product" required className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all" placeholder="Ex: Milho Verde" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Quantidade</label>
                  <input name="quantity" type="number" required className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all" placeholder="500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Unidade</label>
                  <select name="unit" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all">
                    <option value="kg">kg</option>
                    <option value="ton">Tonelada</option>
                    <option value="cx">Caixa</option>
                    <option value="sc">Saco</option>
                    <option value="dz">Dúzia</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Preço Unitário (R$)</label>
                <input name="price" type="number" step="0.01" required className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all" placeholder="2.50" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Localização</label>
                <input name="location" required className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all" placeholder="Ex: Cachoeiras de Macacu, RJ" />
              </div>
              <div className="flex items-center gap-3 py-2">
                <input type="checkbox" name="isOrganic" id="isOrganic" className="w-5 h-5 rounded border-stone-300 text-green-600 focus:ring-green-500" />
                <label htmlFor="isOrganic" className="text-sm font-bold text-stone-700">Produção Orgânica</label>
              </div>
              <button type="submit" className="w-full bg-orange-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 mt-4">
                Publicar Oferta
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="p-6 border-b border-stone-200 bg-white/50 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Store className="text-orange-500" />
            MERCADO & COTAÇÕES
          </h2>
          <p className="text-stone-500 text-sm font-medium italic">Conectando o roçado ao varejo com inteligência CEASA-RJ</p>
        </div>

        <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button 
            onClick={() => setActiveTab('quotes')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'quotes' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            COTAÇÕES CEASA
          </button>
          <button 
            onClick={() => setActiveTab('marketplace')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'marketplace' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            CONEXÃO DIRETA
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {activeTab === 'quotes' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Quotes Grid */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Buscar produto no CEASA..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="p-2.5 bg-white border border-stone-200 rounded-xl text-stone-600 hover:bg-stone-50 transition-colors">
                  <Filter size={20} />
                </button>
              </div>

              {/* Quotes Table - Recipe 1 style */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                <div className="grid grid-cols-4 p-4 bg-stone-50 border-b border-stone-200 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                  <span>Produto</span>
                  <span className="text-center">Preço Médio</span>
                  <span className="text-center">Unidade</span>
                  <span className="text-right">Tendência</span>
                </div>
                <div className="divide-y divide-stone-100">
                  {isLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center text-stone-400 gap-3">
                      <Loader2 className="animate-spin" size={32} />
                      <p className="text-sm font-medium">Buscando cotações reais no CEASA...</p>
                    </div>
                  ) : filteredQuotes.length > 0 ? (
                    filteredQuotes.map((quote, idx) => (
                      <div key={idx} className="grid grid-cols-4 p-4 items-center hover:bg-stone-50 transition-colors cursor-pointer group">
                        <span className="text-sm font-bold text-stone-800 group-hover:text-orange-600 transition-colors">{quote.product}</span>
                        <span className="text-center font-mono text-sm font-bold text-stone-600">R$ {quote.price.toFixed(2)}</span>
                        <span className="text-center text-xs font-medium text-stone-500">{quote.unit}</span>
                        <div className="flex justify-end">
                          {quote.trend === 'up' && <div className="flex items-center gap-1 text-red-500 font-bold text-xs bg-red-50 px-2 py-1 rounded-full"><TrendingUp size={12}/> ALTA</div>}
                          {quote.trend === 'down' && <div className="flex items-center gap-1 text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded-full"><TrendingDown size={12}/> BAIXA</div>}
                          {quote.trend === 'stable' && <div className="flex items-center gap-1 text-stone-400 font-bold text-xs bg-stone-50 px-2 py-1 rounded-full"><Minus size={12}/> ESTÁVEL</div>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center text-stone-400 text-sm">Nenhuma cotação encontrada.</div>
                  )}
                </div>
              </div>

              {/* AI Insight Card */}
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
                  <BrainCircuit size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                      <BrainCircuit size={20} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Estratégia IAC Farm</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Previsão de Alta para o Tomate</h3>
                  <p className="text-orange-50 text-sm leading-relaxed mb-6 max-w-md">
                    Baseado no histórico do CEASA-RJ e nas condições climáticas de Cachoeiras de Macacu, prevemos uma alta de 15% nos próximos 10 dias. Recomendamos antecipar a colheita se possível.
                  </p>
                  <button 
                    onClick={() => setShowAnalysis(true)}
                    className="px-6 py-2.5 bg-white text-orange-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-50 transition-colors shadow-lg"
                  >
                    Ver Análise Completa
                  </button>
                </div>
              </div>
            </div>

            {/* Side Panel: Predictions & Info */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <TrendingUp size={14} className="text-orange-500" />
                  Tendência de Preço (30 dias)
                </h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={HISTORICAL_DATA}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                      <XAxis dataKey="date" hide />
                      <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="price" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-stone-400">
                  <span>01 MAR</span>
                  <span className="text-orange-500">HOJE: R$ 95,00</span>
                  <span>30 MAR (PREV)</span>
                </div>
              </div>

              <div className="bg-stone-900 rounded-2xl p-6 text-white shadow-xl">
                <h3 className="text-xs font-black text-white/50 uppercase tracking-widest mb-4">Dica do Especialista</h3>
                <p className="text-sm text-stone-300 leading-relaxed italic">
                  "O mercado tá agitado pro lado do Hortifruti. Quem tiver mercadoria de qualidade e souber a hora de soltar no CEASA vai fazer um bom negócio. Fica de olho no frete, que tá subindo também!"
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-bold">IAC</div>
                  <span className="text-xs font-bold">Consultor AgroBrasil</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Marketplace Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-wrap gap-4">
                <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                    <Truck size={24} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Ofertas Ativas</div>
                    <div className="text-xl font-black text-stone-900">{filteredOffers.length}</div>
                  </div>
                </div>
                <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    <Store size={24} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Demandas Varejo</div>
                    <div className="text-xl font-black text-stone-900">45 Novas</div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowMap(true)}
                  className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm flex items-center gap-4 hover:border-orange-500 transition-all group"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-all">
                    <MapPin size={24} />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Mapa Regional</div>
                    <div className="text-xs font-black text-stone-900">Ver Produtores</div>
                  </div>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-3 rounded-2xl border transition-all flex items-center gap-2 font-bold text-sm ${showFilters ? 'bg-orange-600 border-orange-600 text-white' : 'bg-white border-stone-200 text-stone-600 hover:border-orange-500'}`}
                >
                  <Filter size={18} />
                  Filtros
                </button>
                {currentUser?.role === UserRole.PRODUCER && (
                  <button 
                    onClick={() => setIsAddingOffer(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-2xl font-bold text-sm hover:bg-stone-800 transition-all shadow-lg shadow-stone-200"
                  >
                    <Plus size={18} />
                    ANUNCIAR MINHA SAFRA
                  </button>
                )}
              </div>
            </div>

            {/* Filters Bar */}
            {showFilters && (
              <div className="bg-white border border-stone-200 p-6 rounded-3xl shadow-sm animate-in slide-in-from-top-4 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Busca</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                      <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Produto ou local..."
                        className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Tipo de Cultivo</label>
                    <select 
                      value={filters.type}
                      onChange={(e) => setFilters({...filters, type: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    >
                      <option value="all">Todos os Tipos</option>
                      <option value="organic">Apenas Orgânicos</option>
                      <option value="conventional">Convencional</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Status</label>
                    <select 
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                    >
                      <option value="all">Todos os Status</option>
                      <option value="available">Disponível</option>
                      <option value="sold">Vendido</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Distância Máxima: {filters.maxDistance}km</label>
                    <input 
                      type="range" 
                      min="5" 
                      max="200" 
                      step="5"
                      value={filters.maxDistance}
                      onChange={(e) => setFilters({...filters, maxDistance: Number(e.target.value)})}
                      className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-stone-400 mt-1">
                      <span>5km</span>
                      <span>200km</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Marketplace Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Producer Offers */}
              <div className="space-y-6">
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest flex items-center gap-2">
                  <Truck size={18} className="text-green-500" />
                  Ofertas de Produtores (Região)
                </h3>
                <div className="space-y-4">
                  {filteredOffers.length > 0 ? (
                    filteredOffers.map(offer => {
                      const mockDistance = (offer.id.length % 50) + 5;
                      return (
                        <div key={offer.id} className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-green-500 transition-all cursor-pointer group shadow-sm">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-lg font-black text-stone-900 group-hover:text-green-600 transition-colors">{offer.product}</h4>
                              <p className="text-xs text-stone-500 font-medium">{offer.location} • {offer.isOrganic ? 'Orgânico' : 'Convencional'} • {mockDistance}km</p>
                            </div>
                            <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase ${
                              offer.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'
                            }`}>
                              {offer.status === 'available' ? 'Disponível' : 'Vendido'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between border-t border-stone-100 pt-4">
                            <div className="flex gap-4">
                              <div>
                                <div className="text-[10px] font-bold text-stone-400 uppercase">Qtd</div>
                                <div className="text-sm font-black">{offer.quantity}{offer.unit}</div>
                              </div>
                              <div>
                                <div className="text-[10px] font-bold text-stone-400 uppercase">Preço</div>
                                <div className="text-sm font-black text-green-600">R$ {offer.price.toFixed(2)}/{offer.unit}</div>
                              </div>
                            </div>
                            <button className="p-2 bg-stone-50 rounded-xl text-stone-400 group-hover:text-green-600 group-hover:bg-green-50 transition-all">
                              <ArrowRight size={20} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-12 text-center text-stone-400 text-sm bg-white rounded-2xl border border-dashed border-stone-200">
                      Nenhuma oferta encontrada com os filtros selecionados.
                    </div>
                  )}
                </div>
              </div>

              {/* Retailer Demands */}
              <div className="space-y-6">
                <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest flex items-center gap-2">
                  <Store size={18} className="text-blue-500" />
                  Demandas de Hortifrutis & Sacolões
                </h3>
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-stone-900 rounded-2xl p-5 border border-stone-800 hover:border-blue-500 transition-all cursor-pointer group shadow-xl">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors">Hortifruti Real RJ</h4>
                          <p className="text-xs text-stone-400 font-medium">Rio de Janeiro • Centro</p>
                        </div>
                        <div className="flex items-center gap-1 text-blue-400 text-[10px] font-black uppercase">
                          <Info size={12} /> URGENTE
                        </div>
                      </div>
                      <div className="bg-stone-800/50 rounded-xl p-3 mb-4">
                        <p className="text-xs text-stone-300 font-medium leading-relaxed">
                          "Buscamos fornecedores de Alface e Tomate para entrega semanal. Pagamento à vista na descarga."
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-stone-800 pt-4">
                        <div className="flex gap-4">
                          <div>
                            <div className="text-[10px] font-bold text-stone-500 uppercase">Volume</div>
                            <div className="text-sm font-black text-white">Grande</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-stone-500 uppercase">Frequência</div>
                            <div className="text-sm font-black text-blue-400">Semanal</div>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-all">
                          Candidatar-se
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAnalysis && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h3 className="font-black text-stone-900 uppercase tracking-tight">Análise de Mercado IAC</h3>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Inteligência Preditiva</p>
                </div>
              </div>
              <button onClick={() => setShowAnalysis(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                <X size={20} className="text-stone-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <section>
                <h4 className="text-sm font-black text-stone-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <TrendingUp size={16} className="text-orange-500" />
                  Panorama Geral
                </h4>
                <p className="text-stone-600 leading-relaxed text-sm">
                  O mercado de hortifruti no CEASA-RJ apresenta uma volatilidade moderada nesta semana. A oferta de produtos folhosos está estável, enquanto frutos como tomate e pimentão mostram sinais de pressão inflacionária devido às chuvas nas regiões produtoras serranas.
                </p>
              </section>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-1">Oportunidade</span>
                  <p className="text-sm font-bold text-green-600">Batata Inglesa em queda</p>
                  <p className="text-[10px] text-stone-500 mt-1">Momento ideal para estocagem de curto prazo.</p>
                </div>
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-1">Alerta</span>
                  <p className="text-sm font-bold text-red-600">Escassez de Tomate</p>
                  <p className="text-[10px] text-stone-500 mt-1">Previsão de alta contínua nos próximos 15 dias.</p>
                </div>
              </div>

              <section>
                <h4 className="text-sm font-black text-stone-900 uppercase tracking-widest mb-4">Recomendações Estratégicas</h4>
                <ul className="space-y-3">
                  {[
                    "Diversificar fornecedores para mitigar riscos de quebra de safra local.",
                    "Ajustar margens de lucro nos itens de alta volatilidade (Tomate/Cebola).",
                    "Priorizar compras diretas de produtores de Cachoeiras de Macacu para reduzir frete."
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm text-stone-600">
                      <div className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold">{i+1}</div>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="p-6 bg-stone-50 border-t border-stone-100 flex justify-end">
              <button 
                onClick={() => setShowAnalysis(false)}
                className="px-8 py-3 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 transition-all"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {showMap && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-black text-stone-900 uppercase tracking-tight">Mapa de Produtores Regionais</h3>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Conexão Direta: Cachoeiras de Macacu & Região</p>
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
                      <div className="absolute -inset-4 bg-blue-500/20 rounded-full animate-ping"></div>
                      <div className="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center z-10 relative">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white px-2 py-1 rounded-md shadow-sm border border-stone-200 whitespace-nowrap">
                        <span className="text-[8px] font-black uppercase text-blue-600">Sua Localização</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Producer Markers */}
                {[
                  { id: 1, name: 'Sítio das Flores', product: 'Brócolis', top: '30%', left: '40%', color: 'bg-green-600', icon: Leaf },
                  { id: 2, name: 'Fazenda Sol Nascente', product: 'Milho', top: '60%', left: '35%', color: 'bg-orange-600', icon: Wheat },
                  { id: 3, name: 'Recanto Verde', product: 'Morango', top: '45%', left: '65%', color: 'bg-red-600', icon: Apple },
                  { id: 4, name: 'Horta do Vale', product: 'Alface', top: '25%', left: '70%', color: 'bg-emerald-600', icon: Leaf },
                  { id: 5, name: 'Agro Macacu', product: 'Tomate', top: '70%', left: '55%', color: 'bg-red-500', icon: Apple },
                ].map((producer) => (
                  <div 
                    key={producer.id}
                    className="absolute cursor-pointer group"
                    style={{ top: producer.top, left: producer.left }}
                  >
                    <div className="relative">
                      <div className={`w-10 h-10 ${producer.color} rounded-xl border-2 border-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <producer.icon size={20} className="text-white" />
                      </div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        <div className="bg-white p-3 rounded-2xl shadow-xl border border-stone-100 min-w-[150px]">
                          <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">{producer.product}</div>
                          <div className="text-sm font-black text-stone-900">{producer.name}</div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-green-600">Disponível</span>
                            <ArrowRight size={12} className="text-stone-400" />
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
                  <h4 className="text-xs font-black text-stone-900 uppercase tracking-widest mb-3">Legenda de Culturas</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shadow-sm">
                        <Leaf size={16} className="text-white" />
                      </div>
                      <span className="text-[10px] font-black text-stone-600 uppercase tracking-wider">Hortaliças & Folhosas</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center shadow-sm">
                        <Wheat size={16} className="text-white" />
                      </div>
                      <span className="text-[10px] font-black text-stone-600 uppercase tracking-wider">Grãos & Cereais</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-sm">
                        <Apple size={16} className="text-white" />
                      </div>
                      <span className="text-[10px] font-black text-stone-600 uppercase tracking-wider">Frutas & Pomares</span>
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

            <div className="p-6 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-stone-200 flex items-center justify-center text-[10px] font-bold text-stone-600">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-xs font-bold text-stone-500">24 produtores ativos nesta região</span>
              </div>
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

export default MarketView;
