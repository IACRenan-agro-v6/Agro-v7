
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

  const startCamera = async () => {
    if (!isOpen) return;
    console.log("[CameraModal] Camera start requested", { facingMode });
    setIsLoading(true);
    setIsReady(false);
    
    try {
      if (stream) {
        console.log("[CameraModal] Stopping existing stream tracks before restart");
        stream.getTracks().forEach(track => track.stop());
      }

      let newStream: MediaStream;
      
      try {
        console.log("[CameraModal] Attempting getUserMedia with ideal facingMode:", facingMode);
        newStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (fallbackErr) {
        console.warn("[CameraModal] Ideal facingMode failed, using fallback:", fallbackErr);
        console.log("[CameraModal] Fallback camera mode used: { video: true }");
        newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }
      
      console.log("[CameraModal] Camera permission granted and stream obtained");

      if (videoRef.current) {
        const video = videoRef.current;
        
        // Set attributes BEFORE srcObject
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        
        console.log("[CameraModal] Attaching stream to video element");
        video.srcObject = newStream;
        
        video.onloadedmetadata = async () => {
          console.log("[CameraModal] Video metadata loaded, attempting play()");
          try {
            await video.play();
            console.log("[CameraModal] Video playing successfully");
            setStream(newStream);
            setIsReady(true);
            setIsLoading(false);
          } catch (playErr) {
            console.error("[CameraModal] Error playing video:", playErr);
            toast.error("Erro ao iniciar reprodução do vídeo.");
            setIsLoading(false);
          }
        };
      }
    } catch (err: any) {
      console.error("[CameraModal] Camera access error:", err);
      const msg = err.name === 'NotAllowedError' 
        ? "Permissão de câmera negada. Por favor, ative nas configurações do navegador." 
        : "Não foi possível acessar a câmera. Verifique as permissões.";
      toast.error(msg);
      onClose();
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is ready and it's a direct result of user action (modal opening)
      const timer = setTimeout(() => {
        startCamera();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      if (stream) {
        console.log("[CameraModal] Closing modal, stopping tracks");
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setIsReady(false);
    }
  }, [isOpen, facingMode]);

  useEffect(() => {
    // Final cleanup only on unmount
    return () => {
      if (stream) {
        console.log("[CameraModal] Component unmounting, stopping tracks");
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        onCapture(base64);
        onClose();
      }
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
