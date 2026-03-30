
import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Bell, 
  Shield, 
  Database, 
  Save, 
  Globe, 
  Smartphone, 
  Wifi, 
  Cpu,
  Tractor,
  Layers,
  CloudRain,
  Image as ImageIcon,
  Camera,
  Upload,
  Trash2
} from 'lucide-react';

type SettingsTab = 'general' | 'farm' | 'security' | 'integrations' | 'data';

interface SettingsProps {
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({ isDarkMode, setIsDarkMode }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isSaving, setIsSaving] = useState(false);

  // Mock State for Form Fields
  const [farmName, setFarmName] = useState('Fazenda Santa Matilde');
  const [ownerName, setOwnerName] = useState('João da Silva');
  const [totalArea, setTotalArea] = useState('1.250');
  const [mainCrop, setMainCrop] = useState('Soja');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [weatherAlerts, setWeatherAlerts] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [farmLogo, setFarmLogo] = useState<string | null>(null);

  useEffect(() => {
    const savedLogo = localStorage.getItem('farmLogo');
    if (savedLogo) {
        setFarmLogo(savedLogo);
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API Call
    setTimeout(() => {
      setIsSaving(false);
      alert("Configurações salvas com sucesso!");
    }, 1500);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const logoData = event.target.result as string;
          setFarmLogo(logoData);
          localStorage.setItem('farmLogo', logoData);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
      setFarmLogo(null);
      localStorage.removeItem('farmLogo');
  };

  const TabButton = ({ id, label, icon: Icon }: { id: SettingsTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm mb-2 ${
        activeTab === id 
          ? 'bg-farm-100 text-farm-700 font-bold shadow-sm' 
          : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="w-full h-full overflow-hidden bg-stone-50 flex flex-col md:flex-row animate-fade-in">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-stone-200 flex-shrink-0 flex flex-col h-full">
        <div className="p-6 border-b border-stone-100">
          <h2 className="text-xl font-bold text-stone-900">Configurações</h2>
          <p className="text-xs text-stone-500 mt-1">Parametrização do Sistema</p>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-2 mb-2">Geral</div>
          <TabButton id="general" label="Perfil & Conta" icon={User} />
          <TabButton id="farm" label="Dados da Fazenda" icon={Tractor} />
          
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-2 mb-2 mt-6">Sistema</div>
          <TabButton id="security" label="Segurança & Alertas" icon={Shield} />
          <TabButton id="integrations" label="Dispositivos IoT" icon={Cpu} />
          <TabButton id="data" label="Dados & Backup" icon={Database} />
        </div>

        <div className="p-4 border-t border-stone-100">
           <div className="flex items-center gap-2 text-xs text-stone-400">
              <Globe size={12} /> Versão 2.4.1 (Stable)
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 relative">
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
          
          {/* Header Action */}
          <div className="flex justify-between items-center mb-6">
             <div>
                <h1 className="text-2xl font-bold text-stone-900">
                   {activeTab === 'general' && 'Perfil & Conta'}
                   {activeTab === 'farm' && 'Dados da Propriedade'}
                   {activeTab === 'security' && 'Segurança & Notificações'}
                   {activeTab === 'integrations' && 'Integrações de Hardware'}
                   {activeTab === 'data' && 'Gerenciamento de Dados'}
                </h1>
                <p className="text-stone-500 text-sm">Gerencie as preferências que alimentam o AgroBrasil.</p>
             </div>
             <button 
               onClick={handleSave}
               disabled={isSaving}
               className="flex items-center gap-2 bg-farm-600 hover:bg-farm-700 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-farm-600/20 transition-all disabled:opacity-70"
             >
                {isSaving ? <span className="animate-spin">↻</span> : <Save size={18} />}
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
             </button>
          </div>

          {/* --- TAB: GENERAL --- */}
          {activeTab === 'general' && (
             <div className="space-y-6 animate-slide-up">
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                   <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2"><User size={20} className="text-farm-600"/> Informações do Usuário</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                         <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Nome Completo</label>
                         <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 outline-none focus:border-farm-500 font-medium"/>
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-stone-500 uppercase mb-1">E-mail de Acesso</label>
                         <input type="email" value="contato@agrobrasil.com.br" disabled className="w-full bg-stone-100 border border-stone-200 rounded-lg p-3 text-stone-500 cursor-not-allowed"/>
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Telefone / WhatsApp</label>
                         <input type="text" defaultValue="(11) 99876-5432" className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 outline-none focus:border-farm-500 font-medium"/>
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Função</label>
                         <select className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 outline-none focus:border-farm-500 font-medium">
                            <option>Administrador (Proprietário)</option>
                            <option>Gerente Operacional</option>
                            <option>Agrônomo</option>
                         </select>
                      </div>
                   </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                   <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2"><Smartphone size={20} className="text-blue-500"/> Preferências de Interface</h3>
                   <div className="flex items-center justify-between py-3 border-b border-stone-100">
                      <div>
                         <div className="font-bold text-stone-700">Modo Escuro</div>
                         <div className="text-xs text-stone-500">Ajustar interface para ambientes noturnos.</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={isDarkMode}
                          onChange={(e) => setIsDarkMode(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-farm-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-farm-600"></div>
                      </label>
                   </div>
                   <div className="flex items-center justify-between py-3">
                      <div>
                         <div className="font-bold text-stone-700">Densidade de Informação</div>
                         <div className="text-xs text-stone-500">Compactar tabelas e listas para ver mais dados.</div>
                      </div>
                      <select className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-1 text-sm font-bold text-stone-600 outline-none">
                         <option>Confortável (Padrão)</option>
                         <option>Compacto</option>
                      </select>
                   </div>
                </div>
             </div>
          )}

          {/* --- TAB: FARM --- */}
          {activeTab === 'farm' && (
             <div className="space-y-6 animate-slide-up">
                
                {/* Visual Identity Card */}
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                   <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2"><ImageIcon size={20} className="text-purple-500"/> Personalização Visual</h3>
                   
                   <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="relative group shrink-0">
                        <div className={`w-32 h-32 rounded-full border-4 border-stone-100 flex items-center justify-center overflow-hidden bg-stone-50 shadow-inner ${!farmLogo ? 'border-dashed border-stone-300' : ''}`}>
                            {farmLogo ? (
                                <img src={farmLogo} alt="Logo Fazenda" className="w-full h-full object-cover" />
                            ) : (
                                <Tractor className="text-stone-300" size={40} />
                            )}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer backdrop-blur-sm">
                           <div className="flex flex-col items-center">
                              <Camera size={24} className="mb-1" />
                              <span className="text-[10px] font-bold uppercase">Alterar</span>
                           </div>
                           <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                        </label>
                      </div>
                      
                      <div className="flex-1 text-center md:text-left">
                          <h4 className="font-bold text-stone-800 text-lg">Logo da Propriedade</h4>
                          <p className="text-sm text-stone-500 mb-4 leading-relaxed max-w-md">
                            Esta imagem será usada para personalizar a identidade do sistema. 
                            Recomendamos uma imagem PNG ou JPG quadrada (500x500px).
                          </p>
                          <div className="flex gap-3 justify-center md:justify-start">
                             <label className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors cursor-pointer flex items-center gap-2">
                                <Upload size={16} /> Carregar Imagem
                                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                             </label>
                             {farmLogo && (
                               <button 
                                 onClick={handleRemoveLogo}
                                 className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                               >
                                 <Trash2 size={16} /> Remover
                               </button>
                             )}
                          </div>
                      </div>
                   </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-start gap-4">
                   <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><Layers size={24} /></div>
                   <div>
                      <h3 className="font-bold text-blue-900 text-lg">Por que preencher estes dados?</h3>
                      <p className="text-blue-800/80 text-sm mt-1 leading-relaxed">
                         O assistente de IA (Gemini) utiliza as informações abaixo para calibrar diagnósticos de pragas, sugestões de plantio e previsões climáticas específicas para o seu microclima e tipo de solo.
                      </p>
                   </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                   <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2"><Tractor size={20} className="text-farm-600"/> Detalhes Operacionais</h3>
                   
                   <div className="grid grid-cols-1 gap-6">
                      <div>
                         <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Nome da Propriedade</label>
                         <input type="text" value={farmName} onChange={(e) => setFarmName(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 text-lg font-bold text-stone-800 outline-none focus:border-farm-500 focus:ring-4 focus:ring-farm-50"/>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                           <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Área Total (Hectares)</label>
                           <input type="number" value={totalArea} onChange={(e) => setTotalArea(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 outline-none focus:border-farm-500 font-medium"/>
                         </div>
                         <div>
                           <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Cultura Principal</label>
                           <select value={mainCrop} onChange={(e) => setMainCrop(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 outline-none focus:border-farm-500 font-medium">
                              <option>Soja</option>
                              <option>Milho</option>
                              <option>Café</option>
                              <option>Cana-de-Açúcar</option>
                              <option>Hortifruti</option>
                              <option>Pecuária (Gado de Corte)</option>
                           </select>
                         </div>
                      </div>

                      <div>
                         <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Tipo de Solo Predominante</label>
                         <select className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 outline-none focus:border-farm-500 font-medium">
                            <option>Latossolo Vermelho (Argiloso)</option>
                            <option>Argissolo (Arenoso-Argiloso)</option>
                            <option>Neossolo (Arenoso)</option>
                            <option>Terra Roxa (Alta Fertilidade)</option>
                         </select>
                         <p className="text-[10px] text-stone-400 mt-1 italic">Isso ajuda na recomendação de correção de solo.</p>
                      </div>

                      <div>
                         <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Localização (Coordenadas)</label>
                         <div className="flex gap-2">
                            <div className="relative flex-1">
                               <MapPin size={16} className="absolute left-3 top-3.5 text-stone-400" />
                               <input type="text" defaultValue="-23.550520" className="w-full pl-9 bg-stone-50 border border-stone-200 rounded-lg p-3 outline-none font-mono text-sm"/>
                            </div>
                            <div className="relative flex-1">
                               <MapPin size={16} className="absolute left-3 top-3.5 text-stone-400" />
                               <input type="text" defaultValue="-46.633308" className="w-full pl-9 bg-stone-50 border border-stone-200 rounded-lg p-3 outline-none font-mono text-sm"/>
                            </div>
                            <button className="bg-stone-100 hover:bg-stone-200 text-stone-600 px-4 rounded-lg font-bold text-xs uppercase transition-colors">Detectar</button>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {/* --- TAB: SECURITY & ALERTS --- */}
          {activeTab === 'security' && (
             <div className="space-y-6 animate-slide-up">
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                   <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2"><Bell size={20} className="text-amber-500"/> Central de Notificações</h3>
                   
                   <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
                         <div className="flex items-center gap-4">
                            <div className="bg-white p-2 rounded-lg shadow-sm text-farm-600"><Bell size={20} /></div>
                            <div>
                               <div className="font-bold text-stone-800">Notificações Gerais</div>
                               <div className="text-xs text-stone-500">Alertas de tarefas, pagamentos e sistema.</div>
                            </div>
                         </div>
                         <div onClick={() => setNotificationsEnabled(!notificationsEnabled)} className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${notificationsEnabled ? 'bg-farm-500' : 'bg-stone-300'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                         </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
                         <div className="flex items-center gap-4">
                            <div className="bg-white p-2 rounded-lg shadow-sm text-blue-600"><CloudRain size={20} /></div>
                            <div>
                               <div className="font-bold text-stone-800">Alertas Climáticos Severos</div>
                               <div className="text-xs text-stone-500">Avisos de geada, tempestades e seca.</div>
                            </div>
                         </div>
                         <div onClick={() => setWeatherAlerts(!weatherAlerts)} className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${weatherAlerts ? 'bg-blue-500' : 'bg-stone-300'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${weatherAlerts ? 'translate-x-6' : 'translate-x-0'}`}></div>
                         </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
                         <div className="flex items-center gap-4">
                            <div className="bg-white p-2 rounded-lg shadow-sm text-red-600"><Shield size={20} /></div>
                            <div>
                               <div className="font-bold text-stone-800">Alertas de Segurança (Câmeras)</div>
                               <div className="text-xs text-stone-500">Detecção de movimento e intrusão em tempo real.</div>
                            </div>
                         </div>
                         <div onClick={() => setSecurityAlerts(!securityAlerts)} className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${securityAlerts ? 'bg-red-500' : 'bg-stone-300'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${securityAlerts ? 'translate-x-6' : 'translate-x-0'}`}></div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {/* --- TAB: INTEGRATIONS --- */}
          {activeTab === 'integrations' && (
             <div className="space-y-6 animate-slide-up">
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                   <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2"><Cpu size={20} className="text-purple-500"/> Dispositivos Conectados</h3>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border border-green-200 bg-green-50 rounded-xl flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <div>
                               <div className="font-bold text-stone-800 text-sm">Estação Meteorológica</div>
                               <div className="text-xs text-stone-500 font-mono">ID: WS-2024-X</div>
                            </div>
                         </div>
                         <span className="text-xs font-bold text-green-700 bg-white px-2 py-1 rounded border border-green-100">ONLINE</span>
                      </div>

                      <div className="p-4 border border-stone-200 bg-stone-50 rounded-xl flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-stone-400"></div>
                            <div>
                               <div className="font-bold text-stone-800 text-sm">Sensor Umidade Solo (Pivô 1)</div>
                               <div className="text-xs text-stone-500 font-mono">ID: SM-001-A</div>
                            </div>
                         </div>
                         <span className="text-xs font-bold text-stone-500 bg-white px-2 py-1 rounded border border-stone-200">OFFLINE</span>
                      </div>
                   </div>
                   
                   <div className="mt-6 pt-6 border-t border-stone-100">
                      <button className="w-full py-3 border-2 border-dashed border-stone-300 rounded-xl text-stone-400 font-bold hover:border-farm-400 hover:text-farm-600 hover:bg-farm-50 transition-all flex items-center justify-center gap-2">
                         + Adicionar Novo Dispositivo IoT
                      </button>
                   </div>
                </div>
             </div>
          )}

          {/* --- TAB: DATA --- */}
          {activeTab === 'data' && (
             <div className="space-y-6 animate-slide-up">
                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                   <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2"><Database size={20} className="text-stone-600"/> Gestão de Dados</h3>
                   
                   <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer group">
                         <div>
                            <div className="font-bold text-stone-800 group-hover:text-blue-600 transition-colors">Exportar Histórico Completo</div>
                            <div className="text-xs text-stone-500">Baixar CSV com todos os dados financeiros, climáticos e de sensores.</div>
                         </div>
                         <Database size={20} className="text-stone-300 group-hover:text-blue-500" />
                      </div>

                      <div className="flex items-center justify-between p-4 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer group">
                         <div>
                            <div className="font-bold text-stone-800 group-hover:text-farm-600 transition-colors">Backup da Configuração</div>
                            <div className="text-xs text-stone-500">Salvar estado atual do sistema para restauração futura.</div>
                         </div>
                         <Save size={20} className="text-stone-300 group-hover:text-farm-500" />
                      </div>

                      <div 
                        onClick={() => {
                          if (window.confirm("Isso irá limpar as mensagens e o histórico local. Seu perfil e dados no servidor não serão afetados. Continuar?")) {
                            localStorage.clear();
                            window.location.reload();
                          }
                        }}
                        className="flex items-center justify-between p-4 border border-stone-200 rounded-xl hover:bg-red-50 transition-colors cursor-pointer group"
                      >
                         <div>
                            <div className="font-bold text-stone-800 group-hover:text-red-600 transition-colors">Limpar Cache Local</div>
                            <div className="text-xs text-stone-500">Remove mensagens e dados temporários salvos neste navegador.</div>
                         </div>
                         <Trash2 size={20} className="text-stone-300 group-hover:text-red-500" />
                      </div>
                   </div>
                </div>
                
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                   <h3 className="text-lg font-bold text-red-800 mb-2">Zona de Perigo</h3>
                   <p className="text-sm text-red-700 mb-4">Ações irreversíveis que afetam o funcionamento da fazenda.</p>
                   <button className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-600 hover:text-white transition-colors">
                      Resetar Todas as Configurações de Fábrica
                   </button>
                </div>
             </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Settings;
