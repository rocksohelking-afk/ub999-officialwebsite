/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Flame, 
  Briefcase, 
  Gamepad2, 
  Home as HomeIcon, 
  Gift, 
  Users, 
  Award, 
  UserCheck, 
  Headphones, 
  Star,
  CheckCircle2,
  User,
  RotateCw
} from 'lucide-react';

import { 
  EXACT_HOT_GAMES, 
  EXACT_JACKPOT_GAMES, 
  EXACT_SLOTS_GAMES, 
  EXACT_LIVE_CASINO_GAMES, 
  EXACT_SPORTS_GAMES, 
  EXACT_ESPORTS_GAMES, 
  EXACT_POKER_GAMES, 
  EXACT_LOTTERY_GAMES, 
  PROVIDER_LOGOS,
  ExactGameCard
} from './data/exactSiteData';

import { RegisterPage } from './components/RegisterPage';
import { LoginPage } from './components/LoginPage';
import { SideDrawerMenu } from './components/SideDrawerMenu';
import { RealisticHeroSlider } from './components/RealisticHeroSlider';
import { GameModal } from './components/GameModal';
import { DepositModal } from './components/DepositModal';
import { WithdrawModal } from './components/WithdrawModal';
import { LiveChatWidget } from './components/LiveChatWidget';
import { AppDownloadModal } from './components/AppDownloadModal';
import { UserProfileModal } from './components/UserProfileModal';
import { SecurityModal } from './components/SecurityModal';
import { ProfileDropdownMenu } from './components/ProfileDropdownMenu';
import { MyFavoritesModal } from './components/MyFavoritesModal';
import { isAviatorGame, getGameBehavior } from './utils/gameBehaviors';
import { AdminPanel } from './components/AdminPanel';
import { SignalApp } from './components/SignalApp';
import {
  submitDepositRequest,
  submitWithdrawRequest,
  saveOrUpdateUser,
  subscribeToSettings,
  updateSystemSettings,
  subscribeToDeposits,
  subscribeToWithdrawals,
  subscribeToUsers
} from './utils/firebaseService';

export default function App() {
  // Page Routing: 'home' | 'register' | 'login' | 'admin' | 'signal'
  const [currentView, setCurrentView] = useState<'home' | 'register' | 'login' | 'admin' | 'signal'>(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    const envMode = import.meta.env.VITE_APP_MODE;
    if (envMode === 'admin') return 'admin';
    if (envMode === 'signal') return 'signal';

    const isAdmin = 
      params.get('app') === 'admin' ||
      params.get('view') === 'admin' ||
      params.get('page') === 'admin' ||
      params.has('admin') ||
      path.includes('admin') ||
      hash.includes('admin');

    const isSignal = 
      params.get('app') === 'signal' ||
      params.get('view') === 'signal' ||
      params.get('page') === 'signal' ||
      params.has('signal') ||
      path.includes('signal') ||
      hash.includes('signal');

    if (isAdmin) return 'admin';
    if (isSignal) return 'signal';
    return 'home';
  });

  // Listen to popstate and hashchange so navigating updates view smoothly
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();

      const isAdmin = 
        params.get('app') === 'admin' ||
        params.get('view') === 'admin' ||
        params.get('page') === 'admin' ||
        params.has('admin') ||
        path.includes('admin') ||
        hash.includes('admin');

      const isSignal = 
        params.get('app') === 'signal' ||
        params.get('view') === 'signal' ||
        params.get('page') === 'signal' ||
        params.has('signal') ||
        path.includes('signal') ||
        hash.includes('signal');

      if (isAdmin) {
        setCurrentView('admin');
      } else if (isSignal) {
        setCurrentView('signal');
      } else {
        setCurrentView('home');
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const [activeSubTab, setActiveSubTab] = useState<'hot' | 'favorites' | 'slots'>('hot');
  const [activeBottomTab, setActiveBottomTab] = useState<'home' | 'promotion' | 'invite' | 'reward' | 'member'>('home');
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [jackpotAmount, setJackpotAmount] = useState<number>(117345946.93);

  // Modals & Drawer
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [isGameModalOpen, setIsGameModalOpen] = useState<boolean>(false);
  const [isDepositOpen, setIsDepositOpen] = useState<boolean>(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState<boolean>(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState<boolean>(false);

  // User state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('ub999_logged_in');
    if (saved === 'true') return true;
    return false;
  });
  const [userBalance, setUserBalance] = useState<number>(() => {
    const saved = localStorage.getItem('ub999_balance');
    if (saved !== null) {
      const val = parseFloat(saved);
      if (!isNaN(val) && val >= 0) return val;
    }
    return 0;
  });
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('ub999_user_name') || 'VIP Player';
  });
  const [userPhone, setUserPhone] = useState<string>(() => {
    return localStorage.getItem('ub999_user_phone') || '01712345678';
  });

  const [depositRecords, setDepositRecords] = useState<{ id: string; amount: number; method: string; date: string; status: string; trxId?: string }[]>(() => {
    try {
      const saved = localStorage.getItem('ub999_deposit_records');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [withdrawRecords, setWithdrawRecords] = useState<{ id: string; amount: number; method: string; date: string; status: string }[]>(() => {
    try {
      const saved = localStorage.getItem('ub999_withdraw_records');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState<boolean>(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    const handleInstalled = () => {
      setDeferredInstallPrompt(null);
      showToast('🎉 UB999 অ্যাপ হোমস্ক্রিনে সফলভাবে যুক্ত হয়েছে!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  // Listen for admin panel approval events & cross-tab storage changes
  useEffect(() => {
    const handleAdminApproval = (e: any) => {
      const { type, id, trxId, amount } = e.detail || {};
      if (type === 'deposit') {
        setDepositRecords(prev => prev.map(r => {
          if (
            (r.id === id || (trxId && r.trxId === trxId) || (amount && r.amount === amount && r.status === 'অপেক্ষমান')) &&
            r.status !== 'সফল'
          ) {
            setUserBalance(b => b + r.amount);
            showToast(`৳${r.amount} ডিপোজিট সফল হয়েছে`);
            return { ...r, status: 'সফল' };
          }
          return r;
        }));
      } else if (type === 'withdraw') {
        setWithdrawRecords(prev => prev.map(r => {
          if (
            (r.id === id || (amount && r.amount === amount && r.status === 'অপেক্ষমান')) &&
            r.status !== 'সফল'
          ) {
            showToast(`৳${r.amount} উইথড্র সফল হয়েছে`);
            return { ...r, status: 'সফল' };
          }
          return r;
        }));
      }
    };

    const handleStorageChange = () => {
      try {
        const savedDeps = localStorage.getItem('ub999_deposit_records');
        if (savedDeps) setDepositRecords(JSON.parse(savedDeps));
        const savedWths = localStorage.getItem('ub999_withdraw_records');
        if (savedWths) setWithdrawRecords(JSON.parse(savedWths));
        const savedBal = localStorage.getItem('ub999_balance');
        if (savedBal !== null) {
          const bal = parseFloat(savedBal);
          if (!isNaN(bal)) setUserBalance(bal);
        }
      } catch (err) {
        console.error(err);
      }
    };

    window.addEventListener('ub999_admin_approve_record', handleAdminApproval);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('ub999_admin_approve_record', handleAdminApproval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Real-time synchronization of Deposits from Firestore to display 'সফল' when approved
  useEffect(() => {
    const unsub = subscribeToDeposits((firestoreDeposits) => {
      if (!firestoreDeposits || firestoreDeposits.length === 0) return;
      setDepositRecords((prev) => {
        let changed = false;
        const updated = prev.map((localRec) => {
          const match = firestoreDeposits.find(
            (d) =>
              d.id === localRec.id ||
              (localRec.trxId && d.trxId === localRec.trxId) ||
              ((d.phone === userPhone || d.userId === userPhone) && d.amount === localRec.amount)
          );
          if (match) {
            const newStatus =
              match.status === 'approved'
                ? 'সফল'
                : match.status === 'rejected'
                ? 'বাতিল'
                : 'অপেক্ষমান';
            if (localRec.status !== newStatus) {
              changed = true;
              return { ...localRec, status: newStatus, id: match.id || localRec.id };
            }
          }
          return localRec;
        });

        // Also add any deposits from Firestore belonging to this user that aren't yet in local state
        firestoreDeposits.forEach((fd) => {
          const isUserMatch =
            (userPhone && (fd.phone === userPhone || fd.userId === userPhone)) ||
            (userName && fd.userId === userName);
          if (isUserMatch) {
            const exists = updated.some(
              (r) => r.id === fd.id || (fd.trxId && r.trxId === fd.trxId)
            );
            if (!exists) {
              changed = true;
              updated.unshift({
                id: fd.id,
                amount: fd.amount,
                method: fd.method === 'nagad' ? 'Nagad Deposit' : 'bKash Deposit',
                trxId: fd.trxId,
                date: new Date(fd.createdAt).toLocaleString('en-GB'),
                status:
                  fd.status === 'approved'
                    ? 'সফল'
                    : fd.status === 'rejected'
                    ? 'বাতিল'
                    : 'অপেক্ষমান'
              });
            }
          }
        });

        return changed ? updated : prev;
      });
    });
    return () => unsub?.();
  }, [userPhone, userName]);

  // Real-time synchronization of Withdrawals from Firestore to display 'সফল' when approved
  useEffect(() => {
    const unsub = subscribeToWithdrawals((firestoreWithdrawals) => {
      if (!firestoreWithdrawals || firestoreWithdrawals.length === 0) return;
      setWithdrawRecords((prev) => {
        let changed = false;
        const updated = prev.map((localRec) => {
          const match = firestoreWithdrawals.find(
            (w) =>
              w.id === localRec.id ||
              ((w.phone === userPhone || w.userId === userPhone) && w.amount === localRec.amount)
          );
          if (match) {
            const newStatus =
              match.status === 'approved'
                ? 'সফল'
                : match.status === 'rejected'
                ? 'বাতিল'
                : 'অপেক্ষমান';
            if (localRec.status !== newStatus) {
              changed = true;
              return { ...localRec, status: newStatus, id: match.id || localRec.id };
            }
          }
          return localRec;
        });

        firestoreWithdrawals.forEach((fw) => {
          const isUserMatch =
            (userPhone && (fw.phone === userPhone || fw.userId === userPhone)) ||
            (userName && fw.userId === userName);
          if (isUserMatch) {
            const exists = updated.some((r) => r.id === fw.id);
            if (!exists) {
              changed = true;
              updated.unshift({
                id: fw.id,
                amount: fw.amount,
                method: fw.method === 'nagad' ? 'Nagad Withdrawal' : 'bKash Withdrawal',
                date: new Date(fw.createdAt).toLocaleString('en-GB'),
                status:
                  fw.status === 'approved'
                    ? 'সফল'
                    : fw.status === 'rejected'
                    ? 'বাতিল'
                    : 'অপেক্ষমান'
              });
            }
          }
        });

        return changed ? updated : prev;
      });
    });
    return () => unsub?.();
  }, [userPhone, userName]);

  // Real-time balance sync from Firestore when admin approves deposit or updates user balance
  useEffect(() => {
    if (!userPhone) return;
    const unsub = subscribeToUsers((usersList) => {
      const me = usersList.find((u) => u.phone === userPhone || u.id === userPhone);
      if (me && typeof me.balance === 'number' && !isNaN(me.balance)) {
        setUserBalance((prev) => {
          if (prev !== me.balance) {
            localStorage.setItem('ub999_balance', String(me.balance));
            return me.balance;
          }
          return prev;
        });
      }
    });
    return () => unsub?.();
  }, [userPhone]);


  const handleDownloadClick = async () => {
    if (deferredInstallPrompt) {
      try {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          showToast('🎉 অ্যাপ হোমস্ক্রিনে যুক্ত হচ্ছে...');
          setDeferredInstallPrompt(null);
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }
    setIsDownloadOpen(true);
  };

  const [isDistDownloading, setIsDistDownloading] = useState<boolean>(false);
  const [distProgress, setDistProgress] = useState<string>('');

  const handleDownloadDistZip = async () => {
    if (isDistDownloading) return;
    setIsDistDownloading(true);
    setDistProgress('ডাউনলোড হচ্ছে (১৬ MB)...');
    try {
      showToast('⏳ ১৬ MB ফাইলটি প্রস্তুত হচ্ছে, একটু অপেক্ষা করুন...');
      const response = await fetch('/dist.zip');
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const blob = await response.blob();
      
      if (blob.size < 500000) {
        throw new Error('ত্রুটি: ফাইলটি অসম্পূর্ণ এসেছে। দয়া করে আবার চেষ্টা করুন।');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dist.zip';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 2000);
      showToast('✅ আসল ১৬ MB dist.zip ফাইল ডাউনলোড সম্পন্ন হয়েছে!');
      setDistProgress('ডাউনলোড সম্পন্ন!');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'ডাউনলোডে ত্রুটি');
      setDistProgress('ব্যর্থ হয়েছে');
    } finally {
      setTimeout(() => {
        setIsDistDownloading(false);
        setDistProgress('');
      }, 4000);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleRefreshBalance = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshingBalance(true);
    setTimeout(() => {
      setIsRefreshingBalance(false);
    }, 600);
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('ub999_logged_in', isLoggedIn ? 'true' : 'false');
    localStorage.setItem('ub999_balance', userBalance.toString());
    localStorage.setItem('ub999_user_name', userName);
    localStorage.setItem('ub999_user_phone', userPhone);
    localStorage.setItem('ub999_deposit_records', JSON.stringify(depositRecords));
    localStorage.setItem('ub999_withdraw_records', JSON.stringify(withdrawRecords));
  }, [isLoggedIn, userBalance, userName, userPhone, depositRecords, withdrawRecords]);

  // Jackpot rolling animation
  useEffect(() => {
    const timer = setInterval(() => {
      setJackpotAmount((prev) => prev + (Math.random() * 0.75 + 0.15));
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  // Handle mobile phone hardware/browser back button or gesture to close game modal and return directly to website
  useEffect(() => {
    if (isGameModalOpen) {
      window.history.pushState({ isGameModalOpen: true }, '');

      const handlePopState = () => {
        setIsGameModalOpen(false);
      };

      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isGameModalOpen]);

  const handleCloseGameModal = () => {
    setIsGameModalOpen(false);
    if (window.history.state?.isGameModalOpen) {
      window.history.back();
    }
  };

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleGuestClickCapture = (e: React.MouseEvent) => {
    if (isLoggedIn) return;
    const target = e.target as HTMLElement;
    // If the user explicitly clicked the Login button, allow going to login
    if (target.closest('[data-action="login"]')) {
      return;
    }
    // If the user explicitly clicked the Register button, allow going to register
    if (target.closest('[data-action="register"]')) {
      return;
    }
    // Otherwise, clicking ANYWHERE on the website directly redirects to registration
    e.preventDefault();
    e.stopPropagation();
    setCurrentView('register');
  };

  const handleOpenGame = (game: ExactGameCard) => {
    if (!isLoggedIn) {
      setCurrentView('register');
      return;
    }
    const isAviator = isAviatorGame(game.id, game.title);
    if (!isAviator) {
      const behavior = getGameBehavior(game.id, game.title);
      if (behavior === 'none') {
        // কোনোটায় চাপ দিলে কিছুই আসবে না
        return;
      }
    }

    setSelectedGame({
      id: game.id,
      title: game.title,
      titleBn: game.title,
      provider: game.provider,
      category: isAviator ? 'crash' : 'slots',
      rating: 5.0,
      image: game.image,
      minBet: 10,
      playersCount: 4210
    });
    setIsGameModalOpen(true);
  };

  const handleSuccessRegister = (user: { name: string; phone: string; method: string }) => {
    setIsLoggedIn(true);
    setUserName(user.phone);
    setUserPhone(user.phone);
    setUserBalance(0);
    setCurrentView('home');
    saveOrUpdateUser({
      id: user.phone,
      phone: user.phone,
      username: user.name || user.phone,
      balance: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }).catch(console.error);
  };

  const handleSuccessLogin = (user: { name: string; phone: string; balance?: number; referral?: string }) => {
    setIsLoggedIn(true);
    setUserName(user.name || user.phone);
    setUserPhone(user.phone);
    if (typeof user.balance === 'number' && !isNaN(user.balance)) {
      setUserBalance(user.balance);
    }
    setCurrentView('home');
    showToast(`লগইন সফল হয়েছে! স্বাগতম।`);
    saveOrUpdateUser({
      id: user.phone,
      phone: user.phone,
      username: user.name || user.phone,
      balance: typeof user.balance === 'number' ? user.balance : userBalance,
      status: 'active',
      referredBy: user.referral || 'UB999VIP',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    }).catch(console.error);
  };

  const handleLogout = () => {
    // Save current user state to accounts database before logging out
    try {
      const storedUsers = localStorage.getItem('ub999_registered_users');
      const accounts = storedUsers ? JSON.parse(storedUsers) : {};
      if (userPhone) {
        if (!accounts[userPhone]) {
          accounts[userPhone] = {
            phone: userPhone,
            password: localStorage.getItem('ub999_user_password') || localStorage.getItem('ub999_last_registered_password') || '123456',
            name: userName,
            balance: userBalance,
            registeredAt: new Date().toISOString(),
          };
        } else {
          accounts[userPhone].balance = userBalance;
          accounts[userPhone].name = userName;
        }
        localStorage.setItem('ub999_registered_users', JSON.stringify(accounts));
      }
    } catch (err) {
      console.error(err);
    }

    setIsLoggedIn(false);
    setUserName('');
    setUserPhone('');
    setUserBalance(0);
    localStorage.setItem('ub999_logged_in', 'false');
    localStorage.removeItem('ub999_user_name');
    localStorage.removeItem('ub999_user_phone');
    localStorage.setItem('ub999_balance', '0');
    setIsProfileOpen(false);
    setIsProfileDropdownOpen(false);
  };

  // Convert jackpot float to segmented format
  const jackpotParts = jackpotAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Listen for Cloud System Settings (Payment numbers, marquee)
  useEffect(() => {
    const isDummy = (str?: string) => {
      if (!str) return true;
      const c = str.replace(/[^0-9]/g, '');
      if (!c || c.length < 5) return true;
      return c === '01700000000' || c === '01800000000' || c === '01900000000' || c === '01700006560' || c === '019000000000';
    };

    const unsub = subscribeToSettings((settings) => {
      if (settings.bkashNumber && !isDummy(settings.bkashNumber)) {
        localStorage.setItem('ub999_admin_bkash_number', settings.bkashNumber);
        localStorage.setItem('ub999_bkash_number', settings.bkashNumber);
      }
      if (settings.nagadNumber && !isDummy(settings.nagadNumber)) {
        localStorage.setItem('ub999_admin_nagad_number', settings.nagadNumber);
        localStorage.setItem('ub999_nagad_number', settings.nagadNumber);
      }
      if (settings.bkashNumbers && Array.isArray(settings.bkashNumbers)) {
        const cleanBk = settings.bkashNumbers.filter(n => n && !isDummy(n));
        if (cleanBk.length > 0) {
          localStorage.setItem('ub999_bkash_numbers', JSON.stringify(settings.bkashNumbers));
        }
      }
      if (settings.nagadNumbers && Array.isArray(settings.nagadNumbers)) {
        const cleanNg = settings.nagadNumbers.filter(n => n && !isDummy(n));
        if (cleanNg.length > 0) {
          localStorage.setItem('ub999_nagad_numbers', JSON.stringify(settings.nagadNumbers));
        }
      }
      if (settings.marqueeNotice) {
        localStorage.setItem('ub999_marquee_text', settings.marqueeNotice);
      }
    });
    return () => unsub?.();
  }, []);

  // If the browser already has numbers in local storage from a prior session, auto-sync to server
  // Seed official numbers into local storage and database
  // Safe initial seed: ONLY seed if local storage is completely empty (first run), NEVER overwrite existing admin numbers!
  useEffect(() => {
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

    try {
      const existingBk = localStorage.getItem('ub999_bkash_numbers');
      const existingNg = localStorage.getItem('ub999_nagad_numbers');
      const hasBk = existingBk && JSON.parse(existingBk).some((n: string) => n && n.trim().length >= 10);
      const hasNg = existingNg && JSON.parse(existingNg).some((n: string) => n && n.trim().length >= 10);

      // Only seed default numbers if NO numbers exist at all
      if (!hasBk) {
        localStorage.setItem('ub999_bkash_numbers', JSON.stringify(OFFICIAL_BKASH_NUMBERS));
        localStorage.setItem('ub999_admin_bkash_number', OFFICIAL_BKASH_NUMBERS[0]);
        localStorage.setItem('ub999_bkash_number', OFFICIAL_BKASH_NUMBERS[0]);
      }
      if (!hasNg) {
        localStorage.setItem('ub999_nagad_numbers', JSON.stringify(OFFICIAL_NAGAD_NUMBERS));
        localStorage.setItem('ub999_admin_nagad_number', OFFICIAL_NAGAD_NUMBERS[0]);
        localStorage.setItem('ub999_nagad_number', OFFICIAL_NAGAD_NUMBERS[0]);
      }
    } catch {}
  }, []);

  // If in 'admin' view: render AdminPanel
  if (currentView === 'admin') {
    return (
      <AdminPanel
        onBackToMain={() => {
          window.history.replaceState({}, '', window.location.pathname);
          setCurrentView('home');
        }}
        onOpenSignalApp={() => setCurrentView('signal')}
      />
    );
  }

  // If in 'signal' view: render SignalApp (admin access disabled)
  if (currentView === 'signal') {
    return (
      <SignalApp
        onBackToMain={() => {
          window.history.replaceState({}, '', window.location.pathname);
          setCurrentView('home');
        }}
      />
    );
  }

  // If in 'register' view: render RegisterPage
  if (currentView === 'register') {
    return (
      <div className="min-h-screen bg-[#01251e] flex flex-col items-center justify-start">
        <div className="w-full max-w-[430px] min-h-screen bg-[#012b23] shadow-2xl relative flex flex-col border-x border-[#053d31]">
          <RegisterPage
            onBack={() => setCurrentView('home')}
            onGoToLogin={() => setCurrentView('login')}
            onSuccessRegister={handleSuccessRegister}
          />
        </div>
      </div>
    );
  }

  // If in 'login' view: render LoginPage
  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-[#01251e] flex flex-col items-center justify-start">
        <div className="w-full max-w-[430px] min-h-screen bg-[#012b23] shadow-2xl relative flex flex-col border-x border-[#053d31]">
          <LoginPage
            onBack={() => setCurrentView('home')}
            onGoToRegister={() => setCurrentView('register')}
            onSuccessLogin={handleSuccessLogin}
          />
        </div>
      </div>
    );
  }

  // Default: 'home' view
  return (
    <div className="min-h-screen bg-[#01251e] text-slate-100 flex flex-col items-center justify-start font-sans selection:bg-[#ffd000] selection:text-black">
      
      {/* Toast popup */}
      {toastMsg && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-[#ffd000] text-black px-4 py-2 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 border border-yellow-300 animate-bounce max-w-xs text-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Mobile Screen Container */}
      <div 
        onClickCapture={handleGuestClickCapture}
        className="w-full max-w-[430px] min-h-screen bg-[#012b23] shadow-2xl relative flex flex-col pb-24 border-x border-[#053d31]"
      >
        

        {/* =========================================================================
            1. TOP APP DOWNLOAD BANNER
            ========================================================================= */}
        <div className="bg-[#002f27] border-b border-[#064236] px-3 py-1.5 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm flex items-center justify-center shrink-0">
              <img src="/ub999_logo.svg" alt="UB999" className="w-full h-full object-contain" />
            </div>

            <div className="flex flex-col">
              <span className="text-[#ffd000] font-black text-xs tracking-wide">
                APP UP TO ৳999 &gt;&gt;&gt;
              </span>
              <div className="flex items-center gap-0.5 text-[#ffd000] text-[9px] -mt-0.5">
                <Star className="w-2.5 h-2.5 fill-[#ffd000] text-[#ffd000]" />
                <Star className="w-2.5 h-2.5 fill-[#ffd000] text-[#ffd000]" />
                <Star className="w-2.5 h-2.5 fill-[#ffd000] text-[#ffd000]" />
                <Star className="w-2.5 h-2.5 fill-[#ffd000] text-[#ffd000]" />
                <Star className="w-2.5 h-2.5 fill-[#ffd000] text-[#ffd000]" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadClick}
              className="px-3.5 py-1 rounded-md bg-[#ffd000] hover:bg-yellow-400 text-black font-black text-xs shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              Download
            </button>
            <button 
              onClick={handleDownloadClick}
              className="relative p-0.5 text-slate-400 hover:text-white cursor-pointer"
            >
              <span className="text-sm">🎁</span>
              <span className="absolute -top-1 -right-1 text-[8px] bg-slate-900 text-slate-400 rounded-full w-3 h-3 flex items-center justify-center border border-slate-700">✖</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            2. MAIN HEADER BAR: Hamburger (3 Lines), Logo (UB999 | winub), Login & Register
            ========================================================================= */}
        <header className="bg-[#01382e] border-b border-[#084c3f] px-3 py-2 flex items-center justify-between sticky top-[42px] z-30 shadow-md">
          {/* Hamburger (3 Lines) + Logo */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSideMenuOpen(true)}
              className="p-1 rounded text-[#00f5cc] hover:text-white cursor-pointer active:scale-95 transition-transform"
              title="Open Menu"
            >
              <Menu className="w-6 h-6 stroke-[2.5]" />
            </button>

            {/* Brand Logo */}
            <div className="flex items-center gap-1.5 text-lg font-black tracking-tight select-none">
              <img src="/ub999_logo.svg" alt="UB999" className="w-6 h-6 rounded-md shadow-sm shrink-0 object-contain" />
              <div className="flex items-center">
                <span className="text-[#59e236]">UB999</span>
                <span className="text-white/60 mx-1 font-light text-sm">|</span>
                <span className="text-white">win</span>
                <span className="text-[#59e236]">ub</span>
              </div>
            </div>
          </div>

          {/* Buttons & User Info */}
          <div className="flex items-center gap-2 relative">
            {isLoggedIn ? (
              <div className="flex items-center gap-1.5">
                {/* 1. রিয়েলস্টিক প্রোফাইল পিকচার (Cute girl with hands on face/chin) */}
                <button
                  type="button"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_8px_rgba(251,191,36,0.45)] hover:shadow-[0_0_12px_rgba(251,191,36,0.7)] flex items-center justify-center transition-all active:scale-95 cursor-pointer shrink-0"
                  title="Profile Menu"
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 border border-yellow-100/50 flex items-center justify-center">
                    <img 
                      src="/avatar.jpg" 
                      alt="Profile Avatar"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&h=120&q=80';
                      }}
                    />
                  </div>
                </button>

                {/* Profile Dropdown Menu matching Screenshot_20261010-022440.jpg */}
                <ProfileDropdownMenu
                  isOpen={isProfileDropdownOpen}
                  onClose={() => setIsProfileDropdownOpen(false)}
                  onLogout={handleLogout}
                />

                {/* 2. ব্যালেন্স সিস্টেম বক্স (Balance Pill Box with Refresh Icon) */}
                <div 
                  className="flex items-center gap-1.5 bg-[#022820] border border-[#00f5cc]/40 hover:border-[#00f5cc]/70 px-2.5 py-1 rounded-full cursor-pointer transition-all shadow-inner active:scale-98"
                >
                  <span className="text-xs font-black text-[#00f5cc] font-mono tracking-tight select-none">
                    ৳{userBalance.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={handleRefreshBalance}
                    className="text-[#00f5cc] hover:text-white transition-colors cursor-pointer p-0.5 -mr-0.5"
                    title="Refresh Balance"
                  >
                    <RotateCw className={`w-3.5 h-3.5 stroke-[2.2] transition-transform duration-500 ${isRefreshingBalance ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  data-action="login"
                  onClick={() => setCurrentView('login')}
                  className="px-3 py-1 rounded-md bg-[#0e5860] hover:bg-[#126b75] text-white font-bold text-xs border border-[#167885] cursor-pointer"
                >
                  Login
                </button>
                <button
                  data-action="register"
                  onClick={() => setCurrentView('register')}
                  className="px-3 py-1 rounded-md bg-[#ffd000] hover:bg-yellow-400 text-black font-black text-xs cursor-pointer"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </header>

        {/* Body Scroll Area */}
        <div className="px-3 py-2.5 space-y-3.5 flex-1">
          
          {/* 3. MARQUEE NOTICE */}
          <div className="bg-[#002f27] border border-[#094d40] rounded-full px-2.5 py-1 flex items-center gap-2 overflow-hidden shadow-inner">
            {/* Professional Golden Speakerhorn Icon */}
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center shrink-0 shadow-sm border border-amber-200/50">
              <svg className="w-3 h-3 fill-[#01251e]" viewBox="0 0 24 24">
                <path d="M3.5 9h3.7l5.3-4.2c.7-.6 1.8-.1 1.8.8v12.8c0 .9-1.1 1.4-1.8.8L7.2 15H3.5c-.8 0-1.5-.7-1.5-1.5v-3c0-.8.7-1.5 1.5-1.5zm14.3-.8c.4-.4 1-.4 1.4 0 2.2 2.2 2.2 5.8 0 8-.4.4-1 .4-1.4 0s-.4-1 0-1.4c1.4-1.4 1.4-3.8 0-5.2-.4-.4-.4-1 0-1.4zm-2.8 2.8c.4-.4 1-.4 1.4 0 .7.7.7 1.8 0 2.5-.4.4-1 .4-1.4 0s-.4-1 0-1.4c0-.2 0-.8 0-1.1z" />
              </svg>
            </div>
            <div className="overflow-hidden w-full whitespace-nowrap">
              <div className="animate-marquee inline-block font-medium text-amber-200 text-[11px] tracking-wide">
                স্বাগতম UB999 এ! নতুন সদস্যদের জন্য ১০০% ওয়েলকাম বোনাস ৳৯৯৯ পর্যন্ত • বিকাশ, নগদ ও রকেটে দ্রুত ২ মিনিটে ডিপোজিট ও ইনস্ট্যান্ট উইথড্র • আনলিমিটেড ৫% ডেইলি ক্যাশব্যাক ও ভিআইপি রিওয়ার্ডস • ২৪/৭ লাইভ কাস্টমার সাপোর্ট সর্বদা আপনাদের সেবায় নিয়োজিত
              </div>
            </div>
          </div>

          {/* 4. REALISTIC HERO SLIDER ADS */}
          <RealisticHeroSlider onBannerClick={() => setIsDepositOpen(true)} />

          {/* DEPOSIT & WITHDRAW BUTTONS (2-column layout filling the entire space) */}
          {isLoggedIn && (
            <div className="grid grid-cols-2 gap-2">
              {/* Deposit Button */}
              <button
                onClick={() => setIsDepositOpen(true)}
                className="relative flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-gradient-to-b from-[#052620] to-[#021713] border border-[#0d4a3e] hover:border-[#00f5cc]/50 shadow-sm active:scale-[0.98] transition-all cursor-pointer group overflow-hidden"
              >
                <div className="w-4.5 h-4.5 rounded bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 flex items-center justify-center shadow-sm shrink-0 border border-amber-200/40">
                  <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-black font-black" fill="currentColor">
                    <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                  </svg>
                </div>
                <span className="font-black text-xs text-[#ffd000] tracking-wide uppercase drop-shadow-sm">
                  Deposit
                </span>
              </button>

              {/* Withdraw Button */}
              <button
                onClick={() => setIsWithdrawOpen(true)}
                className="relative flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-gradient-to-b from-[#052620] to-[#021713] border border-[#0d4a3e] hover:border-[#00f5cc]/50 shadow-sm active:scale-[0.98] transition-all cursor-pointer group overflow-hidden"
              >
                <div className="w-4.5 h-4.5 rounded bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 flex items-center justify-center shadow-sm shrink-0 border border-amber-200/40">
                  <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-black font-black" fill="currentColor">
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                  </svg>
                </div>
                <span className="font-black text-xs text-[#ffd000] tracking-wide uppercase drop-shadow-sm">
                  Withdraw
                </span>
              </button>
            </div>
          )}

          {/* 5. SUB-NAV TABS: [HOT GAMES] [FAVORITES] [SLOTS] */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => setActiveSubTab('hot')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeSubTab === 'hot'
                  ? 'bg-[#06483c] text-[#00f5cc] border border-[#00f5cc]/60 shadow-sm'
                  : 'bg-[#002f27] text-slate-300 border border-[#084639]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-[#00f5cc]" />
              <span className="text-[11px]">HOT GAMES</span>
            </button>

            <button
              onClick={() => setIsFavoritesOpen(true)}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeSubTab === 'favorites'
                  ? 'bg-[#06483c] text-[#00f5cc] border border-[#00f5cc]/60 shadow-sm'
                  : 'bg-[#002f27] text-slate-300 border border-[#084639]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-[#00f5cc]" />
              <span className="text-[11px]">FAVORITES</span>
            </button>

            <button
              onClick={() => setActiveSubTab('slots')}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeSubTab === 'slots'
                  ? 'bg-[#06483c] text-[#00f5cc] border border-[#00f5cc]/60 shadow-sm'
                  : 'bg-[#002f27] text-slate-300 border border-[#084639]'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 text-[#00f5cc]" />
              <span className="text-[11px]">SLOTS</span>
            </button>
          </div>

          {/* 6. HOT / SUBTAB GAMES */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#00f5cc] tracking-wide font-sans">
                {activeSubTab === 'favorites' ? 'FAVORITE GAMES' : activeSubTab === 'slots' ? 'POPULAR SLOTS' : 'HOT GAMES'}
              </h3>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setActiveSubTab(activeSubTab === 'hot' ? 'slots' : 'hot')}
                  className="px-2.5 py-0.5 rounded bg-[#06483c] text-[#00f5cc] text-xs font-bold border border-[#0b5446] cursor-pointer"
                >
                  See All
                </button>
                <button className="w-5 h-5 rounded bg-[#06483c] text-[#00f5cc] flex items-center justify-center border border-[#0b5446] cursor-pointer">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button className="w-5 h-5 rounded bg-[#06483c] text-[#00f5cc] flex items-center justify-center border border-[#0b5446] cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {activeSubTab === 'favorites' && favorites.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 bg-[#001f19] rounded-lg border border-[#08493c]">
                কোনো প্রিয় গেম যোগ করা হয়নি। গেমে থাকা হার্ট আইকনে ট্যাপ করে পছন্দের তালিকা তৈরি করুন।
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {(activeSubTab === 'favorites'
                  ? [...EXACT_HOT_GAMES, ...EXACT_SLOTS_GAMES, ...EXACT_JACKPOT_GAMES].filter((game, index, self) =>
                      favorites.includes(game.id) && self.findIndex((g) => g.id === game.id) === index
                    )
                  : activeSubTab === 'slots'
                  ? EXACT_SLOTS_GAMES
                  : EXACT_HOT_GAMES
                ).map((game) => (
                  <div
                    key={game.id}
                    onClick={() => handleOpenGame(game)}
                    className="relative bg-[#001713] border border-[#08493c] rounded-lg overflow-hidden cursor-pointer group aspect-[4/5] transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <img
                      src={game.image}
                      alt={game.title}
                      className="absolute inset-0 w-full h-full object-cover object-center select-none"
                      loading="lazy"
                    />
                    
                    {/* Badge */}
                    {game.badge && (
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur border border-amber-500/50 text-amber-300 font-black text-[8px] font-mono shadow-sm z-10">
                        {game.badge}
                      </div>
                    )}

                    {/* Favorite Heart */}
                    <button
                      onClick={(e) => toggleFavorite(e, game.id)}
                      className={`absolute top-1 right-1 w-5 h-5 rounded-full ${
                        favorites.includes(game.id)
                          ? 'bg-black/60 text-rose-500'
                          : 'bg-black/40 text-white'
                      } flex items-center justify-center z-10 transition-opacity cursor-pointer`}
                      title="Favorite"
                    >
                      <Heart className={`w-3 h-3 ${favorites.includes(game.id) ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                    </button>

                    {/* Provider Name at Bottom Center (e.g. SPRIBE on Aviator) matching screenshot */}
                    {game.provider && (
                      <div className="absolute inset-x-0 bottom-2 z-10 text-center pointer-events-none select-none">
                        <span className="text-[11px] font-black text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                          {game.provider}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 7. JACKPOT SECTION */}
          <div className="bg-[#00261f] border border-[#08493c] rounded-xl p-3 relative shadow-md">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl animate-bounce">🛩️</span>
                <h3 className="text-2xl font-black text-[#f59e0b] tracking-wide">
                  Jackpot
                </h3>
              </div>
            </div>

            {/* Odometer Numbers */}
            <div className="flex items-center justify-center gap-1 my-2 flex-wrap">
              {jackpotParts.split('').map((char, idx) => {
                if (char === ',' || char === '.') {
                  return (
                    <span key={idx} className="text-[#ffd000] font-black text-lg px-0.5">
                      {char}
                    </span>
                  );
                }
                return (
                  <div
                    key={idx}
                    className="w-6 h-8 bg-white text-black font-black font-mono text-lg rounded flex items-center justify-center shadow border border-slate-300 select-none"
                  >
                    {char}
                  </div>
                );
              })}
            </div>

            {/* 3 Jackpot Games */}
            <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2.5 border-t border-[#063c31]">
              {EXACT_JACKPOT_GAMES.map((game) => (
                <div
                  key={game.id}
                  onClick={() => handleOpenGame(game)}
                  className="relative bg-[#001713] border border-[#08493c] rounded-lg overflow-hidden cursor-pointer group aspect-[4/5] transition-all hover:scale-[1.02] active:scale-95"
                >
                  <img
                    src={game.image}
                    alt={game.title}
                    className="absolute inset-0 w-full h-full object-cover object-center select-none"
                    loading="lazy"
                  />
                  {game.badge && (
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur border border-amber-500/50 text-amber-300 font-black text-[8px] font-mono shadow-sm z-10">
                      {game.badge}
                    </div>
                  )}

                  {/* Provider Name at Bottom Center */}
                  {game.provider && (
                    <div className="absolute inset-x-0 bottom-2 z-10 text-center pointer-events-none select-none">
                      <span className="text-[11px] font-black text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                        {game.provider}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 8. SLOTS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#00f5cc] tracking-wide font-sans">
                SLOTS
              </h3>
              <div className="flex items-center gap-1">
                <button className="px-2.5 py-0.5 rounded bg-[#06483c] text-[#00f5cc] text-xs font-bold border border-[#0b5446] cursor-pointer">
                  See All
                </button>
                <button className="w-5 h-5 rounded bg-[#06483c] text-[#00f5cc] flex items-center justify-center border border-[#0b5446] cursor-pointer">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button className="w-5 h-5 rounded bg-[#06483c] text-[#00f5cc] flex items-center justify-center border border-[#0b5446] cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {EXACT_SLOTS_GAMES.map((game) => (
                <div
                  key={game.id}
                  onClick={() => handleOpenGame(game)}
                  className="relative bg-[#001713] border border-[#08493c] rounded-lg overflow-hidden cursor-pointer group aspect-[4/5] transition-all hover:scale-[1.02] active:scale-95"
                >
                  <img
                    src={game.image}
                    alt={game.title}
                    className="absolute inset-0 w-full h-full object-cover object-center select-none"
                    loading="lazy"
                  />
                  {game.badge && (
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur border border-amber-500/50 text-amber-300 font-black text-[8px] font-mono shadow-sm z-10">
                      {game.badge}
                    </div>
                  )}

                  {/* Provider Name at Bottom Center */}
                  {game.provider && (
                    <div className="absolute inset-x-0 bottom-2 z-10 text-center pointer-events-none select-none">
                      <span className="text-[11px] font-black text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                        {game.provider}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 9. LIVE CASINO */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#00f5cc] tracking-wide font-sans">
                LIVE CASINO
              </h3>
              <div className="flex items-center gap-1">
                <button className="px-2.5 py-0.5 rounded bg-[#06483c] text-[#00f5cc] text-xs font-bold border border-[#0b5446] cursor-pointer">
                  See All
                </button>
                <button className="w-5 h-5 rounded bg-[#06483c] text-[#00f5cc] flex items-center justify-center border border-[#0b5446] cursor-pointer">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button className="w-5 h-5 rounded bg-[#06483c] text-[#00f5cc] flex items-center justify-center border border-[#0b5446] cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {EXACT_LIVE_CASINO_GAMES.map((game) => (
                <div
                  key={game.id}
                  onClick={() => handleOpenGame(game)}
                  className="relative bg-[#001713] border border-[#08493c] rounded-lg overflow-hidden cursor-pointer group aspect-[4/5] transition-all hover:scale-[1.02] active:scale-95"
                >
                  <img
                    src={game.image}
                    alt={game.title}
                    className="absolute inset-0 w-full h-full object-cover object-center select-none"
                    loading="lazy"
                  />
                  {game.badge && (
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-red-600/90 text-white font-black text-[8px] font-mono shadow-sm z-10">
                      {game.badge}
                    </div>
                  )}

                  {/* Provider Name at Bottom Center */}
                  {game.provider && (
                    <div className="absolute inset-x-0 bottom-2 z-10 text-center pointer-events-none select-none">
                      <span className="text-[11px] font-black text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                        {game.provider}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 10. SPORTS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#00f5cc] tracking-wide font-sans">
                SPORTS
              </h3>
              <div className="flex items-center gap-1">
                <button className="px-2.5 py-0.5 rounded bg-[#06483c] text-[#00f5cc] text-xs font-bold border border-[#0b5446] cursor-pointer">
                  See All
                </button>
                <button className="w-5 h-5 rounded bg-[#06483c] text-[#00f5cc] flex items-center justify-center border border-[#0b5446] cursor-pointer">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button className="w-5 h-5 rounded bg-[#06483c] text-[#00f5cc] flex items-center justify-center border border-[#0b5446] cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {EXACT_SPORTS_GAMES.map((game) => (
                <div
                  key={game.id}
                  onClick={() => handleOpenGame(game)}
                  className="relative bg-[#001713] border border-[#08493c] rounded-lg overflow-hidden cursor-pointer group aspect-[4/5] transition-all hover:scale-[1.02] active:scale-95"
                >
                  <img
                    src={game.image}
                    alt={game.title}
                    className="absolute inset-0 w-full h-full object-cover object-center select-none"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 11. E-SPORTS */}
          <div className="space-y-2">
            <h3 className="text-base font-black text-[#00f5cc] tracking-wide font-sans">
              E-SPORTS
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {EXACT_ESPORTS_GAMES.map((game) => (
                <div
                  key={game.id}
                  onClick={() => handleOpenGame(game)}
                  className="relative bg-[#001713] border border-[#08493c] rounded-lg overflow-hidden cursor-pointer group aspect-[16/9] transition-all hover:scale-[1.02] active:scale-95"
                >
                  <img
                    src={game.image}
                    alt={game.title}
                    className="w-full h-full object-cover select-none"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 12. POKER */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#00f5cc] tracking-wide font-sans">
                POKER
              </h3>
              <div className="flex items-center gap-1">
                <button className="px-2.5 py-0.5 rounded bg-[#06483c] text-[#00f5cc] text-xs font-bold border border-[#0b5446] cursor-pointer">
                  See All
                </button>
                <button className="w-5 h-5 rounded bg-[#06483c] text-[#00f5cc] flex items-center justify-center border border-[#0b5446] cursor-pointer">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button className="w-5 h-5 rounded bg-[#06483c] text-[#00f5cc] flex items-center justify-center border border-[#0b5446] cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {EXACT_POKER_GAMES.map((game) => (
                <div
                  key={game.id}
                  onClick={() => handleOpenGame(game)}
                  className="relative bg-[#001713] border border-[#08493c] rounded-lg overflow-hidden cursor-pointer group aspect-[4/5] transition-all hover:scale-[1.02] active:scale-95"
                >
                  <img
                    src={game.image}
                    alt={game.title}
                    className="absolute inset-0 w-full h-full object-cover object-center select-none"
                    loading="lazy"
                  />
                  {game.badge && (
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur border border-amber-500/50 text-amber-300 font-black text-[8px] font-mono shadow-sm z-10">
                      {game.badge}
                    </div>
                  )}

                  {/* Provider Name at Bottom Center */}
                  {game.provider && (
                    <div className="absolute inset-x-0 bottom-2 z-10 text-center pointer-events-none select-none">
                      <span className="text-[11px] font-black text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                        {game.provider}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 13. LOTTERY */}
          <div className="space-y-2">
            <h3 className="text-base font-black text-[#00f5cc] tracking-wide font-sans">
              LOTTERY
            </h3>

            <div className="w-1/3">
              {EXACT_LOTTERY_GAMES.map((game) => (
                <div
                  key={game.id}
                  onClick={() => handleOpenGame(game)}
                  className="relative bg-[#001713] border border-[#08493c] rounded-lg overflow-hidden cursor-pointer group aspect-[4/5] transition-all hover:scale-[1.02] active:scale-95"
                >
                  <img
                    src={game.image}
                    alt={game.title}
                    className="absolute inset-0 w-full h-full object-cover object-center select-none"
                    loading="lazy"
                  />

                  {/* Provider Name at Bottom Center */}
                  {game.provider && (
                    <div className="absolute inset-x-0 bottom-2 z-10 text-center pointer-events-none select-none">
                      <span className="text-[11px] font-black text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                        {game.provider}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 14. DUAL BIG BUTTONS: [PARTNER] & [Live Chat] */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              type="button"
              onClick={(e) => e.preventDefault()}
              className="py-3 px-3 rounded-xl bg-[#06483c] hover:bg-[#0a5749] border border-[#0c594b] text-center shadow active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-base font-black text-[#ffd000] tracking-wider">
                PARTNER
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="py-3 px-3 rounded-xl bg-[#06483c] hover:bg-[#0a5749] border border-[#0c594b] text-center shadow active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              <span className="text-base font-black text-[#ffd000] tracking-wide">
                Live Chat
              </span>
            </button>
          </div>

          {/* 15. GAME CENTER */}
          <div className="space-y-2 pt-2">
            <h4 className="text-sm font-black text-amber-400">
              Game Center
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {['Slots', 'Live Casino', 'Sports', 'E-sports', 'Poker', 'Fish', 'Lottery'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => alert(`${tag} filter selected`)}
                  className="px-3 py-1.5 rounded-lg bg-[#002f27] border border-[#094d40] text-[#00f5cc] font-bold text-xs cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 16. FOOTER LICENSE & SOCIALS */}
          <div className="pt-4 border-t border-[#063c31] space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shrink-0 border border-amber-400/50 p-0.5 bg-[#00241e]">
                <img src="/ub999_logo.svg" alt="UB999 Official Logo" className="w-full h-full object-contain" />
              </div>

              <p className="text-[10px] text-slate-300/80 leading-relaxed">
                UB999 website is operated by company, under license number GLH-OCCHKTW07080120 issued to it and regulated by Gaming Services Provider N.V., authorized by the Government of Curaçao under license number 365JAZ.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Facebook */}
              <button 
                onClick={() => window.open('https://facebook.com/', '_blank')}
                className="w-7 h-7 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                title="Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>

              {/* Instagram */}
              <button 
                onClick={() => window.open('https://instagram.com/', '_blank')}
                className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                title="Instagram"
              >
                <svg className="w-3.5 h-3.5 text-white fill-none stroke-white stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <circle cx="17.5" cy="6.5" r="1.5" fill="white" stroke="none" />
                </svg>
              </button>

              {/* Telegram */}
              <button 
                onClick={() => window.open('https://t.me/', '_blank')}
                className="w-7 h-7 rounded-full bg-[#229ED9] text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                title="Telegram"
              >
                <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.536-.196 1.006.128.832.939z"/>
                </svg>
              </button>

              {/* WhatsApp */}
              <button 
                onClick={() => window.open('https://wa.me/', '_blank')}
                className="w-7 h-7 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                title="WhatsApp"
              >
                <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                  <path d="M12.031 0C5.385 0 .002 5.383 0 12.029c0 2.12.553 4.188 1.603 6.01L.06 24l6.143-1.612a11.968 11.968 0 0 0 5.828 1.503h.005c6.645 0 12.029-5.384 12.03-12.031A12.01 12.01 0 0 0 12.031 0zm0 22.013a9.98 9.98 0 0 1-5.093-1.392l-.365-.217-3.784.992 1.01-3.689-.237-.378a9.96 9.96 0 0 1-1.53-5.298c0-5.526 4.498-10.024 10.026-10.024a9.97 9.97 0 0 1 7.09 2.937 9.97 9.97 0 0 1 2.934 7.087c-.002 5.528-4.5 10.026-10.051 10.026zm5.498-7.509c-.301-.151-1.784-.88-2.06-.98-.277-.1-.478-.151-.68.151-.201.302-.78 1.005-.956 1.206-.176.201-.352.226-.653.076-.301-.151-1.272-.469-2.423-1.496-.896-.799-1.501-1.787-1.677-2.089-.176-.301-.019-.464.132-.614.136-.135.301-.352.452-.528.151-.176.201-.301.301-.502.101-.201.05-.377-.025-.528-.075-.151-.678-1.633-.929-2.236-.245-.588-.494-.508-.679-.517l-.578-.01c-.201 0-.527.075-.803.377s-1.054 1.03-1.054 2.512 1.08 2.914 1.23 3.115c.151.201 2.125 3.245 5.149 4.549.72.311 1.281.497 1.719.636.723.23 1.38.197 1.9.12.58-.086 1.784-.729 2.035-1.432.251-.703.251-1.306.176-.151z"/>
                </svg>
              </button>

              {/* 18+ Responsible Gaming Badge */}
              <div 
                className="w-7 h-7 rounded-full border-2 border-red-500 bg-[#2b0707] text-red-500 font-black text-[10px] flex items-center justify-center shadow-md select-none"
                title="18+ Only - Play Responsibly"
              >
                18+
              </div>
            </div>

            {/* Providers Grid */}
            <div className="pt-3 border-t border-[#063c31]/60">
              <div className="grid grid-cols-4 gap-1.5 text-center">
                {PROVIDER_LOGOS.map((prov, idx) => (
                  <div
                    key={idx}
                    className="p-1 rounded bg-[#00241e] border border-[#053d31] text-[9px] font-mono font-bold text-amber-300/80 flex items-center justify-center truncate"
                  >
                    {prov}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* 17. FLOATING ACTION BADGES (Right Edge with realistic logos) */}
        <div className="fixed right-2 bottom-20 z-40 flex flex-col items-center gap-2">
          {/* WhatsApp */}
          <button
            onClick={() => window.open('https://wa.me/', '_blank')}
            className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform cursor-pointer"
            title="WhatsApp"
          >
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
              <path d="M12.031 0C5.385 0 .002 5.383 0 12.029c0 2.12.553 4.188 1.603 6.01L.06 24l6.143-1.612a11.968 11.968 0 0 0 5.828 1.503h.005c6.645 0 12.029-5.384 12.03-12.031A12.01 12.01 0 0 0 12.031 0zm0 22.013a9.98 9.98 0 0 1-5.093-1.392l-.365-.217-3.784.992 1.01-3.689-.237-.378a9.96 9.96 0 0 1-1.53-5.298c0-5.526 4.498-10.024 10.026-10.024a9.97 9.97 0 0 1 7.09 2.937 9.97 9.97 0 0 1 2.934 7.087c-.002 5.528-4.5 10.026-10.051 10.026zm5.498-7.509c-.301-.151-1.784-.88-2.06-.98-.277-.1-.478-.151-.68.151-.201.302-.78 1.005-.956 1.206-.176.201-.352.226-.653.076-.301-.151-1.272-.469-2.423-1.496-.896-.799-1.501-1.787-1.677-2.089-.176-.301-.019-.464.132-.614.136-.135.301-.352.452-.528.151-.176.201-.301.301-.502.101-.201.05-.377-.025-.528-.075-.151-.678-1.633-.929-2.236-.245-.588-.494-.508-.679-.517l-.578-.01c-.201 0-.527.075-.803.377s-1.054 1.03-1.054 2.512 1.08 2.914 1.23 3.115c.151.201 2.125 3.245 5.149 4.549.72.311 1.281.497 1.719.636.723.23 1.38.197 1.9.12.58-.086 1.784-.729 2.035-1.432.251-.703.251-1.306.176-.151z"/>
            </svg>
          </button>

          {/* Facebook */}
          <div className="relative">
            <button
              onClick={() => window.open('https://facebook.com/', '_blank')}
              className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              title="Facebook"
            >
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
            <span className="absolute -bottom-1.5 -left-3 whitespace-nowrap bg-[#ffd000] text-black text-[7px] font-black px-1 rounded-full shadow border border-amber-300 scale-90">
              +১০ টাকা বোনাস
            </span>
          </div>

          {/* Telegram */}
          <div className="relative mt-0.5">
            <button
              onClick={() => window.open('https://t.me/', '_blank')}
              className="w-9 h-9 rounded-full bg-[#229ED9] text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              title="Telegram"
            >
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.536-.196 1.006.128.832.939z"/>
              </svg>
            </button>
            <span className="absolute -bottom-1.5 -left-3 whitespace-nowrap bg-[#ffd000] text-black text-[7px] font-black px-1 rounded-full shadow border border-amber-300 scale-90">
              +১০ টাকা বোনাস
            </span>
          </div>

          {/* Customer Service Live Chat */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0ea5e9] to-[#0284c7] text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform mt-0.5 cursor-pointer"
            title="Live Chat"
          >
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
              <path d="M12 1a9 9 0 0 0-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2a7 7 0 0 1 14 0v2h-4v8h3c.55 0 1-.45 1-1v-1.1c1.8-1.4 3-3.6 3-6.9 0-4.97-4.03-9-9-9zm-5 13H5v-2h2v2zm12 0h-2v-2h2v2z"/>
            </svg>
          </button>
        </div>

        {/* 18. FIXED BOTTOM NAVIGATION BAR matching Screenshot_20261010-024800.jpg */}
        <nav className="fixed bottom-0 max-w-[430px] w-full z-40 bg-[#002820] border-t border-[#005244] shadow-2xl pb-safe">
          <div className="flex items-center justify-around px-1 py-1.5 relative">
            
            {/* 1. Home */}
            <button
              onClick={() => setActiveBottomTab('home')}
              className="flex flex-col items-center justify-center min-w-[56px] py-0.5 cursor-pointer transition-all active:scale-95"
            >
              <svg 
                className={`w-5 h-5 transition-colors ${activeBottomTab === 'home' ? 'text-[#ffd000]' : 'text-[#00f5cc]'}`} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5z" />
              </svg>
              {activeBottomTab === 'home' ? (
                <div className="w-5 h-[2.5px] bg-[#ffd000] rounded-full mt-1 mb-0.5" />
              ) : (
                <div className="w-5 h-[2.5px] opacity-0 mt-1 mb-0.5" />
              )}
              <span className={`text-[11px] font-bold tracking-tight ${activeBottomTab === 'home' ? 'text-[#ffd000]' : 'text-[#00f5cc]'}`}>
                Home
              </span>
            </button>

            {/* 2. Promotion */}
            <button
              onClick={() => {
                // User instruction: প্রোমোশন এ ক্লিক করলে কিছুই হবে না
              }}
              className="flex flex-col items-center justify-center min-w-[56px] py-0.5 cursor-pointer transition-all active:scale-95"
            >
              <svg 
                className={`w-5 h-5 transition-colors ${activeBottomTab === 'promotion' ? 'text-[#ffd000]' : 'text-[#00f5cc]'}`} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="3" y="8" width="18" height="13" rx="2" />
                <path d="M12 8v13" />
                <path d="M19 12H5" />
                <path d="M7.5 8a2.5 2.5 0 0 1 0-5A3.5 3.5 0 0 1 12 6.5" />
                <path d="M16.5 8a2.5 2.5 0 0 0 0-5A3.5 3.5 0 0 0 12 6.5" />
              </svg>
              {activeBottomTab === 'promotion' ? (
                <div className="w-5 h-[2.5px] bg-[#ffd000] rounded-full mt-1 mb-0.5" />
              ) : (
                <div className="w-5 h-[2.5px] opacity-0 mt-1 mb-0.5" />
              )}
              <span className={`text-[11px] font-bold tracking-tight ${activeBottomTab === 'promotion' ? 'text-[#ffd000]' : 'text-[#00f5cc]'}`}>
                Promotion
              </span>
            </button>

            {/* 3. Invite (Center elevated circular button) */}
            <div className="relative -top-4 flex flex-col items-center">
              <button
                onClick={() => {
                  setActiveBottomTab('invite');
                  navigator.clipboard.writeText(window.location.href);
                  showToast('রেফারেল লিঙ্ক কপি হয়েছে!');
                }}
                className="w-12 h-12 rounded-full bg-[#002820] border-2 border-[#00f5cc] shadow-[0_0_12px_rgba(0,245,204,0.45)] flex items-center justify-center active:scale-95 transition-all cursor-pointer hover:border-[#ffd000]"
              >
                {/* 3 Connected user network nodes */}
                <svg className="w-6 h-6 text-[#00f5cc]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="5" r="2.5" fill="#00f5cc" stroke="none" />
                  <circle cx="5" cy="18" r="2.5" fill="#00f5cc" stroke="none" />
                  <circle cx="19" cy="18" r="2.5" fill="#00f5cc" stroke="none" />
                  <line x1="12" y1="7.5" x2="5" y2="15.5" stroke="#00f5cc" strokeWidth="2.5" />
                  <line x1="12" y1="7.5" x2="19" y2="15.5" stroke="#00f5cc" strokeWidth="2.5" />
                  <circle cx="12" cy="5" r="3.5" stroke="#00f5cc" strokeWidth="1.5" />
                  <circle cx="5" cy="18" r="3.5" stroke="#00f5cc" strokeWidth="1.5" />
                  <circle cx="19" cy="18" r="3.5" stroke="#00f5cc" strokeWidth="1.5" />
                </svg>
              </button>
              <span className="text-[11px] font-bold text-[#00f5cc] tracking-tight mt-0.5">
                Invite
              </span>
            </div>

            {/* 4. Reward */}
            <button
              onClick={() => {
                // User instruction: রেওয়ার্ড এ ক্লিক করলে কিছুই হবে না
              }}
              className="flex flex-col items-center justify-center min-w-[56px] py-0.5 cursor-pointer transition-all active:scale-95"
            >
              {/* Rosette Medal with ribbon tails */}
              <svg 
                className={`w-5 h-5 transition-colors ${activeBottomTab === 'reward' ? 'text-[#ffd000]' : 'text-[#00f5cc]'}`} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="9" r="6" />
                <path d="M12 6.5l.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2z" fill="currentColor" stroke="none" />
                <path d="M8.5 14L7 21l5-2.5L17 21l-1.5-7" />
              </svg>
              {activeBottomTab === 'reward' ? (
                <div className="w-5 h-[2.5px] bg-[#ffd000] rounded-full mt-1 mb-0.5" />
              ) : (
                <div className="w-5 h-[2.5px] opacity-0 mt-1 mb-0.5" />
              )}
              <span className={`text-[11px] font-bold tracking-tight ${activeBottomTab === 'reward' ? 'text-[#ffd000]' : 'text-[#00f5cc]'}`}>
                Reward
              </span>
            </button>

            {/* 5. Member */}
            <button
              onClick={() => {
                setActiveBottomTab('member');
                if (isLoggedIn) {
                  setIsProfileOpen(true);
                } else {
                  setCurrentView('register');
                }
              }}
              className="flex flex-col items-center justify-center min-w-[56px] py-0.5 cursor-pointer transition-all active:scale-95"
            >
              {/* Faceted Diamond with crown points */}
              <svg 
                className={`w-5 h-5 transition-colors ${activeBottomTab === 'member' ? 'text-[#ffd000]' : 'text-[#00f5cc]'}`} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M6 9l6-5 6 5-6 11L6 9z" />
                <path d="M6 9h12" />
                <circle cx="12" cy="3.5" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="6" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
                <circle cx="18" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
              </svg>
              {activeBottomTab === 'member' ? (
                <div className="w-5 h-[2.5px] bg-[#ffd000] rounded-full mt-1 mb-0.5" />
              ) : (
                <div className="w-5 h-[2.5px] opacity-0 mt-1 mb-0.5" />
              )}
              <span className={`text-[11px] font-bold tracking-tight ${activeBottomTab === 'member' ? 'text-[#ffd000]' : 'text-[#00f5cc]'}`}>
                Member
              </span>
            </button>

          </div>
        </nav>

        {/* 19. EXACT SIDE DRAWER MENU (Matching Screenshot_20261008-234359.png) */}
        <SideDrawerMenu
          isOpen={isSideMenuOpen}
          onClose={() => setIsSideMenuOpen(false)}
        />

        {/* MODALS */}
        <GameModal
          game={selectedGame}
          isOpen={isGameModalOpen}
          onClose={handleCloseGameModal}
          lang="bn"
          userBalance={userBalance}
          onUpdateBalance={(diff) => setUserBalance((prev) => Math.max(0, prev + diff))}
        />

        <DepositModal
          isOpen={isDepositOpen}
          onClose={() => setIsDepositOpen(false)}
          lang="bn"
          userPhone={userPhone}
          onSuccessDeposit={async (amount, trxId, method) => {
            const tempId = 'DP' + Math.floor(100000 + Math.random() * 900000);
            const newRec = {
              id: tempId,
              amount,
              method: method.includes('nagad') ? 'Nagad Deposit' : 'bKash Deposit',
              trxId,
              date: new Date().toLocaleString('en-GB'),
              status: 'অপেক্ষমান'
            };
            setDepositRecords((prev) => [newRec, ...prev]);
            try {
              const res = await submitDepositRequest({
                userId: userPhone || 'guest',
                phone: userPhone || '017XXXXXXXX',
                method: method.toLowerCase().includes('nagad') ? 'nagad' : 'bkash',
                amount,
                trxId: trxId || 'TRX_' + Date.now()
              });
              if (res && res.id) {
                setDepositRecords((prev) =>
                  prev.map((r) => (r.id === tempId ? { ...r, id: res.id } : r))
                );
              }
            } catch (err) {
              console.error(err);
            }
          }}
        />

        <WithdrawModal
          isOpen={isWithdrawOpen}
          onClose={() => setIsWithdrawOpen(false)}
          lang="bn"
          userBalance={userBalance}
          userName={userName}
          userPhone={userPhone}
          records={withdrawRecords}
          onSuccessWithdraw={async (amount, method) => {
            setUserBalance((prev) => Math.max(0, prev - amount));
            const tempId = 'WD' + Math.floor(100000 + Math.random() * 900000);
            const newRec = {
              id: tempId,
              amount,
              method: method === 'nagad' ? 'Nagad Withdrawal' : 'bKash Withdrawal',
              date: new Date().toLocaleString('en-GB'),
              status: 'অপেক্ষমান'
            };
            setWithdrawRecords((prev) => [newRec, ...prev]);
            try {
              const res = await submitWithdrawRequest({
                userId: userPhone || 'guest',
                phone: userPhone || '017XXXXXXXX',
                method: method === 'nagad' ? 'nagad' : 'bkash',
                amount,
                accountNumber: userPhone || '017XXXXXXXX'
              });
              if (res && res.id) {
                setWithdrawRecords((prev) =>
                  prev.map((r) => (r.id === tempId ? { ...r, id: res.id } : r))
                );
              }
            } catch (err) {
              console.error(err);
            }
          }}
        />

        <LiveChatWidget
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          lang="bn"
        />

        <AppDownloadModal
          isOpen={isDownloadOpen}
          onClose={() => setIsDownloadOpen(false)}
          lang="bn"
          installPrompt={deferredInstallPrompt}
          onInstallSuccess={() => showToast('🎉 UB999 অ্যাপ ইনস্টল হচ্ছে! আপনার ফোনের স্ক্রিনে যুক্ত হচ্ছে...')}
        />

        <UserProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          lang="bn"
          userBalance={userBalance}
          userName={userName}
          userPhone={userPhone}
          depositRecords={depositRecords}
          withdrawRecords={withdrawRecords}
          onOpenDeposit={() => setIsDepositOpen(true)}
          onOpenWithdraw={() => setIsWithdrawOpen(true)}
          onOpenSecurity={() => setIsSecurityOpen(true)}
          onOpenCustomerService={() => setIsChatOpen(true)}
          onLogout={handleLogout}
        />

        <SecurityModal
          isOpen={isSecurityOpen}
          onClose={() => setIsSecurityOpen(false)}
          lang="bn"
          currentPhone={userPhone}
          onUpdatePhone={(newPhone) => setUserPhone(newPhone)}
          onShowToast={showToast}
        />

        <MyFavoritesModal
          isOpen={isFavoritesOpen}
          onClose={() => setIsFavoritesOpen(false)}
        />

      </div>
    </div>
  );
}
