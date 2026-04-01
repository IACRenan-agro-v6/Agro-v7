import React, { useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Send, Mic, Image as ImageIcon, Video, X, Loader2, ScanEye, Camera, ClipboardList, StopCircle, Trash2, Paperclip } from 'lucide-react';
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
  const [isPlantIdFlow, setIsPlantIdFlow] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const plantIdInputRef = useRef<HTMLInputElement>(null);
  const unifiedPlantInputRef = useRef<HTMLInputElement>(null);
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
    
    if (attachment && attachment.type === 'image') {
      console.log('[ChatImage] send started');
    }
    
    onSendMessage(inputText, attachment || undefined);
    setInputText('');
    setAttachment(null);
    setIsPlantIdFlow(false);
  };

  const handleChatImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        console.log('[ChatImage] file selected', file.name);
        
        if (!file.type.startsWith('image/')) {
          toast.error('Por favor, selecione uma imagem.');
          console.error('[Identify] error: Invalid file type');
          return;
        }

        setIsAttaching(true);
        const previewUrl = URL.createObjectURL(file);
        console.log('[ChatImage] preview url created', previewUrl);
        
        setAttachment({
          type: 'image',
          url: previewUrl,
          base64: '', // Will be filled at send time
          mimeType: file.type,
          file: file
        });
        
        console.log('[ChatImage] preview ready');
      }
    } catch (err) {
      console.error('[Identify] error:', err);
      toast.error('Erro ao anexar imagem.');
    } finally {
      setIsAttaching(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleUnifiedImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        console.log('[ChatImage] file selected', file.name);
        console.log('[ChatImage] mimeType', file.type);

        if (!file.type.startsWith('image/')) {
          toast.error('Por favor, selecione um arquivo de imagem válido.');
          console.error('[Identify] error: Invalid file type');
          return;
        }

        const previewUrl = URL.createObjectURL(file);
        console.log('[ChatImage] preview url created', previewUrl);
        
        setAttachment({
          type: 'image',
          url: previewUrl,
          base64: '', // Will be filled at send time
          mimeType: file.type,
          file: file
        });
        setIsPlantIdFlow(true);
        console.log('[ChatImage] preview ready');
      }
    } catch (err) {
      console.error('[Identify] error:', err);
      toast.error('Erro ao processar imagem. Tente novamente.');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const triggerIdentification = () => {
    if (!attachment || attachment.type !== 'image') return;
    
    console.log('[Identify] request started');
    onSendMessage("Opa, companheiro! Dá uma olhada nessa planta aqui pra mim. Me diz o nome dela, se ela tá com alguma praga ou doença, se é tóxica pros bicho e o que eu devo fazer pra cuidar dela direitinho.", attachment);
    setAttachment(null);
    setIsPlantIdFlow(false);
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
        const file = e.target.files[0];
        console.log('[ChatImage] file selected (camera)', file.name);
        
        const previewUrl = URL.createObjectURL(file);
        console.log('[ChatImage] preview url created', previewUrl);
        
        setAttachment({
          type: 'image',
          url: previewUrl,
          base64: '', // Will be filled at send time
          mimeType: file.type || 'image/jpeg',
          file: file
        });
        console.log('[ChatImage] preview ready');
      }
    } catch (err) {
      console.error('[Identify] error:', err);
      toast.error('Ocorreu um erro ao processar a imagem da câmera. Tente de novo.');
    } finally {
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleModalCapture = async (base64: string) => {
    try {
      console.log('[ChatImage] capture received (modal)');
      const compressedBase64 = await compressImage(base64);
      const url = `data:image/jpeg;base64,${compressedBase64}`;
      console.log('[ChatImage] preview url created (data url)', url.substring(0, 50) + '...');
      
      setAttachment({
        type: 'image',
        url: url,
        base64: compressedBase64,
        mimeType: 'image/jpeg'
      });
      
      if (cameraMode === 'plant') {
        setIsPlantIdFlow(true);
      }
      
      console.log('[ChatImage] preview ready');
    } catch (err) {
      console.error('[Identify] error:', err);
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
        const file = e.target.files[0];
        console.log('[ChatImage] file selected (plant id)', file.name);
        
        const previewUrl = URL.createObjectURL(file);
        console.log('[ChatImage] preview url created', previewUrl);
        
        setAttachment({
          type: 'image',
          url: previewUrl,
          base64: '', // Will be filled at send time
          mimeType: file.type || 'image/jpeg',
          file: file
        });
        setIsPlantIdFlow(true);
        console.log('[ChatImage] preview ready');
      }
    } catch (err) {
      console.error('[Identify] error:', err);
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
        onChange={handleChatImageSelect}
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
      <input 
        type="file" 
        ref={unifiedPlantInputRef} 
        className="hidden" 
        accept="image/*"
        capture="environment"
        onChange={handleUnifiedImageSelect}
      />

      <CameraModal 
        isOpen={isCameraModalOpen} 
        onClose={() => setIsCameraModalOpen(false)} 
        onCapture={handleModalCapture} 
      />

      {attachment && (
        <div className="absolute -top-36 left-4 right-4 bg-white p-3 rounded-2xl border border-stone-200 shadow-xl flex items-center gap-4 animate-fade-in z-30">
           {attachment.type === 'image' ? (
             <div className="relative group">
               <img 
                 src={attachment.url} 
                 className="h-24 w-24 object-cover rounded-xl shadow-sm border border-stone-100" 
                 alt="Preview" 
                 onLoad={() => console.log('[ChatImage] preview rendered')}
               />
               {isAttaching && (
                 <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
                   <Loader2 size={20} className="text-white animate-spin" />
                 </div>
               )}
             </div>
           ) : attachment.type === 'video' ? (
             <div className="h-24 w-24 bg-stone-100 rounded-xl flex items-center justify-center">
               <Video size={24} className="text-stone-400"/>
             </div>
           ) : (
             <div className="h-24 w-24 bg-blue-50 rounded-xl flex items-center justify-center">
               <Mic size={24} className="text-blue-500"/>
             </div>
           )}
           
           <div className="flex-1 flex flex-col gap-1">
             <div className="flex items-center gap-2">
               <span className="text-[10px] text-stone-400 font-black uppercase tracking-widest">
                 {attachment.type === 'image' ? 'Imagem para envio' : attachment.type === 'video' ? 'Vídeo Selecionado' : 'Áudio Gravado'}
               </span>
               {isLoading && (
                 <span className="text-[10px] text-farm-600 font-bold animate-pulse">
                   {attachment.type === 'image' ? 'Analisando imagem...' : 'Enviando...'}
                 </span>
               )}
             </div>
             
             <div className="flex items-center gap-2 mt-1">
                <button 
                  onClick={() => {
                    setAttachment(null);
                    setIsPlantIdFlow(false);
                  }}
                  disabled={isLoading}
                  className="text-red-500 text-xs font-bold hover:bg-red-50 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 border border-red-100"
                >
                  <Trash2 size={14} /> Remover
                </button>
                
                {isPlantIdFlow && attachment.type === 'image' && (
                  <button 
                    onClick={triggerIdentification}
                    disabled={isLoading || isAttaching}
                    className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : <ScanEye size={14} />}
                    IDENTIFICAR AGORA
                  </button>
                )}
             </div>
           </div>
           
           {!isLoading && (
             <button 
               onClick={() => {
                 setAttachment(null);
                 setIsPlantIdFlow(false);
               }}
               className="p-2 text-stone-300 hover:text-stone-500"
             >
               <X size={20} />
             </button>
           )}
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
              <div className="flex items-center">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-stone-400 hover:text-farm-600 transition-colors rounded-full hover:bg-stone-50"
                    title="Anexar arquivo"
                >
                    <Paperclip size={22} />
                </button>
                <button 
                    onClick={() => {
                      setCameraMode('general');
                      plantIdInputRef.current?.click();
                    }}
                    className="p-3 text-stone-400 hover:text-farm-600 transition-colors rounded-full hover:bg-stone-50"
                    title="Tirar foto"
                >
                    <Camera size={22} />
                </button>
              </div>

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
        <div className="flex flex-col md:flex-row justify-center gap-3 mt-4">
           <button 
             onClick={() => unifiedPlantInputRef.current?.click()} 
             className="flex-1 flex items-center gap-4 p-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-600/20 group"
           >
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                <Camera size={24} className="text-white" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-black uppercase tracking-tight">Tirar ou enviar foto da planta</span>
                <span className="text-[10px] font-medium text-blue-100 opacity-80">Identificação instantânea por IA</span>
              </div>
           </button>

           <div className="flex gap-3">
             <button 
               onClick={() => openCamera('general')} 
               className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-stone-50 hover:bg-farm-50 border border-stone-100 hover:border-farm-200 transition-all group min-w-[80px]"
               title="Câmera Secundária"
             >
                <div className="p-2 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                  <Video size={20} className="text-stone-500 group-hover:text-farm-600" />
                </div>
                <span className="text-[10px] font-bold text-stone-500 group-hover:text-farm-700 uppercase tracking-tight">Webcam</span>
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

    </div>
  );
};

export default InputArea;
