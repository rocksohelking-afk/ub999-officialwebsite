import React from 'react';
import { Download, Globe, Bell, Wallet, User as UserIcon, LogIn, UserPlus } from 'lucide-react';
import { Language } from '../types';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  isLoggedIn: boolean;
  userBalance: number;
  userPhone?: string;
  userName?: string;
  onOpenDeposit: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenDownload: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  isLoggedIn,
  userBalance,
  userPhone,
  userName,
  onOpenDeposit,
  onOpenAuth,
  onOpenDownload,
  onOpenProfile,
}) => {
  const maskedDisplay = userPhone && userPhone.length >= 8
    ? `${userPhone.slice(0, 3)}***${userPhone.slice(-3)}`
    : (userName || 'Member');
  return (
    <header className="sticky top-0 z-40 bg-[#0d131f] border-b border-slate-800/80 shadow-md">
      
      {/* Top App Download Ribbon */}
      <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 px-3 py-1.5 text-xs font-semibold flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <span className="bg-slate-950 text-amber-400 px-1.5 py-0.5 rounded text-[10px] font-bold">APK</span>
          <span className="truncate">
            {lang === 'bn' 
              ? 'UB999 অফিসিয়াল মোবাইল অ্যাপ - সুপার ফাস্ট ও সেফ' 
              : 'UB999 Official Mobile App - Fast & Smooth'}
          </span>
        </div>
        <button
          onClick={onOpenDownload}
          className="ml-2 flex items-center gap-1 bg-slate-950 text-amber-300 hover:text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all shrink-0 shadow-sm"
        >
          <Download className="w-3 h-3" />
          <span>{lang === 'bn' ? 'ডাউনলোড' : 'Download'}</span>
        </button>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 cursor-pointer select-none">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-yellow-300">
              <span className="text-slate-950 font-black text-xl leading-none">👑</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-0.5">
                <span className="text-xl font-black tracking-tight text-white font-mono">TK</span>
                <span className="text-xl font-black tracking-tight text-amber-400 font-mono">999</span>
                <span className="text-[10px] font-bold text-amber-300 ml-1 px-1 py-0.2 bg-amber-500/20 border border-amber-500/40 rounded">VIP</span>
              </div>
              <span className="text-[9px] text-slate-400 tracking-widest font-semibold uppercase -mt-0.5">
                Official Gaming
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Language Switcher */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
            title="Switch Language"
          >
            <span className="text-sm">{lang === 'bn' ? '🇧🇩' : '🇬🇧'}</span>
            <span className="hidden sm:inline">{lang === 'bn' ? 'বাংলা' : 'ENG'}</span>
          </button>

          {isLoggedIn ? (
            /* Logged in state */
            <div className="flex items-center gap-2">
              <div 
                onClick={onOpenProfile}
                className="bg-slate-900 border border-amber-500/40 rounded-xl px-2.5 py-1 flex items-center gap-2 cursor-pointer hover:border-amber-400 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold border border-amber-500/30">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-slate-400 leading-none">{maskedDisplay}</span>
                  <span className="text-xs font-bold font-mono text-amber-400 leading-tight">
                    ৳{userBalance.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={onOpenDeposit}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1 active:scale-95 transition-all"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'ডিপোজিট' : 'Deposit'}</span>
              </button>
            </div>
          ) : (
            /* Logged out state */
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'লগইন' : 'Login'}</span>
              </button>
              
              <button
                onClick={() => onOpenAuth('register')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-105 shadow-md shadow-amber-500/20 transition-all flex items-center gap-1 active:scale-95"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'রেজিস্টার' : 'Register'}</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
