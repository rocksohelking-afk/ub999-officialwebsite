import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Check, 
  Copy, 
  Clock, 
  X, 
  FileUp, 
  AlertCircle,
  ThumbsUp,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Language } from '../types';
import { subscribeToSettings, getLocalSettings } from '../utils/firebaseService';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  userPhone?: string;
  onSuccessDeposit: (amount: number, trxId: string, method: string) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  lang,
  userPhone,
  onSuccessDeposit,
}) => {
  // Method selection matching Screenshot_20261010-032813.jpg
  const [selectedMethod, setSelectedMethod] = useState<
    'bkash_send' | 'nagad_send' | 'nagad_vip' | 'nagad_fast'
  >('bkash_send');

  // Channel selection
  const [selectedChannel, setSelectedChannel] = useState<string>('vip');

  // Amount selection
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>('');

  // Step state: 'form' | 'payment_details' | 'success'
  const [currentStep, setCurrentStep] = useState<'form' | 'payment_details' | 'success'>('form');
  const [trxId, setTrxId] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showTrxGuideModal, setShowTrxGuideModal] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 05:00 countdown timer
  
  // Official Deposit Numbers as configured
  const OFFICIAL_BKASH_NUMBERS = [
    '01349782631',
    '01318097241',
    '01357287095'
  ];

  const OFFICIAL_NAGAD_NUMBERS = [
    '01768782530',
    '01349845888',
    '01349845906',
    '01349845902',
    '01347246605'
  ];

  // Live numbers dynamically updated from Admin Panel, with 100% guaranteed fallback to official numbers
  const [bkashPool, setBkashPool] = useState<string[]>(() => {
    try {
      const local = getLocalSettings();
      const valid = (local.bkashNumbers || []).filter(n => Boolean(n) && n.trim().length >= 10);
      if (valid.length > 0) return valid;
      if (local.bkashNumber && local.bkashNumber.trim().length >= 10) return [local.bkashNumber.trim()];
    } catch {}
    return OFFICIAL_BKASH_NUMBERS;
  });

  const [nagadPool, setNagadPool] = useState<string[]>(() => {
    try {
      const local = getLocalSettings();
      const valid = (local.nagadNumbers || []).filter(n => Boolean(n) && n.trim().length >= 10);
      if (valid.length > 0) return valid;
      if (local.nagadNumber && local.nagadNumber.trim().length >= 10) return [local.nagadNumber.trim()];
    } catch {}
    return OFFICIAL_NAGAD_NUMBERS;
  });

  // Listen to Admin Panel updates in real-time
  useEffect(() => {
    const unsub = subscribeToSettings((s) => {
      if (s.bkashNumbers && Array.isArray(s.bkashNumbers)) {
        const validBk = s.bkashNumbers.filter(n => Boolean(n) && n.trim().length >= 10);
        if (validBk.length > 0) {
          setBkashPool(prev => (JSON.stringify(prev) === JSON.stringify(validBk) ? prev : validBk));
        }
      } else if (s.bkashNumber && s.bkashNumber.trim().length >= 10) {
        setBkashPool(prev => (prev.length === 1 && prev[0] === s.bkashNumber?.trim() ? prev : [s.bkashNumber.trim()]));
      }

      if (s.nagadNumbers && Array.isArray(s.nagadNumbers)) {
        const validNg = s.nagadNumbers.filter(n => Boolean(n) && n.trim().length >= 10);
        if (validNg.length > 0) {
          setNagadPool(prev => (JSON.stringify(prev) === JSON.stringify(validNg) ? prev : validNg));
        }
      } else if (s.nagadNumber && s.nagadNumber.trim().length >= 10) {
        setNagadPool(prev => (prev.length === 1 && prev[0] === s.nagadNumber?.trim() ? prev : [s.nagadNumber.trim()]));
      }
    });

    const onStorageOrConfig = () => {
      try {
        const local = getLocalSettings();
        const validBk = (local.bkashNumbers || []).filter(n => Boolean(n) && n.trim().length >= 10);
        if (validBk.length > 0) {
          setBkashPool(prev => (JSON.stringify(prev) === JSON.stringify(validBk) ? prev : validBk));
        }
        const validNg = (local.nagadNumbers || []).filter(n => Boolean(n) && n.trim().length >= 10);
        if (validNg.length > 0) {
          setNagadPool(prev => (JSON.stringify(prev) === JSON.stringify(validNg) ? prev : validNg));
        }
      } catch {}
    };

    window.addEventListener('storage', onStorageOrConfig);
    window.addEventListener('ub999_admin_config_updated', onStorageOrConfig);

    return () => {
      unsub();
      window.removeEventListener('storage', onStorageOrConfig);
      window.removeEventListener('ub999_admin_config_updated', onStorageOrConfig);
    };
  }, []);

  const safeBkashPool = bkashPool.length > 0 ? bkashPool : OFFICIAL_BKASH_NUMBERS;
  const safeNagadPool = nagadPool.length > 0 ? nagadPool : OFFICIAL_NAGAD_NUMBERS;

  // Current index for auto-rotation
  const [bkashIndex, setBkashIndex] = useState<number>(0);
  const [nagadIndex, setNagadIndex] = useState<number>(0);
  const prevCategoryRef = React.useRef<'bkash' | 'nagad'>('bkash');

  // When modal opens: Initialize user-distinct distributed number so users receive different numbers
  useEffect(() => {
    if (isOpen) {
      setSelectedAmount(0);
      setCustomAmount('');
      setCurrentStep('form');
      setTrxId('');
      setTimeLeft(300);

      // Compute distinct seed per user so different users get distributed across the numbers
      const userKey = userPhone || (() => {
        let sid = sessionStorage.getItem('ub999_user_seed');
        if (!sid) {
          sid = 'user_' + Math.floor(Math.random() * 1000000);
          sessionStorage.setItem('ub999_user_seed', sid);
        }
        return sid;
      })();

      let hash = 0;
      for (let i = 0; i < userKey.length; i++) {
        hash = (hash * 31 + userKey.charCodeAt(i)) & 0xffffffff;
      }
      const seedVal = Math.abs(hash);

      setBkashIndex(seedVal % safeBkashPool.length);
      setNagadIndex((seedVal + 3) % safeNagadPool.length);
    }
  }, [isOpen, userPhone, safeBkashPool.length, safeNagadPool.length]);

  // When timer finishes (5 minutes / 300s): Auto-rotate to next official number and reset timer
  useEffect(() => {
    if (currentStep === 'payment_details') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Time expired: rotate to next available official number
            if (selectedMethod.includes('nagad')) {
              setNagadIndex((cur) => (cur + 1) % safeNagadPool.length);
            } else {
              setBkashIndex((cur) => (cur + 1) % safeBkashPool.length);
            }
            return 300; // Reset timer for next number
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentStep, selectedMethod, safeBkashPool.length, safeNagadPool.length]);

  // When user switches method (bKash <-> Nagad): rotate to a different number so previous number is not repeated
  const currentCategory: 'bkash' | 'nagad' = selectedMethod.includes('nagad') ? 'nagad' : 'bkash';

  useEffect(() => {
    if (prevCategoryRef.current !== currentCategory) {
      if (currentCategory === 'bkash') {
        setBkashIndex((cur) => (cur + 1) % safeBkashPool.length);
      } else if (currentCategory === 'nagad') {
        setNagadIndex((cur) => (cur + 1) % safeNagadPool.length);
      }
      prevCategoryRef.current = currentCategory;
    }
  }, [currentCategory, safeBkashPool.length, safeNagadPool.length]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `00:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  // Selected method active number strictly from current rotation index of official lists
  const activeBkashNum = safeBkashPool[bkashIndex % safeBkashPool.length] || safeBkashPool[0] || '01349782631';
  const activeNagadNum = safeNagadPool[nagadIndex % safeNagadPool.length] || safeNagadPool[0] || '01768782530';
  const activeAgentNum = selectedMethod.includes('nagad') ? activeNagadNum : activeBkashNum;

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleCopyAgent = () => {
    if (!activeAgentNum) {
      alert(lang === 'bn' ? 'এডমিন প্যানেল থেকে এখনও কোনো নম্বর যুক্ত করা হয়নি।' : 'No deposit number configured by admin yet.');
      return;
    }
    navigator.clipboard.writeText(activeAgentNum);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNext = () => {
    setCurrentStep('payment_details');
  };

  const handleSubmitTrx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId.trim()) {
      alert(lang === 'bn' ? 'দয়া করে ৮-১০ সংখ্যার Transaction ID (TrxID) লিখুন।' : 'Please enter Transaction ID.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setCurrentStep('success');
      onSuccessDeposit(finalAmount, trxId.trim(), selectedMethod);

      setTimeout(() => {
        setCurrentStep('form');
        setTrxId('');
        onClose();
      }, 2500);
    }, 1200);
  };

  // 4 Deposit Methods matching screenshot with original realistic logos
  const methods = [
    {
      id: 'bkash_send',
      title: 'Bkash SEND MONEY',
      textColor: 'text-[#d61e56]',
      icon: (
        <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center shadow-xs bg-white">
          <img 
            src="/img_deposit_method.jpg" 
            alt="bKash Deposit Method" 
            className="w-full h-full object-cover"
          />
        </div>
      ),
    },
    {
      id: 'nagad_send',
      title: 'NAGAD SEND MONEY',
      textColor: 'text-slate-800',
      icon: (
        <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center shadow-xs bg-white">
          <img 
            src="/img_nagod_method.jpeg" 
            alt="Nagad Deposit Method" 
            className="w-full h-full object-cover"
          />
        </div>
      ),
    },
    {
      id: 'nagad_vip',
      title: 'NAGAD VIP CASH OUT',
      textColor: 'text-slate-800',
      icon: (
        <div className="w-12 h-10 flex items-center justify-center">
          <img 
            src="/nagad_logo.svg" 
            alt="Nagad VIP Cash Out" 
            className="w-full h-full object-contain"
          />
        </div>
      ),
    },
    {
      id: 'nagad_fast',
      title: 'NAGAD FAST PAYMENT',
      textColor: 'text-slate-800',
      icon: (
        <div className="w-12 h-10 flex items-center justify-center">
          <img 
            src="/nagad_logo.svg" 
            alt="Nagad Fast Payment" 
            className="w-full h-full object-contain"
          />
        </div>
      ),
    },
  ];

  // 6 Payment Channels matching screenshot
  const isBkash = selectedMethod === 'bkash_send';
  const channelPrefix = isBkash ? 'বিকাশ' : 'নগদ';

  const channels = [
    { id: 'vip', name: 'SEND MONEY VIP | GBKPAY', isRed: true },
    { id: 'm', name: `M SEND MONEY- ${channelPrefix} পেমেন্ট চ্যানেল`, isRed: false },
    { id: 'x', name: `X SEND MONEY- ${channelPrefix} পেমেন্ট চ্যানেল`, isRed: false },
    { id: 't', name: `T SEND MONEY- ${channelPrefix} পেমেন্ট চ্যানেল`, isRed: false },
    { id: 'q', name: `Q SEND MONEY- ${channelPrefix} পেমেন্ট চ্যানেল`, isRed: false },
    { id: 'a', name: `A SEND MONEY- ${channelPrefix} পেমেন্ট চ্যানেল`, isRed: false },
  ];

  // 8 Deposit Amounts starting from 300
  const quickAmounts = [300, 500, 1000, 2000, 3000, 5000, 10000, 15000];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 backdrop-blur-xs overflow-y-auto no-scrollbar">
      {/* Mobile container matching Screenshot_20261010-032813.jpg */}
      <div className="relative w-full max-w-[430px] min-h-screen bg-[#ffffff] text-slate-800 flex flex-col shadow-2xl overflow-y-auto no-scrollbar pb-40">
        
        {/* =========================================================================
            1. TOP HEADER (Dark Bar with Back Arrow, "Deposit" title & History Icon)
            ========================================================================= */}
        <div className="bg-[#002f27] text-white px-4 pt-3.5 pb-3 flex items-center justify-between sticky top-0 z-20 shadow-md">
          <button
            type="button"
            onClick={currentStep === 'payment_details' ? () => setCurrentStep('form') : onClose}
            className="p-1 -ml-1 text-[#ffd000] hover:text-amber-300 active:scale-95 transition-transform cursor-pointer flex items-center justify-center"
            title="Back"
            aria-label="Back"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          <h2 className="text-lg font-bold text-[#ffd000] tracking-wide text-center flex-1">
            Deposit
          </h2>

          {/* Deposit Record Icon (Clipboard with up arrow) */}
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="p-1 -mr-1 text-[#ffd000] hover:text-amber-300 active:scale-95 transition-transform cursor-pointer flex items-center justify-center"
            title="Deposit Record"
            aria-label="Deposit Record"
          >
            <svg className="w-6 h-6 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <circle cx="18" cy="18" r="4" fill="#002f27" />
              <path d="M18 20v-4m-2 2l2-2 2 2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* =========================================================================
            SUCCESS SCREEN
            ========================================================================= */}
        {currentStep === 'success' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-[320px] w-full text-center space-y-4">
              <div className="w-14 h-14 bg-[#22c55e] rounded-full flex items-center justify-center shadow-md text-white">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                ডিপোজিট সফল
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                সফলভাবে জমা দেওয়া হয়েছে, প্রক্রিয়াকরণ চলছে
              </p>
            </div>
          </div>
        ) : currentStep === 'payment_details' ? (
          /* =========================================================================
              EXACT PAYMENT GATEWAY PAGE MATCHING Screenshot_20261010-045751.jpg
              ========================================================================= */
          <form onSubmit={handleSubmitTrx} className="flex-1 bg-white text-slate-950 flex flex-col pb-20">
            
            {/* Top Green Bar */}
            <div className="bg-[#002f27] text-white px-4 py-3 space-y-1.5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-lg font-black font-mono tracking-tight text-white">
                  BDT {finalAmount.toLocaleString()}.00
                </span>
                <div className="flex items-center gap-2">
                  <span className="bg-[#ffd000] text-[#002f27] font-black text-[10px] px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
                    PAY SERVICE
                  </span>
                  <div className="flex bg-white/20 rounded text-[10px] font-black overflow-hidden">
                    <span className="px-1.5 py-0.5 bg-white/30 text-white">EN</span>
                    <span className="px-1.5 py-0.5 text-white">বাংলা</span>
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-amber-100 font-bold leading-tight">
                অতিরিক্ত বা কম টাকা উত্তোলন করবেন না।
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Red Warning Banner */}
              <div className="text-xs font-black text-[#d32f2f] leading-relaxed">
                আপনি যদি টাকার পরিমাণ পরিবর্তন করেন (BDT {finalAmount.toLocaleString()}), আপনি ক্রেডিট পেতে সক্ষম হবেন না।
              </div>

              {/* Payment Validity */}
              <div className="text-xs font-black text-emerald-700 font-mono">
                পেমেন্ট বৈধ: {formattedTime}
              </div>

              {/* Wallet Number Section */}
              <div className="space-y-1.5">
                <div className="text-xs font-black text-slate-950">
                  ওয়ালেট নম্বর* *
                </div>
                <div className="text-base font-black text-black leading-snug">
                  {selectedMethod.includes('nagad')
                    ? 'এই নগদ নম্বরটি শুধুমাত্র Send-Money গ্রহণ করে।'
                    : 'এই বিকাশ নম্বরটি শুধুমাত্র Send-Money গ্রহণ করে।'}
                </div>
                <div className="flex items-center justify-between bg-white border-2 border-slate-300 rounded-xl px-4 py-3 shadow-xs min-h-[52px]">
                  {activeAgentNum ? (
                    <span className="text-base font-black font-mono text-slate-950 tracking-wider">
                      {activeAgentNum}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                      নম্বর এডমিন প্যানেল থেকে যুক্ত হবে (অপেক্ষমান)
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleCopyAgent}
                    disabled={!activeAgentNum}
                    className={`p-1.5 ${
                      activeAgentNum 
                        ? 'text-emerald-700 hover:text-emerald-800 active:scale-95 cursor-pointer' 
                        : 'text-slate-300 cursor-not-allowed'
                    } flex items-center justify-center`}
                    title={activeAgentNum ? 'Copy' : 'নম্বর এখনও যোগ করা হয়নি'}
                  >
                    {copied ? <Check className="w-5 h-5 stroke-[3]" /> : (
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Wallet Provider Section */}
              <div className="space-y-2">
                <div className="text-xs font-black text-slate-950">
                  ওয়ালেট প্রদানকারী
                </div>
                {selectedMethod.includes('nagad') ? (
                  <div className="w-full bg-[#f7941d] rounded-xl p-3 flex items-center gap-3 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md shrink-0 overflow-hidden p-0.5">
                      <img src="/banners/15821.jpeg" alt="Nagad" className="w-full h-full object-contain scale-125" />
                    </div>
                    <span className="text-white font-black text-sm tracking-wide">
                      নগদ ডিপোজিট
                    </span>
                  </div>
                ) : (
                  <div className="w-full bg-[#e2136e] rounded-xl p-3 flex items-center gap-3 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xs shrink-0 overflow-hidden p-1">
                      <img src="/bkash-logo-png_seeklogo-471379 (1).png" alt="bKash" className="w-full h-full object-contain rounded-full" />
                    </div>
                    <span className="text-white font-black text-sm tracking-wide">
                      বিকাশ ডিপোজিট
                    </span>
                  </div>
                )}
              </div>

              {/* TrxID Section */}
              <div className="space-y-2">
                <div className="text-xs font-black text-slate-950 flex items-center justify-between">
                  <span>লেনদেন আইডি লিখুন <span className="text-[#d32f2f] font-black">(TrxID প্রয়োজন!)</span></span>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowTrxGuideModal(true)}
                  className="text-xs font-black text-blue-700 hover:underline block cursor-pointer"
                >
                  TrxID কিভাবে পাবেন তা দেখতে ক্লিক করুন
                </button>
                <input
                  type="text"
                  required
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                  placeholder="TrxID প্রয়োজন!"
                  className={`w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 ${
                    selectedMethod.includes('nagad') ? 'focus:border-[#f7941d]' : 'focus:border-[#e2136e]'
                  } outline-none font-mono text-sm uppercase font-black text-slate-950 bg-white placeholder-slate-500 shadow-xs`}
                />
              </div>

              {/* Submit Button ("নিশ্চিত করুন") */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3.5 rounded-xl border-2 font-black text-sm tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                    trxId.trim().length >= 8
                      ? 'bg-[#e52835] hover:bg-[#c91c29] border-[#e52835] text-white shadow-md active:scale-98'
                      : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-950 shadow-sm'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className={`w-4 h-4 border-2 ${trxId.trim().length >= 8 ? 'border-white' : 'border-slate-950'} border-t-transparent rounded-full animate-spin`} />
                      <span>যাচাই করা হচ্ছে...</span>
                    </>
                  ) : (
                    <span>নিশ্চিত করুন</span>
                  )}
                </button>
              </div>

              {/* Footer Warnings */}
              <div className="pt-3 space-y-2 text-xs border-t border-slate-200">
                <div className="font-black text-[#d32f2f]">
                  সতর্কতা:
                </div>
                <div className="font-black text-[#d32f2f]">
                  লেনদেন আইডি সঠিকভাবে পূরণ করতে হবে, অন্যথায় স্কোর ব্যর্থ হবে
                </div>
                <div className="text-slate-900 text-[11px] font-black leading-relaxed">
                  অনুগ্রহ করে নিশ্চিত হয়ে নিন যে আপনি BKASH deposit ওয়ালেট নম্বরে ক্যাশ আউট করছেন। এই নম্বরের অন্য কোন ওয়ালেট থেকে ক্যাশ আউট করলে সেই টাকা পাওয়ার কোন সম্ভাবনা নাই
                </div>
              </div>

            </div>
          </form>
        ) : (
          /* =========================================================================
              MAIN FORM VIEW: Exactly matching Screenshot_20261010-032813.jpg
              ========================================================================= */
          <div className="flex-1 space-y-4.5 pb-16 pt-2">
            
            {/* -------------------------------------------------------------
                SECTION 1: • Deposit Method
                ------------------------------------------------------------- */}
            <div className="pt-3 px-3">
              <div className="flex items-center gap-1.5 mb-2.5">
                <span className="w-2 h-2 rounded-full bg-[#f59e0b] inline-block" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Deposit Method
                </h3>
              </div>

              {/* 4 Cards Grid */}
              <div className="grid grid-cols-4 gap-1.5">
                {methods.map((method) => {
                  const isSelected = selectedMethod === method.id;
                  const isBlocked = method.id === 'nagad_vip' || method.id === 'nagad_fast';
                  return (
                    <div
                      key={method.id}
                      onClick={() => {
                        if (isBlocked) return;
                        setSelectedMethod(method.id as any);
                      }}
                      className={`relative bg-white rounded-lg p-1.5 pt-3 flex flex-col items-center justify-between min-h-[92px] transition-all border ${
                        isSelected
                          ? 'border-2 border-[#e52835] shadow-xs'
                          : 'border-slate-200/90 hover:border-slate-300'
                      } ${isBlocked ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      {/* Top-Left Orange Ribbon with Thumbs-up */}
                      <div className="absolute top-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-br-md px-1 py-0.5 shadow-2xs flex items-center justify-center">
                        <ThumbsUp className="w-2.5 h-2.5 fill-current" />
                      </div>

                      {/* Icon */}
                      <div className="flex-1 flex items-center justify-center mt-1">
                        {method.icon}
                      </div>

                      {/* Title */}
                      <span
                        className={`text-[9px] font-black leading-tight text-center mt-1 uppercase line-clamp-2 ${
                          isSelected ? 'text-[#e52835]' : method.textColor
                        }`}
                      >
                        {method.title}
                      </span>

                      {/* Selected Bottom-Right Checkmark Corner Badge */}
                      {isSelected && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 overflow-hidden">
                          <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[12px] border-l-[12px] border-b-[#e52835] border-l-transparent" />
                          <Check className="w-2 h-2 text-white stroke-[3.5] absolute bottom-0 right-0 z-10" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subheading text */}
            <div className="px-3 pt-1">
              <span className="font-serif italic font-extrabold text-slate-800 text-xs tracking-wider uppercase block">
                SEND MONEY VIP | GBKPAY
              </span>
            </div>

            {/* -------------------------------------------------------------
                SECTION 2: • Payment Channel
                ------------------------------------------------------------- */}
            <div className="px-3">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#00f5cc] inline-block" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Payment Channel
                </h3>
              </div>

              {/* 2x3 Grid */}
              <div className="grid grid-cols-3 gap-1.5">
                {channels.map((ch) => {
                  const isSelected = selectedChannel === ch.id;
                  return (
                    <div
                      key={ch.id}
                      onClick={() => setSelectedChannel(ch.id)}
                      className={`relative bg-white rounded-lg p-2 pt-2.5 min-h-[58px] flex flex-col items-center justify-center text-center cursor-pointer transition-all border ${
                        isSelected
                          ? 'border-2 border-[#e52835] shadow-xs'
                          : 'border-slate-200/90 hover:border-slate-300'
                      }`}
                    >
                      {/* Top-Left Orange Ribbon with Thumbs-up */}
                      <div className="absolute top-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-br-md px-1 py-0.5 shadow-2xs flex items-center justify-center">
                        <ThumbsUp className="w-2 h-2 fill-current" />
                      </div>

                      {/* Channel Name */}
                      <span
                        className={`text-[9.5px] font-black leading-tight tracking-tight uppercase ${
                          ch.isRed ? 'text-[#e52835]' : 'text-slate-800'
                        }`}
                      >
                        {ch.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* -------------------------------------------------------------
                SECTION 3: 6-STEP TUTORIAL INFOGRAPHIC BANNER
                বিকাশ (Bkash) সেন্ড মানি (Send Money) প্রসেস
                ------------------------------------------------------------- */}
            <div className="px-3 pt-1">
              <div className="w-full rounded-xl overflow-hidden">
                <img 
                  src={selectedMethod.includes('bkash') ? "/banners/IMG-20261010-WA0017~2.jpg" : (selectedMethod.includes('nagad') ? "/banners/img_nagod_process.jpg" : "/img_deposit_method.jpg")} 
                  alt="Send Money Process" 
                  className="w-full h-auto object-contain block rounded-xl"
                />
              </div>
            </div>

            {/* -------------------------------------------------------------
                SECTION 4: • Deposit Amounts (matching screenshot precisely)
                ------------------------------------------------------------- */}
            <div className="px-3 pt-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#881337] inline-block" />
                <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                  Deposit Amounts
                </h3>
              </div>

              {/* Amounts Grid layout: 4 on top, 4 below */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {quickAmounts.slice(0, 4).map((amt) => {
                  const isSelected = selectedAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount(amt.toString());
                      }}
                      className={`py-2 px-1 rounded-lg text-xs font-semibold font-mono transition-all border text-center cursor-pointer ${
                        isSelected
                          ? 'border-2 border-[#881337] bg-rose-50 text-[#881337] shadow-xs'
                          : 'border-rose-200 bg-white text-slate-800 hover:border-rose-300'
                      }`}
                    >
                      {amt.toLocaleString()}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                {quickAmounts.slice(4, 8).map((amt) => {
                  const isSelected = selectedAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount(amt.toString());
                      }}
                      className={`py-2 px-1 rounded-lg text-xs font-semibold font-mono transition-all border text-center cursor-pointer ${
                        isSelected
                          ? 'border-2 border-[#881337] bg-rose-50 text-[#881337] shadow-xs'
                          : 'border-rose-200 bg-white text-slate-800 hover:border-rose-300'
                      }`}
                    >
                      {amt.toLocaleString()}
                    </button>
                  );
                })}
              </div>

              {/* Custom amount input field matching screenshot */}
              <div className="pt-2 space-y-1.5">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    ৳
                  </span>
                  <input
                    type="text"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      const num = parseFloat(e.target.value);
                      if (!isNaN(num)) {
                        setSelectedAmount(num);
                      } else {
                        setSelectedAmount(0);
                      }
                    }}
                    placeholder="300 - 15,000"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-rose-200 bg-white text-xs font-mono text-slate-900 placeholder-slate-400 outline-none focus:border-[#881337] shadow-2xs"
                  />
                </div>

                {/* Deposit Info text */}
                <div className="text-xs font-bold pl-0.5">
                  {finalAmount > 0 && finalAmount < 300 ? (
                    <span className="text-red-600 font-black animate-pulse">
                      ⚠️ সর্বনিম্ন ডিপোজিট ৩০০ টাকা (৩০০ - ১৫,০০০ টাকা প্রযোজ্য)
                    </span>
                  ) : (
                    <span className="text-[#e52835]">
                      Deposit Info: 24/24 (৩০০ - ১৫,০০০)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------
                PAYMENT DETAILS CARD & NEXT BUTTON (matching screenshot)
                ------------------------------------------------------------- */}
            {finalAmount > 0 && (
              <div className="px-3 pt-4 space-y-3 pb-16 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3b82f6] inline-block" />
                  <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                    Payment Details
                  </h3>
                </div>

                {/* Card Container */}
                <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100">
                  {/* Row 1: Deposit Amounts */}
                  <div className="flex items-center justify-between px-3.5 py-3">
                    <span className="text-xs font-medium text-slate-600">
                      Deposit Amounts
                    </span>
                    <span className="text-xs font-bold font-mono text-slate-700">
                      ৳ {finalAmount.toLocaleString()}.00
                    </span>
                  </div>

                  {/* Row 2: Actual Payment Amount */}
                  <div className="flex items-center justify-between px-3.5 py-3 bg-rose-50/80">
                    <span className="text-xs font-medium text-slate-700">
                      Actual Payment Amount
                    </span>
                    <span className="text-xs font-black font-mono text-[#e52835]">
                      ৳ {finalAmount.toLocaleString()}.00
                    </span>
                  </div>
                </div>

                {/* Big Red Next Button right below Actual Payment Amount */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (finalAmount < 300) {
                        alert('সর্বনিম্ন ডিপোজিট এমাউন্ট ৩০০ টাকা। (৩০০ - ১৫,০০০ টাকা)');
                        return;
                      }
                      setCurrentStep('payment_details');
                    }}
                    disabled={finalAmount < 300}
                    className={`w-full py-3.5 rounded-xl font-black text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 ${
                      finalAmount < 300
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : 'bg-[#e52835] hover:bg-[#c91c29] active:scale-98 text-white cursor-pointer'
                    }`}
                  >
                    <span>{finalAmount < 300 ? 'সর্বনিম্ন ৩০০ টাকা ডিপোজিট' : 'Next'}</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* =========================================================================
            DEPOSIT HISTORY MODAL (when clicking clipboard icon at top right)
            ========================================================================= */}
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[75vh]">
              <div className="bg-[#002f27] text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileUp className="w-5 h-5 text-[#ffd000]" />
                  <h3 className="font-bold text-sm text-[#ffd000]">
                    Deposit Record (ডিপোজিট হিস্ট্রি)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="p-1 text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex-1 space-y-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">
                      {selectedMethod.includes('nagad') ? 'Nagad' : 'bKash'} Deposit
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      DP928371
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm text-emerald-600 block">
                      +৳1,000
                    </span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                      Completed
                    </span>
                  </div>
                </div>

                <div className="text-center py-4 text-xs text-slate-400">
                  সর্বশেষ লেনদেন সফলভাবে সংরক্ষিত আছে
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TrxID GUIDE MODAL
            ========================================================================= */}
        {showTrxGuideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col p-2 items-center">
              {/* Guide Image Only */}
              <div className="relative w-full rounded-xl overflow-hidden bg-white flex items-center justify-center">
                <img 
                  src="/banners/Screenshot_20261010-153628~2.jpg" 
                  alt="TrxID Guide" 
                  className="w-full h-auto object-contain rounded-lg select-none"
                />
                {/* Transparent clickable hotspot exactly over the 'বন্ধ করুন' button in the picture */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setShowTrxGuideModal(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setShowTrxGuideModal(false);
                    }
                  }}
                  className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 w-44 h-12 cursor-pointer z-20 rounded-lg active:scale-95 transition-transform"
                  title="বন্ধ করুন"
                  aria-label="বন্ধ করুন"
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
