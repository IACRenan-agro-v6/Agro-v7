
import React, { useState, useEffect, useRef } from 'react';
import { Message, MessageRole, Attachment, UserLocation, WeatherInfo, ViewMode, UserRole, UserProfile, AITaskIntent, OfflineTask } from './types';
import { sendMessageToGemini, generateSpeechFromText, parseFieldNote, processUserTask } from './services/geminiService';
import { fetchLocalWeather } from './services/weatherService';
import { playRawAudio } from './utils/audioUtils';
import { dbService } from './services/dbService';
import { cacheService } from './services/cacheService';
import { supabase } from './services/supabaseClient';
import { Wifi, WifiOff, RefreshCw, CloudOff } from 'lucide-react';

// Components
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import InputArea from './components/InputArea';
import CropPlanner from './components/CropPlanner';
import CameraGrid from './components/CameraGrid';
import AutomationControl from './components/AutomationControl';
import FarmDashboard from './components/FarmDashboard';
import LoginScreen from './components/LoginScreen';
import RegistrationScreen from './components/RegistrationScreen';
import EmaterChannel from './components/EmaterChannel';
import SystemPresentation from './components/SystemPresentation';
import Settings from './components/Settings';
import PlantRegistry from './components/PlantRegistry';
import MarketView from './components/MarketView';
import LogisticsView from './components/LogisticsView';
import RetailPOSView from './components/RetailPOSView';
import RetailerInsights from './components/RetailerInsights';
import ConsumerHub from './components/ConsumerHub';
import ProfessionalHub from './components/ProfessionalHub';

import { 
  Menu, 
  Square, 
  Bot, 
  Camera, 
  Flower2, 
  HeartPulse, 
  Store
} from 'lucide-react';

const INITIAL_MESSAGE: Message = {
  id: 'init-1',
  role: MessageRole.ASSISTANT,
  content: `Olá! Sou o IAC Farm, seu Gestor Autônomo de Ecossistema. 

Como posso te ajudar hoje?
• Se você é **Produtor**: Posso planejar sua safra ou identificar pragas.
• Se você é **Varejista**: Posso te dar insights de mercado e gerenciar seu PDV.
• Se você é **Consumidor**: Posso criar um plano nutricional com o que tem de melhor no campo agora.

Envie uma foto, um áudio ou escolha uma das opções abaixo!`,
  timestamp: new Date()
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('agro_isAuthenticated') === 'true';
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('agro_currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [userRole, setUserRole] = useState<UserRole>(() => {
    return (localStorage.getItem('agro_userRole') as UserRole) || UserRole.CONSUMER;
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('agro_isDarkMode') === 'true';
  });
  const [view, setView] = useState<ViewMode | 'registry'>(() => {
    return (localStorage.getItem('agro_currentView') as ViewMode | 'registry') || 'chat';
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { error } = await supabase.from('plants').select('id').limit(1);
        if (error) {
          console.error("Erro na conexão com Supabase:", error.message);
          if (error.message.includes('Failed to fetch')) {
            console.error("DICA: Verifique se a URL do Supabase está correta e se o projeto está ativo.");
          }
          if (error.message.includes('JWT')) {
            console.error("DICA: A chave ANON do Supabase parece inválida.");
          }
        } else {
          console.log("Conexão com Supabase estabelecida com sucesso.");
        }
      } catch (e) {
        console.error("Falha fatal ao conectar ao Supabase:", e);
        console.error("Certifique-se de configurar VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas configurações do projeto.");
      }
    };
    testConnection();
  }, []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceAssistantActive, setIsVoiceAssistantActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [audioStopper, setAudioStopper] = useState<(() => void) | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { if (view === 'chat') scrollToBottom(); }, [messages, view]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(loc);
          const weather = await fetchLocalWeather(loc);
          setWeatherInfo(weather);
        },
        async (error) => {
          console.warn("Geolocation denied or failed, using fallback (Rio de Janeiro):", error);
          const fallbackLoc = { lat: -22.9068, lng: -43.1729 };
          setUserLocation(fallbackLoc);
          const weather = await fetchLocalWeather(fallbackLoc);
          setWeatherInfo(weather);
        },
        { timeout: 10000 }
      );
    } else {
      // No geolocation support
      const fallbackLoc = { lat: -22.9068, lng: -43.1729 };
      setUserLocation(fallbackLoc);
      fetchLocalWeather(fallbackLoc).then(setWeatherInfo);
    }
  }, []);

  const stopAudio = () => { if (audioStopper) { audioStopper(); setAudioStopper(null); setPlayingMessageId(null); } };

  const handleToggleAudio = async (messageId: string) => {
    if (playingMessageId === messageId) { stopAudio(); return; }
    
    // Check if any message is currently loading audio to prevent concurrent requests
    const isAnyAudioLoading = messages.some(m => m.isAudioLoading);
    if (isAnyAudioLoading) return;

    stopAudio();
    const msg = messages.find(m => m.id === messageId);
    if (!msg) return;
    if (msg.audioBase64) {
      setPlayingMessageId(messageId);
      const stopFn = await playRawAudio(msg.audioBase64, () => { setAudioStopper(null); setPlayingMessageId(null); });
      setAudioStopper(() => stopFn);
      return;
    }
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isAudioLoading: true } : m));
    try {
      const audioBase64 = await generateSpeechFromText(msg.content);
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isAudioLoading: false, audioBase64: audioBase64 || undefined } : m));
      if (audioBase64) {
        setPlayingMessageId(messageId);
        const stopFn = await playRawAudio(audioBase64, () => { setAudioStopper(null); setPlayingMessageId(null); });
        setAudioStopper(() => stopFn);
      }
    } catch (e) { setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isAudioLoading: false } : m)); }
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      syncOfflineTasks();
    }
  }, [isOnline]);

  const syncOfflineTasks = async () => {
    const pendingTasks = await cacheService.getPendingTasks();
    if (pendingTasks.length === 0) return;

    setIsSyncing(true);
    console.log(`Sincronizando ${pendingTasks.length} tarefas pendentes...`);

    for (const task of pendingTasks) {
      try {
        // Re-process the task now that we are online
        await handleSendMessage(task.text, task.attachment, true);
        await cacheService.markTaskSynced(task.id);
      } catch (error) {
        console.error(`Erro ao sincronizar tarefa ${task.id}:`, error);
      }
    }

    setIsSyncing(false);
  };

  const handleSendMessage = async (text: string, attachment?: Attachment, isSyncingTask = false) => {
    stopAudio();
    const cleanText = text.startsWith('[FIELD_NOTE]: ') ? text.replace('[FIELD_NOTE]: ', '') : text;

    if (!isSyncingTask) {
      const newMessage: Message = { id: Date.now().toString(), role: MessageRole.USER, content: cleanText, attachment, timestamp: new Date() };
      setMessages(prev => [...prev, newMessage]);
    }

    if (!isOnline && !isSyncingTask) {
      // Offline mode: save to queue
      const offlineTask: OfflineTask = {
        id: Date.now().toString(),
        text: text,
        attachment,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };
      await cacheService.saveOfflineTask(offlineTask);
      
      setMessages(prev => [...prev, { 
        id: 'offline-' + Date.now(), 
        role: MessageRole.ASSISTANT, 
        content: "📴 **Você está offline.** Sua mensagem foi salva e será processada assim que a conexão voltar. Fique tranquilo, nada se perde!", 
        timestamp: new Date() 
      }]);
      return;
    }

    setIsLoading(true);
    const thinkingId = 'thinking-' + Date.now();
    if (!isSyncingTask) {
      setMessages(prev => [...prev, { id: thinkingId, role: MessageRole.ASSISTANT, content: '', timestamp: new Date(), isThinking: true }]);
    }

    try {
      let responseText = '';
      
      // Use the new processUserTask for intelligent intent detection
      const aiTask = await processUserTask(cleanText, attachment ? { base64: attachment.base64, mimeType: attachment.mimeType } : undefined);
      
      if (aiTask) {
        responseText = aiTask.assistantMessage;
        
        // Handle specific intents with extra UI feedback or logic
        if (aiTask.intent === AITaskIntent.ADD_PRODUCT && aiTask.confidence > 0.7) {
          const { productName, quantity, price } = aiTask.extractedData;
          responseText += `\n\n📦 **Resumo do Anúncio:**\n- Produto: ${productName || 'Não identificado'}\n- Quantidade: ${quantity || 'Sob consulta'}\n- Preço: ${price || 'A combinar'}\n\n*Deseja confirmar a publicação no Mercado?*`;
        } else if (aiTask.intent === AITaskIntent.CHECK_ORDER && aiTask.confidence > 0.7) {
          const { orderId } = aiTask.extractedData;
          responseText += `\n\n🔍 **Status do Pedido ${orderId || ''}:**\nO seu pedido está em rota de entrega e deve chegar em breve ao destino.`;
        } else if (aiTask.intent === AITaskIntent.FIELD_NOTE && aiTask.confidence > 0.7) {
          const { activity, productName, quantity, location } = aiTask.extractedData;
          responseText = `✅ **Nota de Campo Registrada!**\n\n` +
            `🚜 **Atividade:** ${activity || 'Geral'}\n` +
            `🌱 **Produto:** ${productName || 'N/A'}\n` +
            `⚖️ **Quantidade:** ${quantity || 'N/A'}\n` +
            `📍 **Local:** ${location || 'N/A'}\n\n` +
            `*${aiTask.assistantMessage}*`;
        }
      } else {
        // Fallback to general chat if task processing fails
        responseText = await sendMessageToGemini(messages, text, attachment ? { base64: attachment.base64, mimeType: attachment.mimeType } : undefined, userLocation);
      }
      
      const assistantMsgId = Date.now().toString();
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== thinkingId);
        return [...filtered, { id: assistantMsgId, role: MessageRole.ASSISTANT, content: responseText, timestamp: new Date() }];
      });

      // Auto-play audio if Voice Assistant is active
      if (isVoiceAssistantActive) {
        setTimeout(() => handleToggleAudio(assistantMsgId), 500);
      }

      // Lógica de Salvamento Automático no Supabase para Diagnósticos com Imagem
      if (attachment && attachment.type === 'image') {
        const publicUrl = await dbService.uploadImage(attachment.base64, "plant_chat");
        if (publicUrl) {
          await dbService.savePlantDiagnosis({
            commonName: "Planta Identificada",
            scientificName: "Análise via Chat",
            date: new Date().toISOString(),
            imageUrl: publicUrl,
            healthStatus: responseText.toLowerCase().includes('doença') ? 'diseased' : 'healthy',
            diagnosisSummary: "Análise Automática Chat",
            fullDiagnosis: responseText,
            confidence: 85,
            location: userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Não informada'
          }, currentUser?.id || 'anonymous');
        }
      }
    } catch (error) {
       if (!isSyncingTask) {
         setMessages(prev => prev.filter(msg => msg.id !== thinkingId));
         setMessages(prev => [...prev, { id: Date.now().toString(), role: MessageRole.ASSISTANT, content: "Opa, deu um problema na conexão.", timestamp: new Date() }]);
       }
    } finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('agro_isAuthenticated', isAuthenticated.toString());
    if (currentUser) {
      localStorage.setItem('agro_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('agro_currentUser');
    }
    localStorage.setItem('agro_userRole', userRole);
    localStorage.setItem('agro_currentView', view);
    localStorage.setItem('agro_isDarkMode', isDarkMode.toString());
  }, [isAuthenticated, currentUser, userRole, view, isDarkMode]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        const profile = {
          id: session.user.id,
          email: session.user.email || '',
          role: userRole, // Keep current role or default
          fullName: session.user.user_metadata?.full_name || 'Usuário',
          document: '',
          createdAt: new Date().toISOString()
        };
        setCurrentUser(profile);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
      } else {
        // Only clear if it wasn't a mock login (dev-user)
        const savedUser = localStorage.getItem('agro_currentUser');
        const isMock = savedUser && JSON.parse(savedUser).id === 'dev-user';
        
        if (!isMock) {
          setIsAuthenticated(false);
          setCurrentUser(null);
          localStorage.removeItem('agro_isAuthenticated');
          localStorage.removeItem('agro_currentUser');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('agro_isAuthenticated');
    localStorage.removeItem('agro_currentUser');
    localStorage.removeItem('agro_userRole');
    localStorage.removeItem('agro_currentView');
    setView('chat');
  };

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsAuthenticated(true);
    // Set initial view based on role
    if (role === UserRole.PRODUCER) setView('dashboard');
    else if (role === UserRole.RETAILER) setView('market');
    else if (role === UserRole.CONSUMER) setView('consumer_hub');
    else if (role === UserRole.PROFESSIONAL) setView('professional_hub');

    // Mock user for dev
    setCurrentUser({
      id: 'dev-user',
      email: 'dev@agrobrasil.com',
      role: role,
      fullName: 'Produtor Rural',
      document: '123.456.789-00',
      createdAt: new Date().toISOString()
    });
  };

  const getHeaderTitle = () => {
    switch (view) {
      case 'chat': return 'IAC Farm - Assistente';
      case 'planner': return 'Planejamento';
      case 'cameras': return 'Segurança';
      case 'automations': return 'Acionamentos';
      case 'dashboard': return 'Minha Fazenda';
      case 'emater': return 'Canal EMATER';
      case 'presentation': return 'Relatório Executivo';
      case 'market': return 'Mercado & Cotações';
      case 'logistics': return 'Logística & Frete';
      case 'pos': return 'PDV Varejo';
      case 'retail_insights': return 'Insights Varejo';
      case 'consumer_hub': return 'Saúde & Nutrição';
      case 'professional_hub': return 'Hub do Profissional';
      case 'settings': return 'Configurações';
      case 'registry': return 'Minhas Plantas';
      default: return 'IAC Farm';
    }
  };

  if (!isAuthenticated) {
    if (isRegistering) {
      return (
        <RegistrationScreen 
          onBack={() => setIsRegistering(false)}
          onRegister={async (role, data) => {
            const profile: UserProfile = {
              id: Date.now().toString(), // In real app, this would be from Auth
              email: data.email,
              role: role,
              fullName: data.fullName,
              document: data.document,
              phone: data.phone,
              createdAt: new Date().toISOString(),
              producerData: role === UserRole.PRODUCER ? {
                farmName: data.farmName,
                totalArea: Number(data.totalArea),
                mainCrops: data.mainCrops?.split(',') || [],
                location: data.location
              } : undefined,
              retailerData: role === UserRole.RETAILER ? {
                storeName: data.storeName,
                cnpj: data.document,
                address: data.address
              } : undefined,
              professionalData: role === UserRole.PROFESSIONAL ? {
                specialty: data.specialty,
                registryNumber: data.registryNumber
              } : undefined
            };

            const success = await dbService.saveUserProfile(profile);
            if (success) {
              setCurrentUser(profile);
              setUserRole(role);
              setIsAuthenticated(true);
              setIsRegistering(false);
            } else {
              alert("Erro ao salvar perfil. Tente novamente.");
            }
          }}
        />
      );
    }
    return (
      <LoginScreen 
        onLogin={handleLogin} 
        onGoToRegister={() => setIsRegistering(true)}
      />
    );
  }

  return (
    <div className={`flex h-screen w-full relative overflow-hidden font-sans animate-fade-in ${isDarkMode ? 'bg-stone-950 text-stone-100' : 'bg-white text-stone-900'}`}>
      
      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white py-1 px-4 text-center text-xs font-bold z-[100] flex items-center justify-center gap-2 animate-slide-down">
          <WifiOff size={14} />
          <span>MODO OFFLINE ATIVO - Suas ações serão sincronizadas quando a conexão voltar</span>
        </div>
      )}

      {isSyncing && (
        <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white py-1 px-4 text-center text-xs font-bold z-[100] flex items-center justify-center gap-2 animate-slide-down">
          <RefreshCw size={14} className="animate-spin" />
          <span>SINCRONIZANDO DADOS COM O SERVIDOR...</span>
        </div>
      )}

      <Sidebar 
        view={view as ViewMode} 
        setView={(v) => setView(v as ViewMode | 'registry')} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        userLocation={userLocation}
        weatherInfo={weatherInfo}
        userRole={userRole}
        onLogout={handleLogout}
      />

      {isSidebarOpen && <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <main className="flex-1 flex flex-col h-full relative z-10 w-full bg-transparent transition-all duration-300">
        <div className="md:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-20">
          <button onClick={() => setIsSidebarOpen(true)} className="text-farm-800 p-2 hover:bg-stone-100 rounded-lg"><Menu size={24} /></button>
          <span className="text-farm-900 font-bold text-lg tracking-tight">{getHeaderTitle()}</span>
          <div className="w-6" />
        </div>

        {view === 'chat' && (
          <>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth bg-white">
              <div className="max-w-4xl mx-auto min-h-full flex flex-col pb-4">
                <div className="bg-gradient-to-r from-farm-600 to-farm-500 rounded-3xl p-6 md:p-8 text-white mb-6 flex justify-between items-center shadow-lg shadow-farm-600/20">
                   <div>
                      <h1 className="text-2xl md:text-3xl font-black mb-1 tracking-tight">IAC Farm</h1>
                      <p className="text-farm-100 text-sm font-medium opacity-90">Sua lavoura na palma da mão</p>
                   </div>
                   <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm"><Bot size={32} className="text-white" /></div>
                </div>

                <div className="mb-6 flex items-center justify-between bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isVoiceAssistantActive ? 'bg-green-500 animate-pulse' : 'bg-stone-300'}`} />
                    <div>
                      <h4 className="font-bold text-stone-800 text-sm">Assistente de Voz</h4>
                      <p className="text-xs text-stone-500">A IA falará as respostas automaticamente</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsVoiceAssistantActive(!isVoiceAssistantActive)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${isVoiceAssistantActive ? 'bg-farm-600 text-white shadow-md' : 'bg-white border border-stone-200 text-stone-600'}`}
                  >
                    {isVoiceAssistantActive ? 'ATIVADO' : 'DESATIVADO'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                   <button onClick={() => setView('planner')} className="bg-white border border-stone-100 shadow-sm rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-md hover:border-emerald-100 transition-all group cursor-pointer">
                      <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><Flower2 size={26} /></div>
                      <h3 className="font-bold text-stone-800 text-lg">Planejar Safra</h3>
                      <p className="text-xs text-stone-500 font-medium">IA para produtores</p>
                   </button>
                   <button onClick={() => setView('market')} className="bg-white border border-stone-100 shadow-sm rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-md hover:border-orange-100 transition-all group cursor-pointer">
                      <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><Store size={26} /></div>
                      <h3 className="font-bold text-stone-800 text-lg">Mercado CEASA</h3>
                      <p className="text-xs text-stone-500 font-medium">Previsões para varejo</p>
                   </button>
                   <button onClick={() => setView('consumer_hub')} className="bg-white border border-stone-100 shadow-sm rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-md hover:border-rose-100 transition-all group cursor-pointer">
                      <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><HeartPulse size={26} /></div>
                      <h3 className="font-bold text-stone-800 text-lg">Saúde & Nutrição</h3>
                      <p className="text-xs text-stone-500 font-medium">IA para o consumidor</p>
                   </button>
                </div>
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} isPlaying={playingMessageId === msg.id} onToggleAudio={handleToggleAudio} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            {audioStopper && (
              <div className="absolute bottom-28 right-6 z-30 animate-fade-in">
                 <button onClick={stopAudio} className="flex items-center gap-2 bg-farm-600 text-white pl-3 pr-4 py-3 rounded-full shadow-xl hover:bg-red-600 transition-colors border border-white/20">
                    <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span></span>
                    <span className="text-sm font-bold">Ouvindo...</span>
                    <div className="h-4 w-[1px] bg-white/20 mx-1"></div>
                    <Square size={14} fill="currentColor" />
                 </button>
              </div>
            )}
            <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
          </>
        )}

        {view === 'planner' && <CropPlanner userLocation={userLocation} setView={setView} />}
        {view === 'cameras' && <CameraGrid />}
        {view === 'automations' && <AutomationControl />}
        {view === 'dashboard' && <FarmDashboard />}
        {view === 'emater' && <EmaterChannel />}
        {view === 'presentation' && <SystemPresentation />}
        {view === 'market' && <MarketView currentUser={currentUser} setView={setView} />}
        {view === 'logistics' && <LogisticsView />}
        {view === 'pos' && <RetailPOSView />}
        {view === 'retail_insights' && <RetailerInsights setView={setView} />}
        {view === 'consumer_hub' && <ConsumerHub setView={setView} />}
        {view === 'professional_hub' && <ProfessionalHub setView={setView} />}
        {view === 'settings' && <Settings isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}
        {view === 'registry' && <PlantRegistry currentUser={currentUser} />}

      </main>
    </div>
  );
};

export default App;
