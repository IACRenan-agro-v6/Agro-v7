
import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Bot, Flower2, Store, HeartPulse, Square } from 'lucide-react';
import ChatMessage from './ChatMessage';
import InputArea from './InputArea';
import { useChatContext } from '../contexts/ChatContext';
import { MessageRole } from '../types';
import { useNavigation } from '../hooks/useNavigation';

const ChatView: React.FC = () => {
  const { setView } = useNavigation();

  const {
    messages,
    isLoading,
    isVoiceAssistantActive,
    setIsVoiceAssistantActive,
    audioStopper,
    playingMessageId,
    messagesEndRef,
    handleSendMessage,
    handleToggleAudio,
    stopAudio,
    scrollToBottom
  } = useChatContext();

  useEffect(() => { 
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      scrollToBottom(lastMessage.role === MessageRole.USER); 
    } 
  }, [messages]);

  return (
    <motion.div 
      key="chat"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full overflow-hidden"
    >
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
    </motion.div>
  );
};

export default ChatView;
