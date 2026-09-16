import React from 'react';
import { Plus, Check, ArrowUpRight } from 'lucide-react';
import { DESTINATIONS } from '../data/travelData';
import { handleImageFallback } from '../utils/imageFallback';

interface DestinationsGridProps {
  onSelectDestination: (destName: string) => void;
  selectedDestinations?: string[];
}

export const DestinationsGrid: React.FC<DestinationsGridProps> = ({
  onSelectDestination,
  selectedDestinations = [],
}) => {
  return (
    <section id="destinations" className="py-14 sm:py-18 bg-slate-50/70 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2">
          <span className="text-xs font-extrabold tracking-widest text-brand-green uppercase">
            EXPLORE KERALA
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-brand-navy">
            Destinations worth discovering
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Click any destination to include it in your customized trip request.
          </p>
        </div>

        {/* 8-Destination Grid: 2-column on mobile, 4-column on desktop with compact, sleek height */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {DESTINATIONS.map((dest) => {
            const isSelected = selectedDestinations.some(
              (d) => d.toLowerCase() === dest.name.toLowerCase()
            );

            return (
              <div
                key={dest.id}
                onClick={() => onSelectDestination(dest.name)}
                className={`group relative rounded-xl sm:rounded-2xl overflow-hidden aspect-[4/2.7] sm:aspect-[4/3] lg:aspect-[4/3] cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 ${
                  isSelected
                    ? 'border-2 border-brand-green shadow-lg scale-[1.01]'
                    : 'border border-slate-200 hover:border-brand-green/60'
                }`}
              >
                {/* Destination Image */}
                <img
                  src={dest.image}
                  alt={dest.name}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => handleImageFallback(e, dest.id)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Shading / Gradient Overlay */}
                <div
                  className={`absolute inset-0 transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-t from-[#051930]/95 via-[#083344]/80 to-[#064e3b]/50'
                      : 'bg-gradient-to-t from-black/90 via-black/35 to-transparent'
                  }`}
                />

                {/* Top Badge: Selection Indicator */}
                <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded-full transition-all ${
                      isSelected
                        ? 'bg-brand-green text-white shadow-md'
                        : 'bg-black/50 text-white backdrop-blur-md group-hover:bg-brand-green group-hover:text-white'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3 h-3 stroke-[2.5]" />
                        <span className="hidden xs:inline">Selected</span>
                        <span className="xs:hidden">Added</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span className="hidden xs:inline">Add to Trip</span>
                        <span className="xs:hidden">Add</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Bottom Content with Proportional, Compact Typography */}
                <div className="absolute bottom-0 inset-x-0 p-2.5 sm:p-3.5 lg:p-4 text-white z-10 space-y-0.5">
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 drop-shadow-xs block">
                    {dest.category}
                  </span>
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-sm sm:text-lg lg:text-xl font-bold font-display tracking-tight text-white group-hover:text-emerald-300 transition-colors drop-shadow-sm truncate">
                      {dest.name}
                    </h3>
                    <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-200 line-clamp-1">
                    {dest.subtitle}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-emerald-300 font-semibold pt-0.5 hidden sm:block">
                    Best Season: {dest.bestTime}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
