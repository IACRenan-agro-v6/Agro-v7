
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Calendar, MapPin, AlertTriangle, CheckCircle2, ChevronRight, Flower2, Sprout, Bug, Activity, X, Loader2, RefreshCw } from 'lucide-react';
import { IdentifiedPlant, UserProfile } from '../types';
import { dbService } from '../services/dbService';
import PlantCard from './PlantCard';
import PlantSkeleton from './PlantSkeleton';

interface PlantRegistryProps {
  currentUser?: UserProfile | null;
}

const PlantRegistry: React.FC<PlantRegistryProps> = ({ currentUser }) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'healthy' | 'attention'>('all');
  const [selectedPlant, setSelectedPlant] = useState<IdentifiedPlant | null>(null);
  const [plants, setPlants] = useState<IdentifiedPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (currentUser) {
      setPage(0);
      setPlants([]);
      setHasMore(true);
      loadPlants(0);
    }
  }, [currentUser]);

  const loadPlants = async (pageNum: number) => {
    if (!currentUser) return;
    
    if (pageNum === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const data = await dbService.getPlantHistory(currentUser.id, pageNum, 20);
      
      if (data.length < 20) {
        setHasMore(false);
      }

      if (pageNum === 0) {
        setPlants(data);
      } else {
        setPlants(prev => [...prev, ...data]);
      }
    } catch (error) {
      console.error("Erro ao carregar plantas:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const lastPlantElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => {
          const nextPage = prevPage + 1;
          loadPlants(nextPage);
          return nextPage;
        });
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  const filteredPlants = useMemo(() => {
    return plants.filter(plant => {
      const matchesSearch = plant.commonName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            plant.diagnosisSummary.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterType === 'all') return matchesSearch;
      if (filterType === 'healthy') return matchesSearch && plant.healthStatus === 'healthy';
      if (filterType === 'attention') return matchesSearch && plant.healthStatus !== 'healthy';
      
      return matchesSearch;
    });
  }, [plants, searchTerm, filterType]);

  const handleRefresh = () => {
    setPage(0);
    setHasMore(true);
    loadPlants(0);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-green-200 flex items-center gap-1"><CheckCircle2 size={12}/> Saudável</span>;
      case 'diseased':
        return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-red-200 flex items-center gap-1"><AlertTriangle size={12}/> Doença</span>;
      case 'pest':
        return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-amber-200 flex items-center gap-1"><Bug size={12}/> Praga</span>;
      case 'deficiency':
        return <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-yellow-200 flex items-center gap-1"><Activity size={12}/> Nutrição</span>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 md:p-8 pb-20 bg-stone-50">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold text-farm-900 mb-2 flex items-center gap-3">
            <Flower2 className="text-farm-600" />
            Minhas Plantas
          </h2>
          <p className="text-stone-500 font-medium">Histórico de identificações e diagnósticos no banco de dados.</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto items-center">
           {/* Refresh Button */}
           <button 
             onClick={handleRefresh}
             disabled={loading}
             className="p-2.5 bg-white border border-stone-200 rounded-xl text-stone-500 hover:text-farm-600 hover:border-farm-200 transition-all shadow-sm"
             title="Atualizar Histórico"
           >
             <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
           </button>

           {/* Search */}
           <div className="relative flex-1 md:flex-none">
              <input 
                type="text" 
                placeholder="Buscar planta..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:ring-2 focus:ring-farm-100 outline-none w-full md:w-64 text-sm font-medium shadow-sm"
              />
              <Search className="absolute left-3 top-3 text-stone-400" size={16} />
           </div>

           <div className="flex bg-white p-1 rounded-xl border border-stone-200 shadow-sm">
              <button 
                onClick={() => setFilterType('all')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'all' ? 'bg-stone-800 text-white shadow-md' : 'text-stone-500 hover:text-stone-800'}`}
              >
                Todas
              </button>
              <button 
                onClick={() => setFilterType('healthy')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'healthy' ? 'bg-green-600 text-white shadow-md' : 'text-stone-500 hover:text-green-600'}`}
              >
                Saudáveis
              </button>
              <button 
                onClick={() => setFilterType('attention')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'attention' ? 'bg-red-500 text-white shadow-md' : 'text-stone-500 hover:text-red-500'}`}
              >
                Atenção
              </button>
           </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <PlantSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredPlants.map((plant, index) => {
              if (filteredPlants.length === index + 1) {
                return (
                  <div ref={lastPlantElementRef} key={plant.id}>
                    <PlantCard plant={plant} onClick={setSelectedPlant} />
                  </div>
                );
              } else {
                return <PlantCard key={plant.id} plant={plant} onClick={setSelectedPlant} />;
              }
            })}
          </motion.div>
          
          {loadingMore && (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-farm-600" size={32} />
            </div>
          )}
        </>
      )}

      {!loading && filteredPlants.length === 0 && (
         <div className="flex flex-col items-center justify-center py-20 text-stone-400">
            <Sprout size={64} className="mb-4 opacity-20" />
            <p className="font-medium text-lg">Nenhum registro encontrado no banco de dados.</p>
            <p className="text-sm opacity-60">Utilize o chat para realizar novas análises.</p>
         </div>
      )}

      <AnimatePresence>
        {selectedPlant && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4"
           >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto"
              >
               <div className="w-full md:w-2/5 relative h-64 md:h-auto bg-stone-100">
                  <img src={selectedPlant.imageUrl} alt={selectedPlant.commonName} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4">
                     <button onClick={() => setSelectedPlant(null)} className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors backdrop-blur-md md:hidden"><X size={20} /></button>
                  </div>
               </div>
               <div className="w-full md:w-3/5 p-8 overflow-y-auto relative">
                  <button onClick={() => setSelectedPlant(null)} className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors hidden md:block"><X size={24} /></button>
                  <div className="mb-6">
                     <div className="flex items-center gap-3 mb-2">
                        {getStatusBadge(selectedPlant.healthStatus)}
                        <span className="text-xs font-bold text-stone-400 flex items-center gap-1"><MapPin size={12}/> {selectedPlant.location}</span>
                        <span className="text-xs font-bold text-stone-400 flex items-center gap-1"><Calendar size={12}/> {selectedPlant.date}</span>
                     </div>
                     <h2 className="text-3xl font-bold text-stone-900 mb-1">{selectedPlant.commonName}</h2>
                     <p className="text-lg text-stone-500 italic font-serif">{selectedPlant.scientificName}</p>
                  </div>
                  <div className="space-y-6">
                     <div className={`p-5 rounded-2xl border ${selectedPlant.healthStatus === 'healthy' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                        <h4 className={`text-sm font-bold uppercase tracking-widest mb-2 ${selectedPlant.healthStatus === 'healthy' ? 'text-green-700' : 'text-red-700'}`}>Diagnóstico: {selectedPlant.diagnosisSummary}</h4>
                        <p className={`text-sm leading-relaxed ${selectedPlant.healthStatus === 'healthy' ? 'text-green-800' : 'text-red-800'}`}>{selectedPlant.fullDiagnosis}</p>
                     </div>
                     <div>
                        <h4 className="font-bold text-stone-800 mb-3 flex items-center gap-2"><Activity size={18} className="text-farm-600" /> Ações Recomendadas</h4>
                        <ul className="space-y-3">
                           <li className="flex gap-3 text-sm text-stone-600"><div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${selectedPlant.healthStatus === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div> Recomendações baseadas na análise técnica arquivada.</li>
                        </ul>
                     </div>
                  </div>
               </div>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlantRegistry;
