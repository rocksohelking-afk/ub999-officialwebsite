import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';

const require = createRequire(import.meta.url);
const { ZipArchive } = require('archiver');

// Persistent JSON Storage Directory
const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJsonFile<T>(filename: string, defaultData: T): T {
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error(`Error reading ${filename}:`, e);
  }
  return defaultData;
}

function writeJsonFile(filename: string, data: any) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error(`Error writing ${filename}:`, e);
  }
}

// Initial Seeds
const DEFAULT_SETTINGS = {
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
  firebaseRtdbUrl: 'https://ub-999-project-default-rtdb.firebaseio.com',
  updatedAt: 1791961001287
};

const INITIAL_DEPOSITS = [
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

const INITIAL_WITHDRAWALS = [
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

const INITIAL_SIGNALS = {
  isEnabled: true,
  nextCrashMultiplier: 2.85,
  currentRoundId: '#948251',
  updatedAt: new Date().toLocaleTimeString('bn-BD')
};

const INITIAL_USERS = [
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

// =========================================================================
// CENTRAL AUTHORITATIVE AVIATOR ENGINE (Synchronized across all phones & apps)
// =========================================================================
let adminOverrideMultiplier: number | null = null;

function computeCrashMultiplier(seed: number): number {
  let s = (seed * 1664525 + 1013904223) >>> 0;
  s = (s ^ (s >>> 16)) >>> 0;
  s = Math.imul(s, 2246822507) >>> 0;
  s = (s ^ (s >>> 13)) >>> 0;
  const unit = (s % 1000000) / 1000000;

  let mult: number;
  if (unit < 0.12) {
    mult = 1.06 + (unit / 0.12) * 0.19;
  } else if (unit < 0.60) {
    mult = 1.26 + ((unit - 0.12) / 0.48) * 0.89;
  } else if (unit < 0.84) {
    mult = 2.16 + ((unit - 0.60) / 0.24) * 2.34;
  } else if (unit < 0.95) {
    mult = 4.51 + ((unit - 0.84) / 0.11) * 5.29;
  } else {
    mult = 10.00 + ((unit - 0.95) / 0.05) * 25.00;
  }
  return Math.round(mult * 100) / 100;
}

export interface AviatorLiveState {
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

function calculateFlightDuration(targetCrash: number): number {
  const y = Math.max(0, targetCrash - 1.0);
  const tSec = (-0.08 + Math.sqrt(0.0064 + 0.14 * y)) / 0.07;
  return Math.min(35000, Math.max(800, Math.round(tSec * 1000)));
}

const initialRoundSeed = Math.floor(Date.now() / 25000);
const initialTarget = computeCrashMultiplier(initialRoundSeed);
const initialFlightDuration = calculateFlightDuration(initialTarget);

const savedEngineState = readJsonFile<any>('aviator_engine_state.json', null);
let aviatorEngineState = (savedEngineState && savedEngineState.roundNum >= 955700) ? savedEngineState : {
  roundNum: Math.max(955780, 948000 + (initialRoundSeed % 10000)),
  seedSlot: initialRoundSeed,
  targetCrash: initialTarget,
  history: [1.85, 3.20, 1.15, 4.50, 1.42, 2.10, 8.90, 1.25, 2.75, 1.30],
  roundStartTime: Date.now(),
  flightDurationMs: initialFlightDuration,
  totalRoundDurationMs: 5000 + initialFlightDuration + 2600,
};

function updateAviatorEngine() {
  const now = Date.now();
  let elapsed = now - aviatorEngineState.roundStartTime;
  let hasStepped = false;

  // If previous round finished, step forward to current active round
  while (elapsed >= aviatorEngineState.totalRoundDurationMs) {
    // Record crashed multiplier to history
    aviatorEngineState.history.unshift(aviatorEngineState.targetCrash);
    if (aviatorEngineState.history.length > 50) {
      aviatorEngineState.history.pop();
    }

    // Step to next round
    aviatorEngineState.roundNum += 1;
    aviatorEngineState.seedSlot += 1;
    aviatorEngineState.roundStartTime += aviatorEngineState.totalRoundDurationMs;

    // Next target multiplier
    if (adminOverrideMultiplier !== null) {
      aviatorEngineState.targetCrash = adminOverrideMultiplier;
      adminOverrideMultiplier = null;
    } else {
      aviatorEngineState.targetCrash = computeCrashMultiplier(aviatorEngineState.seedSlot);
    }

    aviatorEngineState.flightDurationMs = calculateFlightDuration(aviatorEngineState.targetCrash);
    aviatorEngineState.totalRoundDurationMs = 5000 + aviatorEngineState.flightDurationMs + 2600;

    elapsed = now - aviatorEngineState.roundStartTime;
    hasStepped = true;
  }

  if (hasStepped) {
    writeJsonFile('aviator_engine_state.json', aviatorEngineState);
  }
}

function getLiveAviatorState(): AviatorLiveState {
  updateAviatorEngine();
  const now = Date.now();
  const elapsed = now - aviatorEngineState.roundStartTime;

  const WAITING_MS = 5000;
  const FLYING_MS = aviatorEngineState.flightDurationMs;
  const CRASHED_MS = 2600;

  let phase: 'WAITING' | 'FLYING' | 'CRASHED' = 'WAITING';
  let currentMultiplier = 1.00;
  let waitingCountdown = 0.0;
  let phaseStartedAt = aviatorEngineState.roundStartTime;
  let phaseDurationMs = WAITING_MS;

  if (elapsed < WAITING_MS) {
    phase = 'WAITING';
    phaseStartedAt = aviatorEngineState.roundStartTime;
    phaseDurationMs = WAITING_MS;
    const remainingMs = Math.max(0, WAITING_MS - elapsed);
    waitingCountdown = parseFloat((remainingMs / 1000).toFixed(1));
    currentMultiplier = 1.00;
  } else if (elapsed < WAITING_MS + FLYING_MS) {
    phase = 'FLYING';
    phaseStartedAt = aviatorEngineState.roundStartTime + WAITING_MS;
    phaseDurationMs = FLYING_MS;
    const flightElapsedSec = (elapsed - WAITING_MS) / 1000;
    const currentM = Math.round((1.00 + 0.08 * flightElapsedSec + 0.035 * flightElapsedSec * flightElapsedSec) * 100) / 100;
    currentMultiplier = Math.min(aviatorEngineState.targetCrash, currentM);
    waitingCountdown = 0.0;
  } else {
    phase = 'CRASHED';
    phaseStartedAt = aviatorEngineState.roundStartTime + WAITING_MS + FLYING_MS;
    phaseDurationMs = CRASHED_MS;
    currentMultiplier = aviatorEngineState.targetCrash;
    waitingCountdown = 0.0;
  }

  return {
    roundNum: aviatorEngineState.roundNum,
    roundId: '#' + aviatorEngineState.roundNum,
    phase,
    targetCrash: aviatorEngineState.targetCrash,
    currentMultiplier,
    waitingCountdown,
    safeCashout: Math.round(aviatorEngineState.targetCrash * 0.90 * 100) / 100,
    history: [...aviatorEngineState.history],
    phaseStartedAt,
    phaseDurationMs,
    flightDurationMs: FLYING_MS,
    serverTime: now
  };
}

// 24/7 Firebase Realtime Database Live Synchronization
let isSyncingFirebase = false;
let lastSyncedDataSignature = '';

async function syncLiveStateToFirebase(force: boolean = false) {
  if (isSyncingFirebase && !force) return;
  isSyncingFirebase = true;
  try {
    const live = getLiveAviatorState();
    const currentSignals = readJsonFile('signals.json', INITIAL_SIGNALS);
    const settings = readJsonFile('system_settings.json', DEFAULT_SETTINGS);
    const rtdbBase = ((settings as any).firebaseRtdbUrl || 'https://ub-999-project-default-rtdb.firebaseio.com').trim().replace(/\/+$/, '');

    if (!rtdbBase.startsWith('http')) {
      isSyncingFirebase = false;
      return;
    }

    const payload = {
      roundNum: live.roundNum,
      roundId: live.roundId,
      currentRoundId: live.roundId,
      phase: live.phase,
      targetCrash: live.targetCrash,
      nextCrashMultiplier: live.targetCrash,
      currentMultiplier: live.currentMultiplier,
      waitingCountdown: live.waitingCountdown,
      safeCashout: live.safeCashout,
      accuracy: 98.6,
      confidence: 'HIGH',
      isRigged: adminOverrideMultiplier !== null,
      isEnabled: currentSignals.isEnabled ?? true,
      history: live.history.slice(0, 15),
      phaseStartedAt: live.phaseStartedAt,
      phaseDurationMs: live.phaseDurationMs,
      flightDurationMs: live.flightDurationMs,
      serverTime: live.serverTime,
      updatedAt: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    // Push to /live.json (Primary REST endpoint for Android Aviator signal apps)
    await fetch(`${rtdbBase}/live.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // Also push to /signals.json (Secondary alias endpoint)
    await fetch(`${rtdbBase}/signals.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err: any) {
    // Non-blocking error catch
  } finally {
    isSyncingFirebase = false;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser for APIs
  app.use(express.json({ limit: '10mb' }));

  // =========================================================================
  // AUTHORITATIVE REST APIS (Cross-Device Persistence & Instant Sync)
  // =========================================================================

  // 1. Settings API (bKash & Nagad numbers, marquee, etc.)
  app.get('/api/settings', (req, res) => {
    const data = readJsonFile('system_settings.json', DEFAULT_SETTINGS);
    res.json(data);
  });

  app.post('/api/settings', (req, res) => {
    try {
      const incoming = req.body || {};
      const current = readJsonFile('system_settings.json', DEFAULT_SETTINGS);

      // Respect admin additions and removals directly while trimming strings
      const mergedBkashNumbers = Array.isArray(incoming.bkashNumbers)
        ? incoming.bkashNumbers.map((n: any) => (typeof n === 'string' ? n.trim() : ''))
        : current.bkashNumbers;

      const mergedNagadNumbers = Array.isArray(incoming.nagadNumbers)
        ? incoming.nagadNumbers.map((n: any) => (typeof n === 'string' ? n.trim() : ''))
        : current.nagadNumbers;

      const activeBkash = (incoming.bkashNumber && incoming.bkashNumber.trim()) ||
        mergedBkashNumbers.find((n: string) => Boolean(n)) ||
        '';

      const activeNagad = (incoming.nagadNumber && incoming.nagadNumber.trim()) ||
        mergedNagadNumbers.find((n: string) => Boolean(n)) ||
        '';

      const updated = {
        ...current,
        ...incoming,
        bkashNumber: activeBkash,
        nagadNumber: activeNagad,
        bkashNumbers: mergedBkashNumbers,
        nagadNumbers: mergedNagadNumbers,
        updatedAt: Math.max(incoming.updatedAt || 0, Date.now())
      };

      writeJsonFile('system_settings.json', updated);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Deposits API
  app.get('/api/deposits', (req, res) => {
    const data = readJsonFile('deposits.json', INITIAL_DEPOSITS);
    res.json(data);
  });

  app.post('/api/deposits', (req, res) => {
    try {
      const current = readJsonFile<any[]>('deposits.json', INITIAL_DEPOSITS);
      const newRec = {
        ...req.body,
        id: req.body.id || 'DEP_' + Date.now(),
        status: req.body.status || 'pending',
        createdAt: req.body.createdAt || new Date().toISOString()
      };
      // Prevent duplicates by ID or TrxID
      const existingIdx = current.findIndex(d => d.id === newRec.id || (newRec.trxId && d.trxId === newRec.trxId));
      if (existingIdx >= 0) {
        current[existingIdx] = { ...current[existingIdx], ...newRec };
      } else {
        current.unshift(newRec);
      }
      writeJsonFile('deposits.json', current);
      res.json(newRec);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/deposits/:id', (req, res) => {
    try {
      const { id } = req.params;
      const current = readJsonFile<any[]>('deposits.json', INITIAL_DEPOSITS);
      let found = false;
      const updated = current.map(d => {
        if (d.id === id) {
          found = true;
          return { ...d, ...req.body };
        }
        return d;
      });
      if (found) {
        writeJsonFile('deposits.json', updated);
      }
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Withdrawals API
  app.get('/api/withdrawals', (req, res) => {
    const data = readJsonFile('withdrawals.json', INITIAL_WITHDRAWALS);
    res.json(data);
  });

  app.post('/api/withdrawals', (req, res) => {
    try {
      const current = readJsonFile<any[]>('withdrawals.json', INITIAL_WITHDRAWALS);
      const newRec = {
        ...req.body,
        id: req.body.id || 'WTH_' + Date.now(),
        status: req.body.status || 'pending',
        createdAt: req.body.createdAt || new Date().toISOString()
      };
      const existingIdx = current.findIndex(w => w.id === newRec.id);
      if (existingIdx >= 0) {
        current[existingIdx] = { ...current[existingIdx], ...newRec };
      } else {
        current.unshift(newRec);
      }
      writeJsonFile('withdrawals.json', current);
      res.json(newRec);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/withdrawals/:id', (req, res) => {
    try {
      const { id } = req.params;
      const current = readJsonFile<any[]>('withdrawals.json', INITIAL_WITHDRAWALS);
      let found = false;
      const updated = current.map(w => {
        if (w.id === id) {
          found = true;
          return { ...w, ...req.body };
        }
        return w;
      });
      if (found) {
        writeJsonFile('withdrawals.json', updated);
      }
      res.json({ success: true, id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // 4. Signals API
  app.get('/api/signals', (req, res) => {
    const data = readJsonFile('signals.json', INITIAL_SIGNALS);
    // Overlay the active server aviator round so signals API is 100% synchronized
    const liveState = getLiveAviatorState();
    res.json({
      ...data,
      nextCrashMultiplier: liveState.targetCrash,
      currentRoundId: liveState.roundId,
      roundNum: liveState.roundNum,
      phase: liveState.phase,
      waitingCountdown: liveState.waitingCountdown,
      safeCashout: liveState.safeCashout,
      history: liveState.history.slice(0, 10),
      updatedAt: new Date().toLocaleTimeString('bn-BD')
    });
  });

  app.post('/api/signals', (req, res) => {
    try {
      const current = readJsonFile('signals.json', INITIAL_SIGNALS);
      const updated = { ...current, ...req.body, updatedAt: new Date().toLocaleTimeString('bn-BD') };
      writeJsonFile('signals.json', updated);
      syncLiveStateToFirebase(true);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4b. Dedicated Authoritative Aviator Engine API
  app.get('/api/aviator/live', (req, res) => {
    const liveState = getLiveAviatorState();
    res.json(liveState);
  });

  // Admin override to rig next round if desired
  app.post('/api/aviator/override', (req, res) => {
    try {
      const { multiplier } = req.body;
      const num = parseFloat(multiplier);
      if (!isNaN(num) && num >= 1.01 && num <= 100) {
        adminOverrideMultiplier = Math.round(num * 100) / 100;
        syncLiveStateToFirebase(true);
        res.json({ success: true, message: `Next crash target set to ${adminOverrideMultiplier}x`, override: adminOverrideMultiplier });
      } else {
        res.status(400).json({ error: 'Invalid multiplier value (must be between 1.01 and 100)' });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4c. Firebase Realtime Database Status & Manual Sync Check API
  app.get('/api/firebase-rtdb/status', async (req, res) => {
    const settings = readJsonFile('system_settings.json', DEFAULT_SETTINGS);
    const rtdbBase = ((settings as any).firebaseRtdbUrl || 'https://ub-999-project-default-rtdb.firebaseio.com').trim().replace(/\/+$/, '');
    try {
      const response = await fetch(`${rtdbBase}/live.json`, { method: 'GET' });
      const data = await response.json();
      res.json({
        connected: response.ok,
        status: response.status,
        databaseUrl: `${rtdbBase}/live.json`,
        lastData: data
      });
    } catch (err: any) {
      res.status(500).json({ connected: false, error: err.message, databaseUrl: `${rtdbBase}/live.json` });
    }
  });

  // 5. Users API
  app.get('/api/users', (req, res) => {
    const data = readJsonFile('users.json', INITIAL_USERS);
    res.json(data);
  });

  app.post('/api/users', (req, res) => {
    try {
      const current = readJsonFile<any[]>('users.json', INITIAL_USERS);
      const user = req.body;
      const idx = current.findIndex(u => u.id === user.id || u.phone === user.phone);
      if (idx >= 0) {
        current[idx] = { ...current[idx], ...user };
      } else {
        current.unshift(user);
      }
      writeJsonFile('users.json', current);
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/users/:id', (req, res) => {
    try {
      const { id } = req.params;
      const current = readJsonFile<any[]>('users.json', INITIAL_USERS);
      const updated = current.map(u => {
        if (u.id === id || u.phone === id) {
          return { ...u, ...req.body };
        }
        return u;
      });
      writeJsonFile('users.json', updated);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Dedicated download page for mobile and web
  app.get(['/download', '/download.html', '/download/'], (req, res) => {
    const pagePath = path.resolve(process.cwd(), 'download.html');
    if (fs.existsSync(pagePath)) {
      return res.sendFile(pagePath);
    }
    res.redirect('/dist.zip');
  });

  // Direct download for dist.zip
  app.get(['/dist.zip', '/api/download-dist', '/download/dist.zip', '/download-dist'], (req, res) => {
    const zipPath = path.resolve(process.cwd(), 'dist.zip');
    if (fs.existsSync(zipPath)) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="dist.zip"');
      return res.sendFile(zipPath);
    }
    res.status(404).send('dist.zip not found');
  });

  // Direct download for project-code.zip
  app.get(['/project-code.zip', '/api/download-project', '/download/project-code.zip', '/download-zip'], (req, res) => {
    const zipPath = path.resolve(process.cwd(), 'project-code.zip');
    if (fs.existsSync(zipPath)) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="project-code.zip"');
      return res.sendFile(zipPath);
    }
    res.status(404).send('project-code.zip not found');
  });

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  // Dedicated route to serve standalone Admin Panel
  app.get(['/admin', '/admin.html', '/admin/'], async (req, res, next) => {
    try {
      const adminPath = path.resolve(process.cwd(), 'admin.html');
      if (fs.existsSync(adminPath)) {
        const template = fs.readFileSync(adminPath, 'utf-8');
        const html = await vite.transformIndexHtml('/admin.html', template);
        return res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      }
      next();
    } catch (e) {
      next(e);
    }
  });

  // Dedicated route to serve standalone Signal App
  app.get(['/signal', '/signal.html', '/signal/'], async (req, res, next) => {
    try {
      const signalPath = path.resolve(process.cwd(), 'signal.html');
      if (fs.existsSync(signalPath)) {
        const template = fs.readFileSync(signalPath, 'utf-8');
        const html = await vite.transformIndexHtml('/signal.html', template);
        return res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      }
      next();
    } catch (e) {
      next(e);
    }
  });


  if (fs.existsSync(path.resolve(process.cwd(), 'dist'))) {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    app.use(vite.middlewares);
  }

  // Note: Option 1 enabled. Background server sync to Firebase RTDB is disabled.
  // The user's active website browser is the sole Master Writer to Firebase RTDB live.json.

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
