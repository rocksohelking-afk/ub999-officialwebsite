import React from 'react';
import { PROVIDERS } from '../data/mockGames';
import { Language } from '../types';

interface ProviderFilterProps {
  activeProvider: string;
  onSelectProvider: (provider: string) => void;
  lang: Language;
}

export const ProviderFilter: React.FC<ProviderFilterProps> = ({
  activeProvider,
  onSelectProvider,
  lang,
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
        {PROVIDERS.map((prov) => {
          const isActive = activeProvider === prov.id;
          return (
            <button
              key={prov.id}
              onClick={() => onSelectProvider(prov.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all select-none ${
                isActive
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {prov.short}
            </button>
          );
        })}
      </div>
    </div>
  );
};
