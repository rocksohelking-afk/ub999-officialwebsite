import React from 'react';
import { Home, Gift, Wallet, MessageSquare, User } from 'lucide-react';
import { Language } from '../types';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  lang: Language;
  onOpenDeposit: () => void;
  onOpenChat: () => void;
  onOpenProfile: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  lang,
  onOpenDeposit,
  onOpenChat,
  onOpenProfile,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d131f]/95 backdrop-blur-md border-t border-slate-800 shadow-2xl pb-safe">
      <div className="max-w-md sm:max-w-xl mx-auto flex items-center justify-around px-2 py-1.5 relative">
        
        {/* Home */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 transition-colors ${
            currentTab === 'home' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className={`w-5 h-5 ${currentTab === 'home' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">{lang === 'bn' ? 'হোম' : 'Home'}</span>
        </button>

        {/* Promotion */}
        <button
          onClick={() => onSelectTab('promo')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 transition-colors ${
            currentTab === 'promo' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gift className={`w-5 h-5 ${currentTab === 'promo' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">{lang === 'bn' ? 'অফার' : 'Promo'}</span>
        </button>

        {/* Center Deposit Button (Raised prominent golden button) */}
        <div className="relative -top-4">
          <button
            onClick={onOpenDeposit}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-0.5 shadow-xl shadow-amber-500/30 flex items-center justify-center active:scale-95 transition-transform"
          >
            <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-amber-400 hover:bg-slate-900 transition-colors">
              <Wallet className="w-5 h-5 fill-current" />
              <span className="text-[8px] font-black uppercase text-amber-300 -mt-0.5">
                {lang === 'bn' ? 'ডিপোজিট' : 'Deposit'}
              </span>
            </div>
          </button>
        </div>

        {/* 24/7 Live Chat */}
        <button
          onClick={onOpenChat}
          className="flex flex-col items-center justify-center py-1 px-2.5 text-slate-400 hover:text-slate-200 transition-colors relative"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{lang === 'bn' ? '২৪/৭ চ্যাট' : 'Live CS'}</span>
          <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        </button>

        {/* Account / Mine */}
        <button
          onClick={onOpenProfile}
          className={`flex flex-col items-center justify-center py-1 px-2.5 transition-colors ${
            currentTab === 'profile' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className={`w-5 h-5 ${currentTab === 'profile' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">{lang === 'bn' ? 'আমার একাউন্ট' : 'Account'}</span>
        </button>

      </div>
    </div>
  );
};
