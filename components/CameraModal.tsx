
import React, { useRef, useState, useEffect } from 'react';
import { X, Camera, RefreshCw, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isLoading, setIsLoading] = useState(true);
  const [showFallback, setShowFallback] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      return /android|iphone|ipad|ipod/i.test(userAgent);
    };
    setIsMobile(checkMobile());
  }, []);

  const startCamera = async () => {
    if (!isOpen) return;
    console.log("[Camera] start requested", { facingMode });
    setIsLoading(true);
    setIsReady(false);
    setShowFallback(false);
    
    const constraints = [
      { video: { facingMode: { ideal: 'environment' } }, audio: false },
      { video: { facingMode: 'environment' }, audio: false },
      { video: true, audio: false }
    ];

    let newStream: MediaStream | null = null;
    let lastError: any = null;

    for (let i = 0; i < constraints.length; i++) {
      try {
        console.log(`[Camera] trying constraints #${i + 1}`, constraints[i]);
        newStream = await navigator.mediaDevices.getUserMedia(constraints[i]);
        if (newStream) break;
      } catch (err: any) {
        console.warn(`[Camera] constraints #${i + 1} failed:`, err.name, err.message);
        lastError = err;
      }
    }

    if (!newStream) {
      console.error("[Camera] all constraints failed", lastError);
      console.log("[CameraMobile] getUserMedia failed");
      let msg = "Não foi possível acessar a câmera.";
      
      if (lastError) {
        console.log(`[Camera] error name/message: ${lastError.name} / ${lastError.message}`);
        if (lastError.name === 'NotAllowedError' || lastError.name === 'PermissionDeniedError') {
          msg = "Permissão negada. Por favor, ative o acesso à câmera nas configurações do seu navegador.";
        } else if (lastError.name === 'NotFoundError' || lastError.name === 'DevicesNotFoundError') {
          msg = "Câmera não encontrada no dispositivo.";
        } else if (lastError.name === 'NotReadableError' || lastError.name === 'TrackStartError') {
          msg = "Câmera em uso por outro aplicativo ou bloqueada pelo sistema.";
        } else if (lastError.name === 'OverconstrainedError' || lastError.name === 'ConstraintNotSatisfiedError') {
          msg = "Configurações de câmera incompatíveis com este dispositivo.";
        }
      }
      
      if (isMobile) {
        console.log("[CameraMobile] using file input fallback");
        setShowFallback(true);
        setIsLoading(false);
      } else {
        toast.error(msg);
        onClose();
        setIsLoading(false);
      }
      return;
    }

    console.log("[Camera] permission granted");

    try {
      if (videoRef.current) {
        const video = videoRef.current;
        
        // Set attributes BEFORE srcObject
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        
        console.log("[Camera] stream attached");
        video.srcObject = newStream;
        
        video.onloadedmetadata = async () => {
          console.log("[Camera] video metadata loaded, attempting play()");
          try {
            await video.play();
            console.log("[Camera] video playing");
            setStream(newStream);
            setIsReady(true);
            setIsLoading(false);
          } catch (playErr: any) {
            console.error("[Camera] error playing video:", playErr.name, playErr.message);
            toast.error("Erro ao iniciar reprodução do vídeo. Tente novamente.");
            setIsLoading(false);
          }
        };
      }
    } catch (err: any) {
      console.error("[Camera] final setup error:", err);
      toast.error("Erro ao configurar o visor da câmera.");
      onClose();
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is ready and it's a direct result of user action (modal opening)
      const timer = setTimeout(() => {
        startCamera();
      }, 150);
      return () => clearTimeout(timer);
    } else {
      if (stream) {
        console.log("[Camera] stopping tracks (modal closed)");
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setIsReady(false);
    }
  }, [isOpen, facingMode]);

  useEffect(() => {
    return () => {
      if (stream) {
        console.log("[Camera] stopping tracks (unmount)");
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureImage = () => {
    console.log("[Camera] capture clicked");
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        console.log("[Camera] frame drawn to canvas");
        
        const base64Full = canvas.toDataURL('image/jpeg', 0.8);
        const base64 = base64Full.split(',')[1];
        console.log(`[Camera] image generated size/mime: ${Math.round(base64.length * 0.75 / 1024)}KB / image/jpeg`);
        
        onCapture(base64);
        onClose();
      }
    }
  };

  const handleFallbackChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      console.log("[CameraMobile] file selected");
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        onCapture(base64);
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleFacingMode = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl aspect-[3/4] bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col">
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
          <button 
            onClick={onClose}
            className="p-3 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-colors"
          >
            <X size={24} />
          </button>
          <button 
            onClick={toggleFacingMode}
            className="p-3 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-black/60 transition-colors"
          >
            <RefreshCw size={24} />
          </button>
        </div>

        {/* Viewfinder */}
        <div className="flex-1 relative flex items-center justify-center bg-stone-950">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-4 z-10">
              <Loader2 size={48} className="animate-spin text-farm-500" />
              <p className="text-sm font-bold tracking-widest uppercase opacity-50">Iniciando Câmera...</p>
            </div>
          )}
          
          {showFallback && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-6 z-10 p-6 text-center">
              <div className="p-4 bg-stone-800 rounded-2xl border border-white/10">
                <Camera size={48} className="text-stone-400 mx-auto mb-4" />
                <p className="text-sm font-medium mb-2">Não conseguimos abrir o preview da câmera.</p>
                <p className="text-xs text-stone-500 mb-6">Mas você ainda pode tirar uma foto usando a câmera do seu aparelho.</p>
                
                <label className="inline-flex items-center justify-center px-6 py-3 bg-farm-600 hover:bg-farm-700 text-white rounded-full font-bold text-sm cursor-pointer transition-colors shadow-lg">
                  <Camera size={18} className="mr-2" />
                  Tirar foto com câmera do aparelho
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    className="hidden" 
                    onChange={handleFallbackChange}
                  />
                </label>
              </div>
            </div>
          )}

          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            webkit-playsinline="true"
            className={`w-full h-full object-cover transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`}
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Controls */}
        <div className="p-8 flex justify-center items-center bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0">
          <button 
            onClick={captureImage}
            disabled={!isReady}
            className={`
              w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all active:scale-90
              ${isReady ? 'bg-white/20 hover:bg-white/40' : 'bg-white/5 opacity-50 cursor-not-allowed'}
            `}
          >
            <div className="w-16 h-16 bg-white rounded-full shadow-inner flex items-center justify-center">
              <Camera size={32} className="text-stone-900" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraModal;
