import React, { useRef, useState, useEffect } from 'react';
import { Send, Mic, Image as ImageIcon, Video, X, Loader2, ScanEye, Camera } from 'lucide-react';
import { Attachment } from '../types';
import { fileToBase64 } from '../utils/fileUtils';

interface InputAreaProps {
  onSendMessage: (text: string, attachment?: Attachment) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading }) => {
  const [inputText, setInputText] = useState('');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const plantIdInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null); // Use any for SpeechRecognition to avoid complex TS types without lib

  useEffect(() => {
    // Setup Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'pt-BR';

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(prev => prev ? prev + ' ' + transcript : transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const handleSend = () => {
    if (!inputText.trim() && !attachment) return;
    onSendMessage(inputText, attachment || undefined);
    setInputText('');
    setAttachment(null);
  };

  // Generic File Select (Manual)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isVideo = file.type.startsWith('video/');
      const base64 = await fileToBase64(file);
      
      setAttachment({
        type: isVideo ? 'video' : 'image',
        url: URL.createObjectURL(file),
        base64,
        mimeType: file.type
      });
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Direct Camera Capture
  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await fileToBase64(file);
      
      setAttachment({
        type: 'image',
        url: URL.createObjectURL(file),
        base64,
        mimeType: file.type
      });
    }
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Specific Plant ID File Select (Auto-Send)
  const handlePlantIdSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await fileToBase64(file);
      
      const att: Attachment = {
        type: 'image',
        url: URL.createObjectURL(file),
        base64,
        mimeType: file.type
      };

      // Automatically send with a specific prompt
      onSendMessage("Por favor, identifique esta planta, informe se ela é tóxica e me dê detalhes sobre a espécie.", att);
    }
    if (plantIdInputRef.current) plantIdInputRef.current.value = '';
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setInputText('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <div className="w-full bg-white px-4 pb-6 pt-2 relative z-20">
      
      {/* Hidden Inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*,video/*"
        onChange={handleFileSelect}
      />
      <input 
        type="file" 
        ref={cameraInputRef} 
        className="hidden" 
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
      />
      <input 
        type="file" 
        ref={plantIdInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handlePlantIdSelect}
      />

      {/* Attachment Preview (Floating above) */}
      {attachment && (
        <div className="absolute -top-24 left-4 bg-white p-2 rounded-xl border border-stone-200 shadow-lg flex items-start gap-2 animate-fade-in z-30">
           {attachment.type === 'image' ? (
             <img src={attachment.url} className="h-20 w-20 object-cover rounded-lg" alt="Preview" />
           ) : (
             <div className="h-20 w-20 bg-stone-100 rounded-lg flex items-center justify-center">
               <Video size={24} className="text-stone-400"/>
             </div>
           )}
           <button 
             onClick={() => setAttachment(null)}
             className="bg-red-50 text-red-500 p-1 rounded-full hover:bg-red-100 transition-colors"
           >
             <X size={14} />
           </button>
        </div>
      )}

      {/* Main Input Pill Container */}
      <div className="max-w-4xl mx-auto flex items-center gap-3 border border-farm-500 rounded-full px-2 py-2 shadow-sm bg-white hover:shadow-md transition-shadow">
        
        {/* Left Side: Media Actions */}
        <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-stone-400 hover:text-farm-600 transition-colors rounded-full hover:bg-stone-50"
            title="Enviar Foto/Vídeo"
        >
            <ImageIcon size={22} />
        </button>

        {/* Text Input Area */}
        <div className="flex-1 relative">
            <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
                }}
                placeholder={isListening ? "Ouvindo..." : "Digite ou envie uma foto..."}
                className="w-full bg-transparent text-stone-800 placeholder-stone-400 focus:outline-none text-sm font-medium py-2"
                disabled={isLoading}
            />
        </div>

        {/* Right Side: Actions */}
        <button
            onClick={toggleListening}
            className={`p-2 rounded-full transition-colors ${isListening ? 'text-red-500 animate-pulse bg-red-50' : 'text-stone-400 hover:text-farm-600 hover:bg-stone-50'}`}
        >
            <Mic size={22} />
        </button>

        <button
          onClick={handleSend}
          disabled={isLoading || (!inputText && !attachment)}
          className={`
            p-3 rounded-full flex items-center justify-center transition-all duration-300
            ${(inputText || attachment) && !isLoading 
              ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md' 
              : 'bg-stone-100 text-stone-300 cursor-not-allowed'}
          `}
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>

      </div>
      
      {/* Quick shortcuts below input (Optional for power users, but kept subtle) */}
      <div className="max-w-4xl mx-auto flex justify-center gap-4 mt-3">
         <button onClick={() => cameraInputRef.current?.click()} className="text-[10px] uppercase font-bold text-stone-400 hover:text-farm-600 flex items-center gap-1">
            <Camera size={12} /> Câmera
         </button>
         <button onClick={() => plantIdInputRef.current?.click()} className="text-[10px] uppercase font-bold text-stone-400 hover:text-farm-600 flex items-center gap-1">
            <ScanEye size={12} /> Identificar
         </button>
      </div>

    </div>
  );
};

export default InputArea;