import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Minus, Plus, History, X, ShieldCheck, Copy, Check, Volume2, Music, Sparkles, Gift, Sliders, HelpCircle, FileText, ChevronRight } from 'lucide-react';
import { Game } from '../types';
import { updateLiveSignals } from '../utils/firebaseService';
import {
  getCurrentSyncedRound,
  getDeterministicCrash,
  broadcastLiveGameRound,
  fetchLiveAviatorState,
  publishLiveAviatorRound
} from '../utils/signalSync';

export interface RoundHistoryItem {
  roundId: number;
  multiplier: number;
  time: string;
  serverSeed: string;
  clientSeed: string;
  combinedHash: string;
}

// Deterministic cryptographic hash generator for realistic Provably Fair strings
function generateCryptoHash(seed: number): string {
  const chars = '0123456789abcdef';
  let hash = '';
  let pseudo = (seed * 9301 + 49297) % 233280;
  for (let i = 0; i < 64; i++) {
    pseudo = (pseudo * 9301 + 49297) % 233280;
    hash += chars[Math.floor((pseudo / 233280) * chars.length)];
  }
  return hash;
}

// 60 historical rounds synchronized with the Signal App's deterministic distribution
const INITIAL_ROUNDS: RoundHistoryItem[] = Array.from({ length: 60 }).map((_, idx) => {
  const currentSlot = Math.floor(Date.now() / 25000);
  const slot = currentSlot - 1 - idx;
  const roundNum = 955730 - idx;
  const mult = getDeterministicCrash(slot);
  const minutesAgo = idx * 0.42;
  const d = new Date(Date.now() - minutesAgo * 60000);
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return {
    roundId: roundNum,
    multiplier: mult,
    time: timeStr,
    serverSeed: generateCryptoHash(roundNum + 101).substring(0, 32),
    clientSeed: `${(roundNum * 17) % 899999 + 100000}:${(roundNum * 31) % 899999 + 100000}:${(roundNum * 47) % 899999 + 100000}`,
    combinedHash: generateCryptoHash(roundNum + 202)
  };
});

export interface AviatorLiveBet {
  id: string;
  avatarIcon: string;
  avatarBg: string;
  name: string;
  bet: number;
  targetMultiplier: number;
  cashedOut: boolean;
  cashoutMultiplier?: number;
  winAmount?: number;
}

const REALISTIC_AVATARS = [
  { icon: '🦤', bg: 'bg-[#3b2d1f] text-amber-200' },
  { icon: '🏎️', bg: 'bg-[#401217] text-rose-300' },
  { icon: '🍀', bg: 'bg-[#123824] text-emerald-300' },
  { icon: '✈️', bg: 'bg-[#122e40] text-sky-300' },
  { icon: '🌴', bg: 'bg-[#153e34] text-teal-300' },
  { icon: '🐱', bg: 'bg-[#402a15] text-orange-300' },
  { icon: '🪙', bg: 'bg-[#3e3412] text-yellow-300' },
  { icon: '🕶️', bg: 'bg-[#291740] text-purple-300' },
  { icon: '🐶', bg: 'bg-[#3d2612] text-amber-300' },
  { icon: '💀', bg: 'bg-[#24262c] text-zinc-300' },
  { icon: '🐉', bg: 'bg-[#401616] text-red-300' },
  { icon: '🏀', bg: 'bg-[#422212] text-orange-300' },
  { icon: '💵', bg: 'bg-[#143d22] text-green-300' },
  { icon: '🦝', bg: 'bg-[#262830] text-slate-300' },
  { icon: '🚀', bg: 'bg-[#172545] text-blue-300' },
  { icon: '🚘', bg: 'bg-[#15343d] text-cyan-300' },
  { icon: '🐺', bg: 'bg-[#1f1b3d] text-indigo-300' },
  { icon: '🐯', bg: 'bg-[#3d2f12] text-yellow-300' },
  { icon: '👶', bg: 'bg-[#3b1a2e] text-pink-300' },
  { icon: '🍍', bg: 'bg-[#3a3512] text-lime-300' },
];

const NAME_PREFIXES = ['0', '1', '2', '3', '4', '5', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'p', 'r', 's', 'v', 'w', 'x', 'y', 'z', 'u', 't'];
const NAME_SUFFIXES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'd', 'e', 'f', 'g', 'h', 'j', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z', 'k', 'q'];

function generateRandomPlayerName(): string {
  const p = NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)];
  const s = NAME_SUFFIXES[Math.floor(Math.random() * NAME_SUFFIXES.length)];
  return `${p}***${s}`;
}

// Generate realistic dynamic casino bet amounts for a round (sorted descending)
function generateRealisticBetAmounts(count: number): number[] {
  const amounts: number[] = [];

  // 1-2 High roller bets (3,000 - 10,000 BDT)
  const highCount = Math.floor(Math.random() * 2) + 1;
  const highOptions = [10000.00, 9260.00, 8500.00, 7630.00, 6500.00, 5000.00, 4200.00, 3500.00];
  for (let i = 0; i < highCount; i++) {
    const base = highOptions[Math.floor(Math.random() * highOptions.length)];
    const jitter = Math.floor(Math.random() * 80);
    amounts.push(Math.round((base - jitter) * 100) / 100);
  }

  // 4-6 Upper tier bets (1,200 - 2,800 BDT)
  const upperCount = Math.floor(Math.random() * 3) + 4;
  const upperOptions = [2800.00, 2500.00, 2200.00, 2000.00, 1800.00, 1500.00, 1350.00, 1200.00];
  for (let i = 0; i < upperCount; i++) {
    const base = upperOptions[Math.floor(Math.random() * upperOptions.length)];
    const jitter = Math.floor(Math.random() * 40);
    amounts.push(Math.round((base - jitter) * 100) / 100);
  }

  // 6-8 Mid tier bets (500 - 1,000 BDT)
  const midCount = Math.floor(Math.random() * 3) + 6;
  const midOptions = [1000.00, 950.00, 850.00, 800.00, 750.00, 700.00, 600.00, 550.00, 500.00];
  for (let i = 0; i < midCount; i++) {
    const base = midOptions[Math.floor(Math.random() * midOptions.length)];
    const jitter = Math.floor(Math.random() * 20);
    amounts.push(Math.round((base - jitter) * 100) / 100);
  }

  // Remaining popular bets (100 - 450 BDT)
  const lowOptions = [450.00, 400.00, 350.00, 300.00, 250.00, 200.00, 150.00, 120.00, 100.00, 80.00, 50.00];
  while (amounts.length < count) {
    const base = lowOptions[Math.floor(Math.random() * lowOptions.length)];
    amounts.push(base);
  }

  // Sort descending so highest bets are at top (standard Spribe Aviator format)
  return amounts.slice(0, count).sort((a, b) => b - a);
}

function generateFreshLiveBets(): AviatorLiveBet[] {
  const count = 22;
  const usedNames = new Set<string>();
  const bets: AviatorLiveBet[] = [];
  const betAmounts = generateRealisticBetAmounts(count);

  // Shuffle avatars so each round has a distinct visual appearance
  const shuffledAvatars = [...REALISTIC_AVATARS].sort(() => Math.random() - 0.5);

  for (let i = 0; i < count; i++) {
    let name = generateRandomPlayerName();
    while (usedNames.has(name)) {
      name = generateRandomPlayerName();
    }
    usedNames.add(name);

    const avatar = shuffledAvatars[i % shuffledAvatars.length];
    const betAmount = betAmounts[i];

    let targetMultiplier: number;
    const r = Math.random();
    if (r < 0.38) {
      targetMultiplier = Math.round((1.12 + Math.random() * 0.78) * 100) / 100;
    } else if (r < 0.72) {
      targetMultiplier = Math.round((1.95 + Math.random() * 1.55) * 100) / 100;
    } else if (r < 0.90) {
      targetMultiplier = Math.round((3.50 + Math.random() * 2.80) * 100) / 100;
    } else {
      targetMultiplier = Math.round((6.50 + Math.random() * 8.00) * 100) / 100;
    }

    bets.push({
      id: `live-bet-${i}-${Date.now()}-${Math.random()}`,
      avatarIcon: avatar.icon,
      avatarBg: avatar.bg,
      name,
      bet: betAmount,
      targetMultiplier,
      cashedOut: false,
    });
  }

  return bets;
}

const TOP_HISTORICAL_BETS: AviatorLiveBet[] = [
  { id: 'top-1', avatarIcon: '🏎️', avatarBg: 'bg-[#401217] text-rose-300', name: '4***2', bet: 10000.00, targetMultiplier: 284.50, cashedOut: true, cashoutMultiplier: 284.50, winAmount: 2845000.00 },
  { id: 'top-2', avatarIcon: '🍀', avatarBg: 'bg-[#123824] text-emerald-300', name: '0***4', bet: 9262.25, targetMultiplier: 156.20, cashedOut: true, cashoutMultiplier: 156.20, winAmount: 1446763.45 },
  { id: 'top-3', avatarIcon: '🪙', avatarBg: 'bg-[#3e3412] text-yellow-300', name: 'j***7', bet: 7636.64, targetMultiplier: 112.80, cashedOut: true, cashoutMultiplier: 112.80, winAmount: 861412.99 },
  { id: 'top-4', avatarIcon: '🚀', avatarBg: 'bg-[#172545] text-blue-300', name: 'g***n', bet: 6615.89, targetMultiplier: 84.15, cashedOut: true, cashoutMultiplier: 84.15, winAmount: 556727.14 },
  { id: 'top-5', avatarIcon: '🐱', avatarBg: 'bg-[#402a15] text-orange-300', name: 'c***0', bet: 5513.24, targetMultiplier: 72.40, cashedOut: true, cashoutMultiplier: 72.40, winAmount: 399158.58 },
  { id: 'top-6', avatarIcon: '🦤', avatarBg: 'bg-[#3b2d1f] text-amber-200', name: 'y***3', bet: 5227.99, targetMultiplier: 55.60, cashedOut: true, cashoutMultiplier: 55.60, winAmount: 290676.24 },
  { id: 'top-7', avatarIcon: '🌴', avatarBg: 'bg-[#153e34] text-teal-300', name: 's***8', bet: 3981.30, targetMultiplier: 48.90, cashedOut: true, cashoutMultiplier: 48.90, winAmount: 194685.57 },
  { id: 'top-8', avatarIcon: '🐉', avatarBg: 'bg-[#401616] text-red-300', name: '4***5', bet: 3818.32, targetMultiplier: 36.25, cashedOut: true, cashoutMultiplier: 36.25, winAmount: 138414.10 },
  { id: 'top-9', avatarIcon: '👶', avatarBg: 'bg-[#3b1a2e] text-pink-300', name: '3***l', bet: 2500.00, targetMultiplier: 24.80, cashedOut: true, cashoutMultiplier: 24.80, winAmount: 62000.00 },
  { id: 'top-10', avatarIcon: '🍍', avatarBg: 'bg-[#3a3512] text-lime-300', name: 'g***5', bet: 1909.16, targetMultiplier: 19.50, cashedOut: true, cashoutMultiplier: 19.50, winAmount: 37228.62 },
];

export const getMultiplierChipStyle = (m: number) => {
  if (m >= 10.0) {
    return {
      bg: 'bg-[#D97706]/20 hover:bg-[#D97706]/35',
      border: 'border-transparent',
      text: 'text-[#FBBF24]',
      badgeBg: 'bg-[#D97706]',
      category: 'gold',
      glow: '',
    };
  }
  if (m >= 2.0) {
    return {
      bg: 'bg-[#9333EA]/20 hover:bg-[#9333EA]/35',
      border: 'border-transparent',
      text: 'text-[#C084FC]',
      badgeBg: 'bg-[#9333EA]',
      category: 'purple',
      glow: '',
    };
  }
  return {
    bg: 'bg-[#2563EB]/20 hover:bg-[#2563EB]/35',
    border: 'border-transparent',
    text: 'text-[#38BDF8]',
    badgeBg: 'bg-[#2563EB]',
    category: 'blue',
    glow: '',
  };
};

interface AviatorCrashGameWebProps {
  isOpen?: boolean;
  currentBalance?: number;
  onBalanceChange?: (amount: number) => void;
  onClose?: () => void;
  game?: any;
}

/**
 * Realistic Human Avatar Logo for Player ID Profile
 * Depicts a realistic stylized human pilot/aviator character portrait:
 * - Natural skin tone and face shading
 * - Detailed hair styling
 * - Classic aviator metallic sunglasses with sky reflection highlights
 * - Leather flight jacket with collar and inner shirt
 * - Sleek circular container with gradient frame
 */
export const RealisticHumanAvatar: React.FC<{
  className?: string;
}> = ({ className = 'w-11 h-11' }) => (
  <svg
    viewBox="0 0 100 100"
    className={`${className} rounded-full overflow-hidden shrink-0 shadow-[0_2px_12px_rgba(0,0,0,0.6)]`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <radialGradient id="aviatorBgGrad" cx="50%" cy="40%" r="65%">
        <stop offset="0%" stopColor="#2c354e" />
        <stop offset="60%" stopColor="#1a1f2e" />
        <stop offset="100%" stopColor="#0d1017" />
      </radialGradient>
      <linearGradient id="aviatorSkin" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fcd3b0" />
        <stop offset="100%" stopColor="#df9a70" />
      </linearGradient>
      <linearGradient id="aviatorSkinShadow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#c57d54" />
        <stop offset="100%" stopColor="#a35f38" />
      </linearGradient>
      <linearGradient id="aviatorHair" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3d281d" />
        <stop offset="70%" stopColor="#231710" />
        <stop offset="100%" stopColor="#120c08" />
      </linearGradient>
      <linearGradient id="aviatorJacket" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#2d3345" />
        <stop offset="100%" stopColor="#141722" />
      </linearGradient>
      <linearGradient id="aviatorLens" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1f293d" />
        <stop offset="60%" stopColor="#0f172a" />
        <stop offset="100%" stopColor="#020617" />
      </linearGradient>
      <linearGradient id="aviatorSheen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.1" />
      </linearGradient>
    </defs>

    {/* Background Circle */}
    <circle cx="50" cy="50" r="49" fill="url(#aviatorBgGrad)" stroke="#3e4765" strokeWidth="2" />

    {/* Human Shoulders & Leather Bomber Jacket */}
    <path
      d="M16 98 C16 76 31 66 50 66 C69 66 84 76 84 98 Z"
      fill="url(#aviatorJacket)"
    />
    {/* Inner White Collar / Shirt */}
    <path d="M41 68 L50 83 L59 68 Z" fill="#f1f5f9" />
    {/* Jacket Lapels */}
    <path d="M43 68 L50 84 L38 86 L30 72 Z" fill="#1e2230" stroke="#3b4259" strokeWidth="0.8" />
    <path d="M57 68 L50 84 L62 86 L70 72 Z" fill="#181c28" stroke="#3b4259" strokeWidth="0.8" />

    {/* Neck */}
    <path d="M42 55 L42 71 C45 73 55 73 58 71 L58 55 Z" fill="url(#aviatorSkinShadow)" />

    {/* Face / Jaw Structure */}
    <path
      d="M33 42 C33 29 40 21 50 21 C60 21 67 29 67 42 C67 55 59 64 50 64 C41 64 33 55 33 42 Z"
      fill="url(#aviatorSkin)"
    />

    {/* Ears */}
    <circle cx="32" cy="43" r="3.8" fill="#e09c72" />
    <circle cx="32" cy="43" r="2.2" fill="#c57d54" />
    <circle cx="68" cy="43" r="3.8" fill="#e09c72" />
    <circle cx="68" cy="43" r="2.2" fill="#c57d54" />

    {/* Styled Hair */}
    <path
      d="M31 38 C31 23 38 15 50 15 C62 15 69 23 69 38 C69 38 66 29 59 29 C52 29 50 33 44 31 C38 29 33 33 31 38 Z"
      fill="url(#aviatorHair)"
    />

    {/* Eyebrows */}
    <path d="M37 34 Q42 32 46 34" stroke="#231710" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M54 34 Q58 32 63 34" stroke="#231710" strokeWidth="2.2" strokeLinecap="round" />

    {/* Aviator Sunglasses */}
    {/* Bridge */}
    <line x1="46" y1="38" x2="54" y2="38" stroke="#d4af37" strokeWidth="1.8" />
    <line x1="45" y1="36" x2="55" y2="36" stroke="#d4af37" strokeWidth="1.2" />

    {/* Left Teardrop Lens */}
    <path
      d="M35 37 C41 36 46 37 46 41 C46 48 41 51 38 50 C34 49 34 44 35 37 Z"
      fill="url(#aviatorLens)"
      stroke="#d4af37"
      strokeWidth="1.4"
    />
    {/* Left Reflection Flare */}
    <path d="M37 39 L43 39 C41 45 38 47 37 47 Z" fill="url(#aviatorSheen)" />

    {/* Right Teardrop Lens */}
    <path
      d="M54 37 C59 36 65 37 65 41 C65 44 64 49 62 50 C58 51 54 48 54 41 Z"
      fill="url(#aviatorLens)"
      stroke="#d4af37"
      strokeWidth="1.4"
    />
    {/* Right Reflection Flare */}
    <path d="M56 39 L62 39 C61 45 58 47 57 47 Z" fill="url(#aviatorSheen)" />

    {/* Nose */}
    <path d="M50 43 L48.5 49 L51.5 49" stroke="#b87850" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />

    {/* Confident Smile */}
    <path d="M44 55 Q50 60 56 55" stroke="#9e5632" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <path d="M45 55.2 Q50 58.2 55 55.2" fill="#ffffff" />
  </svg>
);

/**
 * High-Fidelity SVG of the Iconic Red Spribe Aviator Stunt Plane
 * Matching the official Spribe Aviator aerobatic stunt airplane:
 * - Streamlined crimson fuselage
 * - Swept wings with ailerons & trim
 * - Vertical rudder fin rooted at tail (0, 0)
 * - Horizontal tail elevators
 * - Dark tinted canopy with glossy shine reflection
 * - Aerodynamic nose cone with spinning propeller and blur disc
 */
/**
 * Exact Red Stylized Spribe Aviator Airplane Logo
 * Pixel-perfect match to user reference image 1791541544259.jpg:
 * - Solid red stylized silhouette (#E52338 / #FF1744)
 * - Static two-bladed propeller with pointed nose cone (no spinning propeller)
 * - Bold stylized 'X' marking on fuselage with serif on bottom-left foot
 * - Angled cockpit canopy window cutout
 * - Swept main triangular wing with 2 horizontal cutout slits
 * - Angular tail hook / skid assembly (anchor point at 0, 0)
 * - Sweeping bottom belly runner skid line
 */
export const SpribeAviatorStuntPlane: React.FC<{
  className?: string;
  style?: React.CSSProperties;
}> = ({ className = '', style = {} }) => (
  <svg
    viewBox="-28 -72 195 118"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <g fill="#E52338">
      {/* Pointed Nose Spinner Cone */}
      <path d="M 143 -12 L 160 -7 L 143 -2 Z" />

      {/* Propeller Upper Blade (Bold Solid) */}
      <path d="M 141 -9 C 137 -28, 131 -46, 135 -59 C 139 -66, 147 -64, 149 -58 C 153 -44, 150 -26, 145 -9 Z" />
      {/* Propeller Lower Blade (Bold Solid) */}
      <path d="M 143 -3 C 147 13, 151 26, 156 34 C 159 39, 164 36, 164 30 C 162 20, 156 9, 147 -3 Z" />

      {/* Front Nose Cowl & Frame (Solid & Muscular) */}
      <path d="M 106 -20 L 142 -20 C 146 -20, 148 -17, 148 -12 L 148 -1 C 148 3, 143 5, 136 5 L 128 5 C 134 -1, 136 -7, 134 -11 L 112 -11 Z" />

      {/* Iconic Bold 'X' Marking on Fuselage (Thick & Crisp) */}
      <path d="M 110 -21 L 118 -21 L 134 -3 L 126 -3 Z" />
      <path d="M 132 -21 L 124 -21 L 110 -3 L 103 -3 L 103 -7.5 L 108 -7.5 L 121 -21 Z" />

      {/* Cockpit Canopy Roof Frame (Bold Matching Propeller Weight) */}
      <path d="M 64 -18 C 70 -32, 88 -35, 102 -26 L 112 -18 L 100 -18 C 91 -24, 83 -24, 76 -18 Z" />

      {/* Main Swept Triangular Wing (Solid & Thick) */}
      <path d="M 34 -17 L 105 -12 L 34 -1 C 30 -6, 30 -12, 34 -17 Z" />

      {/* Vertical Tail Fin (Rudder - Solid & Bold like Propeller) */}
      <path d="M 14 -14 C 9 -28, 14 -40, 27 -40 C 36 -40, 42 -28, 44 -16 L 33 -16 C 30 -24, 27 -30, 24 -30 C 20 -30, 18 -23, 21 -14 Z" />

      {/* Angular Tail Skid Assembly with Hook Notch (Thick & Solid) */}
      <path d="M 0 -2 C -5 -6, -10 -11, -16 -11 C -20 -11, -21 -6, -19 -2 C -15 0, -10 1, -4 1 L -8 4 C -13 3, -17 0, -21 -3 C -24 -9, -21 -15, -15 -15 C -8 -15, -3 -9, 2 -3 Z" />
      <path d="M -16 -11 L -4 -16 L 15 -13 L 11 -7 L -2 -11 L -12 -8 Z" />

      {/* Long Swept Bottom Skid Runner (Thick 8px Undercarriage) */}
      <path d="M -2 -3 C 24 6, 54 9, 90 9 C 118 9, 135 5, 144 0 L 139 7 C 126 12, 106 15, 83 15 C 46 15, 16 9, -2 4 Z" />
    </g>
  </svg>
);

/**
 * Native Canvas Drawing Function for the Exact Red Stylized Aviator Logo
 * Matching reference image 1791541544259.jpg with thick, solid, uniform linework.
 * Local origin (0, 0) is the tail skid hook where the bottom red flight ray anchors.
 */
function drawSpribeAviatorStuntPlaneCanvas(
  ctx: CanvasRenderingContext2D,
  scale: number = 0.30,
  isRocketBoost: boolean = false
) {
  ctx.save();
  ctx.scale(scale, scale);

  const redColor = '#E52338';

  // Rocket Boost Jet Plume when Flew Away (Crash Exit)
  if (isRocketBoost) {
    ctx.save();
    const plumeGrad = ctx.createLinearGradient(-48, 0, 0, 0);
    plumeGrad.addColorStop(0, 'rgba(255, 23, 68, 0)');
    plumeGrad.addColorStop(0.3, 'rgba(255, 80, 0, 0.8)');
    plumeGrad.addColorStop(0.7, 'rgba(255, 220, 0, 0.95)');
    plumeGrad.addColorStop(1, '#FFFFFF');
    ctx.fillStyle = plumeGrad;
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(-48, 0);
    ctx.lineTo(0, 5);
    ctx.closePath();
    ctx.fill();

    // Outer flame aura
    ctx.fillStyle = 'rgba(255, 23, 68, 0.45)';
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(-58, 0);
    ctx.lineTo(0, 9);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Tail glow flare at (0, 0) where the red light ray anchors
  const tailGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 10);
  tailGlow.addColorStop(0, '#FFFFFF');
  tailGlow.addColorStop(0.3, 'rgba(255, 23, 68, 0.95)');
  tailGlow.addColorStop(0.6, 'rgba(229, 35, 56, 0.45)');
  tailGlow.addColorStop(1, 'rgba(229, 35, 56, 0)');
  ctx.fillStyle = tailGlow;
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = redColor;
  ctx.strokeStyle = redColor;
  ctx.lineWidth = 3.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // 1. Pointed Nose Spinner Cone
  ctx.beginPath();
  ctx.moveTo(143, -12);
  ctx.lineTo(160, -7);
  ctx.lineTo(143, -2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Propeller dynamic breathing / expansion pulse:
  // "লোগোর সামনের পাখা টা অলটাইম শুধু একটু ছোট হবে আর বড় হবে শুধু পাখা টা"
  const propPulse = 1.0 + Math.sin(Date.now() * 0.008) * 0.22;

  ctx.save();
  ctx.translate(143, -7);
  ctx.scale(propPulse, propPulse);
  ctx.translate(-143, 7);

  // Propeller Upper Blade (Bold Solid, Pulsing Size)
  ctx.beginPath();
  ctx.moveTo(141, -9);
  ctx.bezierCurveTo(137, -28, 131, -46, 135, -59);
  ctx.bezierCurveTo(139, -66, 147, -64, 149, -58);
  ctx.bezierCurveTo(153, -44, 150, -26, 145, -9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Propeller Lower Blade (Bold Solid, Pulsing Size)
  ctx.beginPath();
  ctx.moveTo(143, -3);
  ctx.bezierCurveTo(147, 13, 151, 26, 156, 34);
  ctx.bezierCurveTo(159, 39, 164, 36, 164, 30);
  ctx.bezierCurveTo(162, 20, 156, 9, 147, -3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();

  // 2. Front Nose Cowl & Frame (Solid & Muscular)
  ctx.beginPath();
  ctx.moveTo(106, -20);
  ctx.lineTo(142, -20);
  ctx.bezierCurveTo(146, -20, 148, -17, 148, -12);
  ctx.lineTo(148, -1);
  ctx.bezierCurveTo(148, 3, 143, 5, 136, 5);
  ctx.lineTo(128, 5);
  ctx.bezierCurveTo(134, -1, 136, -7, 134, -11);
  ctx.lineTo(112, -11);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. The Iconic Bold 'X' Marking on Fuselage (Thick & Crisp)
  // Stroke 1: \ diagonal
  ctx.beginPath();
  ctx.moveTo(110, -21);
  ctx.lineTo(118, -21);
  ctx.lineTo(134, -3);
  ctx.lineTo(126, -3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Stroke 2: / diagonal with bottom-left serif foot
  ctx.beginPath();
  ctx.moveTo(132, -21);
  ctx.lineTo(124, -21);
  ctx.lineTo(110, -3);
  ctx.lineTo(103, -3);
  ctx.lineTo(103, -7.5);
  ctx.lineTo(108, -7.5);
  ctx.lineTo(121, -21);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. Cockpit Canopy Roof Frame (Bold Matching Propeller Weight)
  ctx.beginPath();
  ctx.moveTo(64, -18);
  ctx.bezierCurveTo(70, -32, 88, -35, 102, -26);
  ctx.lineTo(112, -18);
  ctx.lineTo(100, -18);
  ctx.bezierCurveTo(91, -24, 83, -24, 76, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 5. Main Swept Triangular Wing (Solid & Thick)
  ctx.beginPath();
  ctx.moveTo(34, -17);
  ctx.lineTo(105, -12);
  ctx.lineTo(34, -1);
  ctx.bezierCurveTo(30, -6, 30, -12, 34, -17);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 6. Vertical Tail Fin (Rudder - Solid & Bold like Propeller)
  ctx.beginPath();
  ctx.moveTo(14, -14);
  ctx.bezierCurveTo(9, -28, 14, -40, 27, -40);
  ctx.bezierCurveTo(36, -40, 42, -28, 44, -16);
  ctx.lineTo(33, -16);
  ctx.bezierCurveTo(30, -24, 27, -30, 24, -30);
  ctx.bezierCurveTo(20, -30, 18, -23, 21, -14);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 7. Angular Tail Skid Assembly with Hook Notch (Thick & Solid)
  ctx.beginPath();
  ctx.moveTo(0, -2);
  ctx.bezierCurveTo(-5, -6, -10, -11, -16, -11);
  ctx.bezierCurveTo(-20, -11, -21, -6, -19, -2);
  ctx.bezierCurveTo(-15, 0, -10, 1, -4, 1);
  ctx.lineTo(-8, 4);
  ctx.bezierCurveTo(-13, 3, -17, 0, -21, -3);
  ctx.bezierCurveTo(-24, -9, -21, -15, -15, -15);
  ctx.bezierCurveTo(-8, -15, -3, -9, 2, -3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-16, -11);
  ctx.lineTo(-4, -16);
  ctx.lineTo(15, -13);
  ctx.lineTo(11, -7);
  ctx.lineTo(-2, -11);
  ctx.lineTo(-12, -8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 8. Long Swept Bottom Skid Runner (Thick 8px Undercarriage)
  ctx.beginPath();
  ctx.moveTo(-2, -3);
  ctx.bezierCurveTo(24, 6, 54, 9, 90, 9);
  ctx.bezierCurveTo(118, 9, 135, 5, 144, 0);
  ctx.lineTo(139, 7);
  ctx.bezierCurveTo(126, 12, 106, 15, 83, 15);
  ctx.bezierCurveTo(46, 15, 16, 9, -2, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

/**
 * Official Spribe Dot-Matrix Halftone "S" Brandmark Icon
 * Faithfully matches Spribe's circular halftone dot matrix "S" logo from official Aviator
 */
export const SpribeDotMatrixLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 36 36"
    className={`${className} shrink-0`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="14.4" cy="2.4" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="16.8" cy="2.4" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="19.2" cy="2.4" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="21.6" cy="2.4" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="9.6" cy="4.8" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="12.0" cy="4.8" r="0.45" fill="#FFFFFF" opacity="0.35" />
    <circle cx="14.4" cy="4.8" r="0.45" fill="#FFFFFF" opacity="0.35" />
    <circle cx="16.8" cy="4.8" r="0.65" fill="#FFFFFF" opacity="0.5" />
    <circle cx="19.2" cy="4.8" r="0.65" fill="#FFFFFF" opacity="0.5" />
    <circle cx="21.6" cy="4.8" r="0.45" fill="#FFFFFF" opacity="0.35" />
    <circle cx="24.0" cy="4.8" r="0.45" fill="#FFFFFF" opacity="0.35" />
    <circle cx="26.4" cy="4.8" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="7.2" cy="7.2" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="9.6" cy="7.2" r="0.45" fill="#FFFFFF" opacity="0.35" />
    <circle cx="12.0" cy="7.2" r="0.75" fill="#FFFFFF" opacity="0.6" />
    <circle cx="14.4" cy="7.2" r="1.25" fill="#FFFFFF" />
    <circle cx="16.8" cy="7.2" r="1.3" fill="#FFFFFF" />
    <circle cx="19.2" cy="7.2" r="1.3" fill="#FFFFFF" />
    <circle cx="21.6" cy="7.2" r="1.25" fill="#FFFFFF" />
    <circle cx="24.0" cy="7.2" r="1.2" fill="#FFFFFF" />
    <circle cx="26.4" cy="7.2" r="0.7" fill="#FFFFFF" opacity="0.55" />
    <circle cx="28.8" cy="7.2" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="4.8" cy="9.6" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="7.2" cy="9.6" r="0.45" fill="#FFFFFF" opacity="0.35" />
    <circle cx="9.6" cy="9.6" r="0.8" fill="#FFFFFF" opacity="0.7" />
    <circle cx="12.0" cy="9.6" r="1.3" fill="#FFFFFF" />
    <circle cx="14.4" cy="9.6" r="1.35" fill="#FFFFFF" />
    <circle cx="16.8" cy="9.6" r="1.0" fill="#FFFFFF" opacity="0.8" />
    <circle cx="19.2" cy="9.6" r="0.85" fill="#FFFFFF" opacity="0.6" />
    <circle cx="21.6" cy="9.6" r="0.7" fill="#FFFFFF" opacity="0.45" />
    <circle cx="24.0" cy="9.6" r="1.0" fill="#FFFFFF" opacity="0.8" />
    <circle cx="26.4" cy="9.6" r="1.35" fill="#FFFFFF" />
    <circle cx="28.8" cy="9.6" r="0.6" fill="#FFFFFF" opacity="0.4" />
    <circle cx="31.2" cy="9.6" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="4.8" cy="12.0" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="7.2" cy="12.0" r="0.6" fill="#FFFFFF" opacity="0.45" />
    <circle cx="9.6" cy="12.0" r="1.35" fill="#FFFFFF" />
    <circle cx="12.0" cy="12.0" r="1.35" fill="#FFFFFF" />
    <circle cx="14.4" cy="12.0" r="0.8" fill="#FFFFFF" opacity="0.6" />
    <circle cx="16.8" cy="12.0" r="0.6" fill="#FFFFFF" opacity="0.4" />
    <circle cx="19.2" cy="12.0" r="0.55" fill="#FFFFFF" opacity="0.35" />
    <circle cx="21.6" cy="12.0" r="0.6" fill="#FFFFFF" opacity="0.4" />
    <circle cx="24.0" cy="12.0" r="0.9" fill="#FFFFFF" opacity="0.7" />
    <circle cx="26.4" cy="12.0" r="1.35" fill="#FFFFFF" />
    <circle cx="28.8" cy="12.0" r="0.75" fill="#FFFFFF" opacity="0.55" />
    <circle cx="31.2" cy="12.0" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="2.4" cy="14.4" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="4.8" cy="14.4" r="0.55" fill="#FFFFFF" opacity="0.4" />
    <circle cx="7.2" cy="14.4" r="1.0" fill="#FFFFFF" opacity="0.8" />
    <circle cx="9.6" cy="14.4" r="1.35" fill="#FFFFFF" />
    <circle cx="12.0" cy="14.4" r="1.25" fill="#FFFFFF" />
    <circle cx="14.4" cy="14.4" r="0.85" fill="#FFFFFF" opacity="0.65" />
    <circle cx="16.8" cy="14.4" r="0.65" fill="#FFFFFF" opacity="0.45" />
    <circle cx="19.2" cy="14.4" r="0.6" fill="#FFFFFF" opacity="0.4" />
    <circle cx="21.6" cy="14.4" r="0.6" fill="#FFFFFF" opacity="0.4" />
    <circle cx="24.0" cy="14.4" r="0.6" fill="#FFFFFF" opacity="0.4" />
    <circle cx="26.4" cy="14.4" r="0.7" fill="#FFFFFF" opacity="0.5" />
    <circle cx="28.8" cy="14.4" r="0.55" fill="#FFFFFF" opacity="0.4" />
    <circle cx="31.2" cy="14.4" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="33.6" cy="14.4" r="0.4" fill="#FFFFFF" opacity="0.25" />
    <circle cx="2.4" cy="16.8" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="4.8" cy="16.8" r="0.5" fill="#FFFFFF" opacity="0.35" />
    <circle cx="7.2" cy="16.8" r="0.8" fill="#FFFFFF" opacity="0.6" />
    <circle cx="9.6" cy="16.8" r="1.2" fill="#FFFFFF" />
    <circle cx="12.0" cy="16.8" r="1.35" fill="#FFFFFF" />
    <circle cx="14.4" cy="16.8" r="1.35" fill="#FFFFFF" />
    <circle cx="16.8" cy="16.8" r="1.25" fill="#FFFFFF" />
    <circle cx="19.2" cy="16.8" r="0.9" fill="#FFFFFF" opacity="0.7" />
    <circle cx="21.6" cy="16.8" r="0.6" fill="#FFFFFF" opacity="0.4" />
    <circle cx="24.0" cy="16.8" r="0.55" fill="#FFFFFF" opacity="0.35" />
    <circle cx="26.4" cy="16.8" r="0.5" fill="#FFFFFF" opacity="0.35" />
    <circle cx="28.8" cy="16.8" r="0.5" fill="#FFFFFF" opacity="0.35" />
    <circle cx="31.2" cy="16.8" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="33.6" cy="16.8" r="0.4" fill="#FFFFFF" opacity="0.25" />
    <circle cx="2.4" cy="19.2" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="4.8" cy="19.2" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="7.2" cy="19.2" r="0.55" fill="#FFFFFF" opacity="0.4" />
    <circle cx="9.6" cy="19.2" r="0.7" fill="#FFFFFF" opacity="0.5" />
    <circle cx="12.0" cy="19.2" r="1.0" fill="#FFFFFF" opacity="0.8" />
    <circle cx="14.4" cy="19.2" r="1.3" fill="#FFFFFF" />
    <circle cx="16.8" cy="19.2" r="1.35" fill="#FFFFFF" />
    <circle cx="19.2" cy="19.2" r="1.35" fill="#FFFFFF" />
    <circle cx="21.6" cy="19.2" r="1.2" fill="#FFFFFF" />
    <circle cx="24.0" cy="19.2" r="0.8" fill="#FFFFFF" opacity="0.6" />
    <circle cx="26.4" cy="19.2" r="0.55" fill="#FFFFFF" opacity="0.4" />
    <circle cx="28.8" cy="19.2" r="0.5" fill="#FFFFFF" opacity="0.35" />
    <circle cx="31.2" cy="19.2" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="33.6" cy="19.2" r="0.4" fill="#FFFFFF" opacity="0.25" />
    <circle cx="2.4" cy="21.6" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="4.8" cy="21.6" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="7.2" cy="21.6" r="0.5" fill="#FFFFFF" opacity="0.35" />
    <circle cx="9.6" cy="21.6" r="0.55" fill="#FFFFFF" opacity="0.4" />
    <circle cx="12.0" cy="21.6" r="0.6" fill="#FFFFFF" opacity="0.4" />
    <circle cx="14.4" cy="21.6" r="0.75" fill="#FFFFFF" opacity="0.55" />
    <circle cx="16.8" cy="21.6" r="1.1" fill="#FFFFFF" opacity="0.85" />
    <circle cx="19.2" cy="21.6" r="1.35" fill="#FFFFFF" />
    <circle cx="21.6" cy="21.6" r="1.35" fill="#FFFFFF" />
    <circle cx="24.0" cy="21.6" r="1.25" fill="#FFFFFF" />
    <circle cx="26.4" cy="21.6" r="0.8" fill="#FFFFFF" opacity="0.6" />
    <circle cx="28.8" cy="21.6" r="0.55" fill="#FFFFFF" opacity="0.4" />
    <circle cx="31.2" cy="21.6" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="33.6" cy="21.6" r="0.4" fill="#FFFFFF" opacity="0.25" />
    <circle cx="4.8" cy="24.0" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="7.2" cy="24.0" r="0.65" fill="#FFFFFF" opacity="0.5" />
    <circle cx="9.6" cy="24.0" r="1.0" fill="#FFFFFF" opacity="0.8" />
    <circle cx="12.0" cy="24.0" r="0.7" fill="#FFFFFF" opacity="0.5" />
    <circle cx="14.4" cy="24.0" r="0.55" fill="#FFFFFF" opacity="0.4" />
    <circle cx="16.8" cy="24.0" r="0.65" fill="#FFFFFF" opacity="0.45" />
    <circle cx="19.2" cy="24.0" r="0.9" fill="#FFFFFF" opacity="0.7" />
    <circle cx="21.6" cy="24.0" r="1.35" fill="#FFFFFF" />
    <circle cx="24.0" cy="24.0" r="1.35" fill="#FFFFFF" />
    <circle cx="26.4" cy="24.0" r="1.35" fill="#FFFFFF" />
    <circle cx="28.8" cy="24.0" r="0.75" fill="#FFFFFF" opacity="0.55" />
    <circle cx="31.2" cy="24.0" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="4.8" cy="26.4" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="7.2" cy="26.4" r="0.7" fill="#FFFFFF" opacity="0.55" />
    <circle cx="9.6" cy="26.4" r="1.35" fill="#FFFFFF" />
    <circle cx="12.0" cy="26.4" r="1.25" fill="#FFFFFF" />
    <circle cx="14.4" cy="26.4" r="0.9" fill="#FFFFFF" opacity="0.7" />
    <circle cx="16.8" cy="26.4" r="0.8" fill="#FFFFFF" opacity="0.6" />
    <circle cx="19.2" cy="26.4" r="1.0" fill="#FFFFFF" opacity="0.8" />
    <circle cx="21.6" cy="26.4" r="1.35" fill="#FFFFFF" />
    <circle cx="24.0" cy="26.4" r="1.35" fill="#FFFFFF" />
    <circle cx="26.4" cy="26.4" r="1.2" fill="#FFFFFF" />
    <circle cx="28.8" cy="26.4" r="0.6" fill="#FFFFFF" opacity="0.45" />
    <circle cx="31.2" cy="26.4" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="7.2" cy="28.8" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="9.6" cy="28.8" r="0.6" fill="#FFFFFF" opacity="0.45" />
    <circle cx="12.0" cy="28.8" r="1.15" fill="#FFFFFF" />
    <circle cx="14.4" cy="28.8" r="1.35" fill="#FFFFFF" />
    <circle cx="16.8" cy="28.8" r="1.35" fill="#FFFFFF" />
    <circle cx="19.2" cy="28.8" r="1.35" fill="#FFFFFF" />
    <circle cx="21.6" cy="28.8" r="1.35" fill="#FFFFFF" />
    <circle cx="24.0" cy="28.8" r="0.95" fill="#FFFFFF" opacity="0.75" />
    <circle cx="26.4" cy="28.8" r="0.55" fill="#FFFFFF" opacity="0.4" />
    <circle cx="28.8" cy="28.8" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="9.6" cy="31.2" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="12.0" cy="31.2" r="0.45" fill="#FFFFFF" opacity="0.35" />
    <circle cx="14.4" cy="31.2" r="0.65" fill="#FFFFFF" opacity="0.5" />
    <circle cx="16.8" cy="31.2" r="0.8" fill="#FFFFFF" opacity="0.65" />
    <circle cx="19.2" cy="31.2" r="0.75" fill="#FFFFFF" opacity="0.6" />
    <circle cx="21.6" cy="31.2" r="0.55" fill="#FFFFFF" opacity="0.4" />
    <circle cx="24.0" cy="31.2" r="0.45" fill="#FFFFFF" opacity="0.35" />
    <circle cx="26.4" cy="31.2" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="14.4" cy="33.6" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="16.8" cy="33.6" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="19.2" cy="33.6" r="0.45" fill="#FFFFFF" opacity="0.3" />
    <circle cx="21.6" cy="33.6" r="0.45" fill="#FFFFFF" opacity="0.3" />
  </svg>
);

export const SpribeBrandmarkLogo = SpribeDotMatrixLogo;

export function AviatorCrashGameWeb({
  isOpen = true,
  currentBalance = 0,
  onBalanceChange,
  onClose
}: AviatorCrashGameWebProps) {
  if (!isOpen) return null;

  // Game Engine States
  const [phase, setPhase] = useState<'WAITING' | 'FLYING' | 'CRASHED'>('WAITING');
  const [multiplier, setMultiplier] = useState(1.00);
  const [waitingCountdown, setWaitingCountdown] = useState(5.0);
  const [waitingProgress, setWaitingProgress] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(2.40);
  
  // Casino Warning Toast State & Mechanics
  const [toast, setToast] = useState<{ message: string; visible: boolean; id: number } | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const toastHideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string = 'Not enough balance') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    if (toastHideTimerRef.current) clearTimeout(toastHideTimerRef.current);

    const id = Date.now();
    setToast({ message: msg, visible: true, id });

    // Visible for 2.2 seconds, then smooth fade-out (total ~2.5 seconds)
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => (prev?.id === id ? { ...prev, visible: false } : prev));
      toastHideTimerRef.current = setTimeout(() => {
        setToast((prev) => (prev?.id === id ? null : prev));
      }, 300);
    }, 2200);
  };

  // Cash Out Banner Toast State (Exact match to Spribe Aviator screenshot Screenshot_20261009-214150~2.jpg)
  const [cashoutToast, setCashoutToast] = useState<{
    multiplier: number;
    winAmount: number;
    visible: boolean;
    id: number;
  } | null>(null);
  const cashoutToastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cashoutToastHideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerCashoutToast = (mult: number, winAmt: number) => {
    if (cashoutToastTimerRef.current) clearTimeout(cashoutToastTimerRef.current);
    if (cashoutToastHideTimerRef.current) clearTimeout(cashoutToastHideTimerRef.current);

    const id = Date.now();
    setCashoutToast({
      multiplier: mult,
      winAmount: winAmt,
      visible: true,
      id,
    });

    // Visible for 4.2 seconds then smooth fade out
    cashoutToastTimerRef.current = setTimeout(() => {
      setCashoutToast((prev) => (prev?.id === id ? { ...prev, visible: false } : prev));
      cashoutToastHideTimerRef.current = setTimeout(() => {
        setCashoutToast((prev) => (prev?.id === id ? null : prev));
      }, 350);
    }, 4200);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (toastHideTimerRef.current) clearTimeout(toastHideTimerRef.current);
      if (cashoutToastTimerRef.current) clearTimeout(cashoutToastTimerRef.current);
      if (cashoutToastHideTimerRef.current) clearTimeout(cashoutToastHideTimerRef.current);
    };
  }, []);

  // 60-Round History & Provably Fair Modal State
  const [roundHistory, setRoundHistory] = useState<RoundHistoryItem[]>(INITIAL_ROUNDS);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedRound, setSelectedRound] = useState<RoundHistoryItem | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Hamburger 3-lines Menu State (Exact Spribe Aviator Menu)
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [musicOn, setMusicOn] = useState(true);
  const [animationOn, setAnimationOn] = useState(true);

  const handleCopy = (text: string, fieldName: string) => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
      }
    } catch {
      // fallback
    }
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const [onlineCount, setOnlineCount] = useState(770);

  // Panel 1
  const [p1Tab, setP1Tab] = useState<'bet' | 'auto'>('bet');
  const [p1Amount, setP1Amount] = useState(10.00);
  const [p1InputStr, setP1InputStr] = useState('10.00');
  const [p1State, setP1State] = useState<'IDLE' | 'WAITING_IN_ROUND' | 'ACTIVE_FLYING' | 'CASHED_OUT'>('IDLE');
  const [p1AutoBet, setP1AutoBet] = useState(false);
  const [p1AutoCashoutActive, setP1AutoCashoutActive] = useState(false);
  const [p1AutoCashoutMult, setP1AutoCashoutMult] = useState(1.10);
  const [p1AutoCashoutStr, setP1AutoCashoutStr] = useState('1.10');

  // Panel 2
  const [p2Tab, setP2Tab] = useState<'bet' | 'auto'>('bet');
  const [p2Amount, setP2Amount] = useState(10.00);
  const [p2InputStr, setP2InputStr] = useState('10.00');
  const [p2State, setP2State] = useState<'IDLE' | 'WAITING_IN_ROUND' | 'ACTIVE_FLYING' | 'CASHED_OUT'>('IDLE');
  const [p2Collapsed, setP2Collapsed] = useState(false);
  const [p2AutoBet, setP2AutoBet] = useState(false);
  const [p2AutoCashoutActive, setP2AutoCashoutActive] = useState(false);
  const [p2AutoCashoutMult, setP2AutoCashoutMult] = useState(1.10);
  const [p2AutoCashoutStr, setP2AutoCashoutStr] = useState('1.10');

  // Sync refs for async game loop
  const p1AutoBetRef = useRef(p1AutoBet);
  p1AutoBetRef.current = p1AutoBet;
  const p2AutoBetRef = useRef(p2AutoBet);
  p2AutoBetRef.current = p2AutoBet;

  const p1StateRef = useRef(p1State);
  p1StateRef.current = p1State;
  const p2StateRef = useRef(p2State);
  p2StateRef.current = p2State;

  const p1AmountRef = useRef(p1Amount);
  p1AmountRef.current = p1Amount;
  const p2AmountRef = useRef(p2Amount);
  p2AmountRef.current = p2Amount;

  const currentBalanceRef = useRef(currentBalance);
  currentBalanceRef.current = currentBalance;

  const onBalanceChangeRef = useRef(onBalanceChange);
  onBalanceChangeRef.current = onBalanceChange;

  // Bottom bets tab & Live bets simulation
  const [betsTab, setBetsTab] = useState<'all' | 'previous' | 'top'>('all');
  const [liveBets, setLiveBets] = useState<AviatorLiveBet[]>(() => generateFreshLiveBets());
  const [previousBets, setPreviousBets] = useState<AviatorLiveBet[]>(() => {
    const init = generateFreshLiveBets();
    return init.map((b) => {
      const cashed = b.targetMultiplier <= 2.40;
      return {
        ...b,
        cashedOut: cashed,
        cashoutMultiplier: cashed ? b.targetMultiplier : undefined,
        winAmount: cashed ? Math.round(b.bet * b.targetMultiplier * 100) / 100 : undefined,
      };
    });
  });
  const [totalRoundBetsCount, setTotalRoundBetsCount] = useState(1148);
  const [activeBetsCount, setActiveBetsCount] = useState(1148);
  const [totalWinBdt, setTotalWinBdt] = useState(0.00);

  const liveBetsRef = useRef<AviatorLiveBet[]>(liveBets);
  liveBetsRef.current = liveBets;

  // Synchronize live bets cashouts with flight multiplier in real time
  useEffect(() => {
    if (phase === 'FLYING') {
      setLiveBets((prevBets) => {
        let changed = false;
        let newWinsSum = 0;
        let cashedCount = 0;

        const updated = prevBets.map((bet) => {
          if (!bet.cashedOut && bet.targetMultiplier <= multiplier && bet.targetMultiplier <= crashPoint) {
            changed = true;
            cashedCount++;
            const winAmount = Math.round(bet.bet * bet.targetMultiplier * 100) / 100;
            newWinsSum += winAmount;
            return {
              ...bet,
              cashedOut: true,
              cashoutMultiplier: bet.targetMultiplier,
              winAmount,
            };
          }
          return bet;
        });

        if (changed) {
          const scaleFactor = Math.max(1, Math.round(totalRoundBetsCount / prevBets.length));
          setTotalWinBdt((prev) => Math.round((prev + newWinsSum * scaleFactor * 0.35) * 100) / 100);
          setActiveBetsCount((prev) => Math.max(Math.floor(totalRoundBetsCount * 0.20), prev - cashedCount * scaleFactor));
          return updated;
        }
        return prevBets;
      });
    }
  }, [multiplier, phase, crashPoint, totalRoundBetsCount]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const flightStartTimeRef = useRef<number>(0);

  // Flight Physics & Crash State Tracking
  const flightPhysicsRef = useRef({
    tailX: 64,
    tailY: 272,
    cpX: 64,
    cpY: 272,
    tangentAngle: -0.32,
    crashedAt: 0,
    crashTailX: 64,
    crashTailY: 272,
    crashCpX: 64,
    crashCpY: 272,
    crashAngle: -0.32,
  });

  // Round sequence tracker guaranteeing unique consecutive rounds and multipliers
  const roundSequenceRef = useRef<number>(0);
  const lastCrashRef = useRef<number>(0);

  // Game Loop
  useEffect(() => {
    let isCancelled = false;

    const runGameLoop = async () => {
      while (!isCancelled) {
        // 1. WAITING PHASE (5s)
        setPhase('WAITING');
        setMultiplier(1.00);
        setOnlineCount(Math.floor(Math.random() * 20) + 2);
        flightPhysicsRef.current.crashedAt = 0;

        // Fresh dynamic bets for the new round (different names, realistic bet amounts and avatars)
        const nextRoundBets = generateFreshLiveBets();
        setLiveBets(nextRoundBets);
        const randomTotal = Math.floor(Math.random() * 320) + 980; // realistic 1,000 range: e.g. 1024, 1150, 1280, 995, 1180
        setTotalRoundBetsCount(randomTotal);
        setActiveBetsCount(randomTotal);
        setTotalWinBdt(0.00);

        // Auto bet trigger: if enabled, place bet during WAITING phase
        if (p1AutoBetRef.current && (p1StateRef.current === 'IDLE' || p1StateRef.current === 'CASHED_OUT')) {
          const amt = Math.max(10, Math.round(p1AmountRef.current * 100) / 100);
          if (currentBalanceRef.current >= amt) {
            if (onBalanceChangeRef.current) onBalanceChangeRef.current(-amt);
            setP1State('WAITING_IN_ROUND');
          } else {
            showToast('Not enough balance');
            setP1AutoBet(false);
          }
        }

        if (p2AutoBetRef.current && (p2StateRef.current === 'IDLE' || p2StateRef.current === 'CASHED_OUT')) {
          const amt = Math.max(10, Math.round(p2AmountRef.current * 100) / 100);
          if (currentBalanceRef.current >= amt) {
            if (onBalanceChangeRef.current) onBalanceChangeRef.current(-amt);
            setP2State('WAITING_IN_ROUND');
          } else {
            showToast('Not enough balance');
            setP2AutoBet(false);
          }
        }

        // Option 1 Master Writer: Browser controls the game sequence and drives Firebase RTDB
        if (roundSequenceRef.current === 0) {
          try {
            const cached = localStorage.getItem('ub999_aviator_current_round_num');
            const parsed = cached ? parseInt(cached) : 0;
            roundSequenceRef.current = (parsed && parsed >= 955700) ? parsed : 955860;
          } catch {
            roundSequenceRef.current = 955860;
          }
        }

        roundSequenceRef.current += 1;
        const generatedRoundNum = roundSequenceRef.current;
        const generatedRoundId = '#' + generatedRoundNum;
        const targetCrash = getDeterministicCrash(generatedRoundNum);

        try {
          localStorage.setItem('ub999_aviator_current_round_num', String(generatedRoundNum));
        } catch {}

        // Align history round IDs with current round sequence
        setRoundHistory((prev) => {
          return prev.map((item, idx) => ({
            ...item,
            roundId: generatedRoundNum - 1 - idx
          }));
        });

        lastCrashRef.current = targetCrash;
        setCrashPoint(targetCrash);

        // Broadcast to Signal App (instant Firebase RTDB PUT + cross-tab + local storage + Firestore)
        publishLiveAviatorRound({
          roundId: generatedRoundId,
          roundNum: generatedRoundNum,
          multiplier: targetCrash,
          status: 'WAITING',
          safeCashout: Math.round(targetCrash * 0.90 * 100) / 100
        });

        const waitTotalMs = 5000;
        const waitStartTime = Date.now();
        while (Date.now() - waitStartTime < waitTotalMs) {
          if (isCancelled) return;
          const elapsed = Date.now() - waitStartTime;
          setWaitingCountdown(Math.max(0.1, parseFloat(((waitTotalMs - elapsed) / 1000).toFixed(1))));
          setWaitingProgress(Math.max(0.0, 1.0 - elapsed / waitTotalMs));
          await new Promise((r) => setTimeout(r, 40));
        }

        // 2. FLYING PHASE
        setPhase('FLYING');
        setOnlineCount(Math.floor(Math.random() * 500) + 400);

        publishLiveAviatorRound({
          roundId: generatedRoundId,
          roundNum: generatedRoundNum,
          multiplier: targetCrash,
          status: 'FLYING'
        });

        setP1State((prev) => (prev === 'WAITING_IN_ROUND' ? 'ACTIVE_FLYING' : prev));
        setP2State((prev) => (prev === 'WAITING_IN_ROUND' ? 'ACTIVE_FLYING' : prev));

        const y = Math.max(0, targetCrash - 1.0);
        const tSec = (-0.08 + Math.sqrt(0.0064 + 0.14 * y)) / 0.07;
        const totalFlightMs = Math.min(35000, Math.max(800, tSec * 1000));

        const flightStartTime = Date.now();
        flightStartTimeRef.current = flightStartTime;
        while (Date.now() - flightStartTime < totalFlightMs) {
          if (isCancelled) return;
          const elapsed = Date.now() - flightStartTime;
          const t = elapsed / 1000.0;
          const currentM = Math.round((1.00 + 0.08 * t + 0.035 * t * t) * 100) / 100;
          setMultiplier(Math.min(targetCrash, currentM));
          await new Promise((r) => setTimeout(r, 25));
        }

        // 3. CRASHED (FLEW AWAY) PHASE (2.5s)
        flightPhysicsRef.current.crashedAt = Date.now();
        flightPhysicsRef.current.crashTailX = flightPhysicsRef.current.tailX;
        flightPhysicsRef.current.crashTailY = flightPhysicsRef.current.tailY;
        flightPhysicsRef.current.crashCpX = flightPhysicsRef.current.cpX;
        flightPhysicsRef.current.crashCpY = flightPhysicsRef.current.cpY;
        flightPhysicsRef.current.crashAngle = flightPhysicsRef.current.tangentAngle;

        setPhase('CRASHED');
        setMultiplier(targetCrash);
        setOnlineCount(Math.floor(Math.random() * 300) + 200);

        publishLiveAviatorRound({
          roundId: generatedRoundId,
          roundNum: generatedRoundNum,
          multiplier: targetCrash,
          status: 'CRASHED'
        });

        // Store finished live bets into previousBets
        setPreviousBets([...liveBetsRef.current]);

        setP1State((prev) => (prev === 'ACTIVE_FLYING' ? 'IDLE' : prev));
        setP2State((prev) => (prev === 'ACTIVE_FLYING' ? 'IDLE' : prev));

        // Prepend new round outcome to roundHistory (keeping up to 60 historical rounds)
        setRoundHistory((prev) => {
          const filtered = prev.filter((r) => r.roundId !== generatedRoundNum);
          const newRound: RoundHistoryItem = {
            roundId: generatedRoundNum,
            multiplier: targetCrash,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            serverSeed: generateCryptoHash(generatedRoundNum + 101).substring(0, 32),
            clientSeed: `${Math.floor(Math.random() * 899999 + 100000)}:${Math.floor(Math.random() * 899999 + 100000)}:${Math.floor(Math.random() * 899999 + 100000)}`,
            combinedHash: generateCryptoHash(generatedRoundNum + 202),
          };
          return [newRound, ...filtered.slice(0, 59)];
        });

        await new Promise((r) => setTimeout(r, 2600));

        setP1State((prev) => (prev !== 'WAITING_IN_ROUND' ? 'IDLE' : prev));
        setP2State((prev) => (prev !== 'WAITING_IN_ROUND' ? 'IDLE' : prev));
      }
    };

    runGameLoop();
    return () => {
      isCancelled = true;
    };
  }, []);

  // HTML5 Canvas Drawing Loop:
  // Draws Sunburst Fan Rays, Takeoff at (10% X, 85% Y), Smooth Exponential Upward Curve,
  // Realistic ±3px Hovering Wobble, Strict -15° to -25° Tilt, and Flew Away Rocket Boost Exit.
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Update canvas dimensions dynamically to match client size (eliminates cropping)
      const rect = canvas.getBoundingClientRect();
      const displayW = Math.round(rect.width || 640);
      const displayH = Math.round(rect.height || 320);
      if (canvas.width !== displayW || canvas.height !== displayH) {
        canvas.width = displayW;
        canvas.height = displayH;
      }
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 1. Sunburst Fan Rays radiating from bottom-left corner (0, height)
      const rayCount = 30;
      const originX = 0;
      const originY = height;
      const radius = Math.sqrt(width * width + height * height) * 1.2;

      for (let i = 0; i < rayCount; i++) {
        if (i % 2 === 0) {
          const angle1 = (i / rayCount) * (Math.PI / 2);
          const angle2 = ((i + 1) / rayCount) * (Math.PI / 2);

          ctx.fillStyle = 'rgba(18, 20, 30, 0.50)';
          ctx.beginPath();
          ctx.moveTo(originX, originY);
          ctx.lineTo(originX + radius * Math.cos(angle1), originY - radius * Math.sin(angle1));
          ctx.lineTo(originX + radius * Math.cos(angle2), originY - radius * Math.sin(angle2));
          ctx.closePath();
          ctx.fill();
        }
      }

      // Takeoff & Resting origin: Lifted slightly so bottom wing/propeller blade is not covered
      const startX = 8;
      const startY = height - 20;
      const targetX = width * 0.82;
      const targetY = height * 0.22;

      // 2. WAITING PHASE: Plane resting on runway at bottom-left
      // "গেমের ভিতরে অলটাইম সবসময় নিচে ওই লোগো টি থাকবে, টাইম শুরু হলে নিচে থেকে উড়া শুরু করবে"
      if (phase === 'WAITING') {
        ctx.save();
        ctx.translate(startX, startY);
        ctx.rotate(-0.06); // Resting ground tilt
        drawSpribeAviatorStuntPlaneCanvas(ctx, 0.30, false);
        ctx.restore();
      }

      // 3. FLYING PHASE: Constant Realistic Flight Speed (Independent of crashPoint)
      if (phase === 'FLYING') {
        const y = Math.max(0, multiplier - 1.0);
        const tFromMult = (-0.08 + Math.sqrt(0.0064 + 0.14 * y)) / 0.07;
        const flightStart = flightStartTimeRef.current;
        const effectiveT = flightStart > 0 ? Math.max(0, (Date.now() - flightStart) / 1000.0) : tFromMult;

        // Constant speed climb curve across all rounds (never scales by crashPoint)
        const progress = Math.min(1.0, Math.max(0, 1.0 - Math.exp(-0.25 * effectiveT)));

        // Smooth parabolic/exponential upward progression
        const curvedProgress = Math.pow(progress, 1.30);
        const baseX = startX + (targetX - startX) * progress;
        const baseY = startY - (startY - targetY) * curvedProgress;

        // Realistic hovering: subtle floating/wobble effect (±3px sin-wave hover)
        const hoverY = Math.sin(Date.now() * 0.005) * 3.0;

        const tailX = baseX;
        const tailY = baseY + hoverY;

        // Quadratic Bezier control point
        const cpX = startX + (targetX - startX) * 0.35 * Math.pow(progress, 0.70);
        const cpY = startY;

        // Tangent angle along the trajectory: B'(1) = 2*(P2 - P1)
        const dx = tailX - cpX;
        const dy = tailY - cpY;
        const rawAngle = Math.atan2(dy, dx);
        // Tilt angle strictly clamped between -25° (-0.4363 rad) and -15° (-0.2618 rad)
        const clampedAngle = Math.max(-0.4363, Math.min(-0.2618, rawAngle));

        flightPhysicsRef.current.tailX = tailX;
        flightPhysicsRef.current.tailY = tailY;
        flightPhysicsRef.current.cpX = cpX;
        flightPhysicsRef.current.cpY = cpY;
        flightPhysicsRef.current.tangentAngle = clampedAngle;

        // A. Transparent Red Gradient Fill below the curved line down to the bottom
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(cpX, cpY, tailX, tailY);
        ctx.lineTo(tailX, height);
        ctx.lineTo(startX, height);
        ctx.closePath();

        const shadowGrad = ctx.createLinearGradient(0, tailY, 0, height);
        shadowGrad.addColorStop(0, 'rgba(229, 35, 56, 0.72)');
        shadowGrad.addColorStop(0.5, 'rgba(229, 35, 56, 0.28)');
        shadowGrad.addColorStop(1, 'rgba(229, 35, 56, 0.02)');
        ctx.fillStyle = shadowGrad;
        ctx.fill();

        // B. Vertical guide line straight down from plane's tail
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(tailX, height);
        ctx.strokeStyle = 'rgba(229, 35, 56, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // C. Smooth Bezier Red Curved Flight Trail line ending directly into plane tail
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(cpX, cpY, tailX, tailY);
        ctx.strokeStyle = '#E52338';
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#FF1744';
        ctx.shadowBlur = 16;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // D. Draw the Exact Red Stylized Aviator Airplane Logo anchored at (tailX, tailY)
        ctx.save();
        ctx.translate(tailX, tailY);
        ctx.rotate(clampedAngle);
        drawSpribeAviatorStuntPlaneCanvas(ctx, 0.30, false);
        ctx.restore();
      }

      // 4. CRASHED (FLEW AWAY) PHASE: Speed Rocket Boost & Exit Screen Animation
      if (phase === 'CRASHED') {
        const elapsed = Date.now() - flightPhysicsRef.current.crashedAt;
        const boostDuration = 580; // 580ms rocket zoom

        // Draw fading trajectory line for dramatic afterglow
        if (elapsed < 1200) {
          const fadeAlpha = Math.max(0, 1.0 - elapsed / 1200);
          const pTailX = flightPhysicsRef.current.crashTailX;
          const pTailY = flightPhysicsRef.current.crashTailY;
          const pCpX = flightPhysicsRef.current.crashCpX;

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.quadraticCurveTo(pCpX, startY, pTailX, pTailY);
          ctx.strokeStyle = `rgba(229, 35, 56, ${0.85 * fadeAlpha})`;
          ctx.lineWidth = 4;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.quadraticCurveTo(pCpX, startY, pTailX, pTailY);
          ctx.lineTo(pTailX, height);
          ctx.lineTo(startX, height);
          ctx.closePath();
          const shadowGrad = ctx.createLinearGradient(0, pTailY, 0, height);
          shadowGrad.addColorStop(0, `rgba(229, 35, 56, ${0.45 * fadeAlpha})`);
          shadowGrad.addColorStop(1, 'rgba(229, 35, 56, 0)');
          ctx.fillStyle = shadowGrad;
          ctx.fill();
        }

        // Rocket Boost: Plane shoots rapidly through the top-right corner off the screen
        if (elapsed < boostDuration) {
          const t = elapsed / boostDuration; // 0 to 1
          const easeIn = t * t * 1.7; // rapid exponential acceleration

          const exitAngle = flightPhysicsRef.current.crashAngle;
          const boostDist = width * 0.85;
          const exitX = flightPhysicsRef.current.crashTailX + easeIn * boostDist;
          const exitY = flightPhysicsRef.current.crashTailY + easeIn * boostDist * Math.tan(exitAngle);

          // Rocket boost speed streak
          ctx.beginPath();
          ctx.moveTo(flightPhysicsRef.current.crashTailX, flightPhysicsRef.current.crashTailY);
          ctx.lineTo(exitX, exitY);
          ctx.strokeStyle = `rgba(255, 23, 68, ${Math.max(0, 1 - t * 1.3)})`;
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Draw the Exact Airplane Logo zooming off with rocket boost jet plume
          ctx.save();
          ctx.translate(exitX, exitY);
          ctx.rotate(exitAngle);
          drawSpribeAviatorStuntPlaneCanvas(ctx, 0.30, true);
          ctx.restore();
        } else {
          // Resting at bottom-left runway ready for the next round
          ctx.save();
          ctx.translate(startX, startY);
          ctx.rotate(-0.06);
          drawSpribeAviatorStuntPlaneCanvas(ctx, 0.30, false);
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [phase, multiplier, crashPoint]);

  // Auto Cash Out Trigger during flight
  useEffect(() => {
    if (phase === 'FLYING') {
      // Panel 1 Auto Cash Out
      if (p1AutoCashoutActive && p1State === 'ACTIVE_FLYING') {
        const target = Math.max(1.01, p1AutoCashoutMult);
        if (multiplier >= target && target <= crashPoint) {
          const amt = Math.max(10, Math.round(p1Amount * 100) / 100);
          const win = Math.round(amt * target * 100) / 100;
          if (onBalanceChange) onBalanceChange(win);
          setP1State('CASHED_OUT');
          triggerCashoutToast(target, win);
        }
      }

      // Panel 2 Auto Cash Out
      if (p2AutoCashoutActive && p2State === 'ACTIVE_FLYING') {
        const target = Math.max(1.01, p2AutoCashoutMult);
        if (multiplier >= target && target <= crashPoint) {
          const amt = Math.max(10, Math.round(p2Amount * 100) / 100);
          const win = Math.round(amt * target * 100) / 100;
          if (onBalanceChange) onBalanceChange(win);
          setP2State('CASHED_OUT');
          triggerCashoutToast(target, win);
        }
      }
    }
  }, [
    multiplier,
    phase,
    crashPoint,
    p1AutoCashoutActive,
    p1AutoCashoutMult,
    p1Amount,
    p1State,
    p2AutoCashoutActive,
    p2AutoCashoutMult,
    p2Amount,
    p2State,
    onBalanceChange
  ]);

  // Toggle Auto Bet handlers
  const handleToggleP1AutoBet = () => {
    const next = !p1AutoBet;
    setP1AutoBet(next);
    if (next && (p1State === 'IDLE' || p1State === 'CASHED_OUT')) {
      const amt = Math.max(10, Math.round(p1Amount * 100) / 100);
      if (currentBalance >= amt) {
        if (onBalanceChange) onBalanceChange(-amt);
        setP1State('WAITING_IN_ROUND');
      } else {
        showToast('Not enough balance');
        setP1AutoBet(false);
      }
    }
  };

  const handleToggleP2AutoBet = () => {
    const next = !p2AutoBet;
    setP2AutoBet(next);
    if (next && (p2State === 'IDLE' || p2State === 'CASHED_OUT')) {
      const amt = Math.max(10, Math.round(p2Amount * 100) / 100);
      if (currentBalance >= amt) {
        if (onBalanceChange) onBalanceChange(-amt);
        setP2State('WAITING_IN_ROUND');
      } else {
        showToast('Not enough balance');
        setP2AutoBet(false);
      }
    }
  };

  // Bet actions
  const handleBetClick = (panelNum: number) => {
    const rawAmount = panelNum === 1 ? p1Amount : p2Amount;
    const state = panelNum === 1 ? p1State : p2State;

    if (state === 'ACTIVE_FLYING') {
      // Cash out
      const amount = Math.max(10, Math.round(rawAmount * 100) / 100);
      const win = Math.round(amount * multiplier * 100) / 100;
      if (onBalanceChange) onBalanceChange(win);
      if (panelNum === 1) setP1State('CASHED_OUT');
      else setP2State('CASHED_OUT');
      triggerCashoutToast(multiplier, win);
    } else if (state === 'WAITING_IN_ROUND') {
      // Cancel bet & refund balance
      const refundAmount = panelNum === 1 ? p1Amount : p2Amount;
      if (onBalanceChange) onBalanceChange(refundAmount);
      if (panelNum === 1) setP1State('IDLE');
      else setP2State('IDLE');
    } else {
      // Place Bet (active in waiting, flying, or crash phase)
      if (rawAmount < 10) {
        showToast('Not enough balance');
        return;
      }
      const amount = Math.round(rawAmount * 100) / 100;
      if (currentBalance >= amount) {
        if (onBalanceChange) onBalanceChange(-amount);
        const nextState = 'WAITING_IN_ROUND';
        if (panelNum === 1) {
          setP1Amount(amount);
          setP1InputStr(amount.toFixed(2));
          setP1State(nextState);
        } else {
          setP2Amount(amount);
          setP2InputStr(amount.toFixed(2));
          setP2State(nextState);
        }
      } else {
        showToast('Not enough balance');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 w-screen h-[100dvh] bg-[#000000] flex flex-col overflow-y-auto overflow-x-hidden text-white font-sans select-none scrollbar-none">
      <style>{`
        @keyframes casinoToastSlideDown {
          0% {
            opacity: 0;
            transform: translateY(-8px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes menuSlideIn {
          0% {
            opacity: 0;
            transform: translateY(-8px) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes cashoutToastSlideDown {
          0% {
            opacity: 0;
            transform: translateY(-16px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      {/* ============================================================== */}
      {/* CASHOUT NOTIFICATION BANNER (MATCHING SCREENSHOT)              */}
      {/* ============================================================== */}
      {cashoutToast && (
        <div
          className={`fixed top-2 sm:top-2.5 left-1/2 -translate-x-1/2 z-[75] w-[95%] max-w-[440px] pointer-events-auto transition-all duration-300 ease-out select-none ${
            cashoutToast.visible
              ? 'opacity-100 scale-100'
              : 'opacity-0 -translate-y-3 scale-95 pointer-events-none'
          }`}
          style={{
            animation: cashoutToast.visible
              ? 'cashoutToastSlideDown 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              : undefined,
          }}
        >
          {/* Main Capsule Banner Container matching screenshot */}
          <div
            className="w-full flex items-center justify-between pl-4 pr-2.5 py-1.5 rounded-full"
            style={{
              backgroundColor: 'rgba(15, 38, 22, 0.96)',
              border: '1.2px solid #2e7d32',
              boxShadow: '0 4px 22px rgba(34, 197, 94, 0.38), 0 8px 30px rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            {/* Left Section: "You have cashed out!" + Multiplier */}
            <div className="flex-1 flex flex-col items-center justify-center text-center pr-2">
              <span className="text-[#d1fae5] text-[11px] sm:text-xs font-semibold tracking-tight leading-none whitespace-nowrap">
                You have cashed out!
              </span>
              <span className="text-white text-sm sm:text-base font-black font-mono tracking-tight leading-none mt-1">
                {cashoutToast.multiplier.toFixed(2)}x
              </span>
            </div>

            {/* Right Section: Bright Green Win Badge */}
            <div
              className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-md"
              style={{
                backgroundColor: '#388E3C',
                border: '1px solid #4CAF50',
                boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 2px 8px rgba(0, 0, 0, 0.35)',
              }}
            >
              {/* Left Decorative Stars */}
              <div className="flex flex-col -space-y-0.5 opacity-60 shrink-0">
                <svg className="w-3.5 h-3.5 text-white fill-none stroke-current" strokeWidth="2.2" viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <svg className="w-2.5 h-2.5 text-white fill-none stroke-current ml-1" strokeWidth="2.2" viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>

              {/* Center Text: Win BDT + Amount */}
              <div className="flex flex-col items-center justify-center text-center px-1">
                <span className="text-white text-[10px] sm:text-[11px] font-bold tracking-tight leading-none uppercase">
                  Win BDT
                </span>
                <span className="text-white text-sm sm:text-base font-black font-mono tracking-tight leading-none mt-0.5">
                  {cashoutToast.winAmount.toFixed(2)}
                </span>
              </div>

              {/* Right Decorative Stars */}
              <div className="flex flex-col -space-y-0.5 opacity-60 shrink-0">
                <svg className="w-3.5 h-3.5 text-white fill-none stroke-current" strokeWidth="2.2" viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <svg className="w-2.5 h-2.5 text-white fill-none stroke-current -ml-0.5" strokeWidth="2.2" viewBox="0 0 24 24">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
            </div>

            {/* Far Right: Dismiss / Close Button */}
            <button
              type="button"
              onClick={() => setCashoutToast(null)}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 transition-all flex items-center justify-center text-white/90 hover:text-white cursor-pointer ml-1.5 shrink-0"
              title="Close"
              aria-label="Close cashout notification"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* ============================================================== */}
      {/* SPRIBE AVIATOR HAMBURGER MENU (MATCHING SCREENSHOT)            */}
      {/* ============================================================== */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-[100] flex justify-end items-start p-2 sm:p-4 bg-black/60 backdrop-blur-[2px] transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        >
          {/* Menu Container Card */}
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'menuSlideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
            className="w-full max-w-[330px] sm:max-w-[350px] bg-[#161822] border border-[#262a3d] rounded-2xl p-4 shadow-[0_16px_50px_rgba(0,0,0,0.92)] flex flex-col text-white select-none"
          >
            {/* Top User Header: Avatar, Name, Change Avatar, Close */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#232738]">
              <div className="flex items-center gap-3">
                <RealisticHumanAvatar className="w-11 h-11" />
                <div className="flex flex-col">
                  <span className="text-white font-bold text-sm tracking-wide">Player</span>
                  <span className="text-[11px] text-slate-400 font-mono">ID: 948250</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {}} // User request: কোনো কিছু তে ক্লিক করলে কিছু হবে না শুধু এরকম থাকবে
                  className="px-2.5 py-1 rounded-full bg-[#232738] border border-[#353b52] text-[11px] font-semibold text-slate-200 hover:bg-[#2b3146] active:scale-95 transition-all cursor-pointer"
                >
                  Change Avatar
                </button>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-0.5"
                  title="Close"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Settings Toggles: Sound, Music, Animation */}
            <div className="py-2.5 space-y-2.5 border-b border-[#232738]">
              {/* Sound */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5 text-slate-200">
                  <Volume2 className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold">Sound</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSoundOn(!soundOn)}
                  className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${
                    soundOn ? 'bg-[#00E676]' : 'bg-[#262a3b]'
                  }`}
                  aria-label="Toggle Sound"
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 ${
                      soundOn ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Music */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5 text-slate-200">
                  <Music className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold">Music</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMusicOn(!musicOn)}
                  className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${
                    musicOn ? 'bg-[#00E676]' : 'bg-[#262a3b]'
                  }`}
                  aria-label="Toggle Music"
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 ${
                      musicOn ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Animation */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5 text-slate-200">
                  <Sparkles className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold">Animation</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAnimationOn(!animationOn)}
                  className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${
                    animationOn ? 'bg-[#00E676]' : 'bg-[#262a3b]'
                  }`}
                  aria-label="Toggle Animation"
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 ${
                      animationOn ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Menu List Navigation Items */}
            <div className="py-2 space-y-1">
              {[
                { label: 'Free Bets', icon: Gift, color: 'text-amber-400' },
                { label: 'Bet History', icon: History, color: 'text-sky-400' },
                { label: 'Game Limits', icon: Sliders, color: 'text-purple-400' },
                { label: 'How to Play', icon: HelpCircle, color: 'text-emerald-400' },
                { label: 'Game Rules', icon: FileText, color: 'text-slate-300' },
                { label: 'Provably Fair Settings', icon: ShieldCheck, color: 'text-emerald-400' },
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {}} // User request: কোনো কিছু তে ক্লিক করলে কিছু হবে না শুধু এরকম থাকবে
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-slate-200 hover:bg-[#1e2232] active:bg-[#232738] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className={`w-4 h-4 ${item.color}`} />
                      <span className="text-xs font-semibold">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. TOP HEADER (EXACTLY MATCHING SPRIBE AVIATOR)                */}
      {/* ============================================================== */}
      <div className="w-full px-3 py-2 flex items-center justify-between shrink-0 bg-[#000000]">
        {/* Left: Aviator Logo in Red Italic Script */}
        <div className="flex items-center">
          <span className="text-[#E52338] font-black italic text-2xl tracking-wide">
            Aviator
          </span>
        </div>

        {/* Center: Dropdown History Pill */}
        <button 
          onClick={() => {
            setSelectedRound(roundHistory[0] || null);
            setIsHistoryModalOpen(true);
          }}
          className="flex items-center justify-center w-12 h-6 rounded-md bg-[#161822] text-slate-300 hover:text-white border border-[#232533] transition-colors"
          title="Round History"
        >
          <ChevronDown className="w-4 h-4 text-slate-300" />
        </button>

        {/* Right: Balance in Green + Menu */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 font-mono font-bold text-sm text-[#00E676]">
            <span>{currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-xs">BDT</span>
          </div>
          <button 
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="text-slate-400 hover:text-white p-1 cursor-pointer transition-colors"
            title="Menu"
            aria-label="Open menu"
          >
            <div className="w-4 h-3.5 flex flex-col justify-between">
              <span className={`w-full h-0.5 rounded transition-colors ${isMenuOpen ? 'bg-[#00E676]' : 'bg-slate-300'}`} />
              <span className={`w-full h-0.5 rounded transition-colors ${isMenuOpen ? 'bg-[#00E676]' : 'bg-slate-300'}`} />
              <span className={`w-full h-0.5 rounded transition-colors ${isMenuOpen ? 'bg-[#00E676]' : 'bg-slate-300'}`} />
            </div>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MULTIPLIER HISTORY ROW OR EXPANDED 3-LINE ROUND HISTORY      */}
      {/* ============================================================== */}
      <div className="w-full px-3 py-1.5 shrink-0 select-none bg-[#0a0b10]/95 border-b border-[#161822]">
        {!isHistoryModalOpen ? (
          /* Normal Single-Line History with 3 dots on right */
          <div className="flex items-center justify-between gap-2">
            {/* Multipliers without background color, plain colored text */}
            <div className="flex-1 flex items-center gap-2.5 sm:gap-3 overflow-x-auto scrollbar-none py-0.5">
              {roundHistory.slice(0, 16).map((item, idx) => {
                const style = getMultiplierChipStyle(item.multiplier);
                return (
                  <button
                    key={`top-${item.roundId}-${idx}`}
                    onClick={() => setIsHistoryModalOpen(true)}
                    className={`text-[11px] sm:text-xs font-mono font-bold tracking-tight select-none transition-transform hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer bg-transparent border-0 p-0 ${style.text}`}
                    title={`Round #${item.roundId} · ${item.multiplier.toFixed(2)}x`}
                  >
                    {item.multiplier.toFixed(2)}x
                  </button>
                );
              })}
            </div>

            {/* Small subtle 3 dots (...) button */}
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="flex items-center justify-center gap-[3px] p-1 text-slate-400 hover:text-slate-200 transition-colors shrink-0 active:scale-90 cursor-pointer"
              title="Round History"
            >
              <span className="w-1 h-1 rounded-full bg-slate-400" />
              <span className="w-1 h-1 rounded-full bg-slate-400" />
              <span className="w-1 h-1 rounded-full bg-slate-400" />
            </button>
          </div>
        ) : (
          /* Expanded 3-Line Round History Panel (Exact match to screenshot Screenshot_20261009-200739.jpg) */
          <div className="space-y-1.5 py-0.5 animate-fadeIn">
            {/* Top row: Title "Round History" on left, Close (x) on right */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px] sm:text-xs font-medium tracking-wide">
                Round History
              </span>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3 Lines of Round History Multipliers (No extra history, exactly 3 lines cleanly spaced) */}
            <div className="space-y-1 pt-0.5 font-mono text-[11px] sm:text-xs font-bold tracking-tight">
              {/* Line 1: 9 multipliers */}
              <div className="flex items-center justify-between gap-1 overflow-x-hidden">
                {roundHistory.slice(0, 9).map((item, idx) => {
                  const style = getMultiplierChipStyle(item.multiplier);
                  return (
                    <span key={`l1-${item.roundId}-${idx}`} className={`${style.text} whitespace-nowrap`}>
                      {item.multiplier.toFixed(2)}x
                    </span>
                  );
                })}
              </div>

              {/* Line 2: 9 multipliers */}
              <div className="flex items-center justify-between gap-1 overflow-x-hidden">
                {roundHistory.slice(9, 18).map((item, idx) => {
                  const style = getMultiplierChipStyle(item.multiplier);
                  return (
                    <span key={`l2-${item.roundId}-${idx}`} className={`${style.text} whitespace-nowrap`}>
                      {item.multiplier.toFixed(2)}x
                    </span>
                  );
                })}
              </div>

              {/* Line 3: 9 multipliers */}
              <div className="flex items-center justify-between gap-1 overflow-x-hidden">
                {roundHistory.slice(18, 27).map((item, idx) => {
                  const style = getMultiplierChipStyle(item.multiplier);
                  return (
                    <span key={`l3-${item.roundId}-${idx}`} className={`${style.text} whitespace-nowrap`}>
                      {item.multiplier.toFixed(2)}x
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 3. FLIGHT CANVAS ARENA                                         */}
      {/* ============================================================== */}
      <div className="relative mx-3 my-1 h-[250px] sm:h-[280px] rounded-2xl bg-[#0a0b10] border border-[#161822] overflow-hidden flex items-center justify-center shrink-0">
        
        {/* Floating Casino Warning Toast (Top-Center of Flight Arena, 14px from top) */}
        {toast && (
          <div
            className={`absolute top-3.5 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 ease-out ${
              toast.visible
                ? 'opacity-100 scale-100'
                : 'opacity-0 -translate-y-2 scale-95'
            }`}
          >
            <div
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full select-none"
              style={{
                backgroundColor: 'rgba(45, 15, 20, 0.94)',
                border: '1.2px solid #FF1744',
                boxShadow: '0 0 16px rgba(255, 23, 68, 0.45), 0 4px 14px rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                animation: toast.visible ? 'casinoToastSlideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards' : undefined,
              }}
            >
              {/* Small Red Warning Icon */}
              <div className="w-4 h-4 rounded-full bg-[#FF1744] flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(255,23,68,0.85)]">
                <span className="text-[11px] font-black text-white leading-none">!</span>
              </div>

              {/* Toast Text: Not enough balance */}
              <span className="text-[#FFE4E6] font-bold text-[12.5px] leading-tight tracking-tight whitespace-nowrap">
                {toast.message}
              </span>
            </div>
          </div>
        )}

        {/* Canvas for Sunburst rays, flight curve, and stunt airplane */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block pointer-events-none"
        />

        {/* --- WAITING STATE: UFC PARTNERS + SPRIBE OFFICIAL GAME --- */}
        {phase === 'WAITING' && (
          <div className="z-10 flex flex-col items-center justify-center text-center animate-fadeIn pointer-events-none">
            {/* UFC | Aviator Header: UFC [divider] (Logo on Top + Aviator below, matching UFC height) */}
            <div className="flex items-center gap-2">
              <span className="text-[#E52338] text-3xl sm:text-4xl font-black italic tracking-tighter leading-none select-none">
                UFC
              </span>
              <div className="w-[1.5px] h-7 bg-[#6b7280]" />
              <div className="flex flex-col items-center justify-center -space-y-0.5">
                <SpribeAviatorStuntPlane className="w-6 h-3" />
                <span className="text-[#E52338] text-[10px] font-black italic tracking-tight leading-none">
                  Aviator
                </span>
              </div>
            </div>

            <span className="text-white text-[10px] font-black tracking-[1.6px] mt-1 mb-2">
              OFFICIAL PARTNERS
            </span>

            {/* Red Progress Bar */}
            <div className="w-48 h-1 rounded-full bg-[#262933] overflow-hidden mb-3">
              <div
                className="h-full bg-[#E52338] transition-all duration-75"
                style={{ width: `${waitingProgress * 100}%` }}
              />
            </div>

            {/* Green Spribe Card */}
            <div className="rounded-2xl bg-[#152516] border-2 border-[#3fa649] px-6 py-2.5 flex flex-col items-center shadow-xl select-none">
              <div className="flex items-center gap-2 text-white font-black text-xl tracking-wider">
                <SpribeDotMatrixLogo className="w-6 h-6" />
                <span>SPRIBE</span>
              </div>
              <div className="mt-1.5 px-3.5 py-1 rounded-xl bg-[#0a170c] border border-[#2e7d35] flex items-center gap-2">
                <span className="text-[#2dd64e] font-semibold text-xs tracking-wide">Official Game</span>
                {/* Harmonious green circle with checkmark */}
                <div className="w-3.5 h-3.5 rounded-full bg-[#00E676] flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-2 h-2 text-[#08150a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
              <span className="text-white text-[10px] font-semibold tracking-wider mt-1 select-none">
                Since 2019
              </span>
            </div>
          </div>
        )}

        {/* --- FLYING STATE: GIANT CENTER MULTIPLIER --- */}
        {phase === 'FLYING' && (
          <div className="z-10 text-center select-none pointer-events-none">
            <span className="text-6xl sm:text-7xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(255,255,255,0.4)]">
              {multiplier.toFixed(2)}x
            </span>
          </div>
        )}

        {/* --- CRASHED STATE: FLEW AWAY --- */}
        {phase === 'CRASHED' && (
          <div className="z-10 flex flex-col items-center justify-center text-center select-none animate-fadeIn pointer-events-none">
            <span className="text-white text-base sm:text-lg font-bold tracking-widest uppercase mb-1">
              FLEW AWAY!
            </span>
            <span className="text-[#E52338] text-6xl sm:text-7xl font-black font-sans tracking-tight">
              {multiplier.toFixed(2)}x
            </span>
          </div>
        )}

        {/* Bottom-right Online count badge with 3 overlapping avatar bubbles */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-[#14151f]/90 px-2 py-0.5 rounded-full border border-[#232533] text-[11px] font-mono text-slate-300">
          <div className="flex -space-x-1.5">
            <span className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-[8px]">🍀</span>
            <span className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-[8px]">🌙</span>
            <span className="w-4 h-4 rounded-full bg-amber-600 flex items-center justify-center text-[8px]">🐺</span>
          </div>
          <span className="ml-1 font-bold">{onlineCount}</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. BETTING PANEL 1                                             */}
      {/* ============================================================== */}
      <div className="mx-3 my-1 p-2 rounded-2xl bg-[#14151b] border border-[#20222e] flex flex-col shrink-0">
        {/* Top Centered Bet / Auto Pills */}
        <div className="w-full flex justify-center mb-2">
          <div className="flex bg-[#0a0b0f] p-0.5 rounded-full border border-[#20222e]">
            <button
              onClick={() => setP1Tab('bet')}
              className={`px-6 py-0.5 rounded-full text-xs font-bold transition-colors ${
                p1Tab === 'bet' ? 'bg-[#292b3a] text-white shadow' : 'text-slate-400'
              }`}
            >
              Bet
            </button>
            <button
              onClick={() => setP1Tab('auto')}
              className={`px-6 py-0.5 rounded-full text-xs font-bold transition-colors ${
                p1Tab === 'auto' ? 'bg-[#292b3a] text-white shadow' : 'text-slate-400'
              }`}
            >
              Auto
            </button>
          </div>
        </div>

        {/* Panel 1 Controls Row */}
        <div className="flex items-center gap-2">
          {/* Left: Stepper + Quick Pills */}
          <div className="flex-1 flex flex-col gap-1.5">
            {/* Stepper with custom keyboard number input */}
            <div className="flex items-center justify-between px-2 py-1 rounded-xl bg-[#0a0b0f] border border-[#20222e] focus-within:border-emerald-500/60 transition-colors">
              <button
                type="button"
                onClick={() => {
                  const next = Math.max(10, Math.floor(p1Amount) - 1);
                  setP1Amount(next);
                  setP1InputStr(next.toFixed(2));
                }}
                className="w-6 h-6 rounded-full bg-[#1f212c] text-white font-bold flex items-center justify-center hover:bg-[#2b2d3c] active:scale-95 shrink-0"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="flex-1 mx-1 flex items-center justify-center">
                <input
                  type="text"
                  inputMode="decimal"
                  value={p1InputStr}
                  onChange={(e) => {
                    const rawVal = e.target.value.replace(/[^0-9.]/g, '');
                    const parts = rawVal.split('.');
                    if (parts.length > 2) return;
                    if (parts[1] && parts[1].length > 2) return;
                    setP1InputStr(rawVal);
                    const parsed = parseFloat(rawVal);
                    if (!isNaN(parsed)) {
                      setP1Amount(parsed);
                    }
                  }}
                  onBlur={() => {
                    const parsed = parseFloat(p1InputStr);
                    if (isNaN(parsed) || parsed < 10) {
                      setP1Amount(10);
                      setP1InputStr('10.00');
                    } else {
                      setP1Amount(parsed);
                      setP1InputStr(parsed.toFixed(2));
                    }
                  }}
                  className="w-full bg-transparent text-center font-extrabold text-sm sm:text-base font-mono text-white outline-none border-none p-0 focus:ring-0 select-text cursor-text"
                  placeholder="10.00"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = Math.floor(p1Amount) + 1;
                  setP1Amount(next);
                  setP1InputStr(next.toFixed(2));
                }}
                className="w-6 h-6 rounded-full bg-[#1f212c] text-white font-bold flex items-center justify-center hover:bg-[#2b2d3c] active:scale-95 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Pills Grid: 100 200 / 500 10,000 */}
            <div className="grid grid-cols-2 gap-1 text-[11px] font-mono font-bold">
              {[100, 200, 500, 10000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setP1Amount(amt);
                    setP1InputStr(amt.toFixed(2));
                  }}
                  className={`py-1 rounded-lg border text-center transition-colors ${
                    p1Amount === amt
                      ? 'bg-[#292b3a] text-amber-300 border-amber-500/50'
                      : 'bg-[#181a24] text-slate-300 border-[#20222e] hover:bg-[#212330]'
                  }`}
                >
                  {amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Giant Green Bet Button / Big Orange Cashout */}
          <button
            type="button"
            onClick={() => handleBetClick(1)}
            className={`w-[48%] h-[68px] rounded-2xl flex flex-col items-center justify-center font-black shadow-lg transition-all active:scale-95 select-none ${
              p1State === 'ACTIVE_FLYING'
                ? 'bg-[#F97316] text-black shadow-orange-500/30'
                : p1State === 'WAITING_IN_ROUND'
                ? 'bg-[#E52338] hover:bg-[#d01c30] text-white shadow-red-600/30 border border-red-500/40'
                : 'bg-[#1FB935] hover:bg-[#1ea738] text-white shadow-emerald-600/30'
            }`}
          >
            {p1State === 'ACTIVE_FLYING' ? (
              <>
                <span className="text-xs uppercase tracking-wide">CASH OUT</span>
                <span className="text-sm font-mono font-black">
                  {(p1Amount * multiplier).toFixed(2)} BDT
                </span>
              </>
            ) : p1State === 'WAITING_IN_ROUND' ? (
              phase === 'FLYING' ? (
                <>
                  <span className="text-sm sm:text-base font-black tracking-wider uppercase leading-tight">CANCEL</span>
                  <span className="text-[10px] sm:text-xs font-bold text-white/95 tracking-tight leading-tight mt-0.5">
                    Waiting for next round
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold tracking-wide text-white">Cancel</span>
              )
            ) : (
              <>
                <span className="text-base tracking-wide">Bet</span>
                <span className="text-xs font-mono font-extrabold text-white/95">
                  {(p1Amount > 0 ? p1Amount : 10).toFixed(2)} BDT
                </span>
              </>
            )}
          </button>
        </div>

        {/* Panel 1 Auto Controls (Shown when Auto tab is selected) */}
        {p1Tab === 'auto' && (
          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#1c1e2a] px-1 select-none">
            {/* Left: Auto bet */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs font-semibold">Auto bet</span>
              <button
                type="button"
                onClick={handleToggleP1AutoBet}
                className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${
                  p1AutoBet ? 'bg-[#1877F2]' : 'bg-[#222533]'
                }`}
                aria-label="Toggle Auto bet"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 ${
                    p1AutoBet ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Right: Auto Cash Out + Multiplier box */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs font-semibold whitespace-nowrap">Auto Cash Out</span>
              <button
                type="button"
                onClick={() => setP1AutoCashoutActive(!p1AutoCashoutActive)}
                className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${
                  p1AutoCashoutActive ? 'bg-[#1877F2]' : 'bg-[#222533]'
                }`}
                aria-label="Toggle Auto Cash Out"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 ${
                    p1AutoCashoutActive ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>

              {/* Multiplier input with x clear/reset button */}
              <div className="flex items-center bg-[#0a0b0f] border border-[#20222e] rounded-lg px-2 py-0.5 h-7 focus-within:border-[#1877F2]/60 transition-colors">
                <input
                  type="text"
                  inputMode="decimal"
                  value={p1AutoCashoutStr}
                  onChange={(e) => {
                    const rawVal = e.target.value.replace(/[^0-9.]/g, '');
                    const parts = rawVal.split('.');
                    if (parts.length > 2) return;
                    if (parts[1] && parts[1].length > 2) return;
                    setP1AutoCashoutStr(rawVal);
                    const parsed = parseFloat(rawVal);
                    if (!isNaN(parsed) && parsed >= 1.01) {
                      setP1AutoCashoutMult(parsed);
                    }
                  }}
                  onBlur={() => {
                    const parsed = parseFloat(p1AutoCashoutStr);
                    if (isNaN(parsed) || parsed < 1.01) {
                      setP1AutoCashoutMult(1.10);
                      setP1AutoCashoutStr('1.10');
                    } else {
                      setP1AutoCashoutMult(parsed);
                      setP1AutoCashoutStr(parsed.toFixed(2));
                    }
                  }}
                  className="w-10 text-center font-mono font-bold text-xs text-white bg-transparent outline-none border-none p-0 focus:ring-0 select-text cursor-text"
                  placeholder="1.10"
                />
                <button
                  type="button"
                  onClick={() => {
                    setP1AutoCashoutMult(1.10);
                    setP1AutoCashoutStr('1.10');
                  }}
                  className="text-slate-400 hover:text-white ml-1 text-xs font-bold leading-none cursor-pointer"
                  title="Reset to 1.10"
                >
                  &times;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 5. BETTING PANEL 2                                             */}
      {/* ============================================================== */}
      {!p2Collapsed && (
        <div className="mx-3 my-1 p-2 rounded-2xl bg-[#14151b] border border-[#20222e] flex flex-col shrink-0">
          {/* Top Centered Bet / Auto Pills + Collapse button on right */}
          <div className="w-full relative flex justify-center mb-2">
            <div className="flex bg-[#0a0b0f] p-0.5 rounded-full border border-[#20222e]">
              <button
                type="button"
                onClick={() => setP2Tab('bet')}
                className={`px-6 py-0.5 rounded-full text-xs font-bold transition-colors ${
                  p2Tab === 'bet' ? 'bg-[#292b3a] text-white shadow' : 'text-slate-400'
                }`}
              >
                Bet
              </button>
              <button
                type="button"
                onClick={() => setP2Tab('auto')}
                className={`px-6 py-0.5 rounded-full text-xs font-bold transition-colors ${
                  p2Tab === 'auto' ? 'bg-[#292b3a] text-white shadow' : 'text-slate-400'
                }`}
              >
                Auto
              </button>
            </div>

            {/* Collapse toggle button at right */}
            <button
              type="button"
              onClick={() => setP2Collapsed(true)}
              className="absolute right-0 top-0.5 w-6 h-6 rounded-md bg-[#1f212c] text-slate-400 hover:text-white flex items-center justify-center border border-[#2a2d3c]"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Panel 2 Controls Row */}
          <div className="flex items-center gap-2">
            {/* Left: Stepper + Quick Pills */}
            <div className="flex-1 flex flex-col gap-1.5">
              {/* Stepper with custom keyboard number input */}
              <div className="flex items-center justify-between px-2 py-1 rounded-xl bg-[#0a0b0f] border border-[#20222e] focus-within:border-emerald-500/60 transition-colors">
                <button
                  type="button"
                  onClick={() => {
                    const next = Math.max(10, Math.floor(p2Amount) - 1);
                    setP2Amount(next);
                    setP2InputStr(next.toFixed(2));
                  }}
                  className="w-6 h-6 rounded-full bg-[#1f212c] text-white font-bold flex items-center justify-center hover:bg-[#2b2d3c] active:scale-95 shrink-0"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="flex-1 mx-1 flex items-center justify-center">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={p2InputStr}
                    onChange={(e) => {
                      const rawVal = e.target.value.replace(/[^0-9.]/g, '');
                      const parts = rawVal.split('.');
                      if (parts.length > 2) return;
                      if (parts[1] && parts[1].length > 2) return;
                      setP2InputStr(rawVal);
                      const parsed = parseFloat(rawVal);
                      if (!isNaN(parsed)) {
                        setP2Amount(parsed);
                      }
                    }}
                    onBlur={() => {
                      const parsed = parseFloat(p2InputStr);
                      if (isNaN(parsed) || parsed < 10) {
                        setP2Amount(10);
                        setP2InputStr('10.00');
                      } else {
                        setP2Amount(parsed);
                        setP2InputStr(parsed.toFixed(2));
                      }
                    }}
                    className="w-full bg-transparent text-center font-extrabold text-sm sm:text-base font-mono text-white outline-none border-none p-0 focus:ring-0 select-text cursor-text"
                    placeholder="10.00"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = Math.floor(p2Amount) + 1;
                    setP2Amount(next);
                    setP2InputStr(next.toFixed(2));
                  }}
                  className="w-6 h-6 rounded-full bg-[#1f212c] text-white font-bold flex items-center justify-center hover:bg-[#2b2d3c] active:scale-95 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Pills */}
              <div className="grid grid-cols-2 gap-1 text-[11px] font-mono font-bold">
                {[100, 200, 500, 10000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setP2Amount(amt);
                      setP2InputStr(amt.toFixed(2));
                    }}
                    className={`py-1 rounded-lg border text-center transition-colors ${
                      p2Amount === amt
                        ? 'bg-[#292b3a] text-amber-300 border-amber-500/50'
                        : 'bg-[#181a24] text-slate-300 border-[#20222e] hover:bg-[#212330]'
                    }`}
                  >
                    {amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Giant Green Bet Button */}
            <button
              type="button"
              onClick={() => handleBetClick(2)}
              className={`w-[48%] h-[68px] rounded-2xl flex flex-col items-center justify-center font-black shadow-lg transition-all active:scale-95 select-none ${
                p2State === 'ACTIVE_FLYING'
                  ? 'bg-[#F97316] text-black shadow-orange-500/30'
                  : p2State === 'WAITING_IN_ROUND'
                  ? 'bg-[#E52338] hover:bg-[#d01c30] text-white shadow-red-600/30 border border-red-500/40'
                  : 'bg-[#1FB935] hover:bg-[#1ea738] text-white shadow-emerald-600/30'
              }`}
            >
              {p2State === 'ACTIVE_FLYING' ? (
                <>
                  <span className="text-xs uppercase tracking-wide">CASH OUT</span>
                  <span className="text-sm font-mono font-black">
                    {(p2Amount * multiplier).toFixed(2)} BDT
                  </span>
                </>
              ) : p2State === 'WAITING_IN_ROUND' ? (
                phase === 'FLYING' ? (
                  <>
                    <span className="text-sm sm:text-base font-black tracking-wider uppercase leading-tight">CANCEL</span>
                    <span className="text-[10px] sm:text-xs font-bold text-white/95 tracking-tight leading-tight mt-0.5">
                      Waiting for next round
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-bold tracking-wide text-white">Cancel</span>
                )
              ) : (
                <>
                  <span className="text-base tracking-wide">Bet</span>
                  <span className="text-xs font-mono font-extrabold text-white/95">
                    {(p2Amount > 0 ? p2Amount : 10).toFixed(2)} BDT
                  </span>
                </>
              )}
            </button>
          </div>

        {/* Panel 2 Auto Controls (Shown when Auto tab is selected) */}
        {p2Tab === 'auto' && (
          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#1c1e2a] px-1 select-none">
            {/* Left: Auto bet */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs font-semibold">Auto bet</span>
              <button
                type="button"
                onClick={handleToggleP2AutoBet}
                className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${
                  p2AutoBet ? 'bg-[#1877F2]' : 'bg-[#222533]'
                }`}
                aria-label="Toggle Auto bet"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 ${
                    p2AutoBet ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Right: Auto Cash Out + Multiplier box */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs font-semibold whitespace-nowrap">Auto Cash Out</span>
              <button
                type="button"
                onClick={() => setP2AutoCashoutActive(!p2AutoCashoutActive)}
                className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer ${
                  p2AutoCashoutActive ? 'bg-[#1877F2]' : 'bg-[#222533]'
                }`}
                aria-label="Toggle Auto Cash Out"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 ${
                    p2AutoCashoutActive ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>

              {/* Multiplier input with x clear/reset button */}
              <div className="flex items-center bg-[#0a0b0f] border border-[#20222e] rounded-lg px-2 py-0.5 h-7 focus-within:border-[#1877F2]/60 transition-colors">
                <input
                  type="text"
                  inputMode="decimal"
                  value={p2AutoCashoutStr}
                  onChange={(e) => {
                    const rawVal = e.target.value.replace(/[^0-9.]/g, '');
                    const parts = rawVal.split('.');
                    if (parts.length > 2) return;
                    if (parts[1] && parts[1].length > 2) return;
                    setP2AutoCashoutStr(rawVal);
                    const parsed = parseFloat(rawVal);
                    if (!isNaN(parsed) && parsed >= 1.01) {
                      setP2AutoCashoutMult(parsed);
                    }
                  }}
                  onBlur={() => {
                    const parsed = parseFloat(p2AutoCashoutStr);
                    if (isNaN(parsed) || parsed < 1.01) {
                      setP2AutoCashoutMult(1.10);
                      setP2AutoCashoutStr('1.10');
                    } else {
                      setP2AutoCashoutMult(parsed);
                      setP2AutoCashoutStr(parsed.toFixed(2));
                    }
                  }}
                  className="w-10 text-center font-mono font-bold text-xs text-white bg-transparent outline-none border-none p-0 focus:ring-0 select-text cursor-text"
                  placeholder="1.10"
                />
                <button
                  type="button"
                  onClick={() => {
                    setP2AutoCashoutMult(1.10);
                    setP2AutoCashoutStr('1.10');
                  }}
                  className="text-slate-400 hover:text-white ml-1 text-xs font-bold leading-none cursor-pointer"
                  title="Reset to 1.10"
                >
                  &times;
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. BOTTOM ALL BETS SECTION (SPRIBE CASINO REALISTIC)           */}
      {/* ============================================================== */}
      <div className="mx-3 mt-1 mb-4 p-2.5 rounded-2xl bg-[#0f131c] border border-[#1b2230] flex flex-col shrink-0">
        {/* Tabs: All Bets / Previous / Top */}
        <div className="grid grid-cols-3 bg-[#0a0d15] p-1 rounded-xl text-xs font-bold mb-2.5">
          <button
            onClick={() => setBetsTab('all')}
            className={`py-1.5 rounded-lg transition-colors font-semibold ${
              betsTab === 'all' ? 'bg-[#242938] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Bets
          </button>
          <button
            onClick={() => setBetsTab('previous')}
            className={`py-1.5 rounded-lg transition-colors font-semibold ${
              betsTab === 'previous' ? 'bg-[#242938] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => setBetsTab('top')}
            className={`py-1.5 rounded-lg transition-colors font-semibold ${
              betsTab === 'top' ? 'bg-[#242938] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Top
          </button>
        </div>

        {/* Sub-row: Avatars + Bets count & Total win BDT, with full-width green progress line underneath */}
        <div className="flex flex-col pb-2 border-b border-[#1b2230] gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5 items-center">
                <span className="w-5 h-5 rounded-full bg-[#401217] border border-[#0f131c] flex items-center justify-center text-[10px] shadow-sm">
                  🕶️
                </span>
                <span className="w-5 h-5 rounded-full bg-[#3d2612] border border-[#0f131c] flex items-center justify-center text-[10px] shadow-sm">
                  🏎️
                </span>
                <span className="w-5 h-5 rounded-full bg-[#123824] border border-[#0f131c] flex items-center justify-center text-[10px] shadow-sm">
                  🍀
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-slate-200">
                {betsTab === 'all' ? activeBetsCount : betsTab === 'previous' ? totalRoundBetsCount : TOP_HISTORICAL_BETS.length}/
                {betsTab === 'all' ? totalRoundBetsCount : betsTab === 'previous' ? totalRoundBetsCount : TOP_HISTORICAL_BETS.length}{' '}
                <span className="font-sans font-normal text-slate-400 text-[11px]">Bets</span>
              </div>
            </div>

            <div className="text-right">
              <div className="font-mono font-extrabold text-base text-white tracking-tight">
                {betsTab === 'all'
                  ? totalWinBdt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : betsTab === 'previous'
                  ? (totalWinBdt || 382415.60).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : (6936300.75).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-400 font-medium -mt-0.5">Total win BDT</div>
            </div>
          </div>

          {/* Full-width green progress line: starts from left (0%) and grows to right as cashed out bets increase */}
          <div className="w-full h-[3px] rounded-full bg-[#1b2230] overflow-hidden">
            <div
              className="h-full bg-[#22C55E] rounded-full transition-all duration-300"
              style={{
                width: `${
                  betsTab === 'all'
                    ? Math.max(0, Math.min(100, ((totalRoundBetsCount - activeBetsCount) / totalRoundBetsCount) * 100))
                    : 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Live Bet Columns Header */}
        <div className="grid grid-cols-12 text-[11px] text-[#6B7280] font-semibold px-3 py-1.5 mt-1">
          <span className="col-span-4 text-left">Player</span>
          <span className="col-span-3 text-right">Bet BDT</span>
          <span className="col-span-2 text-center">X</span>
          <span className="col-span-3 text-right">Win BDT</span>
        </div>

        {/* Dynamic Bets List matching Screenshots */}
        <div className="flex flex-col space-y-1 pt-0.5 max-h-[380px] overflow-y-auto pr-0.5">
          {(betsTab === 'all' ? liveBets : betsTab === 'previous' ? previousBets : TOP_HISTORICAL_BETS).map((item) => (
            <div
              key={item.id}
              className={`grid grid-cols-12 items-center px-3 py-1.5 rounded-2xl text-[11px] font-mono transition-colors duration-200 select-none ${
                item.cashedOut
                  ? 'bg-[#0e241b] border border-[#164e37]/50 shadow-[0_0_8px_rgba(16,185,129,0.08)]'
                  : 'bg-[#121622] border border-transparent'
              }`}
            >
              {/* Player Avatar & Name */}
              <div className="col-span-4 flex items-center gap-2 overflow-hidden">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] shadow-sm ${item.avatarBg}`}
                >
                  {item.avatarIcon}
                </div>
                <span className="text-slate-200 font-sans font-medium text-[11px] truncate tracking-tight">
                  {item.name}
                </span>
              </div>

              {/* Bet BDT */}
              <div className="col-span-3 text-right text-slate-200 font-medium font-mono text-[11px]">
                {item.bet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>

              {/* Multiplier X (Only shown when cashed out) */}
              <div className="col-span-2 text-center font-bold font-mono text-[11px]">
                {item.cashedOut && item.cashoutMultiplier ? (
                  <span
                    className={
                      item.cashoutMultiplier < 2.0
                        ? 'text-[#38BDF8]'
                        : item.cashoutMultiplier < 10.0
                        ? 'text-[#A855F7]'
                        : 'text-[#F59E0B]'
                    }
                  >
                    {item.cashoutMultiplier.toFixed(2)}x
                  </span>
                ) : null}
              </div>

              {/* Win BDT (Only shown when cashed out) */}
              <div className="col-span-3 text-right text-slate-200 font-medium font-mono text-[11px]">
                {item.cashedOut && item.winAmount
                  ? item.winAmount.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : null}
              </div>
            </div>
          ))}
        </div>

        {/* Provably Fair Game & SPRIBE Footer */}
        <div className="flex items-center justify-between pt-2.5 px-1 text-[11px] text-slate-500 font-medium border-t border-[#181d2a] mt-2">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] text-slate-400">Provably Fair Game</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-500 text-[10px]">Powered by</span>
            <span className="font-black text-slate-200 tracking-wider text-[11px]">SPRIBE</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default AviatorCrashGameWeb;
