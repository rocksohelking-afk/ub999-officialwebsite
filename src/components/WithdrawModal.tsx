import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronsRight, Eye, EyeOff, RotateCw, Plus, Check, X, Lock } from 'lucide-react';
import { Language } from '../types';

interface BoundWallet {
  id: string;
  method: 'bkash' | 'nagad' | 'rocket';
  accountNumber: string;
  accountName?: string;
  createdAt?: string;
}

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  userBalance: number;
  onSuccessWithdraw: (amount: number, method: string) => void;
  records?: { id: string; amount: number; method: string; date: string; status: string }[];
  userName?: string;
  userPhone?: string;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  lang,
  userBalance,
  onSuccessWithdraw,
  records = [],
  userName,
  userPhone,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [trxPassword, setTrxPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showRecordModal, setShowRecordModal] = useState<boolean>(false);

  // Link E-wallet view state (matching Screenshot_20261010-232336.jpg)
  const [showAddWalletModal, setShowAddWalletModal] = useState<boolean>(false);
  const [linkWalletGroup, setLinkWalletGroup] = useState<'bkash' | 'nagad'>('bkash');
  const [legalName, setLegalName] = useState<string>('');
  const [linkAccountNumber, setLinkAccountNumber] = useState<string>('');
  const [newTrxPassword, setNewTrxPassword] = useState<string>('');
  const [confirmTrxPassword, setConfirmTrxPassword] = useState<string>('');
  const [showNewTrxPass, setShowNewTrxPass] = useState<boolean>(false);
  const [showConfirmTrxPass, setShowConfirmTrxPass] = useState<boolean>(false);

  // User specific storage keys
  const userKey = userPhone?.trim() || userName?.trim() || 'guest';
  const walletStorageKey = `ub999_bound_wallets_${userKey}`;
  const trxPassStorageKey = `ub999_saved_trx_pass_${userKey}`;
  const legalNameStorageKey = `ub999_saved_legal_name_${userKey}`;

  // Saved credentials per user
  const [savedTrxPass, setSavedTrxPass] = useState<string>(() => {
    try {
      const p = localStorage.getItem(trxPassStorageKey);
      if (p) return p;
    } catch {}
    return '1234';
  });

  const [savedLegalName, setSavedLegalName] = useState<string>(() => {
    try {
      const n = localStorage.getItem(legalNameStorageKey);
      if (n) return n;
    } catch {}
    return userName && userName !== 'Player' && userName !== 'User' ? userName : '';
  });

  // Dynamic masked name based on user's actual entered name
  const getMaskedUserName = () => {
    let name =
      savedLegalName?.trim() ||
      boundWallets.find((w) => w.accountName && w.accountName !== 'User')?.accountName?.trim() ||
      boundWallets[0]?.accountName?.trim() ||
      userName?.trim() ||
      '';

    if (!name || name === 'User') {
      const fallback = userName && userName !== 'Player' && userName !== 'User' ? userName : 'U';
      const firstChar = fallback.charAt(0).toUpperCase();
      return `${firstChar}*****`;
    }

    const firstChar = name.charAt(0).toUpperCase();
    return `${firstChar}*****`;
  };

  // State for subsequent wallet linking (matching Screenshot_20261011-000229.jpg)
  const [subsequentTrxPass, setSubsequentTrxPass] = useState<string>('');
  const [showSubsequentTrxPass, setShowSubsequentTrxPass] = useState<boolean>(false);

  // Confirmation error modal matching Screenshot_20261011-000209.jpg
  const [showTrxPassErrorModal, setShowTrxPassErrorModal] = useState<boolean>(false);
  const [showInsufficientModal, setShowInsufficientModal] = useState<boolean>(false);
  const [showWithdrawSuccessModal, setShowWithdrawSuccessModal] = useState<boolean>(false);

  // Bound wallets state persisted in localStorage per user
  const [boundWallets, setBoundWallets] = useState<BoundWallet[]>(() => {
    try {
      const saved = localStorage.getItem(walletStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const clean = parsed.filter((w) => w.accountNumber !== '01700006560' && w.id !== 'WAL_DEFAULT_1');
          return clean;
        }
      }
    } catch {
      // fallback
    }
    return [];
  });
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem(walletStorageKey, JSON.stringify(boundWallets));
    } catch {
      // ignore
    }
  }, [boundWallets, walletStorageKey]);

  if (!isOpen) return null;

  const currentWallets = boundWallets.filter((w) => w.method === selectedMethod);
  const parsedAmount = parseFloat(withdrawAmount) || 0;
  const isFormValid = parsedAmount >= 100 && parsedAmount <= 10000 && trxPassword.trim().length > 0;

  const handleRefreshBalance = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  const handleOpenLinkWallet = () => {
    setLinkWalletGroup(selectedMethod === 'nagad' ? 'nagad' : 'bkash');
    setShowAddWalletModal(true);
  };

  const isSubsequentWallet = boundWallets.length > 0;

  const isLinkWalletFormValid = isSubsequentWallet
    ? Boolean(linkAccountNumber.trim() && subsequentTrxPass.trim())
    : legalName.trim().length >= 2 &&
      linkAccountNumber.trim().length >= 11 &&
      newTrxPassword.trim().length >= 4 &&
      newTrxPassword === confirmTrxPassword;

  const handleLinkWalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubsequentWallet) {
      if (subsequentTrxPass.trim() !== savedTrxPass) {
        setShowTrxPassErrorModal(true);
        return;
      }
      if (linkAccountNumber.trim().length < 11) {
        alert(lang === 'bn' ? 'দয়া করে সঠিক ১১ সংখ্যার একাউন্ট নম্বর দিন।' : 'Please enter a valid 11-digit account number.');
        return;
      }

      const now = new Date();
      const formattedTime =
        now.getFullYear() +
        '-' +
        String(now.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(now.getDate()).padStart(2, '0') +
        ' ' +
        String(now.getHours()).padStart(2, '0') +
        ':' +
        String(now.getMinutes()).padStart(2, '0') +
        ':' +
        String(now.getSeconds()).padStart(2, '0');

      const newWallet: BoundWallet = {
        id: 'WAL_' + Date.now(),
        method: linkWalletGroup,
        accountNumber: linkAccountNumber.trim(),
        accountName: savedLegalName,
        createdAt: formattedTime,
      };

      setBoundWallets([newWallet]);
      setSelectedWalletId(newWallet.id);
      setSelectedMethod(linkWalletGroup);
      setLinkAccountNumber('');
      setSubsequentTrxPass('');
      setShowAddWalletModal(false);
      return;
    }

    if (!legalName.trim()) {
      alert(lang === 'bn' ? 'দয়া করে আপনার পূর্ণ নাম লিখুন।' : 'Please enter your full legal name.');
      return;
    }
    if (linkAccountNumber.trim().length < 11) {
      alert(lang === 'bn' ? 'দয়া করে সঠিক ১১ সংখ্যার একাউন্ট নম্বর দিন।' : 'Please enter a valid 11-digit account number.');
      return;
    }
    if (newTrxPassword.length < 4) {
      alert(lang === 'bn' ? 'ট্রানজেকশন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' : 'Transaction password must be at least 4 digits.');
      return;
    }
    if (newTrxPassword !== confirmTrxPassword) {
      alert(lang === 'bn' ? 'পাসওয়ার্ড দুটি মেলেনি, পুনরায় চেক করুন।' : 'Passwords do not match.');
      return;
    }

    const now = new Date();
    const formattedTime =
      now.getFullYear() +
      '-' +
      String(now.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(now.getDate()).padStart(2, '0') +
      ' ' +
      String(now.getHours()).padStart(2, '0') +
      ':' +
      String(now.getMinutes()).padStart(2, '0') +
      ':' +
      String(now.getSeconds()).padStart(2, '0');

    const newWallet: BoundWallet = {
      id: 'WAL_' + Date.now(),
      method: linkWalletGroup,
      accountNumber: linkAccountNumber.trim(),
      accountName: legalName.trim(),
      createdAt: formattedTime,
    };
    setBoundWallets([newWallet]);
    setSelectedWalletId(newWallet.id);
    setSelectedMethod(linkWalletGroup);

    // Save transaction password & legal name
    setSavedTrxPass(newTrxPassword);
    setSavedLegalName(legalName.trim());
    try {
      localStorage.setItem(trxPassStorageKey, newTrxPassword);
      localStorage.setItem(legalNameStorageKey, legalName.trim());
    } catch {}

    // Reset link wallet inputs - DO NOT auto-set trxPassword on withdrawal form!
    setLegalName('');
    setLinkAccountNumber('');
    setNewTrxPassword('');
    setConfirmTrxPassword('');
    setShowAddWalletModal(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentWallets.length === 0) {
      alert(lang === 'bn' ? 'উইথড্র করার আগে দয়া করে আপনার ওয়ালেট নম্বর (+ বাটনে ক্লিক করে) যুক্ত করুন।' : 'Please link an E-Wallet before withdrawing.');
      handleOpenLinkWallet();
      return;
    }
    if (parsedAmount < 100 || parsedAmount > 10000) {
      alert(lang === 'bn' ? 'উইথড্র এমাউন্ট ১০০ থেকে ১০,০০০ টাকার মধ্যে হতে হবে।' : 'Withdrawal amount must be between 100 and 10,000 BDT.');
      return;
    }
    if (parsedAmount > userBalance) {
      setShowInsufficientModal(true);
      return;
    }
    if (!trxPassword.trim() || trxPassword.length < 4) {
      alert(lang === 'bn' ? 'দয়া করে ট্রানজেকশন পাসওয়ার্ড লিখুন।' : 'Please enter your Transaction Password.');
      return;
    }
    if (trxPassword.trim() !== savedTrxPass) {
      setShowTrxPassErrorModal(true);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowWithdrawSuccessModal(true);
      onSuccessWithdraw(parsedAmount, selectedMethod);
      setWithdrawAmount('');
      setTrxPassword('');
      setTimeout(() => {
        setShowWithdrawSuccessModal(false);
        onClose();
      }, 2200);
    }, 1200);
  };

  const getMethodTitle = () => {
    if (selectedMethod === 'bkash') return 'Bkash';
    if (selectedMethod === 'nagad') return 'Nagad';
    return 'Rocket';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 backdrop-blur-xs overflow-y-auto no-scrollbar">
      {/* Mobile container matching Screenshot_20261010-161534.jpg & Screenshot_20261010-232336.jpg */}
      <div className="relative w-full max-w-[430px] min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col shadow-2xl overflow-y-auto no-scrollbar pb-16">

        {/* =========================================================================
            VIEW 1: LINK E-WALLET VIEW (EXACTLY MATCHING Screenshot_20261010-232336.jpg)
            ========================================================================= */}
        {showAddWalletModal ? (
          <div className="flex-1 bg-[#ffffff] flex flex-col">
            {/* Top Bar matching screenshot */}
            <div className="bg-[#002f27] text-white px-4 pt-3.5 pb-3 flex items-center justify-between sticky top-0 z-20 shadow-md">
              <button
                type="button"
                onClick={() => setShowAddWalletModal(false)}
                className="p-1 -ml-1 text-[#ffd000] hover:text-amber-300 active:scale-95 transition-transform cursor-pointer flex items-center justify-center"
                title="Back"
                aria-label="Back"
              >
                <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
              </button>

              <h2 className="text-base font-bold text-[#ffd000] tracking-wide text-center flex-1 pr-5">
                Link E-wallet
              </h2>
            </div>

            {/* Form Container */}
            <form onSubmit={handleLinkWalletSubmit} className="p-4 space-y-4 flex-1 flex flex-col">
              
              {/* Select E-wallet group Section */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 block">
                  Select E-wallet group
                </label>
                <div className="flex items-center gap-2.5">
                  {/* Nagad Pill */}
                  <button
                    type="button"
                    onClick={() => setLinkWalletGroup('nagad')}
                    className={`flex-1 py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer bg-white ${
                      linkWalletGroup === 'nagad'
                        ? 'border-[#e52835] shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                      <img src="/banners/15821.jpeg" alt="Nagad" className="w-full h-full object-contain scale-110" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-[#e52835]">নগদ</span>
                      <span className="text-[7.5px] text-slate-400 block leading-tight">ডাক বিভাগের ডিজিটাল লেনদেন</span>
                    </div>
                  </button>

                  {/* bKash Pill */}
                  <button
                    type="button"
                    onClick={() => setLinkWalletGroup('bkash')}
                    className={`flex-1 py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer bg-white ${
                      linkWalletGroup === 'bkash'
                        ? 'border-[#e52835] shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900">bKash</span>
                    <div className="w-6 h-6 rounded overflow-hidden shrink-0 shadow-2xs">
                      <img src="/bkash-logo-png_seeklogo-471379 (1).png" alt="bKash" className="w-full h-full object-contain" />
                    </div>
                  </button>
                </div>
              </div>

              {isSubsequentWallet ? (
                /* =========================================================================
                   SUBSEQUENT WALLET VIEW (MATCHING Screenshot_20261011-000229.jpg & Screenshot_20261011-000239.jpg)
                   ========================================================================= */
                <>
                  {/* White Card Container: E-wallet type */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3.5 shadow-2xs">
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-slate-600">
                        E-wallet type
                      </div>
                      <div className="inline-block py-1.5 px-4 rounded-lg border border-[#e52835] bg-rose-50/20 text-slate-900 font-bold text-xs">
                        {linkWalletGroup === 'bkash' ? 'BKash' : 'Nagad'}
                      </div>
                    </div>

                    {/* Input 1: Locked Legal Name */}
                    <div className="bg-[#c4c7c9] rounded-xl px-3.5 py-3 flex items-center gap-2.5 border border-transparent select-none cursor-not-allowed">
                      <svg className="w-4 h-4 text-slate-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="16" rx="3" />
                        <circle cx="9" cy="10" r="2" />
                        <line x1="15" y1="8" x2="17" y2="8" />
                        <line x1="15" y1="12" x2="17" y2="12" />
                        <line x1="7" y1="16" x2="17" y2="16" />
                      </svg>
                      <span className="text-xs text-slate-600 font-medium tracking-wider">
                        {getMaskedUserName()}
                      </span>
                    </div>

                    {/* Input 2: Account Number */}
                    <div className="bg-[#f1f5f9] rounded-xl px-3.5 py-3 flex items-center gap-2.5 border border-transparent focus-within:border-slate-300">
                      <svg className="w-4 h-4 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                      <input
                        type="tel"
                        required
                        value={linkAccountNumber}
                        onChange={(e) => setLinkAccountNumber(e.target.value)}
                        placeholder={`* Please fill in ${linkWalletGroup === 'bkash' ? 'BKash' : 'Nagad'} account number`}
                        className="text-xs text-slate-900 placeholder-slate-400 outline-none flex-1 bg-transparent font-medium font-mono"
                      />
                    </div>
                  </div>

                  {/* Input 3: Transaction Password */}
                  <div className="bg-[#f1f5f9] rounded-xl px-3.5 py-3 flex items-center justify-between border border-transparent focus-within:border-slate-300 mt-2">
                    <div className="flex items-center gap-2 flex-1">
                      <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                      <input
                        type={showSubsequentTrxPass ? 'text' : 'password'}
                        required
                        value={subsequentTrxPass}
                        onChange={(e) => setSubsequentTrxPass(e.target.value)}
                        placeholder="* Transaction Password"
                        className="text-xs text-slate-900 placeholder-slate-400 outline-none flex-1 bg-transparent font-medium"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSubsequentTrxPass(!showSubsequentTrxPass)}
                      className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer flex items-center justify-center"
                      title="Toggle password"
                    >
                      {showSubsequentTrxPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 mt-auto">
                    <button
                      type="submit"
                      disabled={!linkAccountNumber.trim() || !subsequentTrxPass.trim()}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-sm flex items-center justify-center ${
                        linkAccountNumber.trim() && subsequentTrxPass.trim()
                          ? 'bg-[#e52835] hover:bg-[#c91c29] text-white cursor-pointer active:scale-98 shadow-md'
                          : 'bg-[#cbd5e1] text-slate-900 cursor-not-allowed'
                      }`}
                    >
                      Submit
                    </button>
                  </div>
                </>
              ) : (
                /* =========================================================================
                   FIRST TIME WALLET SETUP VIEW
                   ========================================================================= */
                <>
                  {/* White Card Container: E-wallet type */}
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3.5 shadow-2xs">
                    <div className="space-y-1.5">
                      <div className="text-xs font-semibold text-slate-600">
                        E-wallet type
                      </div>
                      <div className="inline-block py-1.5 px-4 rounded-lg border border-[#e52835] bg-rose-50/20 text-slate-900 font-bold text-xs">
                        {linkWalletGroup === 'bkash' ? 'BKash' : 'Nagad'}
                      </div>
                    </div>

                    {/* Input 1: Full legal name */}
                    <div className="bg-[#f1f5f9] rounded-xl px-3.5 py-3 flex items-center gap-2.5 border border-transparent focus-within:border-slate-300">
                      <svg className="w-4 h-4 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="16" rx="3" />
                        <circle cx="9" cy="10" r="2" />
                        <line x1="15" y1="8" x2="17" y2="8" />
                        <line x1="15" y1="12" x2="17" y2="12" />
                        <line x1="7" y1="16" x2="17" y2="16" />
                      </svg>
                      <input
                        type="text"
                        required
                        value={legalName}
                        onChange={(e) => setLegalName(e.target.value)}
                        placeholder="* Enter your full legal name"
                        className="text-xs text-slate-900 placeholder-slate-400 outline-none flex-1 bg-transparent font-medium"
                      />
                    </div>

                    {/* Red Notice Text */}
                    <div className="text-[#e52835] text-[11px] font-bold leading-snug px-0.5">
                      Please ensure the name you provide matches exactly with the name registered with your financial provider to avoid failure. Once the name is submited, it cannot be changed
                    </div>

                    {/* Input 2: Account number */}
                    <div className="bg-[#f1f5f9] rounded-xl px-3.5 py-3 flex items-center gap-2.5 border border-transparent focus-within:border-slate-300">
                      <svg className="w-4 h-4 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <line x1="2" y1="10" x2="22" y2="10" />
                      </svg>
                      <input
                        type="tel"
                        required
                        value={linkAccountNumber}
                        onChange={(e) => setLinkAccountNumber(e.target.value)}
                        placeholder={`* Please fill in ${linkWalletGroup === 'bkash' ? 'BKash' : 'Nagad'} account number`}
                        className="text-xs text-slate-900 placeholder-slate-400 outline-none flex-1 bg-transparent font-medium font-mono"
                      />
                    </div>
                  </div>

                  {/* Please set up your transaction password Section */}
                  <div className="pt-1 space-y-2.5">
                    <div className="text-xs font-bold text-[#e52835]">
                      Please set up your transaction password.
                    </div>

                    {/* Input 3: Set transaction password */}
                    <div className="bg-[#f1f5f9] rounded-xl px-3.5 py-3 flex items-center justify-between border border-transparent focus-within:border-slate-300">
                      <div className="flex items-center gap-2 flex-1">
                        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                        <input
                          type={showNewTrxPass ? 'text' : 'password'}
                          required
                          value={newTrxPassword}
                          onChange={(e) => setNewTrxPassword(e.target.value)}
                          placeholder="* Set transaction password"
                          className="text-xs text-slate-900 placeholder-slate-400 outline-none flex-1 bg-transparent font-medium"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowNewTrxPass(!showNewTrxPass)}
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer flex items-center justify-center"
                        title="Toggle password"
                      >
                        {showNewTrxPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Input 4: Confirm password */}
                    <div className="bg-[#f1f5f9] rounded-xl px-3.5 py-3 flex items-center justify-between border border-transparent focus-within:border-slate-300">
                      <div className="flex items-center gap-2 flex-1">
                        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                        <input
                          type={showConfirmTrxPass ? 'text' : 'password'}
                          required
                          value={confirmTrxPassword}
                          onChange={(e) => setConfirmTrxPassword(e.target.value)}
                          placeholder="* Confirm password"
                          className="text-xs text-slate-900 placeholder-slate-400 outline-none flex-1 bg-transparent font-medium"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowConfirmTrxPass(!showConfirmTrxPass)}
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer flex items-center justify-center"
                        title="Toggle password"
                      >
                        {showConfirmTrxPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 mt-auto">
                    <button
                      type="submit"
                      disabled={!isLinkWalletFormValid}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-sm flex items-center justify-center ${
                        isLinkWalletFormValid
                          ? 'bg-[#e52835] hover:bg-[#c91c29] text-white cursor-pointer active:scale-98 shadow-md'
                          : 'bg-[#cbd5e1] text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Submit
                    </button>
                  </div>
                </>
              )}

            </form>
          </div>
        ) : (
          /* =========================================================================
              VIEW 2: MAIN WITHDRAWAL VIEW (MATCHING Screenshot_20261010-161534.jpg)
              ========================================================================= */
          <div className="flex-1 bg-[#ffffff] flex flex-col">
            {/* 1. TOP HEADER (Dark Green Bar with Back Arrow, "Withdrawal" & History Icon) */}
            <div className="bg-[#002f27] text-white px-4 pt-3.5 pb-3 flex items-center justify-between sticky top-0 z-20 shadow-md">
              <button
                type="button"
                onClick={onClose}
                className="p-1 -ml-1 text-[#ffd000] hover:text-amber-300 active:scale-95 transition-transform cursor-pointer flex items-center justify-center"
                title="Back"
                aria-label="Back"
              >
                <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
              </button>

              <h2 className="text-lg font-bold text-[#ffd000] tracking-wide text-center flex-1">
                Withdrawal
              </h2>

              {/* Withdrawal Record History Icon */}
              <button
                type="button"
                onClick={() => setShowRecordModal(true)}
                className="p-1 -mr-1 text-[#ffd000] hover:text-amber-300 active:scale-95 transition-transform cursor-pointer flex items-center justify-center"
                title="Withdrawal Record"
                aria-label="Withdrawal Record"
              >
                <div className="relative">
                  <svg className="w-5.5 h-5.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#ffd000] text-[#002f27] rounded-full flex items-center justify-center">
                    <span className="text-[8px] font-black leading-none">↓</span>
                  </div>
                </div>
              </button>
            </div>

            {/* 2. METHOD TABS CAROUSEL (bKash | Nagad | Rocket) with scroll arrow */}
            <div className="bg-white border-b border-slate-200 flex items-center justify-between px-1 shadow-2xs">
              <div className="flex items-center flex-1 overflow-x-auto no-scrollbar">
                {/* bKash Tab */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('bkash')}
                  className={`flex-1 py-2 px-2.5 flex items-center justify-center gap-1.5 transition-all cursor-pointer relative border-b-2 ${
                    selectedMethod === 'bkash'
                      ? 'border-[#e52835] text-slate-900 font-bold'
                      : 'border-transparent text-slate-700 hover:text-slate-900 font-medium'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900">bKash</span>
                  <div className="w-6 h-6 rounded overflow-hidden shrink-0 shadow-2xs">
                    <img src="/bkash-logo-png_seeklogo-471379 (1).png" alt="bKash" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 leading-tight">Bka<br/>sh</span>
                </button>

                {/* Nagad Tab */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('nagad')}
                  className={`flex-1 py-2 px-2.5 flex items-center justify-center gap-1.5 transition-all cursor-pointer relative border-b-2 ${
                    selectedMethod === 'nagad'
                      ? 'border-[#e52835] text-slate-900 font-bold'
                      : 'border-transparent text-slate-700 hover:text-slate-900 font-medium'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                    <img src="/banners/15821.jpeg" alt="Nagad" className="w-full h-full object-contain scale-110" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">নগদ</span>
                  <span className="text-[10px] font-bold text-slate-500 leading-none">Naga<br/>d</span>
                </button>

                {/* Rocket Tab (Click does nothing) */}
                <button
                  type="button"
                  onClick={() => {}}
                  className="flex-1 py-2 px-2.5 flex items-center justify-center gap-1.5 transition-all cursor-default relative border-b-2 border-transparent text-slate-700 font-medium"
                >
                  <div className="h-6 w-14 rounded overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                    <img src="/rocket_logo.svg" alt="Rocket" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 leading-none">Ro<br/>cket</span>
                </button>
              </div>

              {/* Right Indicator Arrow */}
              <div className="px-1 text-[#0284c7] shrink-0">
                <ChevronsRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>

            {/* 3. BOUND WALLET SECTION */}
            <div className="pt-3 px-4 pb-2">
              <h3 className="text-sm font-semibold text-slate-800 tracking-tight">
                Bound {getMethodTitle()} ({currentWallets.length}/5)
              </h3>

              {currentWallets.length === 0 ? (
                /* Empty state illustration exactly matching Screenshot_20261010-235053.jpg */
                <div
                  onClick={handleOpenLinkWallet}
                  className="relative w-full pt-4 pb-2 flex flex-col items-center justify-center cursor-pointer select-none"
                >
                  {/* Vector Illustration & Card */}
                  <div className="relative w-full max-w-[280px] h-[142px] flex items-center justify-center">
                    {/* Background SVG: Hills, clouds & trees */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 280 142" fill="none">
                      {/* Soft clouds */}
                      <path d="M38 68 A 15 15 0 0 1 68 68 A 12 12 0 0 1 84 76 L 30 76 A 12 12 0 0 1 38 68 Z" fill="#f1f5f9" opacity="0.8" />
                      <path d="M192 64 A 16 16 0 0 1 224 64 A 13 13 0 0 1 242 74 L 182 74 A 13 13 0 0 1 192 64 Z" fill="#f1f5f9" opacity="0.8" />

                      {/* Curved Ground Hill */}
                      <path d="M10 135 Q 140 78, 270 135 L 270 142 L 10 142 Z" fill="#f8fafc" />

                      {/* Trees left */}
                      <line x1="66" y1="92" x2="66" y2="105" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="66" cy="87" r="6.5" fill="#e2e8f0" />

                      <line x1="84" y1="87" x2="84" y2="99" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="84" cy="82" r="5" fill="#e2e8f0" />

                      {/* Trees right */}
                      <line x1="206" y1="85" x2="206" y2="97" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="206" cy="80" r="5" fill="#e2e8f0" />

                      <line x1="226" y1="90" x2="226" y2="103" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="226" cy="84" r="7" fill="#e2e8f0" />
                    </svg>

                    {/* Floating Metallic Card Graphic matching screenshot */}
                    <div className="relative z-10 w-[172px] h-[106px] rounded-xl bg-gradient-to-b from-[#f3f5f8] via-[#eaedf2] to-[#dfe3ea] border border-white/95 p-3 shadow-md shadow-slate-200/70 flex flex-col justify-between">
                      {/* Card Top */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1.5">
                          <div className="w-10 h-2 bg-[#cbd5e1] rounded-full" />
                          <div className="w-6 h-2 bg-[#cbd5e1] rounded-full" />
                        </div>
                        {/* Overlapping Circles */}
                        <div className="flex -space-x-1.5 opacity-60">
                          <div className="w-5.5 h-5.5 rounded-full bg-[#94a3b8]" />
                          <div className="w-5.5 h-5.5 rounded-full bg-[#cbd5e1]" />
                        </div>
                      </div>

                      {/* Card Bottom: 3 Rounded Bars */}
                      <div className="flex items-center gap-1.5 pt-2">
                        <div className="w-7 h-2 bg-[#cbd5e1] rounded-full" />
                        <div className="w-7 h-2 bg-[#cbd5e1] rounded-full" />
                        <div className="w-7 h-2 bg-[#cbd5e1] rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Text below card */}
                  <div className="text-[13px] font-medium text-slate-400 mt-2 tracking-wide text-center">
                    No E-Wallet linked yet
                  </div>
                </div>
              ) : (
                /* Realistic Bound Wallet Cards (Matching Screenshot_20261010-234033.jpg precisely) */
                <div className="mt-2.5 space-y-3">
                  {currentWallets.map((w) => {
                    const maskedNumber = (() => {
                      const raw = (w.accountNumber || '').replace(/\s+/g, '');
                      if (raw.length <= 4) return raw;
                      return '*'.repeat(Math.max(0, raw.length - 4)) + raw.slice(-4);
                    })();

                    const walletDate = w.createdAt || '2026-10-10 23:40:27';
                    const methodName = w.method === 'bkash' ? 'BKash' : w.method === 'nagad' ? 'Nagad' : 'Rocket';

                    return (
                      <div
                        key={w.id}
                        onClick={() => setSelectedWalletId(w.id)}
                        className="relative w-full rounded-2xl p-4 overflow-hidden shadow-md select-none cursor-pointer transition-all hover:brightness-105"
                        style={{
                          background: 'linear-gradient(90deg, #7c3aed 0%, #3b82f6 45%, #06b6d4 82%, #22d3ee 100%)',
                          minHeight: '144px',
                        }}
                      >
                        {/* Subtle repeating vertical pin-stripe texture overlay matching screenshot */}
                        <div 
                          className="absolute inset-0 pointer-events-none opacity-[0.06]"
                          style={{
                            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.7) 3px, rgba(255,255,255,0.7) 4px)'
                          }}
                        />

                        {/* Decorative watermark / abstract swirl pattern on the right side matching screenshot */}
                        <div className="absolute -right-5 -bottom-5 w-48 h-48 opacity-[0.15] pointer-events-none select-none">
                          <svg viewBox="0 0 200 200" fill="none" className="w-full h-full text-white">
                            <circle cx="100" cy="100" r="75" stroke="currentColor" strokeWidth="8" strokeDasharray="16 8" />
                            <path d="M40 100 C 60 40, 140 40, 160 100 C 140 160, 60 160, 40 100 Z" fill="currentColor" opacity="0.8" />
                            <line x1="50" y1="50" x2="150" y2="150" stroke="currentColor" strokeWidth="6" />
                          </svg>
                        </div>

                        <div className="relative z-10 flex flex-col justify-between h-full min-h-[112px]">
                          {/* Top: E-wallet Icon + Name */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {/* E-wallet Glyph [E =] */}
                              <div className="w-6.5 h-5 rounded-[5px] border-[1.5px] border-white/90 bg-white/10 flex items-center justify-between px-1 shrink-0 backdrop-blur-2xs shadow-xs">
                                <span className="text-[10px] font-black text-white leading-none tracking-tight">E</span>
                                <div className="flex flex-col gap-[2px]">
                                  <span className="w-2 h-[1.5px] bg-white rounded-full"></span>
                                  <span className="w-1.5 h-[1.5px] bg-white rounded-full"></span>
                                </div>
                              </div>
                              <span className="text-base font-bold text-white tracking-wide drop-shadow-xs">
                                {methodName}
                              </span>
                            </div>
                          </div>

                          {/* Middle: Masked Account Number */}
                          <div className="text-[22px] font-black font-mono text-white tracking-wider my-2.5 drop-shadow-xs">
                            {maskedNumber}
                          </div>

                          {/* Bottom: Date & Time */}
                          <div className="text-[11px] font-medium text-white/90 tracking-wide font-mono">
                            {walletDate}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Floating Red (+) Button on Bottom-Right */}
              <div className="flex justify-end -mt-5 relative z-10 pr-2">
                <button
                  type="button"
                  onClick={handleOpenLinkWallet}
                  className="w-11 h-11 bg-[#e52835] hover:bg-[#c91c29] active:scale-95 text-white rounded-full shadow-lg flex items-center justify-center transition-all cursor-pointer group"
                  title="Add E-Wallet"
                  aria-label="Add E-Wallet"
                >
                  <Plus className="w-6 h-6 stroke-[3] group-hover:rotate-90 transition-transform" />
                </button>
              </div>
            </div>

            {/* 4. WITHDRAWAL INFO DETAILS */}
            <div className="px-4 pt-2 pb-3 border-t border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Withdrawal time:</span>
                <span className="text-slate-500 font-medium">24 hours</span>
              </div>

              <div className="text-xs text-slate-400">
                Daily withdrawal 99 (Times), Remaining withdrawal 99 (Times)
              </div>

              <div className="text-xs text-slate-700 font-semibold pt-1">
                Main Wallet :৳ {userBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>

              <div className="text-xs text-slate-700 font-semibold">
                Available Amount : ৳ {userBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>

              {/* Light Blue Pill Refresh Balance Button (Centered) */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleRefreshBalance}
                  className="bg-[#dbeafe] hover:bg-[#bfdbfe] active:scale-95 text-[#0284c7] text-xs font-semibold px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <RotateCw className={`w-3.5 h-3.5 stroke-[2.5] ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh Balance</span>
                </button>
              </div>
            </div>

            {/* 5. FORM: WITHDRAWAL AMOUNT & TRANSACTION PASSWORD */}
            <form onSubmit={handleSubmit} className="px-4 pt-3 space-y-3">
              <h4 className="text-xs font-semibold text-slate-800">
                Withdrawal Amount:
              </h4>

              {/* Amount Box */}
              <div className="border border-slate-200 rounded-xl bg-white px-3.5 py-3 flex items-center justify-between shadow-2xs">
                <span className="text-xs font-semibold text-slate-800 w-24 shrink-0">
                  Amount
                </span>
                <input
                  type="number"
                  min="100"
                  max="10000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="100 ~ 10,000"
                  className="text-xs font-mono font-medium text-slate-800 placeholder-slate-400 outline-none flex-1 text-left bg-transparent"
                  required
                />
              </div>

              {/* Transaction Password Box */}
              <div className="border border-slate-200 rounded-xl bg-white px-3.5 py-2.5 flex items-center justify-between shadow-2xs">
                <div className="text-[11px] font-semibold text-slate-800 w-24 shrink-0 leading-tight">
                  <div>Transaction</div>
                  <div>Password</div>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={trxPassword}
                  onChange={(e) => setTrxPassword(e.target.value)}
                  placeholder="Transaction Password"
                  className="text-xs font-medium text-slate-800 placeholder-slate-400 outline-none flex-1 text-left bg-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer flex items-center justify-center"
                  title="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Big Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !isFormValid}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 ${
                    isFormValid
                      ? 'bg-[#e52835] hover:bg-[#c91c29] text-white cursor-pointer active:scale-98 shadow-md'
                      : 'bg-[#cbd5e1] text-white/90 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Submit</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================================
            7. MODAL: WITHDRAWAL RECORD (History)
            ========================================================================= */}
        {showRecordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]">
              <div className="bg-[#002f27] text-white px-4 py-3 flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#ffd000]">
                  Withdrawal Record
                </h4>
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="p-1 rounded-lg text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-2 flex-1">
                {records.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No withdrawal records found
                  </div>
                ) : (
                  records.map((r, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900 font-mono">
                          ৳{r.amount.toLocaleString()}.00
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {r.date} • {r.id}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.status === 'সফল' || r.status === 'approved' || r.status === 'Completed' || r.status === 'উইথড্র সম্পন্ন হয়েছে'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'বাতিল' || r.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.status === 'সফল' || r.status === 'approved' || r.status === 'Completed' || r.status === 'উইথড্র সম্পন্ন হয়েছে'
                          ? 'সফল'
                          : r.status === 'বাতিল' || r.status === 'rejected'
                          ? 'বাতিল'
                          : 'অপেক্ষামান'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            8. MODAL: TRANSACTION PASSWORD ERROR (MATCHING Screenshot_20261011-000209.jpg)
            ========================================================================= */}
        {showTrxPassErrorModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4">
            <div className="relative w-full max-w-[320px] bg-white rounded-2xl shadow-2xl p-6 pt-5 animate-in fade-in zoom-in-95 duration-150">
              <h3 className="text-[17px] font-bold text-slate-900 tracking-tight">
                Confirmation
              </h3>
              <p className="text-[13.5px] text-slate-700 mt-3 leading-normal font-normal">
                Please enter the correct transaction password (#103-x5fet)
              </p>
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowTrxPassErrorModal(false)}
                  className="text-[#0284c7] hover:text-[#0369a1] active:scale-95 font-bold text-sm tracking-wide px-3 py-1 cursor-pointer transition-all"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            INSUFFICIENT BALANCE MODAL
            ========================================================================= */}
        {showInsufficientModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-[320px] w-full text-center space-y-4 animate-in zoom-in-95 duration-150">
              <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-md text-white">
                <X className="w-8 h-8 stroke-[3]" />
              </div>
              <p className="text-sm font-bold text-slate-900 leading-normal">
                আপনার একাউন্টে ব্যালেন্স নাই
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowInsufficientModal(false)}
                  className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition-transform"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            WITHDRAW SUCCESS MODAL
            ========================================================================= */}
        {showWithdrawSuccessModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-[320px] w-full text-center space-y-4 animate-in zoom-in-95 duration-150">
              <div className="w-14 h-14 bg-[#22c55e] rounded-full flex items-center justify-center shadow-md text-white">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                উত্তোলন সফল
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                সফলভাবে জমা দেওয়া হয়েছে, প্রক্রিয়াকরণ চলছে
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
