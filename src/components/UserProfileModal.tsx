import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Edit2, 
  RotateCw, 
  CheckSquare, 
  Trophy, 
  GitFork, 
  FileText, 
  FileUp, 
  FileDown, 
  History, 
  User, 
  ShieldCheck, 
  UserPlus, 
  Gift, 
  RefreshCw, 
  AtSign, 
  MessageSquare, 
  Smartphone, 
  Headphones, 
  LogOut,
  Check,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Clock
} from 'lucide-react';
import { Language } from '../types';

export interface TransactionRecord {
  id: string;
  amount: number;
  method: string;
  date: string;
  status: string;
  trxId?: string;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  userBalance: number;
  userName: string;
  userPhone: string;
  depositRecords: TransactionRecord[];
  withdrawRecords: TransactionRecord[];
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenSecurity: () => void;
  onOpenCustomerService: () => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userBalance,
  userName,
  userPhone,
  depositRecords,
  withdrawRecords,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenSecurity,
  onOpenCustomerService,
  onLogout,
}) => {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [signedInToday, setSignedInToday] = useState(false);
  const [activeRecordModal, setActiveRecordModal] = useState<'none' | 'deposit' | 'withdraw'>('none');

  if (!isOpen) return null;

  const displayPhone = userPhone || userName || 'Player';

  const handleCopy = () => {
    if (displayPhone) {
      navigator.clipboard.writeText(displayPhone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleSignIn = () => {
    setSignedInToday(true);
  };

  // 16 Menu Tiles matching Screenshot_20261010-025835.jpg
  const menuTiles = [
    {
      id: 'rewards',
      label: 'My Rewards',
      icon: <Trophy className="w-5 h-5 text-[#b88636]" />,
      onClick: () => {}, // inert
    },
    {
      id: 'bet_history',
      label: 'Bet History',
      icon: <GitFork className="w-5 h-5 text-[#b88636] rotate-90" />,
      onClick: () => {}, // inert
    },
    {
      id: 'profit_loss',
      label: 'Profit And Loss',
      icon: <FileText className="w-5 h-5 text-[#b88636]" />,
      onClick: () => {}, // inert
    },
    {
      id: 'deposit_record',
      label: 'Deposit Record',
      icon: <FileUp className="w-5 h-5 text-[#b88636]" />,
      onClick: () => {
        // ACTIVE: Opens Deposit Record list
        setActiveRecordModal('deposit');
      },
    },
    {
      id: 'withdrawal_record',
      label: 'Withdrawal Record',
      icon: <FileDown className="w-5 h-5 text-[#b88636]" />,
      onClick: () => {
        // ACTIVE: Opens Withdrawal Record list
        setActiveRecordModal('withdraw');
      },
    },
    {
      id: 'transaction_history',
      label: 'Transaction History',
      icon: <History className="w-5 h-5 text-[#b88636]" />,
      onClick: () => {}, // inert
    },
    {
      id: 'my_account',
      label: 'My Account',
      icon: <User className="w-5 h-5 text-[#b88636]" />,
      onClick: () => {}, // inert
    },
    {
      id: 'security_center',
      label: 'Security Center',
      icon: <ShieldCheck className="w-5 h-5 text-[#b88636]" />,
      onClick: () => {
        // ACTIVE: Opens Security Center for changing phone number & password
        onClose();
        onOpenSecurity();
      },
    },
    {
      id: 'invite_friends',
      label: 'Invite Friends',
      icon: <UserPlus className="w-5 h-5 text-[#b88636]" />,
      onClick: () => {}, // inert
    },
    {
      id: 'mission',
      label: 'Mission',
      icon: <Gift className="w-5 h-5 text-[#b88636]" />,
      badge: 1,
      onClick: () => {}, // inert
    },
    {
      id: 'rebate',
      label: 'Rebate',
      icon: <RefreshCw className="w-5 h-5 text-[#b88636]" />,
      onClick: () => {}, // inert
    },
    {
      id: 'internal_message',
      label: 'Internal Message',
      icon: <AtSign className="w-5 h-5 text-[#b88636]" />,
      badge: 1,
      onClick: () => {}, // inert
    },
    {
      id: 'suggestion',
      label: 'Suggestion',
      icon: <MessageSquare className="w-5 h-5 text-[#b88636]" />,
      onClick: () => {}, // inert
    },
    {
      id: 'download_app',
      label: 'Download APP',
      icon: <Smartphone className="w-5 h-5 text-[#b88636]" />,
      onClick: () => {}, // inert
    },
    {
      id: 'customer_service',
      label: 'Customer Service',
      icon: <Headphones className="w-5 h-5 text-[#b88636]" />,
      onClick: () => {
        // ACTIVE: Opens 24/7 Customer Service
        onClose();
        onOpenCustomerService();
      },
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: <LogOut className="w-5 h-5 text-[#b88636]" />,
      onClick: () => {
        // ACTIVE: Logs out user account
        onClose();
        onLogout();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 backdrop-blur-xs overflow-y-auto">
      {/* Mobile Screen Width Container matching Screenshot_20261010-025835.jpg */}
      <div className="relative w-full max-w-[430px] min-h-screen bg-[#ffffff] text-slate-800 flex flex-col shadow-2xl overflow-y-auto no-scrollbar">
        
        {/* =========================================================================
            1. TOP HEADER (Dark Bar with Top Spacing, Back Arrow and "My Account" title)
            ========================================================================= */}
        <div className="bg-[#1b221f] text-white px-4 pt-4 sm:pt-5 pb-3.5 flex items-center justify-between sticky top-0 z-20 shadow-md">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 -ml-1.5 text-white hover:text-[#00f5cc] active:scale-90 transition-transform cursor-pointer flex items-center justify-center rounded-full hover:bg-white/10"
            title="Back"
            aria-label="Back"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
          
          <h2 className="text-base font-bold tracking-wide text-white text-center flex-1 pr-2">
            My Account
          </h2>

          <div className="w-7" /> {/* Placeholder spacer to keep title perfectly centered */}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 pb-16">
          
          {/* =========================================================================
              2. VIP SILVER / ICE-BLUE FROSTED CARD
              ========================================================================= */}
          <div className="relative mx-3.5 mt-3.5 rounded-2xl bg-gradient-to-br from-[#dfe8ed] via-[#d5e0e7] to-[#eaf0f5] p-4 shadow-sm border border-white/80 overflow-hidden">
            
            {/* Faded 5-Point Star Crest Watermark on Right */}
            <div className="absolute right-0 top-0 bottom-0 w-36 pointer-events-none opacity-20 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-36 h-36 fill-slate-500">
                <polygon points="50,5 64,36 98,36 70,57 81,90 50,70 19,90 30,57 2,36 36,36" />
              </svg>
            </div>

            {/* Top Right "Sign In >" Red Ribbon */}
            <button
              type="button"
              onClick={handleSignIn}
              className="absolute top-0 right-0 bg-[#e52835] hover:bg-[#d0202d] text-white text-[11px] font-bold px-3 py-1.5 rounded-bl-xl shadow-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer z-10"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{signedInToday ? 'Signed In' : 'Sign In'}</span>
              <ChevronRight className="w-3.5 h-3.5 -mr-0.5" />
            </button>

            {/* User Info Row */}
            <div className="flex items-start gap-3">
              {/* Profile Avatar in round circle */}
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md bg-slate-900 shrink-0">
                <img 
                  src="/avatar.jpg" 
                  alt="Profile" 
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80';
                  }}
                />
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0 pr-16">
                {/* VIP0 Badge */}
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-slate-600 to-slate-500 text-white text-[10px] font-bold shadow-xs">
                  <span>🎖️</span>
                  <span>VIP0</span>
                </div>

                {/* Phone Number with Copy Icon */}
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-base font-bold text-slate-900 font-mono tracking-wide truncate">
                    {displayPhone}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    title="Copy"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Nickname with Pencil Icon */}
                <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-0.5 truncate">
                  <span className="truncate">Nickname: {displayPhone}</span>
                  <Edit2 className="w-2.5 h-2.5 text-slate-500 shrink-0 cursor-pointer" />
                </div>

                {/* Joined Date */}
                <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  Joined: {localStorage.getItem('ub999_registered_date') || new Date().toISOString().split('T')[0]}
                </div>
              </div>
            </div>

            {/* Balance with Refresh Icon */}
            <div className="mt-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-slate-800 font-mono tracking-tight">
                  ৳ {userBalance.toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="p-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Refresh Balance"
                >
                  <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* 3 Pill Action Buttons */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDeposit();
                }}
                className="py-1.5 px-2 rounded-full bg-white/95 hover:bg-white text-slate-800 font-bold text-xs shadow-xs border border-slate-200/90 text-center active:scale-95 transition-all cursor-pointer"
              >
                Deposit
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenWithdraw();
                }}
                className="py-1.5 px-2 rounded-full bg-white/95 hover:bg-white text-slate-800 font-bold text-xs shadow-xs border border-slate-200/90 text-center active:scale-95 transition-all cursor-pointer"
              >
                Withdrawal
              </button>

              <button
                type="button"
                onClick={() => {}}
                className="py-1.5 px-2 rounded-full bg-white/95 hover:bg-white text-slate-800 font-bold text-xs shadow-xs border border-slate-200/90 text-center active:scale-95 transition-all cursor-pointer"
              >
                Bank Account
              </button>
            </div>
          </div>

          {/* =========================================================================
              3. "Member Center" SECTION PILL
              ========================================================================= */}
          <div className="px-4 mt-5 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#e8eff3] text-slate-600 text-xs font-semibold select-none">
              Member Center
            </span>
            <div className="flex-1 h-[1px] bg-slate-200" />
          </div>

          {/* =========================================================================
              4. 4x4 GRID OF 16 GOLDEN CIRCULAR MENU TILES
              ========================================================================= */}
          <div className="grid grid-cols-4 gap-y-4 gap-x-2 px-3 mt-4">
            {menuTiles.map((tile) => (
              <div
                key={tile.id}
                onClick={tile.onClick}
                className="flex flex-col items-center justify-start text-center cursor-pointer group"
              >
                {/* Circular Gold/Peach Button */}
                <div className="relative w-13 h-13 rounded-full bg-[#fcedd7] border border-[#f6e0bf] flex items-center justify-center shadow-xs group-hover:bg-[#f8e5c8] group-active:scale-95 transition-all">
                  {tile.icon}
                  
                  {/* Red Notification Badge */}
                  {tile.badge && (
                    <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-[#e52835] text-white text-[10px] font-black flex items-center justify-center shadow-xs border border-white">
                      {tile.badge}
                    </span>
                  )}
                </div>

                {/* Label Below Tile */}
                <span className="text-[11px] font-medium text-slate-700 leading-tight mt-1.5 line-clamp-2 px-0.5">
                  {tile.label}
                </span>
              </div>
            ))}
          </div>

        </div>

        {/* =========================================================================
            RECORD MODALS: DEPOSIT RECORD & WITHDRAWAL RECORD
            ========================================================================= */}
        {activeRecordModal !== 'none' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150">
              
              {/* Header */}
              <div className="bg-[#1b221f] text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {activeRecordModal === 'deposit' ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <ArrowDownLeft className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  )}
                  <h3 className="font-bold text-sm">
                    {activeRecordModal === 'deposit' ? 'Deposit Record (ডিপোজিট হিস্ট্রি)' : 'Withdrawal Record (উইথড্র হিস্ট্রি)'}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveRecordModal('none')}
                  className="p-1 rounded-lg text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Records List Body */}
              <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
                {activeRecordModal === 'deposit' ? (
                  depositRecords.length === 0 ? (
                    <div className="py-10 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <FileUp className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-slate-500">এখনো কোনো ডিপোজিট রেকর্ড নেই</p>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveRecordModal('none');
                          onClose();
                          onOpenDeposit();
                        }}
                        className="px-4 py-1.5 rounded-full bg-[#002f27] text-[#00f5cc] font-bold text-xs hover:bg-[#004438] cursor-pointer"
                      >
                        ডিপোজিট করুন
                      </button>
                    </div>
                  ) : (
                    depositRecords.map((rec) => (
                      <div
                        key={rec.id}
                        className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between shadow-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-800">{rec.method}</span>
                            <span className="text-[10px] font-mono text-slate-400">{rec.id}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{rec.date}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-sm text-emerald-600 block">
                            +৳{rec.amount.toLocaleString()}
                          </span>
                          <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            rec.status === 'সফল' || rec.status === 'approved' || rec.status === 'ডিপোজিট সম্পন্ন হয়েছে' || rec.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.status === 'বাতিল' || rec.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {rec.status === 'সফল' || rec.status === 'approved' || rec.status === 'ডিপোজিট সম্পন্ন হয়েছে' || rec.status === 'Completed'
                              ? 'সফল'
                              : rec.status === 'বাতিল' || rec.status === 'rejected'
                              ? 'বাতিল'
                              : 'অপেক্ষামান'}
                          </span>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  withdrawRecords.length === 0 ? (
                    <div className="py-10 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <FileDown className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-slate-500">এখনো কোনো উইথড্র রেকর্ড নেই</p>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveRecordModal('none');
                          onClose();
                          onOpenWithdraw();
                        }}
                        className="px-4 py-1.5 rounded-full bg-[#002f27] text-[#ffd000] font-bold text-xs hover:bg-[#004438] cursor-pointer"
                      >
                        উইথড্র করুন
                      </button>
                    </div>
                  ) : (
                    withdrawRecords.map((rec) => (
                      <div
                        key={rec.id}
                        className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between shadow-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-800">{rec.method}</span>
                            <span className="text-[10px] font-mono text-slate-400">{rec.id}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{rec.date}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-sm text-amber-600 block">
                            -৳{rec.amount.toLocaleString()}
                          </span>
                          <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            rec.status === 'সফল' || rec.status === 'approved' || rec.status === 'উইথড্র সম্পন্ন হয়েছে' || rec.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.status === 'বাতিল' || rec.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {rec.status === 'সফল' || rec.status === 'approved' || rec.status === 'উইথড্র সম্পন্ন হয়েছে' || rec.status === 'Completed'
                              ? 'সফল'
                              : rec.status === 'বাতিল' || rec.status === 'rejected'
                              ? 'বাতিল'
                              : 'অপেক্ষামান'}
                          </span>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
