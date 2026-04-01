
import React from 'react';

const PlantSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden animate-pulse">
      <div className="h-56 bg-stone-200"></div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-2">
            <div className="h-2 w-16 bg-stone-200 rounded"></div>
            <div className="h-4 w-32 bg-stone-200 rounded"></div>
          </div>
          <div className="space-y-2 text-right">
            <div className="h-2 w-16 bg-stone-200 rounded ml-auto"></div>
            <div className="h-4 w-12 bg-stone-200 rounded ml-auto"></div>
          </div>
        </div>
        <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
          <div className="h-3 w-24 bg-stone-200 rounded"></div>
          <div className="h-3 w-20 bg-stone-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default PlantSkeleton;
