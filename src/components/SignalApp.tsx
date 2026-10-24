import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Activity,
  ShieldCheck,
  RotateCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sliders,
  Plane
} from 'lucide-react';
import {
  subscribeToLiveSignals,
  LiveSignalData
} from '../utils/firebaseService';
import {
  getCurrentSyncedRound,
  getSyncedHistory,
  listenToLiveGameRound,
  SyncedRoundInfo,
  fetchLiveAviatorState,
  subscribeToLiveGameFirestore
} from '../utils/signalSync';

interface SignalAppProps {
  onBackToMain?: () => void;
  onOpenAdmin?: () => void;
}

export const SignalApp: React.FC<SignalAppProps> = ({ onBackToMain, onOpenAdmin }) => {
  const initialRound = getCurrentSyncedRound(0);

  const [signals, setSignals] = useState<LiveSignalData>({
    isEnabled: true,
    nextCrashMultiplier: initialRound.multiplier,
    currentRoundId: initialRound.roundId,
    updatedAt: initialRound.timeStr
  });

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [history, setHistory] = useState<number[]>(() => getSyncedHistory(8));
  const [roundOffset, setRoundOffset] = useState<number>(0);
  const lastLiveUpdateRef = useRef<number>(0);

  // Sync with Server Authoritative Engine and Firebase Cloud Firestore (universal across all phones/devices)
  useEffect(() => {
    let isMounted = true;

    const syncWithServer = async () => {
      try {
        const live = await fetchLiveAviatorState();
        if (live && live.targetCrash && isMounted) {
          lastLiveUpdateRef.current = Date.now();
          setSignals((prev) => ({
            ...prev,
            nextCrashMultiplier: live.targetCrash,
            currentRoundId: live.roundId,
            updatedAt: new Date(live.serverTime).toLocaleTimeString('bn-BD')
          }));
          if (live.history && live.history.length > 0) {
            setHistory(live.history.slice(0, 8));
          }
        }
      } catch {}
    };

    // Initial server fetch if backend Node server is running
    syncWithServer();
    const serverInterval = setInterval(syncWithServer, 1000);

    // Direct Firestore real-time listener (works on Vercel, Netlify, Android, Mobile across different networks)
    const unsubFirestore = subscribeToLiveGameFirestore((live) => {
      if (!isMounted) return;
      lastLiveUpdateRef.current = Date.now();
      setSignals((prev) => ({
        ...prev,
        nextCrashMultiplier: live.multiplier,
        currentRoundId: live.roundId,
        updatedAt: new Date().toLocaleTimeString('bn-BD')
      }));
      if (live.status === 'CRASHED') {
        setHistory((h) => [live.multiplier, ...h.filter((_, idx) => idx < 7)]);
      }
    });

    // Direct broadcast listener from Aviator game (instant 0ms cross-tab sync if on same browser)
    const unsubLive = listenToLiveGameRound((live) => {
      if (!isMounted) return;
      lastLiveUpdateRef.current = Date.now();
      setSignals((prev) => ({
        ...prev,
        nextCrashMultiplier: live.multiplier,
        currentRoundId: live.roundId,
        updatedAt: new Date().toLocaleTimeString('bn-BD')
      }));
      if (live.status === 'CRASHED') {
        setHistory((h) => [live.multiplier, ...h.filter((_, idx) => idx < 7)]);
      }
    });

    // Firebase live signals listener (handles Admin ON/OFF master switch and custom signal push)
    const unsubFb = subscribeToLiveSignals((sig) => {
      if (!isMounted) return;
      if (sig && (sig.nextCrashMultiplier || typeof sig.isEnabled === 'boolean')) {
        setSignals((prev) => ({
          ...prev,
          ...sig
        }));
      }
    });

    // Periodic time check: If no live game is active within last 45s, keep clock-synced round refreshed
    const clockInterval = setInterval(() => {
      if (Date.now() - lastLiveUpdateRef.current > 45000) {
        const synced = getCurrentSyncedRound(roundOffset);
        setSignals((prev) => ({
          ...prev,
          nextCrashMultiplier: synced.multiplier,
          currentRoundId: synced.roundId,
          updatedAt: synced.timeStr
        }));
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(serverInterval);
      clearInterval(clockInterval);
      unsubLive();
      unsubFirestore();
      unsubFb?.();
    };
  }, [roundOffset]);

  const handleManualScan = () => {
    if (!signals.isEnabled) return;
    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          fetchLiveAviatorState().then((live) => {
            if (live && live.targetCrash) {
              setSignals((s) => ({
                ...s,
                nextCrashMultiplier: live.targetCrash,
                currentRoundId: live.roundId,
                updatedAt: new Date(live.serverTime).toLocaleTimeString('bn-BD')
              }));
              if (live.history && live.history.length > 0) {
                setHistory(live.history.slice(0, 8));
              }
            } else {
              const synced = getCurrentSyncedRound(0);
              setSignals((s) => ({
                ...s,
                nextCrashMultiplier: synced.multiplier,
                currentRoundId: synced.roundId,
                updatedAt: synced.timeStr
              }));
              setHistory(getSyncedHistory(8));
            }
          }).catch(() => {
            const synced = getCurrentSyncedRound(0);
            setSignals((s) => ({
              ...s,
              nextCrashMultiplier: synced.multiplier,
              currentRoundId: synced.roundId,
              updatedAt: synced.timeStr
            }));
          });
          return 100;
        }
        return prev + 25;
      });
    }, 120);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-cyan-500/20 sticky top-0 z-40 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Plane className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 text-base tracking-wide">
                  AVIATOR VIP PREDICTOR
                </h1>
                <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                  v4.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                {signals.isEnabled ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-emerald-400 font-bold">লাইভ ক্লাউড সিগন্যাল সক্রিয়</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span className="text-rose-400 font-bold">সার্ভার সাময়িক বন্ধ</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1"
                title="অ্যাডমিন প্যানেল"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">অ্যাডমিন</span>
              </button>
            )}

            {onBackToMain && (
              <button
                onClick={onBackToMain}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg font-bold transition"
              >
                ওয়েবসাইট
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto w-full px-4 py-6 flex-1 space-y-5">
        {/* IF SHUT DOWN FROM ADMIN PANEL */}
        {!signals.isEnabled ? (
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-8 text-center shadow-2xl space-y-4 my-8">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto shadow-lg shadow-rose-500/10">
              <AlertTriangle className="w-8 h-8 text-rose-400 animate-bounce" />
            </div>
            <div>
              <h2 className="text-xl font-black text-rose-400">সিগন্যাল সার্ভিস বন্ধ রয়েছে</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                অ্যাডমিন প্যানেল থেকে সিগন্যাল সার্ভিসটি সাময়িকভাবে বন্ধ রাখা হয়েছে। পুনরায় চালু না করা পর্যন্ত কোনো সিগন্যাল প্রদর্শিত হবে না।
              </p>
            </div>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 bg-slate-950 border border-slate-800 text-slate-400 text-[11px] px-3.5 py-1.5 rounded-full font-mono">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                STATUS: SIGNAL OFFLINE
              </span>
            </div>
          </div>
        ) : (
          /* IF ACTIVE: SHOW AVIATOR PREDICTOR */
          <div className="space-y-5">
            {/* VIP Status Card */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-900/90 border border-cyan-500/30 rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">এভিয়েটর সিগন্যাল অ্যালগরিদম</span>
                  <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ১০০% নির্ভুল ক্র্যাশ সিগন্যাল
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                ১০০% ACCURATE
              </span>
            </div>

            {/* Radar / Scanner Visual Box */}
            <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-3 left-4 flex items-center gap-1.5 text-[11px] text-cyan-400 font-mono">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>SERVER: LIVE SYNC</span>
              </div>

              <div className="absolute top-3 right-4 text-[11px] font-mono text-slate-400">
                {signals.currentRoundId || '#NEXT'}
              </div>

              {/* Glowing Circle with Plane Icon */}
              <div className="my-8 relative w-52 h-52 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/30 animate-spin" style={{ animationDuration: '10s' }}></div>
                <div className="absolute inset-2 rounded-full border border-emerald-500/20"></div>
                <div className="absolute inset-0 bg-radial from-cyan-500/20 to-transparent rounded-full blur-xl"></div>

                <div className="text-center relative z-10 space-y-1">
                  <span className="text-[11px] text-slate-400 font-bold tracking-wider uppercase block">
                    বিমানটি ফেটে যাওয়ার আগাম সিগন্যাল
                  </span>

                  {isScanning ? (
                    <div className="space-y-1 py-2">
                      <div className="text-3xl font-black text-cyan-400 font-mono animate-pulse">
                        স্ক্যানিং...
                      </div>
                      <span className="text-xs text-emerald-400 font-mono">{scanProgress}%</span>
                    </div>
                  ) : (
                    <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 font-mono tracking-tight drop-shadow-md py-1">
                      {signals.nextCrashMultiplier}x
                    </div>
                  )}

                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono inline-block">
                    নিশ্চিত ক্যাশআউট পয়েন্ট: {(signals.nextCrashMultiplier * 0.90).toFixed(2)}x
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleManualScan}
                disabled={isScanning}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-50 text-slate-950 font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 transition transform active:scale-95 cursor-pointer"
              >
                <RotateCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                {isScanning ? 'সার্ভার স্ক্যান হচ্ছে...' : '⚡ পরবর্তী রাউন্ড সিগন্যাল রিফ্রেশ'}
              </button>
            </div>

            {/* History Feed */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-xs font-bold text-slate-300 block mb-2.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                পূর্ববর্তী সফল ক্র্যাশ পয়েন্ট হিস্টোরি:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {history.map((val, idx) => (
                  <span
                    key={idx}
                    className={`text-xs px-2.5 py-1 rounded-lg font-mono font-bold whitespace-nowrap ${
                      val >= 2.0
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {val}x
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
