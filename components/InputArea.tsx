import React, { useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Send, Mic, Image as ImageIcon, Video, X, Loader2, ScanEye, Camera, ClipboardList, StopCircle, Trash2 } from 'lucide-react';
import { Attachment } from '../types';
import { fileToBase64, compressImage } from '../utils/fileUtils';
import CameraModal from './CameraModal';

interface InputAreaProps {
  onSendMessage: (text: string, attachment?: Attachment) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading }) => {
  const [inputText, setInputText] = useState('');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'general' | 'plant'>('general');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const plantIdInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Seu navegador não suporta gravação de áudio.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Try to find a supported mime type
      const mimeTypes = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav'];
      const supportedType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'audio/webm';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: supportedType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length === 0) return;
        
        const audioBlob = new Blob(audioChunksRef.current, { type: supportedType });
        const base64 = await fileToBase64(new File([audioBlob], `audio.${supportedType.split('/')[1]}`, { type: supportedType }));
        
        setAttachment({
          type: 'audio',
          url: URL.createObjectURL(audioBlob),
          base64,
          mimeType: supportedType
        });
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Erro ao acessar microfone:", err);
      const msg = err.name === 'NotAllowedError' 
        ? "Permissão de microfone negada. Por favor, ative nas configurações do navegador." 
        : "Não foi possível acessar o microfone. Verifique as permissões.";
      toast.error(msg);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      audioChunksRef.current = [];
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setAttachment(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = () => {
    if (!inputText.trim() && !attachment) return;
    onSendMessage(inputText, attachment || undefined);
    setInputText('');
    setAttachment(null);
  };

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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files && e.target.files[0]) {
        console.log('Capturando imagem da câmera nativa...');
        const file = e.target.files[0];
        const rawBase64 = await fileToBase64(file);
        const base64 = await compressImage(rawBase64);
        
        console.log('[Camera] upload/request started', { size: file.size, type: file.type });
        
        setAttachment({
          type: 'image',
          url: URL.createObjectURL(file),
          base64,
          mimeType: 'image/jpeg'
        });
        console.log('Imagem capturada e comprimida com sucesso.');
      }
    } catch (err) {
      console.error('Erro ao capturar da câmera:', err);
      toast.error('Ocorreu um erro ao processar a imagem da câmera. Tente de novo.');
    } finally {
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleModalCapture = async (base64: string) => {
    try {
      console.log('Imagem capturada via modal...');
      const compressedBase64 = await compressImage(base64);
      
      console.log('[Camera] upload/request started', { length: compressedBase64.length });

      if (cameraMode === 'plant') {
        console.log('[Identify] capture received (modal)');
        const att: Attachment = {
          type: 'image',
          url: `data:image/jpeg;base64,${compressedBase64}`,
          base64: compressedBase64,
          mimeType: 'image/jpeg'
        };
        onSendMessage("Opa, companheiro! Dá uma olhada nessa planta aqui pra mim. Me diz o nome dela, se ela tá com alguma praga ou doença, se é tóxica pros bicho e o que eu devo fazer pra cuidar dela direitinho.", att);
      } else {
        setAttachment({
          type: 'image',
          url: `data:image/jpeg;base64,${compressedBase64}`,
          base64: compressedBase64,
          mimeType: 'image/jpeg'
        });
      }
      console.log('Imagem do modal processada com sucesso.');
    } catch (err) {
      console.error('Erro ao processar imagem do modal:', err);
      toast.error('Erro ao processar a foto. Tente novamente.');
    }
  };

  const openCamera = (mode: 'general' | 'plant') => {
    setCameraMode(mode);
    // Check if getUserMedia is supported
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setIsCameraModalOpen(true);
    } else {
      // Fallback to native camera input
      if (mode === 'plant') {
        plantIdInputRef.current?.click();
      } else {
        cameraInputRef.current?.click();
      }
    }
  };

  const handlePlantIdSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files && e.target.files[0]) {
        console.log('Processando imagem para identificação de planta...');
        const file = e.target.files[0];
        const rawBase64 = await fileToBase64(file);
        const base64 = await compressImage(rawBase64);
        
        console.log('[Identify] capture received (native)', { size: file.size });
        console.log('[Camera] upload/request started', { size: file.size, type: file.type });

        const att: Attachment = {
          type: 'image',
          url: URL.createObjectURL(file),
          base64,
          mimeType: 'image/jpeg'
        };

        onSendMessage("Opa, companheiro! Dá uma olhada nessa planta aqui pra mim. Me diz o nome dela, se ela tá com alguma praga ou doença, se é tóxica pros bicho e o que eu devo fazer pra cuidar dela direitinho.", att);
        console.log('Solicitação de identificação enviada.');
      }
    } catch (err) {
      console.error('Erro ao identificar planta:', err);
      toast.error('Ocorreu um erro ao processar a identificação da planta. Tente de novo.');
    } finally {
      if (plantIdInputRef.current) plantIdInputRef.current.value = '';
    }
  };

  const handleFieldNote = () => {
    if (!inputText.trim()) {
      toast.warning("Por favor, fale ou digite a atividade primeiro.");
      return;
    }
    onSendMessage(`[FIELD_NOTE]: ${inputText}`);
    setInputText('');
  };

  return (
    <div className="w-full bg-white px-4 pb-6 pt-2 relative z-20">
      
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
        capture="environment"
        onChange={handlePlantIdSelect}
      />

      <CameraModal 
        isOpen={isCameraModalOpen} 
        onClose={() => setIsCameraModalOpen(false)} 
        onCapture={handleModalCapture} 
      />

      {attachment && (
        <div className="absolute -top-24 left-4 bg-white p-2 rounded-xl border border-stone-200 shadow-lg flex items-start gap-2 animate-fade-in z-30">
           {attachment.type === 'image' ? (
             <img src={attachment.url} className="h-20 w-20 object-cover rounded-lg" alt="Preview" />
           ) : attachment.type === 'video' ? (
             <div className="h-20 w-20 bg-stone-100 rounded-lg flex items-center justify-center">
               <Video size={24} className="text-stone-400"/>
             </div>
           ) : (
             <div className="h-20 w-20 bg-blue-50 rounded-lg flex items-center justify-center">
               <Mic size={24} className="text-blue-500"/>
             </div>
           )}
           <div className="flex flex-col">
             <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
               {attachment.type === 'image' ? 'Imagem' : attachment.type === 'video' ? 'Vídeo' : 'Áudio'}
             </span>
             <button 
               onClick={() => setAttachment(null)}
               className="text-red-500 text-xs hover:underline"
             >
               Remover
             </button>
           </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 border border-farm-500 rounded-full px-2 py-2 shadow-sm bg-white hover:shadow-md transition-shadow">
          
          {isRecording ? (
            <div className="flex-1 flex items-center gap-3 px-4 py-1 bg-red-50 rounded-full animate-pulse">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="flex-1 text-red-600 font-mono font-bold text-sm">{formatTime(recordingTime)}</span>
              <button 
                onClick={cancelRecording}
                className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                title="Cancelar"
              >
                <Trash2 size={20} />
              </button>
              <button 
                onClick={stopRecording}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                title="Finalizar"
              >
                <StopCircle size={20} />
              </button>
            </div>
          ) : (
            <>
              <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-stone-400 hover:text-farm-600 transition-colors rounded-full hover:bg-stone-50"
                  title="Enviar Foto/Vídeo"
              >
                  <ImageIcon size={22} />
              </button>

              <div className="flex-1 relative">
                  <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSend();
                      }}
                      placeholder="Fale comigo ou mande uma foto..."
                      className="w-full bg-transparent text-stone-800 placeholder-stone-400 focus:outline-none text-sm font-medium py-2"
                      disabled={isLoading}
                  />
              </div>

              <button
                  onClick={startRecording}
                  className={`p-2 rounded-full transition-colors ${isRecording ? 'text-red-500 bg-red-50' : 'text-stone-400 hover:text-farm-600 hover:bg-stone-50'}`}
                  title="Gravar Áudio"
              >
                  <Mic size={22} />
              </button>

              <button
                onClick={handleSend}
                disabled={isLoading || (!inputText && !attachment)}
                className={`
                  p-3 rounded-full flex items-center justify-center transition-all duration-300
                  ${(inputText || attachment) && !isLoading 
                    ? 'bg-farm-600 hover:bg-farm-700 text-white shadow-md' 
                    : 'bg-stone-100 text-stone-300 cursor-not-allowed'}
                `}
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </>
          )}
        </div>

         {/* Quick Actions for Producer Assistant */}
        <div className="flex justify-center gap-4 mt-4">
           <button 
             onClick={() => openCamera('general')} 
             className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-stone-50 hover:bg-farm-50 border border-stone-100 hover:border-farm-200 transition-all group min-w-[80px]"
           >
              <div className="p-2 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                <Camera size={20} className="text-stone-500 group-hover:text-farm-600" />
              </div>
              <span className="text-[10px] font-bold text-stone-500 group-hover:text-farm-700 uppercase tracking-tight">Câmera</span>
           </button>

           <button 
             onClick={() => openCamera('plant')} 
             className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-stone-50 hover:bg-blue-50 border border-stone-100 hover:border-blue-200 transition-all group min-w-[80px]"
           >
              <div className="p-2 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                <ScanEye size={20} className="text-stone-500 group-hover:text-blue-600" />
              </div>
              <span className="text-[10px] font-bold text-stone-500 group-hover:text-blue-700 uppercase tracking-tight">Identificar</span>
           </button>

           <button 
             onClick={handleFieldNote} 
             className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-stone-50 hover:bg-amber-50 border border-stone-100 hover:border-amber-200 transition-all group min-w-[80px]"
           >
              <div className="p-2 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                <ClipboardList size={20} className="text-stone-500 group-hover:text-amber-600" />
              </div>
              <span className="text-[10px] font-bold text-stone-500 group-hover:text-amber-700 uppercase tracking-tight">Anotar</span>
           </button>
        </div>
      </div>

    </div>
  );
};

export default InputArea;
