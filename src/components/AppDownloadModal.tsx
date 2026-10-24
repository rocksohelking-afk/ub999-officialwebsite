import React, { useState } from 'react';
import { X, Download, Smartphone, Apple, ShieldCheck, CheckCircle, Share, PlusSquare, ArrowDown } from 'lucide-react';
import { Language } from '../types';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  installPrompt?: any;
  onInstallSuccess?: () => void;
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({
  isOpen,
  onClose,
  lang,
  installPrompt,
  onInstallSuccess,
}) => {
  if (!isOpen) return null;

  const [installStatus, setInstallStatus] = useState<string | null>(null);

  const handleInstallApp = async () => {
    if (installPrompt) {
      try {
        installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          if (onInstallSuccess) onInstallSuccess();
        }
      } catch (err) {
        console.error(err);
      }
      onClose();
      return;
    }

    if (onInstallSuccess) {
      onInstallSuccess();
    }
    onClose();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto select-none animate-in fade-in duration-150"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#002821] border border-[#00f5cc]/35 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-150 text-slate-100"
      >
        
        {/* Header */}
        <div className="bg-[#01221b] px-5 py-3.5 border-b border-[#044033] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {lang === 'bn' ? 'UB999 ইনস্টল অ্যাপ' : 'Install UB999 App'}
              </h3>
              <p className="text-[11px] text-[#00f5cc]/80">অফিসিয়াল ওয়েব অ্যাপ • ফুল-স্ক্রিন মোড</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-[#00382e] hover:bg-[#00473a] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          
          {/* Main Download Card */}
          <div className="bg-gradient-to-r from-amber-500/10 via-[#00f5cc]/10 to-amber-500/10 border border-[#00f5cc]/30 rounded-xl p-4 text-center">
            <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto shadow-xl shadow-emerald-500/15 mb-3 border border-amber-400/50 p-1 bg-[#01221a]">
              <img src="/ub999_logo.svg" alt="UB999 Gaming App" className="w-full h-full object-contain" />
            </div>
            <h4 className="text-base font-black text-white">UB999 Gaming App</h4>
            <p className="text-xs text-slate-300 mt-1">
              এক ক্লিকে আপনার ফোনের হোম স্ক্রিনে অ্যাপের মতো বসে যাবে এবং সরাসরি অ্যাপের মতোই ফুল-স্ক্রিনে ওপেন হবে।
            </p>

            <button
              onClick={handleInstallApp}
              className="mt-4 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#ffd000] to-yellow-400 hover:from-yellow-400 hover:to-[#ffd000] text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Smartphone className="w-5 h-5 stroke-[2.3]" />
              <span>{lang === 'bn' ? 'ইনস্টল অ্যাপ' : 'Install App'}</span>
            </button>
          </div>

          {/* Simple Direct Steps */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-[#ffd000]">
              {lang === 'bn' ? 'হোমস্ক্রিনে বসানোর সহজ পদ্ধতি:' : 'How to Add to Home Screen:'}
            </h5>
            <div className="space-y-2 text-xs text-slate-200">
              {/* Android Guide */}
              <div className="bg-[#001e19] p-3 rounded-xl border border-[#05493b] flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Smartphone className="w-4 h-4 shrink-0" />
                  <span>অ্যান্ড্রয়েড (Chrome / Edge):</span>
                </div>
                <p className="text-[11.5px] text-slate-300 leading-relaxed pl-6">
                  উপরের বাটনে চাপ দিন, অথবা ব্রাউজারের উপরে ডানদিকের <strong>৩টি ডট (⋮)</strong> মেনু চাপ দিয়ে <strong>&quot;Install app&quot;</strong> বা <strong>&quot;Add to Home screen&quot;</strong> সিলেক্ট করুন।
                </p>
              </div>

              {/* iOS Guide */}
              <div className="bg-[#001e19] p-3 rounded-xl border border-[#05493b] flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-sky-400 font-bold">
                  <Apple className="w-4 h-4 shrink-0" />
                  <span>আইফোন / আইপ্যাড (Safari):</span>
                </div>
                <p className="text-[11.5px] text-slate-300 leading-relaxed pl-6">
                  সাফারি ব্রাউজারের নিচে থাকা <strong>Share (শেয়ার 📤)</strong> আইকনে চাপ দিন এবং নিচে স্ক্রল করে <strong>&quot;Add to Home Screen&quot; (➕)</strong> এ ক্লিক করুন।
                </p>
              </div>
            </div>
          </div>

          {/* Result notice */}
          <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-2 px-3 rounded-lg text-center font-medium">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>হোম স্ক্রিনে আইকন বসে গেলে চাপ দিলেই অ্যাপের মতো ওপেন হবে</span>
          </div>

        </div>

      </div>
    </div>
  );
};
