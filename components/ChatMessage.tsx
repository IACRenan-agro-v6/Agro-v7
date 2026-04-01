import { motion } from 'motion/react';
import Markdown from 'react-markdown';
import { Message, MessageRole } from '../types';
import { Bot, User, Sprout, Volume2, Square, Loader2 } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  isPlaying?: boolean;
  onToggleAudio?: (id: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isPlaying, onToggleAudio }) => {
  const isUser = message.role === MessageRole.USER;
  const isAssistant = message.role === MessageRole.ASSISTANT;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex max-w-[90%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm
          ${isUser ? 'bg-farm-600 text-white' : 'bg-white text-farm-600 border border-stone-200'}
        `}>
          {isUser ? <User size={18} /> : <Sprout size={20} />}
        </div>

        {/* Bubble */}
        <div className={`
          flex flex-col p-5 rounded-2xl shadow-sm relative group
          ${isUser 
            ? 'bg-farm-600 text-white rounded-tr-none shadow-farm-600/20' 
            : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none'}
        `}>
          
          {/* Media Attachment Display */}
          {message.attachment && (
            <div className="mb-3 rounded-lg overflow-hidden border border-black/5 shadow-sm">
              {message.attachment.type === 'image' ? (
                <img 
                  src={message.attachment.url} 
                  alt="Anexo do usuário" 
                  className="w-full h-auto max-h-60 object-cover" 
                  onLoad={() => console.log('[ChatImage] message rendered with image')}
                />
              ) : (
                <video 
                  src={message.attachment.url} 
                  controls 
                  className="w-full h-auto max-h-60"
                />
              )}
            </div>
          )}

          {/* Text Content */}
          <div className={`
             prose prose-sm prose-p:leading-relaxed prose-headings:font-semibold prose-strong:font-bold
             ${isUser ? 'prose-invert prose-headings:text-white prose-strong:text-white' : 'prose-stone prose-headings:text-farm-800 prose-strong:text-farm-700'}
          `}>
            {message.isThinking ? (
               <div className="flex items-center gap-2 text-farm-600 animate-pulse py-1">
                 <Bot size={18} />
                 <span className="text-xs font-bold uppercase tracking-widest">Analisando Safra...</span>
               </div>
            ) : (
              <Markdown>{message.content}</Markdown>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-2">
            {/* Audio Button (Only Assistant & Not Thinking) */}
            {isAssistant && !message.isThinking && onToggleAudio && (
               <button 
                 onClick={() => onToggleAudio(message.id)}
                 className={`
                   p-1.5 rounded-full transition-all flex items-center gap-1.5 pr-2.5 text-xs font-bold
                   ${isPlaying 
                     ? 'bg-farm-100 text-farm-700 ring-2 ring-farm-500 ring-offset-1' 
                     : 'bg-stone-50 text-stone-500 hover:bg-stone-100 hover:text-farm-600'
                   }
                   ${message.isAudioLoading ? 'cursor-wait opacity-80' : ''}
                 `}
                 disabled={message.isAudioLoading}
                 title={isPlaying ? "Parar leitura" : "Ouvir resposta"}
               >
                 {message.isAudioLoading ? (
                   <Loader2 size={14} className="animate-spin" />
                 ) : isPlaying ? (
                   <Square size={14} fill="currentColor" />
                 ) : (
                   <Volume2 size={14} />
                 )}
                 <span>{message.isAudioLoading ? 'Gerando...' : (isPlaying ? 'Parar' : 'Ouvir')}</span>
               </button>
            )}

            <span className={`text-[10px] font-medium opacity-60 ml-auto ${isUser ? 'text-white' : 'text-gray-500'}`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;