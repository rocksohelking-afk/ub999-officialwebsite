import React from 'react';
import { Play, Flame, Sparkles, Star, Users } from 'lucide-react';
import { Game, Language } from '../types';

interface GameGridProps {
  games: Game[];
  lang: Language;
  onSelectGame: (game: Game) => void;
}

export const GameGrid: React.FC<GameGridProps> = ({ games, lang, onSelectGame }) => {
  if (games.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800">
        <p className="text-sm text-slate-400">
          {lang === 'bn' ? 'কোনো গেম পাওয়া যায়নি।' : 'No games found in this category.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
      {games.map((game) => (
        <div
          key={game.id}
          onClick={() => onSelectGame(game)}
          className="group relative bg-slate-900 border border-slate-800/80 hover:border-amber-500/60 rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col justify-between"
        >
          {/* Thumbnail Container */}
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
            <img
              src={game.image}
              alt={game.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex items-center gap-1">
              {game.isHot && (
                <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-md">
                  <Flame className="w-2.5 h-2.5 fill-current" />
                  HOT
                </span>
              )}
              {game.isNew && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow-md">
                  NEW
                </span>
              )}
            </div>

            {/* Provider Pill */}
            <div className="absolute top-2 right-2">
              <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur text-amber-300 border border-amber-500/30 text-[9px] font-bold uppercase font-mono">
                {game.provider}
              </span>
            </div>

            {/* Hover Play Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/40 group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>
          </div>

          {/* Meta Info */}
          <div className="p-2.5 flex flex-col justify-between flex-1">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                {lang === 'bn' ? game.titleBn : game.title}
              </h4>

              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{(game.rating ?? 4.9).toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-slate-500" />
                  <span>{(game.playersCount ?? 1200).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {game.jackpot && (
              <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-amber-300 font-mono font-bold truncate">
                JP: {game.jackpot}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
