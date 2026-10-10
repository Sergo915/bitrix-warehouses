import React from 'react';
import { Check, ClipboardList, Package, Truck } from 'lucide-react';

const bgColors = [
  'bg-[#217bfb] text-white',
  'bg-[#27c24c] text-white',
  'bg-[#f0ad4e] text-white',
  'bg-[#926dde] text-white',
  'bg-[#f05050] text-white'
];

export default function WarehouseTabs({ warehouses, activeId, onSelect, counts }) {
  return (
    <div className="flex gap-3 overflow-x-auto overflow-y-visible px-2 pt-2 pb-3">
      {warehouses.map((warehouse, index) => {
        const isActive = warehouse.id === activeId;
        const warehouseCount = counts[warehouse.id] || { vehicles: 0, pallets: 0, businessCargos: 0 };
        const colorClass = bgColors[index % bgColors.length];

        return (
          <button
            key={warehouse.id}
            onClick={() => onSelect(warehouse.id)}
            className={`p-3.5 rounded-xl text-left transition-all duration-200 transform hover:-translate-y-0.5 relative cursor-pointer shadow-md min-h-[112px] flex flex-col justify-between shrink-0 basis-[220px] lg:basis-[calc((100%-3.75rem)/6)] lg:min-w-0
              ${colorClass}
              ${isActive
                ? 'ring-3 ring-offset-2 ring-blue-500 shadow-lg font-medium'
                : 'opacity-85 hover:opacity-100 shadow-sm'
              }`}
          >
            {isActive && (
              <div className="absolute top-2 right-2 bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center shadow-sm z-10">
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
              </div>
            )}

            <div className="flex items-start justify-between gap-2.5 w-full mb-auto">
              <svg className="w-9 h-9 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,3 L2,9 L4,9 L4,20 L20,20 L20,9 L22,9 Z" />
                <rect x="6" y="10.5" width="3" height="1.5" rx="0.3" fill="white" fillOpacity="0.4" />
                <rect x="10.5" y="10.5" width="3" height="1.5" rx="0.3" fill="white" fillOpacity="0.4" />
                <rect x="15" y="10.5" width="3" height="1.5" rx="0.3" fill="white" fillOpacity="0.4" />
                <rect x="6" y="14" width="12" height="6" fill="white" />
                <line x1="7" y1="15.5" x2="17" y2="15.5" stroke="black" strokeWidth="0.6" strokeOpacity="0.2" />
                <line x1="7" y1="17" x2="17" y2="17" stroke="black" strokeWidth="0.6" strokeOpacity="0.2" />
                <line x1="7" y1="18.5" x2="17" y2="18.5" stroke="black" strokeWidth="0.6" strokeOpacity="0.2" />
              </svg>

              <span className="text-[13px] font-bold leading-tight tracking-wide text-right w-full block break-words">
                {warehouse.title}
              </span>
            </div>

            <div className="space-y-0.5 text-[11px] text-white/95 font-normal mt-2">
              <div className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 shrink-0" />
                <span>{warehouseCount.pallets} pallets</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 shrink-0" />
                <span>{warehouseCount.vehicles} vehicles</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5 shrink-0" />
                <span>{warehouseCount.businessCargos} business cargos</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
