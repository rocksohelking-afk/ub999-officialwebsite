import React from 'react';
import { X, ChevronLeft, Wrench } from 'lucide-react';
import { Game, Language } from '../types';
import { AviatorCrashGameWeb } from './AviatorCrashGameWeb';
import { isAviatorGame, getGameBehavior } from '../utils/gameBehaviors';

interface GameModalProps {
  game: Game | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  userBalance: number;
  onUpdateBalance: (amount: number) => void;
}

export const GameModal: React.FC<GameModalProps> = ({
  game,
  isOpen,
  onClose,
  lang,
  userBalance,
  onUpdateBalance,
}) => {
  if (!isOpen || !game) return null;

  // If this is the Aviator Spribe crash game, render the full Spribe Aviator Experience
  const isAviator = isAviatorGame(game.id, game.title) || 
                    game.titleBn?.toLowerCase().includes('aviator') ||
                    (game.category === 'crash' && game.provider?.toUpperCase() === 'SPRIBE');

  if (isAviator) {
    return (
      <AviatorCrashGameWeb
        game={game}
        isOpen={isOpen}
        onClose={onClose}
        currentBalance={userBalance}
        onBalanceChange={onUpdateBalance}
      />
    );
  }

  const behavior = getGameBehavior(game.id, game.title);

  // Behavior 1: 'none' -> চাপ দিলে কিছুই আসবে না
  if (behavior === 'none') {
    return null;
  }

  // Behavior 2: 'slow_net' -> নেট স্লো থাকলে যেমন ভাবে কালো হয়ে থাকে মাঝখানে গোল দাগ ঘুরতে থাকে ঠিক ওমন করবে
  if (behavior === 'slow_net') {
    return (
      <div 
        onClick={onClose}
        className="fixed inset-0 z-50 bg-[#000000] flex flex-col items-center justify-center select-none animate-in fade-in duration-150 cursor-pointer"
      >
        {/* Top subtle back button */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/80 hover:text-white transition-all cursor-pointer"
            title="Back"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
          </button>
        </div>

        {/* Center rotating circle loader (infinite slow network buffering effect) */}
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="flex flex-col items-center justify-center pointer-events-auto"
        >
          <div className="w-12 h-12 rounded-full border-[3.5px] border-white/15 border-t-white animate-spin" />
        </div>
      </div>
    );
  }

  // Behavior 3: 'not_found_420' -> ৪২০ নট ফাউন্ড লেখা যেমন মাঝে মাঝে বিভিন্ন জায়গায় আসে না ঠিক ওমন আসবে
  if (behavior === 'not_found_420') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0d12] text-slate-200 flex flex-col items-center justify-center p-6 select-none font-mono animate-in fade-in duration-150">
        {/* Top Back Button */}
        <div className="absolute top-4 left-4">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 cursor-pointer transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        <div className="max-w-sm w-full text-center space-y-3">
          <div className="text-7xl font-black text-rose-500 tracking-tight font-sans select-none">
            420
          </div>
          <div className="text-xl font-bold text-white tracking-wide font-sans">
            420 Not Found
          </div>
          <div className="h-px w-20 bg-slate-700/80 mx-auto my-3" />
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            The requested game resource was not found on this server.
          </p>
          <p className="text-[11px] text-slate-500 font-mono pt-1">
            nginx/1.22.1 &bull; Gateway Error
          </p>

          <div className="pt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-sans font-bold text-xs shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
            >
              হোমে ফিরে যান
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Behavior 4: 'updating' -> এমন লেখা ভেসে উঠবে যেন মনে মনে গেম আপডেট চলছে
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-5 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#0f2e27] to-[#071e19] border border-[#00f5cc]/35 rounded-3xl p-6 text-center shadow-2xl shadow-black/80 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-44 h-44 bg-[#00f5cc]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Maintenance Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#00f5cc]/15 border border-[#00f5cc]/40 flex items-center justify-center shadow-inner">
          <Wrench className="w-8 h-8 text-[#00f5cc] animate-pulse" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-black text-[#ffd000] tracking-wide mb-2">
          গেম আপডেট চলছে
        </h3>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold mb-3">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>সিস্টেম রক্ষণাবেক্ষণ</span>
        </div>

        {/* Message */}
        <p className="text-xs text-white/85 leading-relaxed mb-6 font-medium">
          গেমটির সার্ভার ও নতুন ফিচার আপডেটের কাজ চলছে। সাময়িক অসুবিধার জন্য আমরা আন্তরিকভাবে দুঃখিত। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।
        </p>

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ffd000] to-yellow-400 hover:from-yellow-400 hover:to-[#ffd000] active:scale-98 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          ঠিক আছে (OK)
        </button>
      </div>
    </div>
  );
};
