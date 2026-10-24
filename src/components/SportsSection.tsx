import React, { useState } from 'react';
import { Trophy, Radio, Clock, ShieldCheck, Flame } from 'lucide-react';
import { MOCK_MATCHES } from '../data/mockGames';
import { Language, MatchOdds } from '../types';

interface SportsSectionProps {
  lang: Language;
  onPlaceBet: (match: MatchOdds, selection: string, odds: number) => void;
}

export const SportsSection: React.FC<SportsSectionProps> = ({ lang, onPlaceBet }) => {
  const [selectedSport, setSelectedSport] = useState<'all' | 'cricket' | 'football'>('all');

  const filteredMatches = MOCK_MATCHES.filter((m) => {
    if (selectedSport === 'cricket') return m.id.startsWith('cricket');
    if (selectedSport === 'football') return m.id.startsWith('football');
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Sports Sub-header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              {lang === 'bn' ? 'লাইভ স্পোর্টস ও ক্রিকেট এক্সচেঞ্জ' : 'Live Sports & Cricket Exchange'}
              <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold uppercase animate-pulse">
                LIVE
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'bn' ? 'বিপিএল ও আন্তর্জাতিক ক্রিকেটে সেরা লাইভ অডস' : 'Top live odds for BPL & International Matches'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setSelectedSport('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              selectedSport === 'all' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'bn' ? 'সব' : 'All'}
          </button>
          <button
            onClick={() => setSelectedSport('cricket')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              selectedSport === 'cricket' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            🏏 {lang === 'bn' ? 'ক্রিকেট' : 'Cricket'}
          </button>
          <button
            onClick={() => setSelectedSport('football')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              selectedSport === 'football' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚽ {lang === 'bn' ? 'ফুটবল' : 'Football'}
          </button>
        </div>
      </div>

      {/* Match Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMatches.map((match) => (
          <div
            key={match.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 transition-all shadow-md flex flex-col justify-between"
          >
            <div>
              {/* Tournament Bar */}
              <div className="flex items-center justify-between text-xs mb-3 pb-2 border-b border-slate-800/80">
                <span className="font-semibold text-slate-300 truncate">{match.tournament}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 ${
                  match.status === 'LIVE' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  {match.status === 'LIVE' && <Radio className="w-3 h-3 animate-ping" />}
                  {match.time}
                </span>
              </div>

              {/* Teams & Score */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm font-bold text-white">
                  <span>{lang === 'bn' ? match.teamABn : match.teamA}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-white">
                  <span>{lang === 'bn' ? match.teamBBn : match.teamB}</span>
                </div>
                {match.score && (
                  <div className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                    {match.score}
                  </div>
                )}
              </div>
            </div>

            {/* Betting Odds Boxes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => onPlaceBet(match, match.teamA, match.oddsA)}
                className="bg-slate-950 hover:bg-amber-500/10 hover:border-amber-500/50 border border-slate-800 rounded-xl p-2 flex flex-col items-center justify-center transition-all group"
              >
                <span className="text-[11px] text-slate-400 group-hover:text-amber-300 truncate w-full text-center">
                  1 ({lang === 'bn' ? match.teamABn : match.teamA})
                </span>
                <span className="text-sm font-black font-mono text-amber-400 group-hover:scale-105 transition-transform">
                  {match.oddsA.toFixed(2)}
                </span>
              </button>

              {match.oddsDraw && (
                <button
                  onClick={() => onPlaceBet(match, 'Draw', match.oddsDraw!)}
                  className="bg-slate-950 hover:bg-amber-500/10 hover:border-amber-500/50 border border-slate-800 rounded-xl p-2 flex flex-col items-center justify-center transition-all group"
                >
                  <span className="text-[11px] text-slate-400 group-hover:text-amber-300">
                    {lang === 'bn' ? 'ড্র (Draw)' : 'Draw'}
                  </span>
                  <span className="text-sm font-black font-mono text-amber-400 group-hover:scale-105 transition-transform">
                    {match.oddsDraw.toFixed(2)}
                  </span>
                </button>
              )}

              <button
                onClick={() => onPlaceBet(match, match.teamB, match.oddsB)}
                className="bg-slate-950 hover:bg-amber-500/10 hover:border-amber-500/50 border border-slate-800 rounded-xl p-2 flex flex-col items-center justify-center transition-all group"
              >
                <span className="text-[11px] text-slate-400 group-hover:text-amber-300 truncate w-full text-center">
                  2 ({lang === 'bn' ? match.teamBBn : match.teamB})
                </span>
                <span className="text-sm font-black font-mono text-amber-400 group-hover:scale-105 transition-transform">
                  {match.oddsB.toFixed(2)}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
