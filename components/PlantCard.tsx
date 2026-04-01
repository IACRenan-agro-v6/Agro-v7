
import React from 'react';
import { motion } from 'motion/react';
import { Calendar, ChevronRight, CheckCircle2, AlertTriangle, Bug, Activity } from 'lucide-react';
import { IdentifiedPlant } from '../types';

interface PlantCardProps {
  plant: IdentifiedPlant;
  onClick: (plant: IdentifiedPlant) => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'healthy':
      return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-green-200 flex items-center gap-1"><CheckCircle2 size={12}/> Saudável</span>;
    case 'diseased':
      return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-red-200 flex items-center gap-1"><AlertTriangle size={12}/> Doença</span>;
    case 'pest':
      return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-amber-200 flex items-center gap-1"><Bug size={12}/> Praga</span>;
    case 'deficiency':
      return <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-yellow-200 flex items-center gap-1"><Activity size={12}/> Nutrição</span>;
    default:
      return null;
  }
};

const PlantCard: React.FC<PlantCardProps> = ({ plant, onClick }) => {
  return (
    <motion.div 
      layout
      onClick={() => onClick(plant)}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
    >
        <div className="relative h-56 overflow-hidden">
          <img 
            src={plant.imageUrl} 
            alt={plant.commonName} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
          <div className="absolute top-3 right-3">{getStatusBadge(plant.healthStatus)}</div>
          <div className="absolute bottom-3 left-3 text-white">
              <h3 className="text-xl font-bold leading-none mb-1 shadow-black drop-shadow-md">{plant.commonName}</h3>
              <p className="text-xs font-medium opacity-90 italic">{plant.scientificName}</p>
          </div>
        </div>

        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-[10px] uppercase text-stone-400 font-bold tracking-widest mb-1">Diagnóstico</div>
                <div className={`font-bold text-sm ${plant.healthStatus === 'healthy' ? 'text-green-700' : 'text-red-700'}`}>
                  {plant.diagnosisSummary}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase text-stone-400 font-bold tracking-widest mb-1">Confiança</div>
                <div className="font-bold text-sm text-farm-600">{plant.confidence}%</div>
              </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-between items-center text-xs text-stone-500 font-medium">
              <span className="flex items-center gap-1"><Calendar size={12}/> {plant.date}</span>
              <span className="flex items-center gap-1 group-hover:text-farm-600 transition-colors">Ver Detalhes <ChevronRight size={14} /></span>
          </div>
        </div>
    </motion.div>
  );
};

export default React.memo(PlantCard);
