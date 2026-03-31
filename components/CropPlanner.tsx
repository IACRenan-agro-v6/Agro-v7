import React, { useState } from 'react';
import { toast } from 'sonner';
import { Search, Calendar, Droplets, Sprout, Bug, Shovel, Clock, CheckCircle2, ArrowRight, BarChart3, Share2, MapPin, AlertTriangle, Thermometer, Loader2 } from 'lucide-react';
import { generateCropPlan } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { CropPlan, UserLocation, ViewMode } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CropPlannerProps {
  userLocation: UserLocation | null;
  setView?: (view: ViewMode) => void;
}

const CropPlanner: React.FC<CropPlannerProps> = ({ userLocation, setView }) => {
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem('agro_planner_searchTerm') || '';
  });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<CropPlan | null>(() => {
    const saved = localStorage.getItem('agro_planner_plan');
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Agenda State
  const [plantingDate, setPlantingDate] = useState(() => {
    return localStorage.getItem('agro_planner_plantingDate') || '';
  });

  // Persist state
  React.useEffect(() => {
    localStorage.setItem('agro_planner_searchTerm', searchTerm);
    if (plan) {
      localStorage.setItem('agro_planner_plan', JSON.stringify(plan));
    } else {
      localStorage.removeItem('agro_planner_plan');
    }
    localStorage.setItem('agro_planner_plantingDate', plantingDate);
  }, [searchTerm, plan, plantingDate]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setPlan(null);
    setError('');
    setPlantingDate(''); // Reset date on new search

    try {
      const result = await generateCropPlan(searchTerm, userLocation);
      if (result) {
        setPlan(result);
      } else {
        setError('Não consegui encontrar informações suficientes para essa cultura. Tente ser mais específico.');
      }
    } catch (err) {
      setError('Ocorreu um erro ao gerar o relatório. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (!plan) return;

    const shareText = `🌱 *Planejamento IAC Farm: ${plan.cropName}*\n` +
      `🔬 _${plan.scientificName}_\n\n` +
      `🗓️ *Ciclo:* ${plan.cycleDuration}\n` +
      `☀️ *Melhor Época:* ${plan.bestSeason}\n` +
      `💧 *Irrigação:* ${plan.irrigation.method} (${plan.irrigation.frequency})\n` +
      `🚜 *Solo Ideal:* pH ${plan.soilRequirements.ph} - ${plan.soilRequirements.texture}\n\n` +
      `_Gerado pelo assistente IAC Farm - EMATER_`;

    if (navigator.share) {
      navigator.share({
        title: `Planejamento: ${plan.cropName}`,
        text: shareText,
      }).catch((err) => console.log('Compartilhamento cancelado', err));
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Resumo copiado para a área de transferência!');
    }
  };

  const handleSave = async () => {
    if (!plan) return;
    setIsSaving(true);
    
    // Include planting date in the plan object before saving
    const planToSave = {
      ...plan,
      plantingDate: plantingDate || undefined
    };
    
    const success = await dbService.saveCropPlan(planToSave);
    setIsSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const getHarvestDates = () => {
    if (!plantingDate || !plan) return null;
    const start = new Date(plantingDate);
    const end = new Date(plantingDate);

    start.setDate(start.getDate() + plan.cycleDaysMin);
    end.setDate(end.getDate() + plan.cycleDaysMax);

    return {
      start: start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      end: end.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    };
  };

  const harvestDates = getHarvestDates();

  // Prepare chart data if plan exists
  const chartData = plan ? [
    { name: 'Nitrogênio', value: plan.soilData.nitrogen, fullMark: 10, color: '#35ad73' },
    { name: 'Fósforo', value: plan.soilData.phosphorus, fullMark: 10, color: '#f59e0b' },
    { name: 'Potássio', value: plan.soilData.potassium, fullMark: 10, color: '#a16207' },
    { name: 'pH', value: plan.soilData.phValue, fullMark: 14, color: '#3b82f6' },
  ] : [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-stone-200 p-3 rounded-lg shadow-xl z-50">
          <p className="text-gray-900 font-bold mb-1">{label}</p>
          <p className="text-sm font-medium" style={{ color: payload[0].payload.color }}>
            Valor Ideal: {payload[0].value} 
            {label === 'pH' ? '' : '/10'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 md:p-8">
      {/* Search Section */}
      <div className={`transition-all duration-500 flex flex-col items-center ${plan ? 'mb-8' : 'h-full justify-center'}`}>
        {!plan && (
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="text-3xl md:text-5xl font-bold text-farm-800 mb-3 tracking-tight">Planejamento de Safra</h2>
            <p className="text-stone-500 font-medium max-w-lg mx-auto">
              Digite a cultura e receba um relatório completo com calendário sanitário regional e manejo.
            </p>
            {userLocation && (
              <div className="mt-4 inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-xs font-bold border border-green-200 shadow-sm animate-pulse">
                <MapPin size={14} />
                <span>Localização detectada: Calendário Fitossanitário ativado para sua região.</span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSearch} className="w-full max-w-2xl relative z-20">
          <div className="relative group shadow-xl shadow-farm-900/5 rounded-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ex: Milho, Soja, Tomate Cereja, Maçã..."
              className="w-full bg-white border border-stone-200 text-stone-800 font-medium rounded-full py-5 pl-8 pr-16 focus:outline-none focus:border-farm-400 focus:ring-4 focus:ring-farm-100 transition-all placeholder:text-stone-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 p-3 bg-farm-600 rounded-full text-white hover:bg-farm-700 transition-colors disabled:opacity-50"
            >
              {loading ? <span className="animate-spin block">↻</span> : <Search size={22} />}
            </button>
          </div>
        </form>

        {loading && (
          <div className="mt-8 flex flex-col items-center animate-pulse text-farm-600">
            <Sprout size={48} className="mb-3 animate-bounce" />
            <span className="font-bold text-sm tracking-widest uppercase text-farm-700">
              {userLocation ? 'Calculando Sazonalidade Local...' : 'Analisando Dados Agronômicos...'}
            </span>
          </div>
        )}
        
        {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium">
                {error}
            </div>
        )}
      </div>

      {/* Result Dashboard */}
      {plan && (
        <div className="max-w-6xl mx-auto space-y-6 animate-slide-up pb-20">
          
          {/* Header Card */}
          <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm relative overflow-hidden">
            <div className="absolute -top-10 -right-10 p-8 opacity-[0.03] pointer-events-none">
              <Sprout size={200} className="text-farm-900" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-farm-600 font-bold text-xs uppercase tracking-widest mb-2 block bg-farm-50 w-fit px-2 py-1 rounded">Relatório Técnico</span>
                <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-2">{plan.cropName}</h1>
                <h3 className="text-xl text-stone-500 italic font-medium mb-4">{plan.scientificName}</h3>
                <p className="text-stone-600 max-w-2xl leading-relaxed text-lg">{plan.description}</p>
                {userLocation && (
                  <div className="mt-2 text-xs text-green-600 font-bold flex items-center gap-1">
                    <MapPin size={12} />
                    Relatório otimizado para sua localização atual.
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all font-medium ${saveSuccess ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'}`}
                >
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} className={saveSuccess ? 'text-white' : 'text-farm-600'} />}
                  <span>{saveSuccess ? 'Salvo!' : 'Salvar'}</span>
                </button>
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-2 bg-stone-50 hover:bg-stone-100 text-stone-700 px-5 py-3 rounded-xl border border-stone-200 transition-colors group font-medium"
                  title="Compartilhar Relatório"
                >
                  <Share2 size={18} className="text-farm-600" />
                  <span>Compartilhar</span>
                </button>
                <button 
                  onClick={() => setView?.('market')}
                  className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-xl transition-colors group font-bold shadow-lg shadow-orange-200"
                >
                  <BarChart3 size={18} />
                  <span>Ver Potencial de Mercado</span>
                </button>
              </div>
            </div>
          </div>

          {/* Agenda / Harvest Calculator */}
          <div className="bg-gradient-to-r from-farm-600 to-farm-700 p-6 rounded-3xl shadow-lg shadow-farm-600/20 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
             
             <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                   <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
                     <Calendar className="text-farm-200" /> Agenda de Safra
                   </h3>
                   <p className="text-sm text-farm-100">
                     Informe a data que você realizou o plantio para o sistema calcular a janela estimada de colheita.
                   </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/20 w-full md:w-auto backdrop-blur-sm">
                   <div className="flex flex-col gap-1 w-full sm:w-auto">
                     <label className="text-xs uppercase tracking-wider text-farm-200 font-bold pl-1">Data do Plantio</label>
                     <input 
                       type="date" 
                       value={plantingDate}
                       onChange={(e) => setPlantingDate(e.target.value)}
                       className="bg-white/20 border border-white/30 text-white rounded-lg px-4 py-2 focus:outline-none focus:bg-white/30 text-sm w-full font-bold placeholder-white/50"
                     />
                   </div>
                   
                   {harvestDates && (
                     <>
                      <ArrowRight className="text-farm-200 hidden sm:block" />
                      <div className="flex flex-col gap-1 w-full sm:w-auto">
                        <label className="text-xs uppercase tracking-wider text-farm-200 font-bold pl-1">Estimativa de Colheita</label>
                        <div className="flex items-center justify-between sm:justify-start gap-2 bg-white text-farm-800 rounded-lg px-4 py-2 text-sm font-bold w-full sm:w-auto shadow-sm">
                           <span>{harvestDates.start}</span>
                           <span className="text-gray-400 font-normal">até</span>
                           <span>{harvestDates.end}</span>
                        </div>
                      </div>
                     </>
                   )}
                </div>
             </div>
          </div>

          {/* Seasonal Disease Calendar (New Feature) */}
          {plan.seasonalRisks && plan.seasonalRisks.length > 0 && (
             <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                   <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                      <AlertTriangle size={24} />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-stone-800">Calendário Fitossanitário Regional</h3>
                      <p className="text-stone-500 text-sm">Monitoramento de doenças e pragas por período para a sua região.</p>
                   </div>
                </div>

                <div className="relative">
                   {/* Connection Line */}
                   <div className="absolute top-8 left-4 bottom-8 w-0.5 bg-stone-200 hidden md:block"></div>
                   
                   <div className="space-y-6">
                      {plan.seasonalRisks.map((risk, index) => (
                        <div key={index} className="flex flex-col md:flex-row gap-6 relative group">
                           {/* Dot on line */}
                           <div className="hidden md:block absolute left-[11px] top-8 w-3 h-3 rounded-full bg-stone-300 border-2 border-stone-50 group-hover:bg-farm-500 transition-colors z-10"></div>
                           
                           {/* Period Card */}
                           <div className="md:w-48 shrink-0">
                              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm group-hover:border-farm-300 transition-all">
                                 <div className="text-xs uppercase tracking-widest text-stone-400 font-bold mb-1">Período</div>
                                 <div className="text-farm-700 font-bold text-lg leading-tight">{risk.period}</div>
                                 <div className="text-xs bg-farm-50 text-farm-600 px-2 py-1 rounded mt-2 inline-block font-bold">
                                    {risk.stage}
                                 </div>
                              </div>
                           </div>
                           
                           {/* Risks Details */}
                           <div className="flex-1 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm group-hover:shadow-md transition-all">
                              <div className="mb-3">
                                 <span className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2 block">Pontos de Atenção</span>
                                 <div className="flex flex-wrap gap-2">
                                    {risk.risks.map((r, i) => (
                                       <span key={i} className="flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-red-100">
                                          <Bug size={14} /> {r}
                                       </span>
                                    ))}
                                 </div>
                              </div>
                              <div className="text-sm text-stone-600 border-t border-stone-100 pt-3 flex items-start gap-2">
                                 <CheckCircle2 size={16} className="text-green-500 mt-0.5 shrink-0" />
                                 <span><strong className="text-stone-800">Prevenção:</strong> {risk.prevention}</span>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-stone-200 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-3 text-farm-600">
                <div className="p-2 bg-farm-50 rounded-lg"><Calendar size={20} /></div>
                <h4 className="font-bold uppercase text-xs tracking-wider">Melhor Época</h4>
              </div>
              <p className="text-stone-800 font-semibold text-lg leading-tight">{plan.bestSeason}</p>
            </div>

            <div className="bg-white border border-stone-200 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-3 text-farm-600">
                <div className="p-2 bg-farm-50 rounded-lg"><Clock size={20} /></div>
                <h4 className="font-bold uppercase text-xs tracking-wider">Ciclo</h4>
              </div>
              <p className="text-stone-800 font-semibold text-lg leading-tight">{plan.cycleDuration}</p>
            </div>

            <div className="bg-white border border-stone-200 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-3 text-blue-500">
                <div className="p-2 bg-blue-50 rounded-lg"><Droplets size={20} /></div>
                <h4 className="font-bold uppercase text-xs tracking-wider text-blue-600">Irrigação</h4>
              </div>
              <p className="text-stone-800 font-semibold text-sm">{plan.irrigation.method}</p>
              <p className="text-stone-500 text-xs mt-1 font-medium">{plan.irrigation.frequency}</p>
            </div>

            <div className="bg-white border border-stone-200 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-3 text-wood-500">
                <div className="p-2 bg-wood-50 rounded-lg"><Shovel size={20} /></div>
                <h4 className="font-bold uppercase text-xs tracking-wider text-wood-600">Solo</h4>
              </div>
              <p className="text-stone-800 font-semibold text-sm">{plan.soilRequirements.texture}</p>
              <p className="text-stone-500 text-xs mt-1 font-medium">pH: {plan.soilRequirements.ph}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart Section */}
            <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col">
               <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
                 <BarChart3 className="text-farm-600" size={20} />
                 Análise de Nutrientes
               </h3>
               {/* Explicit height on mobile, flex on desktop */}
               <div className="w-full h-[300px] lg:flex-1 lg:min-h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#9ca3af" 
                        tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }} 
                        axisLine={false} 
                        tickLine={false} 
                        dy={10}
                      />
                      <YAxis 
                        stroke="#9ca3af" 
                        tick={{ fontSize: 11, fill: '#9ca3af' }} 
                        axisLine={false} 
                        tickLine={false}
                      />
                      <Tooltip 
                        content={<CustomTooltip />} 
                        cursor={{fill: 'rgba(0,0,0,0.03)'}}
                        wrapperStyle={{ outline: 'none' }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                 </ResponsiveContainer>
               </div>
               <div className="text-xs text-center mt-4 text-stone-400 font-medium">
                 * Níveis ideais estimados (N-P-K: escala 0-10, pH: escala 0-14)
               </div>
            </div>

            {/* Planting Steps */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
               <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
                 <span className="w-1.5 h-6 bg-farm-600 rounded-full"></span>
                 Passo a Passo do Cultivo
               </h3>
               <div className="space-y-6">
                 {plan.plantingSteps.map((step, idx) => (
                   <div key={idx} className="flex gap-4">
                     <div className="flex-shrink-0 w-8 h-8 rounded-full bg-farm-100 text-farm-700 border border-farm-200 flex items-center justify-center font-bold text-sm shadow-sm">
                       {idx + 1}
                     </div>
                     <p className="text-stone-700 text-base leading-relaxed pt-1 font-medium">{step}</p>
                   </div>
                 ))}
               </div>
            </div>

            {/* Side Details */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Pests */}
              <div className="bg-red-50 border border-red-100 p-6 rounded-2xl">
                <h4 className="flex items-center gap-2 text-red-700 font-bold mb-3">
                  <Bug size={18} /> Atenção às Pragas
                </h4>
                <ul className="space-y-2">
                  {plan.commonPests.map((pest, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-red-800 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                      {pest}
                    </li>
                  ))}
                </ul>
              </div>

               {/* Nutrients */}
               <div className="bg-wood-50 border border-wood-100 p-6 rounded-2xl">
                <h4 className="flex items-center gap-2 text-wood-700 font-bold mb-3">
                  <Sprout size={18} /> Nutrição Focada
                </h4>
                <p className="text-sm text-wood-800 font-medium leading-relaxed">
                  {plan.soilRequirements.nutrientFocus}
                </p>
              </div>

               {/* Harvest */}
               <div className="bg-farm-50 border border-farm-100 p-6 rounded-2xl">
                <h4 className="flex items-center gap-2 text-farm-700 font-bold mb-3">
                  <CheckCircle2 size={18} /> Ponto de Colheita
                </h4>
                <p className="text-sm text-farm-800 font-medium leading-relaxed">
                  {plan.harvestIndicators}
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default CropPlanner;