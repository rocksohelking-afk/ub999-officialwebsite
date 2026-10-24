import React from 'react';
import { 
  Flame, 
  Trophy, 
  Dices, 
  Gamepad2, 
  Plane, 
  Layers, 
  Fish, 
  Ticket, 
  Gift 
} from 'lucide-react';
import { Language } from '../types';

export interface CategoryItem {
  id: string;
  nameBn: string;
  nameEn: string;
  icon: any;
  hot?: boolean;
}

export const CATEGORIES: CategoryItem[] = [
  { id: 'hot', nameBn: 'জনপ্রিয় (Hot)', nameEn: 'Hot Games', icon: Flame, hot: true },
  { id: 'sports', nameBn: 'স্পোর্টস', nameEn: 'Sports', icon: Trophy },
  { id: 'casino', nameBn: 'লাইভ ক্যাসিনো', nameEn: 'Live Casino', icon: Dices, hot: true },
  { id: 'slots', nameBn: 'স্লট', nameEn: 'Slots', icon: Gamepad2 },
  { id: 'crash', nameBn: 'ক্র্যাশ (Aviator)', nameEn: 'Crash Games', icon: Plane, hot: true },
  { id: 'table', nameBn: 'টেবিল', nameEn: 'Table Games', icon: Layers },
  { id: 'fishing', nameBn: 'ফিশিং', nameEn: 'Fishing', icon: Fish },
  { id: 'lottery', nameBn: 'লটারি', nameEn: 'Lottery', icon: Ticket },
  { id: 'promo', nameBn: 'অফার', nameEn: 'Promotions', icon: Gift },
];

interface CategoryNavProps {
  activeCategory: string;
  onSelectCategory: (id: string) => void;
  lang: Language;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
  lang,
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-max pb-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`relative px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all duration-200 select-none ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isActive ? 'text-slate-950 stroke-[2.5]' : 'text-amber-400'}`} />
              <span>{lang === 'bn' ? cat.nameBn : cat.nameEn}</span>
              
              {cat.hot && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
