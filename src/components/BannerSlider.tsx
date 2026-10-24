import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { PROMO_SLIDES } from '../data/mockGames';
import { Language } from '../types';

interface BannerSliderProps {
  lang: Language;
  onSelectPromo: () => void;
}

export const BannerSlider: React.FC<BannerSliderProps> = ({ lang, onSelectPromo }) => {
  const [current, setCurrent] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const slide = PROMO_SLIDES[current];

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-800/80 shadow-2xl bg-slate-900 group">
      {/* Slide Container */}
      <div 
        onClick={onSelectPromo}
        className={`w-full min-h-[160px] sm:min-h-[220px] md:min-h-[260px] bg-gradient-to-r ${slide.bg} p-5 sm:p-8 flex flex-col justify-between cursor-pointer transition-all duration-500 relative overflow-hidden`}
      >
        {/* Subtle background glow & accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-4 sm:right-16 text-7xl sm:text-9xl opacity-20 select-none pointer-events-none font-black font-mono">
          999
        </div>

        {/* Top Tag & Badge */}
        <div className="flex items-center gap-2 z-10">
          <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur text-white text-[10px] sm:text-xs font-bold border border-white/20 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-300" />
            {slide.tag}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] sm:text-xs font-black uppercase">
            {slide.badge}
          </span>
        </div>

        {/* Central Titles */}
        <div className="z-10 my-2 max-w-xl">
          <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-md leading-tight">
            {lang === 'bn' ? slide.titleBn : slide.titleEn}
          </h2>
          <p className="text-xs sm:text-sm text-slate-200/90 mt-1.5 drop-shadow line-clamp-2">
            {lang === 'bn' ? slide.subBn : slide.subEn}
          </p>
        </div>

        {/* Action Button */}
        <div className="z-10 flex items-center justify-between">
          <button className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition-all">
            {lang === 'bn' ? 'ক্লেইম করুন' : 'Claim Now'}
          </button>
          
          <div className="text-[11px] text-white/80 font-mono hidden sm:block">
            {lang === 'bn' ? 'নিয়মাবলী ও শর্ত প্রযোজ্য' : 'T&C Apply'}
          </div>
        </div>
      </div>

      {/* Navigation arrows (desktop) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setCurrent((prev) => (prev - 1 + PROMO_SLIDES.length) % PROMO_SLIDES.length);
        }}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setCurrent((prev) => (prev + 1) % PROMO_SLIDES.length);
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
        {PROMO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-1.5 rounded-full transition-all ${
              current === idx ? 'w-6 bg-amber-400' : 'w-2 bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
