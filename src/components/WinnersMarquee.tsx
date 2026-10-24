import React from 'react';
import { Trophy, TrendingUp } from 'lucide-react';
import { MOCK_WINNERS } from '../data/mockGames';
import { Language } from '../types';

interface WinnersMarqueeProps {
  lang: Language;
}

export const WinnersMarquee: React.FC<WinnersMarqueeProps> = ({ lang }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            {lang === 'bn' ? 'সাম্প্রতিক লাইভ উইনার্স' : 'Recent Big Winners'}
          </h3>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" />
          Live Payouts
        </span>
      </div>

      <div className="overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-3 min-w-max">
          {MOCK_WINNERS.map((win) => (
            <div
              key={win.id}
              className="bg-slate-950/90 border border-slate-800/80 rounded-xl px-3 py-2 flex items-center gap-2.5 shadow-sm"
            >
              <span className="text-lg">{win.avatar}</span>
              <div className="flex flex-col">
                <span className="text-[11px] font-mono text-slate-300 font-semibold">{win.user}</span>
                <span className="text-[10px] text-slate-400">{win.game}</span>
              </div>
              <div className="ml-2 pl-2 border-l border-slate-800 text-right">
                <span className="text-xs font-black font-mono text-amber-400">
                  +৳{win.amount.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
