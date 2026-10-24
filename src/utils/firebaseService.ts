import { db } from './firebase';
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDoc,
  getDocs,
  disableNetwork
} from 'firebase/firestore';

export let isFirestoreQuotaExhausted = true;

// Dedicated Firebase Realtime Database for Admin Panel & Website System Connection
export const ADMIN_RTDB_BASE_URL = 'https://ub999-live-admin-default-rtdb.firebaseio.com';

// Immediately disable Firestore network to prevent overloaded retries and backoff delay errors
try {
  disableNetwork(db).catch(() => {});
} catch {}

export const setQuotaExhausted = () => {
  isFirestoreQuotaExhausted = true;
  try {
    disableNetwork(db).catch(() => {});
  } catch {}
};

// Helper to disable network if explicitly needed
const disableFirebaseNetwork = () => {
  try {
    disableNetwork(db).catch(() => {});
  } catch {}
};

// Fire and forget
const firestoreWrite = async (op: () => Promise<void>) => {
  if (isFirestoreQuotaExhausted) return;
  try {
    await op();
  } catch (err) {
    handleFirestoreError(err);
  }
};

export function handleFirestoreError(err: any, unsubFn?: () => void) {
  const errMsg = err instanceof Error ? err.message : String(err);
  if (errMsg.includes('Quota') || errMsg.includes('resource-exhausted') || errMsg.includes('quota')) {
    setQuotaExhausted();
    if (unsubFn) {
      try {
        unsubFn();
      } catch {}
    }
    return;
  }
  console.warn('Firestore notice:', err);
}


export interface UserRecord {
  id: string;
  phone: string;
  username: string;
  balance: number;
  status: 'active' | 'banned';
  createdAt: string;
  lastLogin: string;
  referredBy?: string;
}

export interface DepositRecord {
  id: string;
  userId: string;
  phone: string;
  method: 'bkash' | 'nagad' | 'rocket';
  amount: number;
  trxId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface WithdrawRecord {
  id: string;
  userId: string;
  phone: string;
  method: 'bkash' | 'nagad' | 'rocket';
  amount: number;
  accountNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface SystemSettings {
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber?: string;
  bkashNumbers?: string[];
  nagadNumbers?: string[];
  activeBkashIndex?: number;
  activeNagadIndex?: number;
  marqueeNotice?: string;
  winRate?: number;
  aviatorNextTarget?: number;
  aviatorRigMode?: 'auto' | 'high' | 'crash_early' | 'exact';
  updatedAt?: number;
}

export interface LiveSignalData {
  isEnabled: boolean;
  nextCrashMultiplier: number;
  currentRoundId: string;
  updatedAt: string;
  aviator?: {
    multiplier: number;
    accuracy?: number;
    period?: string;
    updatedAt?: string;
    isCustom?: boolean;
  };
}

const DEFAULT_SETTINGS: SystemSettings = {
  bkashNumber: '01349782631',
  nagadNumber: '01768782530',
  rocketNumber: '',
  bkashNumbers: [
    '01349782631',
    '01318097241',
    '01357287095'
  ],
  nagadNumbers: [
    '01768782530',
    '01349845888',
    '01349845906',
    '01349845902',
    '01347246605'
  ],
  activeBkashIndex: 0,
  activeNagadIndex: 0,
  marqueeNotice: '🎉 UB999 অফিশিয়াল প্ল্যাটফর্মে স্বাগতম! প্রথম ডিপোজিটে ১০০% ওয়েলকাম বোনাস!',
  winRate: 65,
  aviatorNextTarget: 2.85,
  aviatorRigMode: 'auto',
  updatedAt: 1791961001287
};

const DEFAULT_SIGNALS: LiveSignalData = {
  isEnabled: true,
  nextCrashMultiplier: 2.85,
  currentRoundId: '#948251',
  updatedAt: new Date().toLocaleTimeString('bn-BD')
};

export const INITIAL_SEED_DEPOSITS: DepositRecord[] = [
  {
    id: 'DEP_1728882001',
    userId: 'user_01711223344',
    phone: '01711223344',
    method: 'bkash',
    amount: 1000,
    trxId: 'BL9A2K998Z',
    status: 'pending',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 'DEP_1728881502',
    userId: 'user_01955667788',
    phone: '01955667788',
    method: 'nagad',
    amount: 2500,
    trxId: 'NG7X810P44',
    status: 'pending',
    createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString()
  },
  {
    id: 'DEP_1728879003',
    userId: 'user_01822334455',
    phone: '01822334455',
    method: 'bkash',
    amount: 500,
    trxId: 'BK3M10992L',
    status: 'approved',
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString()
  }
];

export const INITIAL_SEED_WITHDRAWALS: WithdrawRecord[] = [
  {
    id: 'WTH_1728882101',
    userId: 'user_01799887766',
    phone: '01799887766',
    method: 'bkash',
    amount: 2000,
    accountNumber: '01799887766',
    status: 'pending',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  },
  {
    id: 'WTH_1728880402',
    userId: 'user_01633445566',
    phone: '01633445566',
    method: 'nagad',
    amount: 1500,
    accountNumber: '01633445566',
    status: 'pending',
    createdAt: new Date(Date.now() - 65 * 60 * 1000).toISOString()
  }
];

export const INITIAL_SEED_USERS: UserRecord[] = [
  {
    id: '01711223344',
    phone: '01711223344',
    username: 'ub_0171122',
    balance: 1450,
    status: 'active',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    lastLogin: new Date().toISOString()
  },
  {
    id: '01955667788',
    phone: '01955667788',
    username: 'ub_0195566',
    balance: 3200,
    status: 'active',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    lastLogin: new Date().toISOString()
  },
  {
    id: '01799887766',
    phone: '01799887766',
    username: 'ub_0179988',
    balance: 580,
    status: 'active',
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    lastLogin: new Date().toISOString()
  }
];

// Helper to detect dummy placeholder numbers
export const isDummyNumber = (str?: string) => {
  if (!str) return true;
  const clean = str.replace(/[^0-9]/g, '');
  if (!clean || clean.length < 5) return true;
  return clean === '01700000000' || clean === '01800000000' || clean === '01900000000' || clean === '01700006560';
};

// Helper to get local settings safely
export function getLocalSettings(): SystemSettings {
  try {
    const raw = localStorage.getItem('ub999_system_settings');
    let settings = raw ? JSON.parse(raw) : { ...DEFAULT_SETTINGS };

    const bkashNumber = localStorage.getItem('ub999_admin_bkash_number') || localStorage.getItem('ub999_bkash_number');
    if (bkashNumber && !isDummyNumber(bkashNumber)) settings.bkashNumber = bkashNumber;

    const nagadNumber = localStorage.getItem('ub999_admin_nagad_number') || localStorage.getItem('ub999_nagad_number');
    if (nagadNumber && !isDummyNumber(nagadNumber)) settings.nagadNumber = nagadNumber;

    const rawBkashList = localStorage.getItem('ub999_bkash_numbers');
    if (rawBkashList) {
      try {
        const arr = JSON.parse(rawBkashList);
        if (Array.isArray(arr) && arr.some(n => n && !isDummyNumber(n))) {
          settings.bkashNumbers = arr;
        }
      } catch {}
    }

    const rawNagadList = localStorage.getItem('ub999_nagad_numbers');
    if (rawNagadList) {
      try {
        const arr = JSON.parse(rawNagadList);
        if (Array.isArray(arr) && arr.some(n => n && !isDummyNumber(n))) {
          settings.nagadNumbers = arr;
        }
      } catch {}
    }

    return { ...DEFAULT_SETTINGS, ...settings };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// =========================================================================
// SYSTEM SETTINGS (Authoritative Server Sync + Cloud Sync + Anti-Conflict)
// =========================================================================

export function subscribeToSettings(callback: (settings: SystemSettings) => void) {
  // 1. Return local settings immediately
  callback(getLocalSettings());

  // 2. Fetch authoritative settings from Firebase Realtime Database
  const fetchFromRTDB = async () => {
    try {
      const res = await fetch(`${ADMIN_RTDB_BASE_URL}/settings.json?t=${Date.now()}`);
      if (res.ok) {
        const cloudData = await res.json();
        const local = getLocalSettings();

        // If newly created and null, seed with local settings immediately
        if (cloudData === null) {
          fetch(`${ADMIN_RTDB_BASE_URL}/settings.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(local)
          }).catch(() => {});
          return;
        }

        if (cloudData && typeof cloudData === 'object') {
          const cloudHasBkash = Array.isArray(cloudData.bkashNumbers) && cloudData.bkashNumbers.some((n: string) => n && !isDummyNumber(n));
          const cloudHasNagad = Array.isArray(cloudData.nagadNumbers) && cloudData.nagadNumbers.some((n: string) => n && !isDummyNumber(n));

          const mergedBkashList = Array(10).fill('');
          for (let i = 0; i < 10; i++) {
            const sNum = cloudData.bkashNumbers?.[i];
            const lNum = local.bkashNumbers?.[i];
            mergedBkashList[i] = (sNum && !isDummyNumber(sNum)) ? sNum : (lNum && !isDummyNumber(lNum)) ? lNum : '';
          }

          const mergedNagadList = Array(10).fill('');
          for (let i = 0; i < 10; i++) {
            const sNum = cloudData.nagadNumbers?.[i];
            const lNum = local.nagadNumbers?.[i];
            mergedNagadList[i] = (sNum && !isDummyNumber(sNum)) ? sNum : (lNum && !isDummyNumber(lNum)) ? lNum : '';
          }

          const activeBkash = (cloudData.bkashNumber && !isDummyNumber(cloudData.bkashNumber))
            ? cloudData.bkashNumber
            : mergedBkashList.find(n => Boolean(n) && !isDummyNumber(n)) || local.bkashNumber || '';

          const activeNagad = (cloudData.nagadNumber && !isDummyNumber(cloudData.nagadNumber))
            ? cloudData.nagadNumber
            : mergedNagadList.find(n => Boolean(n) && !isDummyNumber(n)) || local.nagadNumber || '';

          const merged: SystemSettings = {
            ...DEFAULT_SETTINGS,
            ...local,
            ...cloudData,
            bkashNumber: activeBkash,
            nagadNumber: activeNagad,
            bkashNumbers: mergedBkashList,
            nagadNumbers: mergedNagadList,
            updatedAt: Math.max(cloudData.updatedAt || 0, local.updatedAt || 0, Date.now())
          };

          try {
            localStorage.setItem('ub999_system_settings', JSON.stringify(merged));
            if (activeBkash) {
              localStorage.setItem('ub999_admin_bkash_number', activeBkash);
              localStorage.setItem('ub999_bkash_number', activeBkash);
            }
            if (activeNagad) {
              localStorage.setItem('ub999_admin_nagad_number', activeNagad);
              localStorage.setItem('ub999_nagad_number', activeNagad);
            }
            localStorage.setItem('ub999_bkash_numbers', JSON.stringify(mergedBkashList));
            localStorage.setItem('ub999_nagad_numbers', JSON.stringify(mergedNagadList));
          } catch {}

          callback(merged);
        }
      }
    } catch {}

    // Fallback: local dev API if running with server
    try {
      const apiRes = await fetch('/api/settings');
      if (apiRes.ok) {
        const serverData = await apiRes.json();
        if (serverData && typeof serverData === 'object') {
          callback({ ...getLocalSettings(), ...serverData });
        }
      }
    } catch {}
  };

  fetchFromRTDB();
  const pollTimer = setInterval(fetchFromRTDB, 2000);

  // 3. Listen to local storage & cross-tab events
  const onLocalChange = () => {
    callback(getLocalSettings());
  };
  window.addEventListener('storage', onLocalChange);
  window.addEventListener('ub999_admin_config_updated', onLocalChange);

  return () => {
    clearInterval(pollTimer);
    window.removeEventListener('storage', onLocalChange);
    window.removeEventListener('ub999_admin_config_updated', onLocalChange);
  };
}

export async function updateSystemSettings(newSettings: Partial<SystemSettings>) {
  const now = newSettings.updatedAt || Date.now();
  const settingsWithTime: SystemSettings = {
    ...getLocalSettings(),
    ...newSettings,
    updatedAt: now
  };

  // 1. Immediately write to localStorage so current tab & same-device tabs update instantly
  try {
    localStorage.setItem('ub999_system_settings', JSON.stringify(settingsWithTime));

    if (settingsWithTime.bkashNumber) {
      localStorage.setItem('ub999_admin_bkash_number', settingsWithTime.bkashNumber);
      localStorage.setItem('ub999_bkash_number', settingsWithTime.bkashNumber);
    }
    if (settingsWithTime.nagadNumber) {
      localStorage.setItem('ub999_admin_nagad_number', settingsWithTime.nagadNumber);
      localStorage.setItem('ub999_nagad_number', settingsWithTime.nagadNumber);
    }
    if (settingsWithTime.bkashNumbers && Array.isArray(settingsWithTime.bkashNumbers)) {
      localStorage.setItem('ub999_bkash_numbers', JSON.stringify(settingsWithTime.bkashNumbers));
    }
    if (settingsWithTime.nagadNumbers && Array.isArray(settingsWithTime.nagadNumbers)) {
      localStorage.setItem('ub999_nagad_numbers', JSON.stringify(settingsWithTime.nagadNumbers));
    }
    window.dispatchEvent(new Event('ub999_admin_config_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch (localErr) {
    console.error('Local save error:', localErr);
  }

  // 2. Direct Sync to user's Firebase Realtime Database
  try {
    await fetch(`${ADMIN_RTDB_BASE_URL}/settings.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsWithTime)
    });
  } catch (cloudErr) {
    console.warn('Firebase RTDB settings sync notice:', cloudErr);
  }

  // 3. Dev server sync
  try {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsWithTime)
    });
  } catch {}
}

// =========================================================================
// LIVE SIGNALS (Server + Local + Cloud Sync)
// =========================================================================

export function subscribeToLiveSignals(callback: (signals: LiveSignalData) => void) {
  const getLocalSignals = (): LiveSignalData => {
    try {
      const saved = localStorage.getItem('ub999_live_signals');
      return saved ? JSON.parse(saved) : DEFAULT_SIGNALS;
    } catch {
      return DEFAULT_SIGNALS;
    }
  };

  callback(getLocalSignals());

  const fetchSignals = async () => {
    try {
      const res = await fetch('/api/signals');
      if (res.ok) {
        const sig = await res.json();
        if (sig && typeof sig.isEnabled === 'boolean') {
          localStorage.setItem('ub999_live_signals', JSON.stringify(sig));
          callback(sig);
        }
      }
    } catch {}
  };

  fetchSignals();
  const pollTimer = setInterval(fetchSignals, 3000);

  const onLocal = () => callback(getLocalSignals());
  window.addEventListener('storage', onLocal);
  window.addEventListener('ub999_signals_updated', onLocal);

  let unsub = () => {};
  if (!isFirestoreQuotaExhausted) {
    try {
      const signalsDoc = doc(db, 'signals', 'live');
      unsub = onSnapshot(signalsDoc, (snapshot) => {
        if (snapshot.exists()) {
          const merged = { ...DEFAULT_SIGNALS, ...snapshot.data() } as LiveSignalData;
          try {
            localStorage.setItem('ub999_live_signals', JSON.stringify(merged));
          } catch {}
          callback(merged);
        }
      }, (error) => {
        handleFirestoreError(error, unsub);
        callback(getLocalSignals());
      });
    } catch (err) {
      handleFirestoreError(err);
      callback(getLocalSignals());
    }
  }

  return () => {
    clearInterval(pollTimer);
    window.removeEventListener('storage', onLocal);
    window.removeEventListener('ub999_signals_updated', onLocal);
    unsub();
  };
}

export async function updateLiveSignals(newSignals: Partial<LiveSignalData>) {
  try {
    const saved = localStorage.getItem('ub999_live_signals');
    const cur = saved ? JSON.parse(saved) : DEFAULT_SIGNALS;
    const updated = { ...cur, ...newSignals };
    localStorage.setItem('ub999_live_signals', JSON.stringify(updated));
    window.dispatchEvent(new Event('ub999_signals_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch {}

  try {
    await fetch('/api/signals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSignals)
    });
  } catch {}

  // Sync to Firestore using official SDK (only if quota is available)
  if (!isFirestoreQuotaExhausted) {
    try {
      const signalsDoc = doc(db, 'signals', 'live');
      const multiplier = typeof newSignals.nextCrashMultiplier === 'number' && newSignals.nextCrashMultiplier > 0
        ? newSignals.nextCrashMultiplier
        : (newSignals.aviator?.multiplier || 2.50);
      const roundId = newSignals.currentRoundId || newSignals.aviator?.period || `#${Math.floor(100000 + Math.random() * 900000)}`;

      await setDoc(signalsDoc, {
        ...newSignals,
        nextCrashMultiplier: multiplier,
        currentRoundId: roundId,
        updatedAt: newSignals.updatedAt || new Date().toLocaleTimeString('bn-BD'),
        timestamp: Date.now(),
        aviator: {
          multiplier,
          period: roundId,
          accuracy: 99,
          isCustom: Boolean(newSignals.aviator?.isCustom)
        }
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err);
    }
  }
}

// =========================================================================
// DEPOSITS (Authoritative Server Sync + Local + Cloud Sync)
// =========================================================================

function getLocalDeposits(): DepositRecord[] {
  try {
    const rawAll = localStorage.getItem('ub999_all_deposits');
    if (rawAll) {
      const parsed = JSON.parse(rawAll);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    const rawApp = localStorage.getItem('ub999_deposit_records');
    if (rawApp) {
      const parsed = JSON.parse(rawApp);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any) => ({
          id: item.id || 'DEP_' + Date.now(),
          userId: item.userId || item.phone || '01712345678',
          phone: item.phone || '01712345678',
          method: (item.method && item.method.toLowerCase().includes('nagad')) ? 'nagad' : 'bkash',
          amount: Number(item.amount) || 500,
          trxId: item.trxId || 'TRX_' + Date.now(),
          status: item.status === 'সফল' || item.status === 'approved' ? 'approved' : item.status === 'বাতিল' ? 'rejected' : 'pending',
          createdAt: item.createdAt || new Date().toISOString()
        }));
      }
    }
    return INITIAL_SEED_DEPOSITS;
  } catch {
    return INITIAL_SEED_DEPOSITS;
  }
}

export function subscribeToDeposits(callback: (deposits: DepositRecord[]) => void) {
  // 1. Immediately return local deposits
  callback(getLocalDeposits());

  // 2. Fetch from Firebase Realtime Database
  const fetchFromRTDB = async () => {
    try {
      const res = await fetch(`${ADMIN_RTDB_BASE_URL}/deposits.json?t=${Date.now()}`);
      if (res.ok) {
        const cloudData = await res.json();
        if (cloudData && typeof cloudData === 'object') {
          const cloudDeps: DepositRecord[] = Object.values(cloudData);
          if (cloudDeps.length > 0) {
            const local = getLocalDeposits();
            const map = new Map<string, DepositRecord>();
            local.forEach(d => map.set(d.id, d));
            cloudDeps.forEach(d => map.set(d.id, d));
            const combined = Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            localStorage.setItem('ub999_all_deposits', JSON.stringify(combined));
            callback(combined);
          }
        }
      }
    } catch {}

    // Fallback: local dev API
    try {
      const apiRes = await fetch('/api/deposits');
      if (apiRes.ok) {
        const serverDeps = await apiRes.json();
        if (Array.isArray(serverDeps) && serverDeps.length > 0) {
          const local = getLocalDeposits();
          const map = new Map<string, DepositRecord>();
          local.forEach(d => map.set(d.id, d));
          serverDeps.forEach((d: DepositRecord) => map.set(d.id, d));
          const combined = Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          localStorage.setItem('ub999_all_deposits', JSON.stringify(combined));
          callback(combined);
        }
      }
    } catch {}
  };

  fetchFromRTDB();
  const pollTimer = setInterval(fetchFromRTDB, 2000);

  // 3. Local events
  const onLocal = () => callback(getLocalDeposits());
  window.addEventListener('storage', onLocal);
  window.addEventListener('ub999_deposit_records_updated', onLocal);

  return () => {
    clearInterval(pollTimer);
    window.removeEventListener('storage', onLocal);
    window.removeEventListener('ub999_deposit_records_updated', onLocal);
  };
}

export async function submitDepositRequest(req: Omit<DepositRecord, 'id' | 'status' | 'createdAt'>) {
  const id = 'DEP_' + Date.now();
  const data: DepositRecord = {
    ...req,
    id,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // 1. Save local
  try {
    const current = getLocalDeposits();
    const updated = [data, ...current];
    localStorage.setItem('ub999_all_deposits', JSON.stringify(updated));
    window.dispatchEvent(new Event('ub999_deposit_records_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch {}

  // 2. Direct Sync to user's Firebase Realtime Database
  try {
    await fetch(`${ADMIN_RTDB_BASE_URL}/deposits/${id}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (cloudErr) {
    console.warn('Firebase RTDB deposit submit notice:', cloudErr);
  }

  // 3. Dev server sync
  try {
    await fetch('/api/deposits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch {}

  return data;
}

export async function updateDepositStatus(depositId: string, status: 'approved' | 'rejected') {
  let updatedRecord: DepositRecord | null = null;
  // 1. Update local
  try {
    const current = getLocalDeposits();
    const updated = current.map(d => {
      if (d.id === depositId) {
        updatedRecord = { ...d, status };
        return updatedRecord;
      }
      return d;
    });
    localStorage.setItem('ub999_all_deposits', JSON.stringify(updated));
    window.dispatchEvent(new Event('ub999_deposit_records_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch {}

  // 2. Direct Sync to user's Firebase Realtime Database
  try {
    await fetch(`${ADMIN_RTDB_BASE_URL}/deposits/${depositId}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  } catch (cloudErr) {
    console.warn('Firebase RTDB deposit update notice:', cloudErr);
  }

  // 3. Dev server sync
  try {
    await fetch(`/api/deposits/${depositId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  } catch {}
}

// =========================================================================
// WITHDRAWALS (Authoritative Server Sync + Local + Cloud Sync)
// =========================================================================

function getLocalWithdrawals(): WithdrawRecord[] {
  try {
    const rawAll = localStorage.getItem('ub999_all_withdrawals');
    if (rawAll) {
      const parsed = JSON.parse(rawAll);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    const rawApp = localStorage.getItem('ub999_withdraw_records');
    if (rawApp) {
      const parsed = JSON.parse(rawApp);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any) => ({
          id: item.id || 'WTH_' + Date.now(),
          userId: item.userId || item.phone || '01712345678',
          phone: item.phone || item.accountNumber || '01712345678',
          method: (item.method && item.method.toLowerCase().includes('nagad')) ? 'nagad' : 'bkash',
          amount: Number(item.amount) || 500,
          accountNumber: item.accountNumber || item.phone || '01712345678',
          status: item.status === 'সফল' || item.status === 'approved' ? 'approved' : item.status === 'বাতিল' ? 'rejected' : 'pending',
          createdAt: item.createdAt || new Date().toISOString()
        }));
      }
    }
    return INITIAL_SEED_WITHDRAWALS;
  } catch {
    return INITIAL_SEED_WITHDRAWALS;
  }
}

export function subscribeToWithdrawals(callback: (withdrawals: WithdrawRecord[]) => void) {
  callback(getLocalWithdrawals());

  const fetchFromRTDB = async () => {
    try {
      const res = await fetch(`${ADMIN_RTDB_BASE_URL}/withdrawals.json?t=${Date.now()}`);
      if (res.ok) {
        const cloudData = await res.json();
        if (cloudData && typeof cloudData === 'object') {
          const cloudWths: WithdrawRecord[] = Object.values(cloudData);
          if (cloudWths.length > 0) {
            const local = getLocalWithdrawals();
            const map = new Map<string, WithdrawRecord>();
            local.forEach(w => map.set(w.id, w));
            cloudWths.forEach(w => map.set(w.id, w));
            const combined = Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            localStorage.setItem('ub999_all_withdrawals', JSON.stringify(combined));
            callback(combined);
          }
        }
      }
    } catch {}

    // Fallback: local dev API
    try {
      const apiRes = await fetch('/api/withdrawals');
      if (apiRes.ok) {
        const serverWths = await apiRes.json();
        if (Array.isArray(serverWths) && serverWths.length > 0) {
          const local = getLocalWithdrawals();
          const map = new Map<string, WithdrawRecord>();
          local.forEach(w => map.set(w.id, w));
          serverWths.forEach((w: WithdrawRecord) => map.set(w.id, w));
          const combined = Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          localStorage.setItem('ub999_all_withdrawals', JSON.stringify(combined));
          callback(combined);
        }
      }
    } catch {}
  };

  fetchFromRTDB();
  const pollTimer = setInterval(fetchFromRTDB, 2000);

  const onLocal = () => callback(getLocalWithdrawals());
  window.addEventListener('storage', onLocal);
  window.addEventListener('ub999_withdraw_records_updated', onLocal);

  return () => {
    clearInterval(pollTimer);
    window.removeEventListener('storage', onLocal);
    window.removeEventListener('ub999_withdraw_records_updated', onLocal);
  };
}

export async function submitWithdrawRequest(req: Omit<WithdrawRecord, 'id' | 'status' | 'createdAt'>) {
  const id = 'WTH_' + Date.now();
  const data: WithdrawRecord = {
    ...req,
    id,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  try {
    const current = getLocalWithdrawals();
    const updated = [data, ...current];
    localStorage.setItem('ub999_all_withdrawals', JSON.stringify(updated));
    window.dispatchEvent(new Event('ub999_withdraw_records_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch {}

  // Direct Sync to user's Firebase Realtime Database
  try {
    await fetch(`${ADMIN_RTDB_BASE_URL}/withdrawals/${id}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (cloudErr) {
    console.warn('Firebase RTDB withdraw submit notice:', cloudErr);
  }

  // Dev server sync
  try {
    await fetch('/api/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch {}

  return data;
}

export async function updateWithdrawStatus(withdrawId: string, status: 'approved' | 'rejected') {
  let updatedRecord: WithdrawRecord | null = null;
  try {
    const current = getLocalWithdrawals();
    const updated = current.map(w => {
      if (w.id === withdrawId) {
        updatedRecord = { ...w, status };
        return updatedRecord;
      }
      return w;
    });
    localStorage.setItem('ub999_all_withdrawals', JSON.stringify(updated));
    window.dispatchEvent(new Event('ub999_withdraw_records_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch {}

  // Direct Sync to user's Firebase Realtime Database
  try {
    await fetch(`${ADMIN_RTDB_BASE_URL}/withdrawals/${withdrawId}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  } catch (cloudErr) {
    console.warn('Firebase RTDB withdraw update notice:', cloudErr);
  }

  // Dev server sync
  try {
    await fetch(`/api/withdrawals/${withdrawId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  } catch {}
}

// =========================================================================
// USERS (Server + Local + Cloud Sync)
// =========================================================================

function getLocalUsers(): UserRecord[] {
  try {
    const rawAll = localStorage.getItem('ub999_registered_users');
    if (rawAll) {
      const parsed = JSON.parse(rawAll);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    return INITIAL_SEED_USERS;
  } catch {
    return INITIAL_SEED_USERS;
  }
}

export function subscribeToUsers(callback: (users: UserRecord[]) => void) {
  callback(getLocalUsers());

  const fetchFromRTDB = async () => {
    try {
      const res = await fetch(`${ADMIN_RTDB_BASE_URL}/users.json?t=${Date.now()}`);
      if (res.ok) {
        const cloudData = await res.json();
        if (cloudData && typeof cloudData === 'object') {
          const cloudUsers: UserRecord[] = Object.values(cloudData);
          if (cloudUsers.length > 0) {
            const local = getLocalUsers();
            const map = new Map<string, UserRecord>();
            local.forEach(u => map.set(u.id, u));
            cloudUsers.forEach(u => map.set(u.id, u));
            const combined = Array.from(map.values());
            localStorage.setItem('ub999_registered_users', JSON.stringify(combined));
            callback(combined);
          }
        }
      }
    } catch {}

    // Fallback: local dev API
    try {
      const apiRes = await fetch('/api/users');
      if (apiRes.ok) {
        const serverUsers = await apiRes.json();
        if (Array.isArray(serverUsers) && serverUsers.length > 0) {
          const local = getLocalUsers();
          const map = new Map<string, UserRecord>();
          local.forEach(u => map.set(u.id, u));
          serverUsers.forEach((u: UserRecord) => map.set(u.id, u));
          const combined = Array.from(map.values());
          localStorage.setItem('ub999_registered_users', JSON.stringify(combined));
          callback(combined);
        }
      }
    } catch {}
  };

  fetchFromRTDB();
  const pollTimer = setInterval(fetchFromRTDB, 2000);

  const onLocal = () => callback(getLocalUsers());
  window.addEventListener('storage', onLocal);
  window.addEventListener('ub999_users_updated', onLocal);

  return () => {
    clearInterval(pollTimer);
    window.removeEventListener('storage', onLocal);
    window.removeEventListener('ub999_users_updated', onLocal);
  };
}

export async function saveOrUpdateUser(user: UserRecord) {
  try {
    const local = getLocalUsers();
    const idx = local.findIndex(u => u.id === user.id || u.phone === user.phone);
    if (idx >= 0) {
      local[idx] = { ...local[idx], ...user };
    } else {
      local.unshift(user);
    }
    localStorage.setItem('ub999_registered_users', JSON.stringify(local));
    window.dispatchEvent(new Event('ub999_users_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch {}

  const cleanId = String(user.phone || user.id).replace(/[^0-9a-zA-Z_]/g, '');
  try {
    await fetch(`${ADMIN_RTDB_BASE_URL}/users/${cleanId}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
  } catch (cloudErr) {
    console.warn('Firebase RTDB user save notice:', cloudErr);
  }

  // Dev server sync
  try {
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
  } catch {}
}

export async function updateUserBalance(userId: string, newBalance: number) {
  try {
    const local = getLocalUsers();
    const updated = local.map(u => (u.id === userId || u.phone === userId) ? { ...u, balance: newBalance } : u);
    localStorage.setItem('ub999_registered_users', JSON.stringify(updated));
    window.dispatchEvent(new Event('ub999_users_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch {}

  const cleanId = String(userId).replace(/[^0-9a-zA-Z_]/g, '');
  try {
    await fetch(`${ADMIN_RTDB_BASE_URL}/users/${cleanId}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ balance: newBalance })
    });
  } catch (cloudErr) {
    console.warn('Firebase RTDB user balance update notice:', cloudErr);
  }

  // Dev server sync
  try {
    await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ balance: newBalance })
    });
  } catch {}
}

export async function updateUserStatus(userId: string, status: 'active' | 'blocked') {
  try {
    const local = getLocalUsers();
    const updated = local.map(u => (u.id === userId || u.phone === userId) ? { ...u, status } : u);
    localStorage.setItem('ub999_registered_users', JSON.stringify(updated));
    window.dispatchEvent(new Event('ub999_users_updated'));
    window.dispatchEvent(new Event('storage'));
  } catch {}

  const cleanId = String(userId).replace(/[^0-9a-zA-Z_]/g, '');
  try {
    await fetch(`${ADMIN_RTDB_BASE_URL}/users/${cleanId}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  } catch (cloudErr) {
    console.warn('Firebase RTDB user status update notice:', cloudErr);
  }

  // Dev server sync
  try {
    await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  } catch {}
}
