import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Sector, LineChart, Line, AreaChart, Area, LabelList
} from 'recharts';
import { DollarSign, TrendingUp, Package, Store, ArrowUpRight, ArrowDownRight, Activity, Calendar, AlertTriangle, Layers, Wallet, CloudRain, Thermometer, CloudFog, History, Sprout, Zap, Battery, BatteryCharging, Sun, Plug, Leaf, X, ChevronRight, FileText } from 'lucide-react';

// Data Imports
import { 
  REVENUE_BY_STORE, 
  STOCK_DATA, 
  REVENUE_HISTORY, 
  RAIN_COMPARISON, 
  RECENT_TRANSACTIONS, 
  ENERGY_GENERATION_DATA,
  STORE_HISTORY_DETAILS
} from '../data/mockData';

const LOW_STOCK_THRESHOLD = 100;

// --- Custom Components ---

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-stone-200 p-4 rounded-xl shadow-xl z-50">
        <p className="text-gray-500 text-xs font-bold uppercase mb-1">{label}</p>
        <p className="text-xl font-bold text-farm-700">
          {payload[0].name === 'value' && payload[0].payload.day 
            ? `R$ ${payload[0].value.toLocaleString('pt-BR')}` // Line Chart Finance
            : payload[0].dataKey === 'solar' 
              ? `${payload[0].value} kW` // Energy Chart
              : `${payload[0].value.toLocaleString('pt-BR')} ${payload[0].name === 'value' ? 'unid/ton' : 'mm'}` // Others
          }
        </p>
        {payload[1] && (
            <p className="text-sm font-bold text-gray-400 mt-1">
                {payload[1].name === 'consumption' ? `Consumo: ${payload[1].value} kW` : `Anterior: ${payload[1].value}`}
            </p>
        )}
      </div>
    );
  }
  return null;
};

// --- Premium Card Icon Component ---
const CardIcon3D = ({ type }: { type: 'revenue' | 'sales' | 'stock' }) => {
  const config = {
    revenue: {
      icon: DollarSign,
      bg: 'bg-gradient-to-br from-emerald-400 to-green-600',
      shadow: 'shadow-green-500/50',
      iconColor: 'text-white'
    },
    sales: {
      icon: Wallet,
      bg: 'bg-gradient-to-br from-blue-400 to-indigo-600',
      shadow: 'shadow-blue-500/50',
      iconColor: 'text-white'
    },
    stock: {
      icon: Layers,
      bg: 'bg-gradient-to-br from-amber-400 to-orange-600',
      shadow: 'shadow-orange-500/50',
      iconColor: 'text-white'
    }
  }[type];

  const Icon = config.icon;

  return (
    <div className={`relative w-20 h-20 rounded-2xl ${config.bg} flex items-center justify-center shadow-2xl ${config.shadow} transform rotate-3 hover:rotate-0 transition-transform duration-500 group`}>
      <div className="absolute inset-0 bg-white/20 rounded-2xl pointer-events-none border border-white/30 backdrop-blur-[1px]"></div>
      <div className="absolute inset-2 bg-gradient-to-tl from-black/10 to-transparent rounded-xl"></div>
      <Icon size={40} className={`${config.iconColor} drop-shadow-md relative z-10`} strokeWidth={2} />
    </div>
  );
};

const FarmDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'finance' | 'history' | 'energy'>('finance');
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  
  const batteryLevel = 78; // %
  const isCharging = true;

  const totalRevenue = useMemo(() => REVENUE_BY_STORE.reduce((acc, curr) => acc + curr.value, 0), []);
  const totalStock = useMemo(() => STOCK_DATA.reduce((acc, curr) => acc + curr.value, 0), []);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
    const isLowStock = value < LOW_STOCK_THRESHOLD;

    return (
      <g>
        <text x={cx} y={cy} dy={-20} textAnchor="middle" fill="#374151" className="text-lg font-bold">
          {payload.name}
        </text>
        <text x={cx} y={cy} dy={5} textAnchor="middle" fill={isLowStock ? "#dc2626" : "#6b7280"} className="text-sm font-medium">
          {value} ton
        </text>
        {isLowStock && (
           <text x={cx} y={cy} dy={25} textAnchor="middle" fill="#dc2626" className="text-[10px] uppercase font-bold tracking-widest">
             ⚠️ Baixo Estoque
           </text>
        )}
        <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={isLowStock ? '#ef4444' : fill} />
        <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 10} outerRadius={outerRadius + 12} fill={isLowStock ? '#ef4444' : fill} />
      </g>
    );
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 md:p-8 animate-fade-in pb-24 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-farm-900 mb-2 flex items-center gap-3">
            <Activity className="text-farm-600" />
            Minha Fazenda
          </h2>
          <p className="text-stone-500 font-medium">Central de inteligência, finanças e infraestrutura.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl border border-stone-200 shadow-sm flex-wrap gap-1">
            <button 
                onClick={() => setActiveTab('finance')}
                className={`px-3 md:px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'finance' ? 'bg-farm-100 text-farm-700' : 'text-stone-500 hover:text-stone-700'}`}
            >
                <DollarSign size={16} /> <span className="hidden md:inline">Financeiro</span>
            </button>
            <button 
                onClick={() => setActiveTab('history')}
                className={`px-3 md:px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-blue-100 text-blue-700' : 'text-stone-500 hover:text-stone-700'}`}
            >
                <History size={16} /> <span className="hidden md:inline">Clima & Safra</span>
            </button>
            <button 
                onClick={() => setActiveTab('energy')}
                className={`px-3 md:px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'energy' ? 'bg-amber-100 text-amber-700' : 'text-stone-500 hover:text-stone-700'}`}
            >
                <Zap size={16} /> Energia Solar
            </button>
        </div>
      </div>

      {/* FINANCE TAB CONTENT */}
      {activeTab === 'finance' && (
        <div className="animate-slide-up">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm relative overflow-visible group hover:border-farm-300 hover:shadow-lg transition-all duration-300">
                    <div className="absolute -top-6 -right-6 scale-75 md:scale-90 group-hover:scale-100 transition-transform duration-300">
                        <CardIcon3D type="revenue" />
                    </div>
                    <div className="relative z-10 pt-4">
                        <div className="flex items-center gap-2 text-farm-600 mb-2 text-xs uppercase tracking-widest font-bold">Faturamento Hoje</div>
                        <div className="text-4xl font-bold text-stone-900 mb-2 tracking-tight">R$ {totalRevenue.toLocaleString('pt-BR')},00</div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="flex items-center text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-100 font-bold text-xs"><ArrowUpRight size={14} /> +12.5%</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm relative overflow-visible group hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                    <div className="absolute -top-6 -right-6 scale-75 md:scale-90 group-hover:scale-100 transition-transform duration-300">
                        <CardIcon3D type="sales" />
                    </div>
                    <div className="relative z-10 pt-4">
                        <div className="flex items-center gap-2 text-blue-600 mb-2 text-xs uppercase tracking-widest font-bold">Vendas Realizadas</div>
                        <div className="text-4xl font-bold text-stone-900 mb-2 tracking-tight">342</div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="flex items-center text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-100 font-bold text-xs"><ArrowUpRight size={14} /> +5.2%</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm relative overflow-visible group hover:border-amber-300 hover:shadow-lg transition-all duration-300">
                    <div className="absolute -top-6 -right-6 scale-75 md:scale-90 group-hover:scale-100 transition-transform duration-300">
                        <CardIcon3D type="stock" />
                    </div>
                    <div className="relative z-10 pt-4">
                        <div className="flex items-center gap-2 text-amber-600 mb-2 text-xs uppercase tracking-widest font-bold">Estoque Total</div>
                        <div className="text-4xl font-bold text-stone-900 mb-2 tracking-tight">{totalStock.toLocaleString('pt-BR')} ton</div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="flex items-center text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 font-bold text-xs"><ArrowDownRight size={14} /> -2.1%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Historical Revenue Chart */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm mb-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                    <Calendar className="text-farm-600" size={20} />
                    Desempenho Semanal (Últimos 7 dias)
                    </h3>
                </div>
                <div className="w-full h-[250px] flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={REVENUE_HISTORY} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                        <XAxis dataKey="day" stroke="#9ca3af" tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
                        <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(53, 173, 115, 0.2)', strokeWidth: 2 }} />
                        <Line type="monotone" dataKey="value" stroke="#35ad73" strokeWidth={4} dot={{ r: 4, fill: '#fff', stroke: '#35ad73', strokeWidth: 3 }} activeDot={{ r: 7, fill: '#35ad73', stroke: '#fff', strokeWidth: 2 }}>
                            <LabelList dataKey="value" position="top" offset={10} formatter={(val: number) => `${(val/1000).toFixed(1)}k`} style={{ fontSize: '11px', fontWeight: 'bold', fill: '#35ad73' }} />
                        </Line>
                    </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2"><TrendingUp className="text-farm-600" size={20} /> Faturamento por Loja (Hoje)</h3>
                    </div>
                    <div className="w-full h-[350px] flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={REVENUE_BY_STORE} margin={{ top: 30, right: 10, left: 0, bottom: 0 }} barSize={60}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                            <XAxis 
                              dataKey="name" 
                              stroke="#9ca3af" 
                              tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 600 }} 
                              axisLine={false} 
                              tickLine={false} 
                              dy={10}
                              interval={0}
                            />
                            <YAxis stroke="#9ca3af" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
                            <RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} content={<CustomTooltip />} />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                {REVENUE_BY_STORE.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                                <LabelList dataKey="value" position="top" formatter={(val: number) => `R$ ${(val/1000).toFixed(1)}k`} style={{ fontSize: '11px', fontWeight: 'bold', fill: '#6b7280' }} />
                            </Bar>
                        </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-stone-800 mb-2 flex items-center gap-2"><Package className="text-amber-500" size={20} /> Estoque por Produto</h3>
                    <div className="w-full h-[350px] relative flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={STOCK_DATA} cx="50%" cy="50%" innerRadius={70} outerRadius={100} fill="#8884d8" dataKey="value" onMouseEnter={onPieEnter} paddingAngle={5} stroke="none" label={({name, value}) => `${name}: ${value}t`} {...{ activeIndex, activeShape: renderActiveShape } as any}>
                                {STOCK_DATA.map((entry, index) => {
                                    const isLowStock = entry.value < LOW_STOCK_THRESHOLD;
                                    return <Cell key={`cell-${index}`} fill={isLowStock ? '#ef4444' : entry.color} stroke={isLowStock ? '#b91c1c' : 'none'} strokeWidth={isLowStock ? 2 : 0} />
                                })}
                            </Pie>
                        </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center mt-2">
                        <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-100 font-bold">
                        <AlertTriangle size={12} />
                        <span>Itens em vermelho: Abaixo de {LOW_STOCK_THRESHOLD} ton</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction List */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2"><Store className="text-blue-500" size={20} /> Últimas Movimentações (Por Loja)</h3>
                <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="text-xs text-stone-400 uppercase tracking-widest border-b border-stone-100">
                        <th className="pb-4 pl-4 font-bold">Loja / Canal</th>
                        <th className="pb-4 font-bold">Produto</th>
                        <th className="pb-4 font-bold">Horário</th>
                        <th className="pb-4 font-bold">Valor</th>
                        <th className="pb-4 pr-4 font-bold text-right">Status</th>
                    </tr>
                    </thead>
                    <tbody className="text-sm">
                    {RECENT_TRANSACTIONS.map((tx) => (
                        <tr key={tx.id} className="group hover:bg-stone-50 transition-colors border-b border-stone-100 last:border-0">
                        <td className="py-4 pl-4 font-bold text-stone-700 transition-colors">
                            <button onClick={() => setSelectedStore(tx.store)} className="hover:text-farm-600 hover:underline flex items-center gap-2 text-left" title="Ver histórico desta loja">
                                {tx.store}
                                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-farm-500" />
                            </button>
                        </td>
                        <td className="py-4 text-stone-600 font-medium">{tx.product}</td>
                        <td className="py-4 text-stone-400 font-mono text-xs">{tx.time}</td>
                        <td className="py-4 font-bold text-stone-800">{tx.value}</td>
                        <td className="py-4 pr-4 text-right">
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${tx.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                            {tx.status === 'completed' ? 'Concluído' : 'Pendente'}
                            </span>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
      )}

      {/* HISTORY & WEATHER TAB */}
      {activeTab === 'history' && (
          <div className="animate-slide-up space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-3xl relative overflow-hidden shadow-lg shadow-blue-500/20">
                      <div className="absolute top-0 right-0 p-8 opacity-20"><Thermometer size={100} /></div>
                      <div className="relative z-10">
                          <div className="text-xs uppercase tracking-widest font-bold text-blue-200 mb-2">Acúmulo de Horas de Frio</div>
                          <div className="text-4xl font-bold mb-1">320h</div>
                          <div className="text-sm text-blue-100 font-medium mb-4">Abaixo de 7.2°C (Inverno 2024)</div>
                          <div className="bg-white/20 rounded-lg p-3 text-xs backdrop-blur-sm">Ideal para a dormência de frutíferas de clima temperado (Maçã, Uva).</div>
                      </div>
                  </div>

                  <div className="bg-white border border-stone-200 p-6 rounded-3xl shadow-sm flex flex-col justify-center relative">
                      <div className="flex items-center justify-between mb-4">
                          <div><div className="text-xs uppercase tracking-widest font-bold text-stone-400 mb-1">Ponto de Orvalho</div><div className="text-3xl font-bold text-stone-800">14°C</div></div>
                          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500"><CloudFog size={24} /></div>
                      </div>
                      <div className="text-xs text-stone-500 font-medium">Indica a temperatura em que o vapor d'água condensa. Alta umidade no ar.</div>
                  </div>

                  <div className="bg-white border border-stone-200 p-6 rounded-3xl shadow-sm flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-4">
                          <div><div className="text-xs uppercase tracking-widest font-bold text-stone-400 mb-1">Chuva Acumulada (Safra)</div><div className="text-3xl font-bold text-stone-800">1.250mm</div></div>
                          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500"><CloudRain size={24} /></div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full w-fit"><ArrowUpRight size={14} /> 15% acima de 2023</div>
                  </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                  <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2"><CloudRain className="text-blue-500" size={20} /> Comparativo Pluviométrico (Safra Atual vs Anterior)</h3>
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={RAIN_COMPARISON} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                            <RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} content={<CustomTooltip />} />
                            <Bar dataKey="current" name="Safra 2024" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                            <Bar dataKey="past" name="Safra 2023" fill="#e5e7eb" radius={[4, 4, 0, 0]} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl">
                      <h4 className="flex items-center gap-2 font-bold text-amber-800 mb-3"><AlertTriangle size={18} /> Alerta de Manejo</h4>
                      <p className="text-amber-900/80 text-sm leading-relaxed mb-4">O volume de chuvas está <strong>superior</strong> ao ano passado neste período. A umidade foliar prolongada aumenta o risco de doenças fúngicas.</p>
                      <div className="bg-white/60 p-3 rounded-lg text-sm text-amber-800 font-medium"><strong>Recomendação:</strong> Reduzir intervalo de pulverização preventiva e monitorar ponto de orvalho diariamente.</div>
                  </div>
                  <div className="bg-farm-50 border border-farm-100 p-6 rounded-2xl">
                      <h4 className="flex items-center gap-2 font-bold text-farm-800 mb-3"><Sprout size={18} /> Potencial Produtivo</h4>
                      <p className="text-farm-900/80 text-sm leading-relaxed">O acúmulo de horas de frio foi excelente para a dormência das culturas de inverno. Espera-se uma brotação uniforme e vigorosa na primavera.</p>
                  </div>
              </div>
          </div>
      )}

      {/* ENERGY TAB */}
      {activeTab === 'energy' && (
          <div className="animate-slide-up space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-stone-200 p-6 rounded-3xl shadow-sm relative overflow-hidden group hover:border-green-300 transition-colors">
                      <div className="flex justify-between items-start mb-6">
                          <div><div className="flex items-center gap-2 text-farm-600 font-bold text-xs uppercase tracking-widest mb-1"><Battery size={14} /> Baterias</div><div className="text-3xl font-bold text-stone-900">{batteryLevel}%</div></div>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCharging ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>{isCharging ? <BatteryCharging size={20} /> : <Battery size={20} />}</div>
                      </div>
                      <div className="w-full h-12 bg-stone-100 rounded-xl relative overflow-hidden border border-stone-200 mb-3">
                          <div className={`h-full transition-all duration-1000 ease-out ${isCharging ? 'bg-gradient-to-r from-farm-400 to-farm-500' : 'bg-amber-400'}`} style={{ width: `${batteryLevel}%` }}>{isCharging && <div className="absolute inset-0 bg-white/30 animate-pulse"></div>}</div>
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-stone-500 mix-blend-multiply">{batteryLevel}% CARGA</div>
                      </div>
                      <div className="flex justify-between items-center text-xs font-medium text-stone-500"><span>Autonomia Estimada: <strong>12h 30m</strong></span><span className={isCharging ? "text-green-600 font-bold" : "text-amber-600"}>{isCharging ? "CARREGANDO VIA SOLAR" : "EM USO"}</span></div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white p-6 rounded-3xl shadow-lg shadow-orange-500/20 relative overflow-hidden">
                      <div className="absolute -right-6 -top-6 text-white/20"><Sun size={120} className="animate-spin-slow" /></div>
                      <div className="relative z-10">
                          <div className="flex items-center gap-2 text-white/80 font-bold text-xs uppercase tracking-widest mb-2"><Sun size={14} /> Geração Solar</div>
                          <div className="text-4xl font-bold mb-1">12.4 kW</div>
                          <div className="text-orange-100 text-sm font-medium mb-6">Potência Instantânea</div>
                          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex justify-between items-center"><div><div className="text-[10px] uppercase text-orange-100 font-bold">Produção Hoje</div><div className="font-bold text-lg">45.2 kWh</div></div><div className="text-right"><div className="text-[10px] uppercase text-orange-100 font-bold">Eficiência</div><div className="font-bold text-lg">94%</div></div></div>
                      </div>
                  </div>

                  <div className="bg-white border border-stone-200 p-6 rounded-3xl shadow-sm relative overflow-hidden">
                       <div className="flex justify-between items-start mb-4">
                          <div><div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-1"><Plug size={14} /> Rede & Consumo</div><div className="text-3xl font-bold text-stone-900">6.1 kW</div><div className="text-xs text-stone-500 font-medium">Consumo Atual da Propriedade</div></div>
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center"><Zap size={20} /></div>
                       </div>
                       <div className="space-y-3">
                           <div className="flex justify-between items-center p-2 bg-stone-50 rounded-lg border border-stone-100"><span className="text-xs font-bold text-stone-500">Origem da Energia</span><span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">100% SOLAR</span></div>
                           <div className="flex justify-between items-center p-2 bg-stone-50 rounded-lg border border-stone-100"><span className="text-xs font-bold text-stone-500">Status da Rede</span><span className="text-xs font-bold text-blue-600">CONECTADA</span></div>
                       </div>
                  </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2"><Zap className="text-amber-500" size={20} /> Curva de Produção Solar vs. Consumo (Hoje)</h3>
                      <div className="flex gap-4"><div className="flex items-center gap-2 text-xs font-bold text-stone-500"><div className="w-3 h-3 bg-amber-400 rounded-full"></div> Geração (kW)</div><div className="flex items-center gap-2 text-xs font-bold text-stone-500"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Consumo (kW)</div></div>
                  </div>
                  <div className="w-full h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={ENERGY_GENERATION_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/><stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/></linearGradient>
                                <linearGradient id="colorConsumo" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                            </defs>
                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} unit=" kW"/>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="solar" stroke="#fbbf24" strokeWidth={3} fillOpacity={1} fill="url(#colorSolar)" />
                            <Area type="monotone" dataKey="consumption" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorConsumo)" />
                        </AreaChart>
                    </ResponsiveContainer>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-xl text-green-600"><Leaf size={24} /></div>
                    <div><div className="text-xs uppercase font-bold text-green-600">Sustentabilidade</div><div className="text-lg font-bold text-green-800">120kg de CO2 evitados</div><div className="text-xs text-green-700">Equivalente a 5 árvores plantadas hoje.</div></div>
                 </div>
                 <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><Wallet size={24} /></div>
                    <div><div className="text-xs uppercase font-bold text-blue-600">Economia Estimada</div><div className="text-lg font-bold text-blue-800">R$ 1.250,00</div><div className="text-xs text-blue-700">Economia na conta de luz este mês.</div></div>
                 </div>
              </div>
          </div>
      )}

      {/* Store History Modal */}
      {selectedStore && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-slide-up border border-stone-200">
              <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-white border border-stone-200 rounded-lg text-farm-600"><Store size={24} /></div>
                    <div><h3 className="font-bold text-stone-800 text-lg">{selectedStore}</h3><p className="text-xs text-stone-500 font-medium uppercase tracking-wide">Extrato de Movimentações</p></div>
                 </div>
                 <button onClick={() => setSelectedStore(null)} className="text-stone-400 hover:text-stone-600 hover:bg-stone-200/50 p-2 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                 {STORE_HISTORY_DETAILS[selectedStore] ? (
                    <div className="space-y-4">
                       <table className="w-full text-left">
                          <thead><tr className="text-xs uppercase text-stone-400 font-bold tracking-wider border-b border-stone-100"><th className="pb-3 pl-2">Data</th><th className="pb-3">Descrição / Produto</th><th className="pb-3 text-right pr-2">Valor</th></tr></thead>
                          <tbody className="text-sm">
                             {STORE_HISTORY_DETAILS[selectedStore].map((item, idx) => (
                                <tr key={idx} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                                   <td className="py-3 pl-2 font-mono text-stone-500 text-xs">{item.date}</td>
                                   <td className="py-3 text-stone-800 font-medium">{item.product}{item.type === 'out' && <span className="ml-2 text-[10px] text-red-500 bg-red-50 px-1 py-0.5 rounded font-bold uppercase">Saída</span>}</td>
                                   <td className={`py-3 pr-2 text-right font-bold ${item.type === 'out' ? 'text-red-600' : 'text-green-600'}`}>{item.value}</td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-stone-400"><FileText size={48} className="mb-4 opacity-50" /><p className="font-medium">Nenhum histórico disponível para esta loja.</p></div>
                 )}
              </div>
              <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex justify-between items-center">
                 <span className="text-xs text-stone-500 font-medium">Exibindo últimos lançamentos</span>
                 <button onClick={() => setSelectedStore(null)} className="px-4 py-2 bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold rounded-lg text-sm transition-colors">Fechar</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default FarmDashboard;