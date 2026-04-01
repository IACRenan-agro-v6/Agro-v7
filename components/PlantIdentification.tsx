import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Leaf, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { identifyPlant, PlantIdentificationResult } from '../services/geminiService';

const PlantIdentification: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PlantIdentificationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Imagem selecionada:', file.name, file.type, file.size);
      setSelectedFile(file);
      setError(null);
      setResult(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    console.log('Imagem removida');
    setImagePreview(null);
    setSelectedFile(null);
    setError(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleIdentify = async () => {
    if (!selectedFile || !imagePreview) return;
    
    console.log('Botão Identificar clicado. Imagem pronta para envio.');
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Extract base64 data (remove the data:image/jpeg;base64, part)
      const base64Data = imagePreview.split(',')[1];
      const mimeType = selectedFile.type;

      const identificationResult = await identifyPlant(base64Data, mimeType);
      setResult(identificationResult);
    } catch (err: any) {
      setError('Não foi possível identificar a planta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden mt-8">
        <div className="p-6 border-b border-stone-100 bg-farm-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-farm-100 text-farm-700 rounded-lg">
              <Leaf size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-800">Identificar Planta</h1>
              <p className="text-sm text-stone-500">Tire uma foto para análise</p>
            </div>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {!imagePreview ? (
            <div 
              className="border-2 border-dashed border-stone-300 rounded-xl p-8 flex flex-col items-center justify-center gap-4 bg-stone-50 cursor-pointer hover:bg-stone-100 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="p-4 bg-white rounded-full shadow-sm text-farm-600">
                <Camera size={32} />
              </div>
              <div className="text-center">
                <p className="font-medium text-stone-700">Tocar para abrir a câmera</p>
                <p className="text-xs text-stone-500 mt-1">ou escolher da galeria</p>
              </div>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-stone-200 bg-stone-100 aspect-[3/4] flex items-center justify-center">
              <img 
                src={imagePreview} 
                alt="Preview da planta" 
                className="w-full h-full object-cover"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                aria-label="Remover imagem"
              >
                <X size={20} />
              </button>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />

          <button
            onClick={handleIdentify}
            disabled={!imagePreview || isLoading}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
              imagePreview && !isLoading
                ? 'bg-farm-600 text-white hover:bg-farm-700 shadow-md hover:shadow-lg' 
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Upload size={20} />
                Identificar Planta
              </>
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-farm-50 border border-farm-100 rounded-xl p-5 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={24} className="text-farm-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-stone-800 text-lg leading-tight">{result.plantName}</h3>
                  <p className="text-sm text-farm-700 font-medium mt-1">Saúde: {result.healthStatus}</p>
                </div>
              </div>
              
              {result.possibleProblems && result.possibleProblems.length > 0 && (
                <div className="pt-3 border-t border-farm-200/50">
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Possíveis Problemas</p>
                  <ul className="list-disc list-inside text-sm text-stone-700 space-y-1">
                    {result.possibleProblems.map((problem, idx) => (
                      <li key={idx}>{problem}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-3 border-t border-farm-200/50">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Recomendação</p>
                <p className="text-sm text-stone-700 leading-relaxed">{result.recommendation}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlantIdentification;
