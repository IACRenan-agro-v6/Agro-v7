
import { useState, useEffect, useRef } from 'react';
import { Message, MessageRole, Attachment, UserLocation, UserProfile, AITaskIntent } from '../types';
import { sendMessageToGemini, generateSpeechFromText, processUserTask } from '../services/geminiService';
import { playRawAudio } from '../utils/audioUtils';
import { dbService } from '../services/dbService';

import { cacheService } from '../services/cacheService';

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

export const useChat = (userLocation: UserLocation | null, currentUser: UserProfile | null, isOnline: boolean) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('agro_messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
      } catch (e) {
        return [INITIAL_MESSAGE];
      }
    }
    return [INITIAL_MESSAGE];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceAssistantActive, setIsVoiceAssistantActive] = useState(false);
  const [audioStopper, setAudioStopper] = useState<(() => void) | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('agro_messages', JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = (force = false) => {
    if (!messagesEndRef.current) return;
    const container = messagesEndRef.current.parentElement;
    if (!container) return;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
    if (force || isNearBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const stopAudio = () => { if (audioStopper) { audioStopper(); setAudioStopper(null); setPlayingMessageId(null); } };

  const handleToggleAudio = async (messageId: string) => {
    if (playingMessageId === messageId) { stopAudio(); return; }
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

  const handleSendMessage = async (text: string, attachment?: Attachment, isSyncingTask = false) => {
    stopAudio();
    const cleanText = text.startsWith('[FIELD_NOTE]: ') ? text.replace('[FIELD_NOTE]: ', '') : text;

    if (!isSyncingTask) {
      const newMessage: Message = { id: Date.now().toString(), role: MessageRole.USER, content: cleanText, attachment, timestamp: new Date() };
      setMessages(prev => [...prev, newMessage]);
    }

    if (!isOnline && !isSyncingTask) {
      await cacheService.saveOfflineTask({
        id: Date.now().toString(),
        text: text,
        attachment,
        timestamp: new Date().toISOString(),
        status: 'pending'
      });
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
      const aiTask = await processUserTask(cleanText, attachment ? { base64: attachment.base64, mimeType: attachment.mimeType } : undefined);
      
      if (aiTask) {
        responseText = aiTask.assistantMessage;
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
        } else if (aiTask.intent === AITaskIntent.PLANT_ID && aiTask.confidence > 0.7) {
          responseText = `🔍 **Análise de Planta:**\n\n${aiTask.assistantMessage}`;
        }
      } else {
        responseText = await sendMessageToGemini(messages, text, attachment ? { base64: attachment.base64, mimeType: attachment.mimeType } : undefined, userLocation);
      }
      
      const assistantMsgId = Date.now().toString();
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== thinkingId);
        return [...filtered, { id: assistantMsgId, role: MessageRole.ASSISTANT, content: responseText, timestamp: new Date() }];
      });

      if (isVoiceAssistantActive) {
        setTimeout(() => handleToggleAudio(assistantMsgId), 500);
      }

      if (attachment && attachment.type === 'image' && currentUser) {
        const publicUrl = await dbService.uploadImage(attachment.base64, "plant_chat");
        if (publicUrl) {
          await dbService.savePlantDiagnosis({
            commonName: aiTask?.intent === AITaskIntent.PLANT_ID ? (aiTask.extractedData?.productName || "Planta Identificada") : "Planta Identificada",
            scientificName: "Análise via Chat",
            date: new Date().toISOString(),
            imageUrl: publicUrl,
            healthStatus: responseText.toLowerCase().includes('doença') || responseText.toLowerCase().includes('praga') ? 'diseased' : 'healthy',
            diagnosisSummary: aiTask?.intent === AITaskIntent.PLANT_ID ? "Identificação de Planta" : "Análise Automática Chat",
            fullDiagnosis: responseText,
            confidence: aiTask?.confidence ? Math.round(aiTask.confidence * 100) : 85,
            location: userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Não informada'
          }, currentUser.id);
        }
      }
    } catch (error) {
       if (!isSyncingTask) {
         setMessages(prev => prev.filter(msg => msg.id !== thinkingId));
         const errorMsg = attachment?.type === 'image' 
           ? "Opa, companheiro! Tive um problema pra analisar essa foto agora. Pode tentar de novo ou me mandar outra?"
           : "Opa, deu um problema na conexão. Tenta de novo daqui a pouco!";
         setMessages(prev => [...prev, { id: Date.now().toString(), role: MessageRole.ASSISTANT, content: errorMsg, timestamp: new Date() }]);
       }
    } finally { setIsLoading(false); }
  };

  return {
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
  };
};
