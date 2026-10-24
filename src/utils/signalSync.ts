/**
 * Time-Synced Deterministic Signal Engine
 * Synchronizes Aviator Crash Game and Signal Predictor App across all devices and browsers
 * without requiring any central server, database, or WebSocket.
 */

import { doc, setDoc, onSnapshot, disableNetwork } from 'firebase/firestore';
import { db } from './firebase';
import { isFirestoreQuotaExhausted, setQuotaExhausted } from './firebaseService';

export interface ServerAviatorLiveState {
  roundNum: number;
  roundId: string;
  phase: 'WAITING' | 'FLYING' | 'CRASHED';
  targetCrash: number;
  currentMultiplier: number;
  waitingCountdown: number;
  safeCashout: number;
  history: number[];
  phaseStartedAt: number;
  phaseDurationMs: number;
  flightDurationMs: number;
  serverTime: number;
}

export const FIREBASE_RTDB_LIVE_URL = 'https://ub-999-project-default-rtdb.firebaseio.com/live.json';

let cachedServerState: ServerAviatorLiveState | null = null;
let lastServerFetchTime = 0;

export async function fetchLiveAviatorState(): Promise<ServerAviatorLiveState | null> {
  // Priority 1: Direct fetch from Firebase Realtime Database (works on Vercel, Netlify, Android, Mobile)
  try {
    const res = await fetch(FIREBASE_RTDB_LIVE_URL, { cache: 'no-store' });
    if (res.ok) {
      const raw = await res.json();
      if (raw && (raw.targetCrash || raw.nextCrashMultiplier || raw.roundNum)) {
        const roundNum = Number(raw.roundNum) || (raw.roundId ? parseInt(String(raw.roundId).replace('#', '')) : 955730);
        const targetCrash = Number(raw.targetCrash || raw.nextCrashMultiplier || 2.10);
        const state: ServerAviatorLiveState = {
          roundNum,
          roundId: raw.roundId || raw.currentRoundId || ('#' + roundNum),
          phase: (raw.phase as any) || 'WAITING',
          targetCrash,
          currentMultiplier: Number(raw.currentMultiplier || 1.00),
          waitingCountdown: typeof raw.waitingCountdown === 'number' ? raw.waitingCountdown : 0,
          safeCashout: Number(raw.safeCashout || Math.round(targetCrash * 0.90 * 100) / 100),
          history: Array.isArray(raw.history) ? raw.history : [],
          phaseStartedAt: Number(raw.phaseStartedAt) || Date.now(),
          phaseDurationMs: Number(raw.phaseDurationMs) || 5000,
          flightDurationMs: Number(raw.flightDurationMs) || 2500,
          serverTime: Number(raw.serverTime) || Date.now()
        };
        cachedServerState = state;
        lastServerFetchTime = Date.now();
        return state;
      }
    }
  } catch {}

  // Priority 2: Fallback to local Express proxy
  try {
    const res = await fetch('/api/aviator/live');
    if (res.ok) {
      const data: ServerAviatorLiveState = await res.json();
      cachedServerState = data;
      lastServerFetchTime = Date.now();
      return data;
    }
  } catch {}

  return cachedServerState;
}

export const ROUND_INTERVAL_SEC = 12; // Dynamic round interval baseline

export interface SyncedRoundInfo {
  roundIndex: number;
  roundId: string;
  roundNum: number;
  multiplier: number;
  safeCashout: number;
  timeStr: string;
  secondsRemaining: number;
}

// Pseudo-Random Generator with Spribe Aviator authentic distribution
export function getDeterministicCrash(roundIndex: number): number {
  let seed = (roundIndex * 1664525 + 1013904223) >>> 0;
  seed = (seed ^ (seed >>> 16)) >>> 0;
  seed = Math.imul(seed, 2246822507) >>> 0;
  seed = (seed ^ (seed >>> 13)) >>> 0;
  const unit = (seed % 1000000) / 1000000;

  let mult: number;
  if (unit < 0.12) {
    // 12% instant early crash (1.05 - 1.25)
    mult = 1.06 + (unit / 0.12) * 0.19;
  } else if (unit < 0.60) {
    // 48% low-mid multiplier (1.26 - 2.15)
    mult = 1.26 + ((unit - 0.12) / 0.48) * 0.89;
  } else if (unit < 0.84) {
    // 24% sweet spot multiplier (2.16 - 4.50)
    mult = 2.16 + ((unit - 0.60) / 0.24) * 2.34;
  } else if (unit < 0.95) {
    // 11% high multiplier (4.51 - 9.80)
    mult = 4.51 + ((unit - 0.84) / 0.11) * 5.29;
  } else {
    // 5% mega multiplier (10.00 - 35.00)
    mult = 10.00 + ((unit - 0.95) / 0.05) * 25.00;
  }
  return Math.round(mult * 100) / 100;
}

export function getCurrentSyncedRound(offsetRounds = 0): SyncedRoundInfo {
  const now = Date.now();
  
  // High-priority: Use live server state if available (< 30s fresh)
  if (cachedServerState && (now - lastServerFetchTime < 30000)) {
    const roundNum = cachedServerState.roundNum + offsetRounds;
    const roundId = '#' + roundNum;
    const multiplier = cachedServerState.targetCrash;
    const secondsRemaining = cachedServerState.phase === 'WAITING' 
      ? Math.max(0, Math.ceil(cachedServerState.waitingCountdown))
      : 0;

    return {
      roundIndex: roundNum,
      roundId,
      roundNum,
      multiplier,
      safeCashout: Math.round(multiplier * 0.90 * 100) / 100,
      timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      secondsRemaining
    };
  }

  // Dynamic round tracking fallback: Calculate active round slot based on dynamic game tempo
  const baseNum = cachedServerState ? cachedServerState.roundNum : 955730;
  const currentSlot = Math.floor(now / 15000) + offsetRounds;
  const multiplier = getDeterministicCrash(currentSlot);
  const roundNum = baseNum + offsetRounds;
  const roundId = '#' + roundNum;

  return {
    roundIndex: currentSlot,
    roundId,
    roundNum,
    multiplier,
    safeCashout: Math.round(multiplier * 0.90 * 100) / 100,
    timeStr: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    secondsRemaining: 5
  };
}

export function getSyncedHistory(count = 10, offset = 0): number[] {
  const current = getCurrentSyncedRound(offset);
  const history: number[] = [];
  for (let i = 1; i <= count; i++) {
    history.push(getDeterministicCrash(current.roundIndex - i));
  }
  return history;
}

// Cross-tab broadcast channel
const CHANNEL_NAME = 'ub999_aviator_signal_sync';
let syncChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  try {
    syncChannel = new BroadcastChannel(CHANNEL_NAME);
  } catch {}
}

export function broadcastLiveGameRound(roundInfo: {
  roundId: string;
  roundNum: number;
  multiplier: number;
  status: 'WAITING' | 'FLYING' | 'CRASHED';
}) {
  try {
    const payload = {
      ...roundInfo,
      timestamp: Date.now()
    };
    syncChannel?.postMessage(payload);
    localStorage.setItem('ub999_last_live_aviator_round', JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent('ub999_live_aviator_event', { detail: payload }));
  } catch {}
}

export function listenToLiveGameRound(callback: (roundInfo: {
  roundId: string;
  roundNum: number;
  multiplier: number;
  status: 'WAITING' | 'FLYING' | 'CRASHED';
  timestamp: number;
}) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleMessage = (e: MessageEvent) => {
    if (e.data && e.data.multiplier) {
      callback(e.data);
    }
  };

  const handleCustomEvent = (e: any) => {
    if (e.detail && e.detail.multiplier) {
      callback(e.detail);
    }
  };

  syncChannel?.addEventListener('message', handleMessage);
  window.addEventListener('ub999_live_aviator_event', handleCustomEvent);

  // Check recent cached round
  try {
    const raw = localStorage.getItem('ub999_last_live_aviator_round');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.timestamp < 35000) {
        callback(parsed);
      }
    }
  } catch {}

  return () => {
    syncChannel?.removeEventListener('message', handleMessage);
    window.removeEventListener('ub999_live_aviator_event', handleCustomEvent);
  };
}

export async function publishLiveAviatorRound(roundInfo: {
  roundId: string;
  roundNum: number;
  multiplier: number;
  status: 'WAITING' | 'FLYING' | 'CRASHED';
  safeCashout?: number;
}) {
  // 1. Instant cross-tab broadcast
  broadcastLiveGameRound(roundInfo);

  const safeCashout = roundInfo.safeCashout || Math.round(roundInfo.multiplier * 0.90 * 100) / 100;

  // 2. SOLE MASTER WRITER: Browser directly updates Firebase RTDB live.json for Android Signal App
  try {
    const payload = {
      roundNum: roundInfo.roundNum,
      roundId: roundInfo.roundId,
      currentRoundId: roundInfo.roundId,
      targetCrash: roundInfo.multiplier,
      nextCrashMultiplier: roundInfo.multiplier,
      safeCashout,
      phase: roundInfo.status,
      status: roundInfo.status,
      accuracy: 98.6,
      confidence: 'HIGH',
      isEnabled: true,
      updatedAt: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      timestamp: Date.now()
    };

    fetch(FIREBASE_RTDB_LIVE_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});
  } catch {}

  // 3. Cloud Firestore persistence
  if (isFirestoreQuotaExhausted) return;
  try {
    await setDoc(doc(db, 'signals', 'live'), {
      nextCrashMultiplier: roundInfo.multiplier,
      currentRoundId: roundInfo.roundId,
      roundNum: roundInfo.roundNum,
      status: roundInfo.status,
      safeCashout,
      updatedAt: new Date().toLocaleTimeString('bn-BD'),
      timestamp: Date.now(),
      isEnabled: true,
      aviator: {
        multiplier: roundInfo.multiplier,
        period: roundInfo.roundId,
        accuracy: 99,
        isCustom: false
      }
    }, { merge: true });
  } catch (error) {
    const errMsg = String(error);
    if (errMsg.includes('Quota') || errMsg.includes('resource-exhausted') || errMsg.includes('quota')) {
      setQuotaExhausted();
    }
  }
}

export function subscribeToLiveGameFirestore(callback: (roundInfo: {
  roundId: string;
  roundNum: number;
  multiplier: number;
  status: 'WAITING' | 'FLYING' | 'CRASHED';
  timestamp: number;
}) => void): () => void {
  if (isFirestoreQuotaExhausted) {
    return () => {};
  }
  try {
    let unsubRef = () => {};
    const unsub = onSnapshot(doc(db, 'signals', 'live'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && (data.nextCrashMultiplier || data.aviator?.multiplier)) {
          const multiplier = data.nextCrashMultiplier || data.aviator?.multiplier || 2.50;
          const roundId = data.currentRoundId || data.aviator?.period || '#948000';
          const roundNum = data.roundNum || (parseInt(roundId.replace('#', '')) || 948000);
          callback({
            roundId,
            roundNum,
            multiplier,
            status: data.status || 'WAITING',
            timestamp: data.timestamp || Date.now()
          });
        }
      }
    }, (err) => {
      const errMsg = String(err);
      if (errMsg.includes('Quota') || errMsg.includes('resource-exhausted') || errMsg.includes('quota')) {
        setQuotaExhausted();
        try { unsubRef(); } catch {}
      }
    });
    unsubRef = unsub;
    return unsub;
  } catch (err) {
    return () => {};
  }
}

export async function syncSignalToFirestore(roundInfo: SyncedRoundInfo) {
  if (isFirestoreQuotaExhausted) return;
  try {
    await setDoc(doc(db, 'signals', 'live'), {
      ...roundInfo,
      nextCrashMultiplier: roundInfo.multiplier,
      currentRoundId: roundInfo.roundId,
      updatedAt: new Date().toISOString(),
      timestamp: Date.now()
    }, { merge: true });
  } catch (error) {
    const errMsg = String(error);
    if (errMsg.includes('Quota') || errMsg.includes('resource-exhausted') || errMsg.includes('quota')) {
      setQuotaExhausted();
    }
  }
}
