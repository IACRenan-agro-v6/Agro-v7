
import React, { createContext, useContext } from 'react';
import { useChat } from '../hooks/useChat';
import { useAuth } from './AuthContext';
import { useLocationWeather } from '../hooks/useLocationWeather';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useConnectivity } from '../hooks/useConnectivity';

interface ChatContextType {
  messages: any[];
  isLoading: boolean;
  isVoiceAssistantActive: boolean;
  setIsVoiceAssistantActive: (active: boolean) => void;
  audioStopper: (() => void) | null;
  playingMessageId: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  handleSendMessage: (text: string, attachment?: any, isSyncingTask?: boolean) => Promise<void>;
  handleToggleAudio: (messageId: string) => Promise<void>;
  stopAudio: () => void;
  scrollToBottom: (force?: boolean) => void;
  isSyncing: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { userLocation } = useLocationWeather();
  const isOnline = useOnlineStatus();

  const chat = useChat(userLocation, currentUser, isOnline);
  const { isSyncing } = useConnectivity(chat.handleSendMessage);

  return (
    <ChatContext.Provider value={{ ...chat, isSyncing }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};
