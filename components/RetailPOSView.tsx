
import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  User,
  History,
  Leaf,
  BarChart3,
  CheckCircle2,
  Scale,
  FileText,
  AlertTriangle,
  Zap,
  Printer,
  X
} from 'lucide-react';

interface POSItem {
  id: string;
  code: string;
  name: string;
  price: number;
  unit: string;
  isOrganic: boolean;
  stock: number;
  category: string;
}

const MOCK_INVENTORY: POSItem[] = [
  { id: '1', code: '101', name: 'Tomate Saladete', price: 6.50, unit: 'kg', isOrganic: true, stock: 45, category: 'Legumes' },
  { id: '2', code: '102', name: 'Batata Inglesa', price: 4.20, unit: 'kg', isOrganic: false, stock: 120, category: 'Raízes' },
  { id: '3', code: '103', name: 'Alface Crespa', price: 3.50, unit: 'un', isOrganic: true, stock: 30, category: 'Folhas' },
  { id: '4', code: '104', name: 'Cenoura Especial', price: 5.80, unit: 'kg', isOrganic: true, stock: 25, category: 'Raízes' },
  { id: '5', code: '105', name: 'Pimentão Verde', price: 8.90, unit: 'kg', isOrganic: false, stock: 15, category: 'Legumes' },
  { id: '6', code: '106', name: 'Banana Prata', price: 7.50, unit: 'kg', isOrganic: true, stock: 60, category: 'Frutas' },
];

const RetailPOSView: React.FC = () => {
  const [cart, setCart] = useState<{ item: POSItem; quantity: number }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isReadingScale, setIsReadingScale] = useState(false);
  const [scaleWeight, setScaleWeight] = useState<number | null>(null);
  const [emitNFCe, setEmitNFCe] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStressInfo, setShowStressInfo] = useState(false);

  const addToCart = (item: POSItem, weight?: number) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      const qtyToAdd = weight || (item.unit === 'kg' ? 1 : 1);
      
      if (existing) {
        return prev.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + qtyToAdd } : c);
      }
      return [...prev, { item, quantity: qtyToAdd }];
    });
    setScaleWeight(null);
  };

  const readScale = () => {
    setIsReadingScale(true);
    // Simulating scale reading delay
    setTimeout(() => {
      const randomWeight = parseFloat((Math.random() * 2 + 0.1).toFixed(3));
      setScaleWeight(randomWeight);
      setIsReadingScale(false);
    }, 800);
  };

  const handleFinalize = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCart([]);
      alert(emitNFCe ? "Venda finalizada! NFC-e emitida com sucesso." : "Venda finalizada!");
    }, 1500);
  };

  const filteredItems = MOCK_INVENTORY.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.code.includes(searchTerm)
  );

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(c => c.item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.item.id === id) {
        const step = c.item.unit === 'kg' ? 0.1 : 1;
        const newQty = Math.max(step, c.quantity + (delta * step));
        return { ...c, quantity: newQty };
      }
      return c;
    }));
  };

  const total = cart.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0);

  return (
    <div className="flex h-full bg-[#FDFBF7] overflow-hidden">
      {/* Inventory Section */}
      <div className="flex-1 flex flex-col border-r border-stone-200">
        <header className="p-6 bg-white border-b border-stone-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                <ShoppingCart className="text-emerald-600" />
                PDV VAREJO
              </h2>
              <p className="text-stone-500 text-sm font-medium italic">Gestão de vendas e estoque em tempo real</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowStressInfo(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors font-bold text-xs"
              >
                <Zap size={16} />
                TESTES DE ESTRESSE
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-colors font-bold text-xs">
                <Plus size={16} />
                REPOR ESTOQUE
              </button>
              <button className="p-2.5 bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 transition-colors">
                <History size={20} />
              </button>
              <button className="p-2.5 bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 transition-colors">
                <BarChart3 size={20} />
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
              <input 
                type="text" 
                placeholder="Buscar por nome ou código PLU..."
                className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-2xl px-4 py-2">
              <Scale className={`${isReadingScale ? 'animate-pulse text-emerald-500' : 'text-stone-400'}`} size={20} />
              <div className="text-right min-w-[80px]">
                <div className="text-[10px] font-black text-stone-400 uppercase">Balança</div>
                <div className="text-sm font-black text-stone-900">
                  {scaleWeight !== null ? `${scaleWeight.toFixed(3)} kg` : '0.000 kg'}
                </div>
              </div>
              <button 
                onClick={readScale}
                disabled={isReadingScale}
                className="ml-2 px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {isReadingScale ? 'Lendo...' : 'Ler Peso'}
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map(item => (
              <button 
                key={item.id}
                onClick={() => addToCart(item, item.unit === 'kg' ? (scaleWeight || undefined) : undefined)}
                className="bg-white border border-stone-200 rounded-2xl p-4 text-left hover:border-emerald-500 hover:shadow-md transition-all group relative overflow-hidden"
              >
                {item.isOrganic && (
                  <div className="absolute top-2 right-2 bg-emerald-100 text-emerald-700 p-1 rounded-lg">
                    <Leaf size={12} />
                  </div>
                )}
                <div className="flex justify-between items-start mb-1">
                  <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{item.category}</div>
                  <div className="text-[10px] font-bold text-stone-300">#{item.code}</div>
                </div>
                <div className="font-bold text-stone-900 mb-2 truncate">{item.name}</div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-lg font-black text-emerald-600">R$ {item.price.toFixed(2)}</div>
                    <div className="text-[10px] font-bold text-stone-400 uppercase">por {item.unit}</div>
                  </div>
                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.stock < 20 ? 'bg-red-100 text-red-600' : 'bg-stone-100 text-stone-600'}`}>
                    Estoque: {item.stock}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 bg-white flex flex-col shadow-2xl z-10">
        <header className="p-6 border-b border-stone-200">
          <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
            Carrinho Atual
            <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full">{cart.length}</span>
          </h3>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
              <ShoppingCart size={48} className="text-stone-300" />
              <p className="text-sm font-bold text-stone-400">O carrinho está vazio.<br/>Selecione produtos ao lado.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.item.id} className="flex items-center gap-4 bg-stone-50 p-3 rounded-2xl border border-stone-100">
                <div className="flex-1">
                  <div className="text-sm font-bold text-stone-900">{item.item.name}</div>
                  <div className="text-xs text-stone-500">R$ {item.item.price.toFixed(2)} / {item.item.unit}</div>
                </div>
                <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl p-1">
                  <button onClick={() => updateQuantity(item.item.id, -1)} className="p-1 hover:text-emerald-600"><Minus size={14} /></button>
                  <span className="text-sm font-black w-10 text-center">{item.quantity.toFixed(item.item.unit === 'kg' ? 3 : 0)}</span>
                  <button onClick={() => updateQuantity(item.item.id, 1)} className="p-1 hover:text-emerald-600"><Plus size={14} /></button>
                </div>
                <button onClick={() => removeFromCart(item.item.id)} className="text-stone-300 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-stone-50 border-t border-stone-200 space-y-4">
          <div className="flex items-center justify-between p-3 bg-white border border-stone-200 rounded-2xl">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-stone-400" />
              <span className="text-xs font-bold text-stone-600">Emitir NFC-e</span>
            </div>
            <button 
              onClick={() => setEmitNFCe(!emitNFCe)}
              className={`w-10 h-5 rounded-full transition-all relative ${emitNFCe ? 'bg-emerald-500' : 'bg-stone-300'}`}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${emitNFCe ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold text-stone-500">
              <span>Subtotal</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-black text-stone-900">
              <span>Total</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-stone-200 rounded-2xl hover:border-emerald-500 hover:text-emerald-600 transition-all group">
              <Banknote size={24} className="text-stone-400 group-hover:text-emerald-500" />
              <span className="text-[10px] font-black uppercase">Dinheiro</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-stone-200 rounded-2xl hover:border-emerald-500 hover:text-emerald-600 transition-all group">
              <CreditCard size={24} className="text-stone-400 group-hover:text-emerald-500" />
              <span className="text-[10px] font-black uppercase">Cartão/PIX</span>
            </button>
          </div>

          <button 
            disabled={cart.length === 0 || isProcessing}
            onClick={handleFinalize}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processando...
              </>
            ) : (
              'Finalizar Venda'
            )}
          </button>
        </div>
      </div>

      {/* Stress Test Modal */}
      {showStressInfo && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-stone-900">Protocolo de Testes de Estresse</h3>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Garantia de Performance em Pico de Venda</p>
                </div>
              </div>
              <button onClick={() => setShowStressInfo(false)} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <h4 className="font-bold text-stone-900 mb-2 flex items-center gap-2">
                    <BarChart3 size={16} className="text-purple-500" /> Carga Simultânea
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Simulamos 500+ transações por minuto para garantir que o banco de dados (Supabase) e a interface não travem durante horários de pico (ex: Sábado de manhã).
                  </p>
                </div>
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <h4 className="font-bold text-stone-900 mb-2 flex items-center gap-2">
                    <History size={16} className="text-purple-500" /> Latência de Balança
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Testes de resposta serial/USB para garantir que o peso seja lido em menos de 200ms, evitando filas no caixa.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-black text-stone-900 text-sm uppercase tracking-widest">Como Executar os Testes:</h4>
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                    <div>
                      <div className="font-bold text-stone-900 text-sm">Teste de Carga (k6 / JMeter)</div>
                      <p className="text-xs text-stone-500">Dispare requisições para as rotas de API de venda simulando múltiplos terminais.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                    <div>
                      <div className="font-bold text-stone-900 text-sm">Teste de Concorrência</div>
                      <p className="text-xs text-stone-500">Tente vender o último item do estoque em dois terminais ao mesmo tempo para validar o bloqueio de estoque (Race Conditions).</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                    <div>
                      <div className="font-bold text-stone-900 text-sm">Teste de Offline</div>
                      <p className="text-xs text-stone-500">Desconecte a rede e verifique se o Service Worker permite continuar operando e sincroniza as vendas ao retornar.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                <div className="flex items-center gap-2 text-amber-700 font-bold mb-1">
                  <AlertTriangle size={16} />
                  <span>Nota sobre Nota Fiscal (NFC-e)</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  A integração fiscal real requer um certificado digital (A1) e comunicação com a SEFAZ. Recomendamos o uso de APIs como Focus NFe ou PlugNotas para simplificar a assinatura e transmissão do XML.
                </p>
              </div>
            </div>

            <div className="p-6 bg-stone-50 border-t border-stone-100 flex justify-end">
              <button 
                onClick={() => setShowStressInfo(false)}
                className="px-6 py-2 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetailPOSView;
