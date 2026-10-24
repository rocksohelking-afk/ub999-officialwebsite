import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  CreditCard,
  ArrowDownCircle,
  ArrowUpCircle,
  Zap,
  CheckCircle2,
  XCircle,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import {
  subscribeToSettings,
  updateSystemSettings,
  subscribeToLiveSignals,
  updateLiveSignals,
  subscribeToDeposits,
  updateDepositStatus,
  subscribeToWithdrawals,
  updateWithdrawStatus,
  subscribeToUsers,
  updateUserBalance,
  updateUserStatus,
  saveOrUpdateUser,
  SystemSettings,
  LiveSignalData,
  DepositRecord,
  WithdrawRecord,
  UserRecord
} from '../utils/firebaseService';

interface AdminPanelProps {
  onBackToMain?: () => void;
  onOpenSignalApp?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToMain, onOpenSignalApp }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('ub999_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'deposits' | 'withdrawals' | 'signals' | 'settings'>('overview');

  // Helper to detect dummy placeholder numbers
  const isDummyNumber = (str?: string) => {
    if (!str) return false;
    const clean = str.replace(/[^0-9]/g, '');
    return clean === '01700000000' || clean === '01800000000' || clean === '01900000000';
  };

  // Firebase Real-time State
  const [settings, setSettings] = useState<SystemSettings>({
    bkashNumber: '',
    nagadNumber: '',
    rocketNumber: '',
    marqueeNotice: '🎉 UB999 অফিশিয়াল প্ল্যাটফর্মে স্বাগতম!',
    winRate: 65,
    aviatorNextTarget: 2.85,
    aviatorRigMode: 'auto'
  });

  const [signals, setSignals] = useState<LiveSignalData>({
    isEnabled: true,
    nextCrashMultiplier: 2.85,
    currentRoundId: '#948251',
    updatedAt: ''
  });

  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);

  const OFFICIAL_DEFAULT_BKASH = ['01349782631', '01318097241', '01357287095'];
  const OFFICIAL_DEFAULT_NAGAD = ['01768782530', '01349845888', '01349845906', '01349845902', '01347246605'];

  // Local Form States for Numbers - GUARANTEED NON-EMPTY FALLBACK
  const [bkashList, setBkashList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ub999_bkash_numbers');
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr.some(n => n && !isDummyNumber(n) && n.trim().length >= 10)) {
          const list = Array(10).fill('');
          arr.forEach((n, i) => {
            if (i < 10) list[i] = (n && !isDummyNumber(n)) ? n.trim() : '';
          });
          return list;
        }
      }
      const single = localStorage.getItem('ub999_admin_bkash_number') || localStorage.getItem('ub999_bkash_number');
      if (single && !isDummyNumber(single) && single.trim().length >= 10) {
        const list = Array(10).fill('');
        list[0] = single.trim();
        return list;
      }
    } catch {}
    const defaultList = Array(10).fill('');
    OFFICIAL_DEFAULT_BKASH.forEach((n, i) => { defaultList[i] = n; });
    return defaultList;
  });

  const [nagadList, setNagadList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ub999_nagad_numbers');
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr.some(n => n && !isDummyNumber(n) && n.trim().length >= 10)) {
          const list = Array(10).fill('');
          arr.forEach((n, i) => {
            if (i < 10) list[i] = (n && !isDummyNumber(n)) ? n.trim() : '';
          });
          return list;
        }
      }
      const single = localStorage.getItem('ub999_admin_nagad_number') || localStorage.getItem('ub999_nagad_number');
      if (single && !isDummyNumber(single) && single.trim().length >= 10) {
        const list = Array(10).fill('');
        list[0] = single.trim();
        return list;
      }
    } catch {}
    const defaultList = Array(10).fill('');
    OFFICIAL_DEFAULT_NAGAD.forEach((n, i) => { defaultList[i] = n; });
    return defaultList;
  });
  const [activeBkashIdx, setActiveBkashIdx] = useState<number>(0);
  const [activeNagadIdx, setActiveNagadIdx] = useState<number>(0);
  const [numberTab, setNumberTab] = useState<'bkash' | 'nagad'>('bkash');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [signalSuccess, setSignalSuccess] = useState('');
  const hasLoadedBkashFromCloudRef = useRef(false);
  const hasLoadedNagadFromCloudRef = useRef(false);

  // Deposit Approval & Balance Add Modal State
  const [selectedDepositForApproval, setSelectedDepositForApproval] = useState<DepositRecord | null>(null);
  const [depositApproveAmount, setDepositApproveAmount] = useState<string>('');
  const [depositSuccessMessage, setDepositSuccessMessage] = useState<string>('');

  // Auto-sync any previously entered local numbers to the server on mount
  useEffect(() => {
    try {
      const savedBk = localStorage.getItem('ub999_bkash_numbers');
      const singleBk = localStorage.getItem('ub999_admin_bkash_number') || localStorage.getItem('ub999_bkash_number');
      const savedNg = localStorage.getItem('ub999_nagad_numbers');
      const singleNg = localStorage.getItem('ub999_admin_nagad_number') || localStorage.getItem('ub999_nagad_number');

      let bkList: string[] = [];
      if (savedBk) {
        const parsed = JSON.parse(savedBk);
        if (Array.isArray(parsed) && parsed.some(n => n && !isDummyNumber(n))) bkList = parsed;
      }
      let ngList: string[] = [];
      if (savedNg) {
        const parsed = JSON.parse(savedNg);
        if (Array.isArray(parsed) && parsed.some(n => n && !isDummyNumber(n))) ngList = parsed;
      }

      if (bkList.length > 0 || ngList.length > 0 || (singleBk && !isDummyNumber(singleBk)) || (singleNg && !isDummyNumber(singleNg))) {
        updateSystemSettings({
          bkashNumber: (singleBk && !isDummyNumber(singleBk)) ? singleBk : bkList.find(n => Boolean(n)) || '',
          nagadNumber: (singleNg && !isDummyNumber(singleNg)) ? singleNg : ngList.find(n => Boolean(n)) || '',
          ...(bkList.length > 0 ? { bkashNumbers: bkList } : {}),
          ...(ngList.length > 0 ? { nagadNumbers: ngList } : {}),
          updatedAt: Date.now()
        });
      }
    } catch {}
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubSettings = subscribeToSettings((s) => {
      setSettings(s);

      // Safe update for bKash numbers: ONLY overwrite if cloud actually has non-empty valid numbers
      if (s.bkashNumbers && Array.isArray(s.bkashNumbers)) {
        const validItems = s.bkashNumbers.filter(num => num && !isDummyNumber(num) && num.trim().length >= 10);
        if (validItems.length > 0) {
          const incomingBkash = Array(10).fill('');
          s.bkashNumbers.forEach((num, idx) => {
            if (idx < 10 && num && !isDummyNumber(num)) incomingBkash[idx] = num.trim();
          });
          setBkashList(incomingBkash);
          hasLoadedBkashFromCloudRef.current = true;
        }
      } else if (s.bkashNumber && !isDummyNumber(s.bkashNumber) && s.bkashNumber.trim().length >= 10) {
        setBkashList(prev => {
          if (prev.some(Boolean)) return prev;
          const list = Array(10).fill('');
          list[0] = s.bkashNumber.trim();
          return list;
        });
        hasLoadedBkashFromCloudRef.current = true;
      }
      if (s.activeBkashIndex !== undefined) {
        setActiveBkashIdx(s.activeBkashIndex);
      }

      // Safe update for Nagad numbers: ONLY overwrite if cloud actually has non-empty valid numbers
      if (s.nagadNumbers && Array.isArray(s.nagadNumbers)) {
        const validItems = s.nagadNumbers.filter(num => num && !isDummyNumber(num) && num.trim().length >= 10);
        if (validItems.length > 0) {
          const incomingNagad = Array(10).fill('');
          s.nagadNumbers.forEach((num, idx) => {
            if (idx < 10 && num && !isDummyNumber(num)) incomingNagad[idx] = num.trim();
          });
          setNagadList(incomingNagad);
          hasLoadedNagadFromCloudRef.current = true;
        }
      } else if (s.nagadNumber && !isDummyNumber(s.nagadNumber) && s.nagadNumber.trim().length >= 10) {
        setNagadList(prev => {
          if (prev.some(Boolean)) return prev;
          const list = Array(10).fill('');
          list[0] = s.nagadNumber.trim();
          return list;
        });
        hasLoadedNagadFromCloudRef.current = true;
      }
      if (s.activeNagadIndex !== undefined) {
        setActiveNagadIdx(s.activeNagadIndex);
      }
    });

    const unsubSignals = subscribeToLiveSignals((sig) => {
      setSignals(sig);
    });

    const unsubDeposits = subscribeToDeposits((deps) => setDeposits(deps));
    const unsubWithdrawals = subscribeToWithdrawals((wths) => setWithdrawals(wths));
    const unsubUsers = subscribeToUsers((u) => setUsers(u));

    return () => {
      unsubSettings?.();
      unsubSignals?.();
      unsubDeposits?.();
      unsubWithdrawals?.();
      unsubUsers?.();
    };
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === 'ZR 6878' || pinInput.trim() === 'ZR 6878') {
      setIsAuthenticated(true);
      sessionStorage.setItem('ub999_admin_auth', 'true');
      setPinError('');
    } else {
      setPinError('ভুল পাসওয়ার্ড');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('ub999_admin_auth');
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (numberTab === 'bkash') {
        const cleanBkashList = bkashList.map(n => (n || '').trim());
        const validItems = cleanBkashList.filter(n => Boolean(n) && n.length >= 10);
        if (validItems.length === 0) {
          alert('কমপক্ষে একটি সঠিক বিকাশ নম্বর থাকা আবশ্যক!');
          return;
        }
        const activeBkash = validItems[0];
        const now = Date.now();
        const payload: Partial<SystemSettings> = {
          bkashNumber: activeBkash,
          bkashNumbers: cleanBkashList,
          updatedAt: now
        };
        // 1. Immediately store in localStorage so site reflects it without delay
        localStorage.setItem('ub999_bkash_numbers', JSON.stringify(cleanBkashList));
        localStorage.setItem('ub999_admin_bkash_number', activeBkash);
        localStorage.setItem('ub999_bkash_number', activeBkash);
        window.dispatchEvent(new Event('ub999_admin_config_updated'));
        window.dispatchEvent(new Event('storage'));

        setBkashList(cleanBkashList);
        hasLoadedBkashFromCloudRef.current = true;
        setSaveSuccess('বিকাশ নম্বর সফলভাবে সেভ হয়েছে!');

        // 2. Sync to server & cloud (safe)
        await updateSystemSettings(payload);
      } else {
        const cleanNagadList = nagadList.map(n => (n || '').trim());
        const validItems = cleanNagadList.filter(n => Boolean(n) && n.length >= 10);
        if (validItems.length === 0) {
          alert('কমপক্ষে একটি সঠিক নগদ নম্বর থাকা আবশ্যক!');
          return;
        }
        const activeNagad = validItems[0];
        const now = Date.now();
        const payload: Partial<SystemSettings> = {
          nagadNumber: activeNagad,
          nagadNumbers: cleanNagadList,
          updatedAt: now
        };
        // 1. Immediately store in localStorage
        localStorage.setItem('ub999_nagad_numbers', JSON.stringify(cleanNagadList));
        localStorage.setItem('ub999_admin_nagad_number', activeNagad);
        localStorage.setItem('ub999_nagad_number', activeNagad);
        window.dispatchEvent(new Event('ub999_admin_config_updated'));
        window.dispatchEvent(new Event('storage'));

        setNagadList(cleanNagadList);
        hasLoadedNagadFromCloudRef.current = true;
        setSaveSuccess('নগদ নম্বর সফলভাবে সেভ হয়েছে!');

        // 2. Sync to server & cloud (safe)
        await updateSystemSettings(payload);
      }
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err) {
      console.warn('Notice while saving settings:', err);
      setSaveSuccess('নম্বর সেভ হয়েছে!');
      setTimeout(() => setSaveSuccess(''), 3000);
    }
  };

  // Signal App Master ON/OFF Switch
  const handleSetSignalState = async (newState: boolean) => {
    try {
      await updateLiveSignals({
        isEnabled: newState,
        updatedAt: new Date().toLocaleTimeString('bn-BD')
      });
      setSignalSuccess(
        newState
          ? '🟢 সিগন্যাল চালু (ON) করা হয়েছে!'
          : '🔴 সিগন্যাল বন্ধ (OFF) করা হয়েছে! সিগন্যাল আর শো করবে না।'
      );
      setTimeout(() => setSignalSuccess(''), 3000);
    } catch {
      alert('সিগন্যাল সুইচ পরিবর্তনে সমস্যা হয়েছে');
    }
  };

  const handleToggleSignalApp = async () => {
    await handleSetSignalState(!signals.isEnabled);
  };

  const handleOpenApproveModal = (dep: DepositRecord) => {
    setSelectedDepositForApproval(dep);
    setDepositApproveAmount(String(dep.amount || ''));
  };

  const handleConfirmApproveDeposit = async () => {
    if (!selectedDepositForApproval) return;
    const addAmount = parseFloat(depositApproveAmount);
    if (isNaN(addAmount) || addAmount <= 0) {
      alert('সঠিক ব্যালেন্স টাকার পরিমাণ লিখুন');
      return;
    }

    try {
      // 1. Mark deposit as approved
      await updateDepositStatus(selectedDepositForApproval.id, 'approved');

      // 2. Add balance to user account in Firestore
      const targetUser = users.find(
        (u) => u.id === selectedDepositForApproval.userId || u.phone === selectedDepositForApproval.phone
      );

      if (targetUser) {
        await updateUserBalance(targetUser.id, targetUser.balance + addAmount);
      } else {
        await saveOrUpdateUser({
          id: selectedDepositForApproval.phone || selectedDepositForApproval.userId,
          phone: selectedDepositForApproval.phone,
          username: selectedDepositForApproval.phone,
          balance: addAmount,
          status: 'active',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
      }

      // 3. Sync localStorage for local test accounts & record status to 'সফল'
      try {
        const storedUsers = localStorage.getItem('ub999_registered_users');
        if (storedUsers) {
          const accs = JSON.parse(storedUsers);
          if (accs[selectedDepositForApproval.phone]) {
            accs[selectedDepositForApproval.phone].balance =
              (Number(accs[selectedDepositForApproval.phone].balance) || 0) + addAmount;
            localStorage.setItem('ub999_registered_users', JSON.stringify(accs));
          }
        }
        const currentPhone = localStorage.getItem('ub999_user_phone');
        if (currentPhone === selectedDepositForApproval.phone || !currentPhone) {
          const curBal = Number(localStorage.getItem('ub999_balance')) || 0;
          localStorage.setItem('ub999_balance', String(curBal + addAmount));
        }

        // Update local deposit records to 'সফল'
        const rawLocalDeps = localStorage.getItem('ub999_deposit_records');
        if (rawLocalDeps) {
          const localDeps = JSON.parse(rawLocalDeps);
          const updatedDeps = localDeps.map((d: any) => {
            if (
              d.id === selectedDepositForApproval.id ||
              (d.trxId && d.trxId === selectedDepositForApproval.trxId) ||
              (d.amount === selectedDepositForApproval.amount && d.status === 'অপেক্ষমান')
            ) {
              return { ...d, status: 'সফল' };
            }
            return d;
          });
          localStorage.setItem('ub999_deposit_records', JSON.stringify(updatedDeps));
        }

        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(
          new CustomEvent('ub999_admin_approve_record', {
            detail: {
              type: 'deposit',
              id: selectedDepositForApproval.id,
              trxId: selectedDepositForApproval.trxId,
              amount: addAmount
            }
          })
        );
      } catch (err) {
        console.error(err);
      }

      setDepositSuccessMessage(`৳${addAmount} ব্যালেন্স সফলভাবে ব্যবহারকারীর একাউন্টে যোগ হয়েছে!`);
      setTimeout(() => setDepositSuccessMessage(''), 4000);
      setSelectedDepositForApproval(null);
    } catch (err) {
      alert('ব্যালেন্স যোগ করতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  };

  const handleRejectDeposit = async (depId: string) => {
    if (confirm('এই ডিপোজিট রিকোয়েস্টটি বাতিল (Reject) করবেন?')) {
      await updateDepositStatus(depId, 'rejected');
      try {
        const rawLocalDeps = localStorage.getItem('ub999_deposit_records');
        if (rawLocalDeps) {
          const localDeps = JSON.parse(rawLocalDeps);
          const updatedDeps = localDeps.map((d: any) =>
            d.id === depId ? { ...d, status: 'বাতিল' } : d
          );
          localStorage.setItem('ub999_deposit_records', JSON.stringify(updatedDeps));
        }
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleApproveWithdraw = async (wth: WithdrawRecord) => {
    if (confirm(`৳${wth.amount} উইথড্রয়াল পেইড হিসেবে মার্ক করবেন?`)) {
      await updateWithdrawStatus(wth.id, 'approved');
      try {
        const rawLocalWths = localStorage.getItem('ub999_withdraw_records');
        if (rawLocalWths) {
          const localWths = JSON.parse(rawLocalWths);
          const updatedWths = localWths.map((w: any) => {
            if (
              w.id === wth.id ||
              (w.amount === wth.amount && w.status === 'অপেক্ষমান')
            ) {
              return { ...w, status: 'সফল' };
            }
            return w;
          });
          localStorage.setItem('ub999_withdraw_records', JSON.stringify(updatedWths));
        }

        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(
          new CustomEvent('ub999_admin_approve_record', {
            detail: {
              type: 'withdraw',
              id: wth.id,
              amount: wth.amount
            }
          })
        );
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleRejectWithdraw = async (wth: WithdrawRecord) => {
    if (confirm('এই উইথড্র রিকোয়েস্টটি বাতিল করে ইউজারের একাউন্টে ব্যালেন্স ফেরত দেবেন?')) {
      await updateWithdrawStatus(wth.id, 'rejected');
      const targetUser = users.find(u => u.id === wth.userId || u.phone === wth.phone);
      if (targetUser) {
        await updateUserBalance(targetUser.id, targetUser.balance + wth.amount);
      }
      try {
        const rawLocalWths = localStorage.getItem('ub999_withdraw_records');
        if (rawLocalWths) {
          const localWths = JSON.parse(rawLocalWths);
          const updatedWths = localWths.map((w: any) =>
            w.id === wth.id ? { ...w, status: 'বাতিল' } : w
          );
          localStorage.setItem('ub999_withdraw_records', JSON.stringify(updatedWths));
        }
        const curBal = Number(localStorage.getItem('ub999_balance')) || 0;
        localStorage.setItem('ub999_balance', String(curBal + wth.amount));
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Stats calculation
  const pendingDepositsCount = deposits.filter(d => d.status === 'pending').length;
  const pendingWithdrawalsCount = withdrawals.filter(w => w.status === 'pending').length;
  const totalDepositAmount = deposits
    .filter(d => d.status === 'approved')
    .reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalWithdrawAmount = withdrawals
    .filter(w => w.status === 'approved')
    .reduce((sum, w) => sum + (w.amount || 0), 0);

  // If not authenticated, show PIN login lockscreen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-sm bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
          
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-9 h-9 text-slate-950" />
            </div>
            <h1 className="text-2xl font-black text-amber-400 tracking-wider">UB999 ADMIN PANEL</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                পাসওয়ার্ড
              </label>
              <div>
                <input
                  type="password"
                  maxLength={32}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (pinError) setPinError('');
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-center tracking-widest text-lg font-mono text-amber-400 focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>
              {pinError && (
                <p className="text-rose-400 text-[11px] mt-1 text-left font-medium pl-1">
                  ভুল পাসওয়ার্ড
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-xl transition duration-200 shadow-md shadow-amber-500/20 flex items-center justify-center cursor-pointer"
            >
              লগইন
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="font-black text-amber-400 tracking-wider text-base sm:text-lg whitespace-nowrap">
            ADMIN PANEL
          </h1>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-2 sm:px-4 sticky top-[61px] z-30 backdrop-blur-md overflow-x-auto scrollbar-none">
        <div className="max-w-6xl mx-auto flex items-center gap-1 sm:gap-2 py-2 min-w-max">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            ওভারভিউ
          </button>

          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition relative ${
              activeTab === 'deposits'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            ডিপোজিট রিকোয়েস্ট
            {pendingDepositsCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                {pendingDepositsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition relative ${
              activeTab === 'withdrawals'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ArrowUpCircle className="w-3.5 h-3.5" />
            উইথড্র রিকোয়েস্ট
            {pendingWithdrawalsCount > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {pendingWithdrawalsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('signals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'signals'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-cyan-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            SIGNAL MAINTENANCE
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            NUMBER ADD OR CHANGE
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="max-w-6xl mx-auto w-full p-4 flex-1">
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
                <span className="text-xs text-slate-400 font-medium">পেন্ডিং ডিপোজিট</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">{pendingDepositsCount} টি</div>
                <div className="text-[11px] text-slate-500 mt-0.5">অ্যাপ্রুভালের অপেক্ষায়</div>
                <ArrowDownCircle className="w-8 h-8 text-emerald-500/10 absolute right-3 bottom-3" />
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
                <span className="text-xs text-slate-400 font-medium">পেন্ডিং উইথড্র</span>
                <div className="text-2xl font-black text-rose-400 mt-1">{pendingWithdrawalsCount} টি</div>
                <div className="text-[11px] text-slate-500 mt-0.5">পেমেন্ট পাঠানোর বাকি</div>
                <ArrowUpCircle className="w-8 h-8 text-rose-500/10 absolute right-3 bottom-3" />
              </div>
            </div>

            {/* Quick Action Hub */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Aviator live signal status */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg relative">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-white text-base">SIGNAL MAINTENANCE</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSetSignalState(true)}
                    className={`py-3.5 rounded-xl font-black text-sm tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
                      signals.isEnabled
                        ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400 shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    ON
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetSignalState(false)}
                    className={`py-3.5 rounded-xl font-black text-sm tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
                      !signals.isEnabled
                        ? 'bg-rose-600 text-white ring-2 ring-rose-500 shadow-rose-600/30'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    OFF
                  </button>
                </div>
              </div>

              {/* Gateway Status */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-white text-base">NUMBER ADD OR CHANGE</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  বদলান <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. DEPOSITS TAB */}
        {activeTab === 'deposits' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">ডিপোজিট রিকোয়েস্ট তালিকা</h2>
                <p className="text-xs text-slate-400">ব্যবহারকারীদের পাঠানো বিকাশ/নগদ পেমেন্ট ভেরিফাই করুন</p>
              </div>
            </div>

            {depositSuccessMessage && (
              <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {depositSuccessMessage}
              </div>
            )}

            {deposits.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
                <ArrowDownCircle className="w-12 h-12 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="text-sm text-slate-400 font-medium">কোনো ডিপোজিট রিকোয়েস্ট পাওয়া যায়নি</p>
                <p className="text-xs text-slate-600 mt-1">ওয়েবসাইটে ব্যবহারকারীরা ডিপোজিট রিকোয়েস্ট পাঠালে তা এখানে সরাসরি রিয়েল-টাইমে আসবে।</p>
              </div>
            ) : (
              <div className="space-y-3">
                {deposits.map((dep) => (
                  <div
                    key={dep.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded ${
                          dep.method === 'bkash' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' :
                          dep.method === 'nagad' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                          'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}>
                          {dep.method}
                        </span>
                        <span className="text-base font-black text-amber-400">৳{dep.amount}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          dep.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                          dep.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                          'bg-amber-500/20 text-amber-400 animate-pulse'
                        }`}>
                          {dep.status === 'pending' ? 'অপেক্ষমাণ' : dep.status === 'approved' ? 'গৃহীত' : 'বাতিল'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 flex items-center gap-2">
                        <span>ফোন: <b className="font-mono text-white">{dep.phone || 'অজ্ঞাত'}</b></span>
                        <span className="text-slate-600">|</span>
                        <span>TrxID: <b className="font-mono text-cyan-400">{dep.trxId}</b></span>
                      </div>
                      <span className="text-[10px] text-slate-500 block font-mono">
                        {new Date(dep.createdAt).toLocaleString('bn-BD')}
                      </span>
                    </div>

                    {dep.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenApproveModal(dep)}
                          className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-500/10"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          ব্যালেন্স এড ও এপ্রুভ
                        </button>
                        <button
                          onClick={() => handleRejectDeposit(dep.id)}
                          className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          বাতিল
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Deposit Approval & Custom Balance Add Modal */}
            {selectedDepositForApproval && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      ডিপোজিট ব্যালেন্স এড ও এপ্রুভ
                    </h3>
                    <button
                      onClick={() => setSelectedDepositForApproval(null)}
                      className="text-slate-400 hover:text-white text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">প্লেয়ার ফোন:</span>
                      <b className="text-white font-mono">{selectedDepositForApproval.phone}</b>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">পেমেন্ট মেথড:</span>
                      <b className="uppercase text-pink-400 font-bold">{selectedDepositForApproval.method}</b>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">TrxID:</span>
                      <b className="text-cyan-400 font-mono">{selectedDepositForApproval.trxId}</b>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">রিকোয়েস্টকৃত টাকা:</span>
                      <b className="text-amber-400 font-mono text-sm">৳{selectedDepositForApproval.amount}</b>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      ব্যালেন্স এড করার অপশন (টাকা):
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-amber-400 font-bold text-sm">৳</span>
                      <input
                        type="number"
                        placeholder="টাকার পরিমাণ লিখুন"
                        value={depositApproveAmount}
                        onChange={(e) => setDepositApproveAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-8 pr-3 text-emerald-400 font-mono text-lg font-black focus:outline-none focus:border-emerald-500"
                        autoFocus
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      * এই পরিমাণ ব্যালেন্স সরাসরি প্লেয়ারের একাউন্টে যোগ হবে।
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleConfirmApproveDeposit}
                      className="py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-500/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      এপ্রুভ
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDepositForApproval(null)}
                      className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
                    >
                      বাতিল
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. WITHDRAWALS TAB */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">উইথড্র রিকোয়েস্ট তালিকা</h2>
                <p className="text-xs text-slate-400">টাকা তোলার আবেদনগুলো দেখুন এবং পেমেন্ট পাঠিয়ে কনফার্ম করুন</p>
              </div>
            </div>

            {withdrawals.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
                <ArrowUpCircle className="w-12 h-12 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="text-sm text-slate-400 font-medium">কোনো উইথড্র রিকোয়েস্ট পাওয়া যায়নি</p>
              </div>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((wth) => (
                  <div
                    key={wth.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {wth.method}
                        </span>
                        <span className="text-base font-black text-rose-400">৳{wth.amount}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          wth.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                          wth.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                          'bg-amber-500/20 text-amber-400 animate-pulse'
                        }`}>
                          {wth.status === 'pending' ? 'অপেক্ষমাণ' : wth.status === 'approved' ? 'পেইড' : 'বাতিল'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300">
                        প্রাপক নম্বর: <b className="font-mono text-amber-400 text-sm">{wth.accountNumber}</b>
                      </div>
                      <span className="text-[10px] text-slate-500 block font-mono">
                        {new Date(wth.createdAt).toLocaleString('bn-BD')}
                      </span>
                    </div>

                    {wth.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveWithdraw(wth)}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          পেইড কনফার্ম
                        </button>
                        <button
                          onClick={() => handleRejectWithdraw(wth)}
                          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold rounded-lg text-xs flex items-center gap-1.5 transition"
                        >
                          <XCircle className="w-4 h-4" />
                          বাতিল ও রিফান্ড
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. SIGNAL APP MASTER CONTROL TAB */}
        {activeTab === 'signals' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                SIGNAL MAINTENANCE
              </h2>
            </div>

            {signalSuccess && (
              <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4" />
                {signalSuccess}
              </div>
            )}

            {/* Main Master Control Card */}
            <div className={`border rounded-3xl p-6 sm:p-8 text-center shadow-2xl transition-all duration-300 ${
              signals.isEnabled
                ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/30 border-emerald-500/40'
                : 'bg-gradient-to-b from-slate-900 via-slate-900 to-rose-950/30 border-rose-500/40'
            }`}>
              <div className="my-4">
                <div className={`w-24 h-24 rounded-3xl mx-auto flex items-center justify-center shadow-xl transition-transform active:scale-95 ${
                  signals.isEnabled
                    ? 'bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-2 border-rose-500/30 text-rose-400'
                }`}>
                  <Zap className={`w-12 h-12 ${signals.isEnabled ? 'animate-pulse' : 'opacity-40'}`} />
                </div>
                <h3 className="text-xl font-black text-white mt-4">
                  SIGNAL MAINTENANCE
                </h3>
              </div>

              {/* ON/OFF Dual Buttons */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleSetSignalState(true)}
                  className={`py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-2xl transition transform active:scale-95 cursor-pointer ${
                    signals.isEnabled
                      ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400 shadow-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  ON
                </button>
                <button
                  type="button"
                  onClick={() => handleSetSignalState(false)}
                  className={`py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-2xl transition transform active:scale-95 cursor-pointer ${
                    !signals.isEnabled
                      ? 'bg-rose-600 text-white ring-2 ring-rose-500 shadow-rose-600/30'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <XCircle className="w-5 h-5" />
                  OFF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                NUMBER ADD OR CHANGE
              </h2>
            </div>

            {saveSuccess && (
              <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {saveSuccess}
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
              {/* Payment Method Switcher Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setNumberTab('bkash')}
                  className={`py-3 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer ${
                    numberTab === 'bkash'
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  বিকাশ নাম্বার এড করুন
                </button>
                <button
                  type="button"
                  onClick={() => setNumberTab('nagad')}
                  className={`py-3 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer ${
                    numberTab === 'nagad'
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  নগদ নাম্বার এড করুন
                </button>
              </div>

              {/* 10 bKash Slots */}
              {numberTab === 'bkash' && (
                <div className="space-y-2">
                  {bkashList.map((num, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 rounded-xl p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3 border border-slate-800"
                    >
                      <span className="text-xs font-bold w-8 shrink-0 font-mono text-pink-400">
                        {idx + 1 < 10 ? `০${idx + 1}` : idx + 1}
                      </span>

                      <input
                        type="text"
                        placeholder={`বিকাশ নম্বর ${idx + 1}`}
                        value={num}
                        onChange={(e) => {
                          const updated = [...bkashList];
                          updated[idx] = e.target.value;
                          setBkashList(updated);
                        }}
                        onBlur={() => {
                          const clean = bkashList.map(n => (n || '').trim());
                          const active = clean.find(Boolean) || '';
                          updateSystemSettings({
                            bkashNumber: active,
                            bkashNumbers: clean,
                            updatedAt: Date.now()
                          });
                        }}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg py-2.5 px-3 text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* 10 Nagad Slots */}
              {numberTab === 'nagad' && (
                <div className="space-y-2">
                  {nagadList.map((num, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 rounded-xl p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3 border border-slate-800"
                    >
                      <span className="text-xs font-bold w-8 shrink-0 font-mono text-orange-400">
                        {idx + 1 < 10 ? `০${idx + 1}` : idx + 1}
                      </span>

                      <input
                        type="text"
                        placeholder={`নগদ নম্বর ${idx + 1}`}
                        value={num}
                        onChange={(e) => {
                          const updated = [...nagadList];
                          updated[idx] = e.target.value;
                          setNagadList(updated);
                        }}
                        onBlur={() => {
                          const clean = nagadList.map(n => (n || '').trim());
                          const active = clean.find(Boolean) || '';
                          updateSystemSettings({
                            nagadNumber: active,
                            nagadNumbers: clean,
                            updatedAt: Date.now()
                          });
                        }}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg py-2.5 px-3 text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Main Save Button at Bottom */}
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-sm transition shadow-lg shadow-amber-500/20 cursor-pointer mt-4 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                {numberTab === 'bkash' ? 'বিকাশ নম্বর সেভ করুন' : 'নগদ নম্বর সেভ করুন'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
