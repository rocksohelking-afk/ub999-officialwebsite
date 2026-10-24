import { GameItem, Game } from '../types';

export enum GameCategory {
  ALL = 'all',
  HOT = 'hot',
  CRASH = 'crash',
  SLOTS = 'slots',
  CASINO = 'casino',
  SPORTS = 'sports',
  TABLE = 'table',
  FISHING = 'fishing',
  LOTTERY = 'lottery',
  ARCADE = 'arcade'
}

export const RAW_GAME_LIST: GameItem[] = [
  // ---------------- HOT & POPULAR CRASH / SLOTS ----------------
  { id: "super_ace", titleBn: "সুপার এস (Super Ace)", titleEn: "Super Ace", category: "slots", badge: "HOT", iconEmoji: "🃏", minBet: 10.0, playersCount: 5420, customImageUrl: '/banners/img_super_ace_official.png' },
  { id: "aviator_crash", titleBn: "SPRIBE AVIATOR", titleEn: "SPRIBE AVIATOR", category: "crash", badge: "HOT", iconEmoji: "✈️", minBet: 50.0, playersCount: 9480, customImageUrl: '/banners/img_aviator_official.png' },
  { id: "slot_fortune_gems_3", titleBn: "ফরচুন জেমস ৩", titleEn: "Fortune Gems 3", category: "slots", badge: "HOT", iconEmoji: "💎", minBet: 10.0, playersCount: 4890, customImageUrl: '/banners/img_fortune_gems_3_official.png' },
  { id: "flyx", titleBn: "ফ্লাইএক্স (FlyX)", titleEn: "FlyX Crash", category: "crash", badge: "HOT", iconEmoji: "🚀", minBet: 20.0, playersCount: 3750, customImageUrl: '/banners/img_flyx_microgaming-1.png' },
  { id: "boxing_king", titleBn: "বক্সিং কিং", titleEn: "Boxing King", category: "hot", badge: "HOT", iconEmoji: "🥊", minBet: 10.0, playersCount: 4120, customImageUrl: '/banners/img_boxing_king.png' },
  { id: "wild_bounty", titleBn: "ওয়াইল্ড বাউন্টি শোডাউন", titleEn: "Wild Bounty Showdown", category: "slots", badge: "HOT", iconEmoji: "🤠", minBet: 20.0, playersCount: 4310, customImageUrl: '/banners/img_wild_bounty.png' },

  // ---------------- LIVE CASINO & SHOWS ----------------
  { id: "crazy_time", titleBn: "ক্রেজি টাইম শো", titleEn: "Crazy Time Live Show", category: "casino", badge: "LIVE", iconEmoji: "🎪", minBet: 50.0, playersCount: 6200, customImageUrl: '/banners/img_cray_time.png' },
  { id: "live_playtech", titleBn: "প্লেটেক লাইভ ডিলার / এভোলিউশন", titleEn: "Evolution / Playtech Live", category: "casino", badge: "LIVE", iconEmoji: "💃", minBet: 50.0, playersCount: 3180, customImageUrl: '/banners/img_evolution_gaming.png' },
  { id: "live_w_casino", titleBn: "সেক্সি গেমিং / ডাব্লিউ ক্যাসিনো", titleEn: "Sexy Gaming Live Casino", category: "casino", badge: "LIVE", iconEmoji: "👑", minBet: 50.0, playersCount: 2940, customImageUrl: '/banners/img_sexy_gaming.png' },
  { id: "dragon_tiger", titleBn: "ড্রাগন ভার্সেস টাইগার", titleEn: "Dragon vs Tiger", category: "casino", badge: "LIVE", iconEmoji: "🐉", minBet: 20.0, playersCount: 2310 },
  { id: "teen_patti", titleBn: "তিন পাত্তি রয়েল", titleEn: "Teen Patti Royal", category: "casino", badge: "HOT", iconEmoji: "🃏", minBet: 20.0, playersCount: 1850, customImageUrl: '/banners/img_kingmaker.png' },
  { id: "andar_bahar", titleBn: "আন্দার বাহার লাইভ", titleEn: "Andar Bahar Live", category: "casino", badge: "HOT", iconEmoji: "🎴", minBet: 20.0, playersCount: 2410, customImageUrl: '/banners/img_andar_bahar.png' },
  { id: "via_casino", titleBn: "ভিয়া ক্যাসিনো লাইভ", titleEn: "VIA Casino Live", category: "casino", badge: "LIVE", iconEmoji: "👑", minBet: 50.0, playersCount: 2980, customImageUrl: '/banners/img_viacasino.png' },

  // ---------------- SPORTS & CRICKET BETTING ----------------
  { id: "sports_9wickets", titleBn: "৯উইকেটস ক্রিকেট ব্যাটিং", titleEn: "9Wickets Cricket", category: "sports", badge: "LIVE", iconEmoji: "🏏", minBet: 50.0, playersCount: 4120, customImageUrl: '/banners/img_9wickets.png' },
  { id: "sports_lucky", titleBn: "লাকি স্পোর্টস ক্রিকেট", titleEn: "Lucky Sports Cricket", category: "sports", badge: "LIVE", iconEmoji: "🔴", minBet: 50.0, playersCount: 3620, customImageUrl: '/banners/img_saba.png' },
  { id: "sports_saba", titleBn: "সাবা স্পোর্টস / আরসিবি হর্স", titleEn: "Saba Sports / Horse Racing", category: "sports", badge: "LIVE", iconEmoji: "🧤", minBet: 50.0, playersCount: 2890, customImageUrl: '/banners/img_rcb_horse_racing.png' },
  { id: "cricket_live", titleBn: "বিপিএল ক্রিকেট লাইভ প্রেডিকশন", titleEn: "BPL Cricket Live", category: "sports", badge: "LIVE", iconEmoji: "🏏", minBet: 50.0, playersCount: 4120, customImageUrl: '/banners/img_saba.png' },

  // ---------------- PREMIUM SLOTS & JACKPOT ----------------
  { id: "slot_super_ace_deluxe", titleBn: "সুপার এস ডিলাক্স", titleEn: "Super Ace Deluxe", category: "slots", badge: "HOT", iconEmoji: "🃏", minBet: 10.0, playersCount: 3890, customImageUrl: '/banners/img_suparace_deluxe.png' },
  { id: "slot_treasures_of_aztec", titleBn: "ট্রেজার্স অফ অ্যাজটেক", titleEn: "Treasures of Aztec", category: "slots", badge: "HOT", iconEmoji: "🗿", minBet: 20.0, playersCount: 4510, customImageUrl: '/banners/img_treasuresof_ajtec.png' },
  { id: "fortune_garuda", titleBn: "ফরচুন গারুদা ৫০০", titleEn: "Fortune Garuda 500", category: "slots", badge: "POPULAR", iconEmoji: "🦅", minBet: 20.0, playersCount: 2760, customImageUrl: '/banners/img_fortunegaruda_500.png' },
  { id: "slot_super_elements", titleBn: "সুপার এলিমেন্টস", titleEn: "Super Elements", category: "slots", badge: "HOT", iconEmoji: "🔥", minBet: 10.0, playersCount: 2340, customImageUrl: '/banners/img_super_elements.png' },
  { id: "slot_7up_7down", titleBn: "৭ আপ ৭ ডাউন", titleEn: "7 Up 7 Down", category: "table", badge: "POPULAR", iconEmoji: "🎲", minBet: 10.0, playersCount: 3120, customImageUrl: '/banners/img_7up_7dawn.png' },
  { id: "slot_coin_up", titleBn: "কয়েন আপ", titleEn: "Coin Up", category: "slots", badge: "HOT", iconEmoji: "🪙", minBet: 10.0, playersCount: 2980, customImageUrl: '/banners/img_coin_up.png' },
  { id: "slot_kingmaker", titleBn: "কিংমেকার স্লট", titleEn: "Kingmaker", category: "slots", badge: "POPULAR", iconEmoji: "👑", minBet: 20.0, playersCount: 3650, customImageUrl: '/banners/img_kingmaker.png' },
  { id: "slot_jetx", titleBn: "জেট এক্স ক্র্যাশ", titleEn: "JetX Crash", category: "crash", badge: "HOT", iconEmoji: "🚀", minBet: 20.0, playersCount: 4100, customImageUrl: '/banners/img_jetx.png' },
  { id: "slot_royale_house", titleBn: "রয়েল হাউস", titleEn: "Royale House", category: "slots", badge: "HOT", iconEmoji: "🏰", minBet: 20.0, playersCount: 2870, customImageUrl: '/banners/img_royale_house.png' },
  { id: "slot_dragon_gems", titleBn: "ড্রাগন জেমস", titleEn: "Dragon Gems", category: "slots", badge: "HOT", iconEmoji: "🐉", minBet: 10.0, playersCount: 3950, customImageUrl: '/banners/img_dragongems.png' },
  { id: "slot_triple_chance", titleBn: "ট্রিপল চান্স", titleEn: "Triple Chance", category: "table", badge: "HOT", iconEmoji: "🎰", minBet: 10.0, playersCount: 3120, customImageUrl: '/banners/img_jriple_chance.png' },
  { id: "mighty_sevens", titleBn: "মাইটি সেভেন্স ৭৭৭", titleEn: "Mighty Sevens 777", category: "slots", badge: "JACKPOT", iconEmoji: "🎰", minBet: 10.0, playersCount: 5210 },
  { id: "slot_anubis_wrath", titleBn: "আনুবিস রথ স্লট", titleEn: "Anubis Wrath", category: "slots", badge: "JACKPOT", iconEmoji: "🏺", minBet: 20.0, playersCount: 3450 },
  { id: "slot_777_rocket", titleBn: "রকেট ৭৭৭ স্লট", titleEn: "777 Rocket", category: "slots", badge: "HOT", iconEmoji: "🚀", minBet: 10.0, playersCount: 4200 },
  { id: "gold_rush_slot", titleBn: "গোল্ড রাশ মেগাওয়েস", titleEn: "Gold Rush Megaways", category: "slots", badge: "JACKPOT", iconEmoji: "💰", minBet: 20.0, playersCount: 2740 },
  { id: "fruit_frenzy", titleBn: "ফ্রুট স্লট ব্লাস্ট", titleEn: "Fruit Slot Blast", category: "slots", badge: null, iconEmoji: "🍒", minBet: 10.0, playersCount: 980 },

  // ---------------- TABLE & ARCADE / BONUS GAMES ----------------
  { id: "lucky_wheel", titleBn: "দৈনিক লাকি স্পিন হুইল", titleEn: "Daily Lucky Spin", category: "hot", badge: "BONUS", iconEmoji: "🎡", minBet: 0.0, playersCount: 8910 },
  { id: "dice_roll", titleBn: "লাকি ডাইস হাই-লো", titleEn: "Lucky Dice Hi-Lo", category: "table", badge: null, iconEmoji: "🎲", minBet: 10.0, playersCount: 820 },
  { id: "roulette_pro", titleBn: "ইউরোপিয়ান রুলেট", titleEn: "European Roulette", category: "table", badge: null, iconEmoji: "🎯", minBet: 50.0, playersCount: 1150 },
  { id: "fish_hunter", titleBn: "ওশান কিং ফিশ শুটার", titleEn: "Ocean King Fish Hunter", category: "hot", badge: "POPULAR", iconEmoji: "🐟", minBet: 10.0, playersCount: 1640 },
  { id: "ludo_quick", titleBn: "লুডু কুইক গেম", titleEn: "Ludo Quick", category: "table", badge: "POPULAR", iconEmoji: "🎲", minBet: 10.0, playersCount: 3950 }
];

// Helper to determine game image fallback
const getFallbackImage = (id: string, category: string, iconEmoji?: string): string => {
  // Quality category-themed casino stock images
  if (category === 'crash' || id.includes('aviator') || id.includes('jetx') || id.includes('flyx')) {
    return 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=80';
  }
  if (category === 'sports' || id.includes('sports') || id.includes('cricket') || id.includes('wickets')) {
    return 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=400&q=80';
  }
  if (category === 'casino' || id.includes('crazy_time') || id.includes('playtech') || id.includes('w_casino') || id.includes('teen_patti') || id.includes('andar_bahar')) {
    return 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&q=80';
  }
  if (id.includes('wheel') || id.includes('spin')) {
    return 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&q=80';
  }
  if (id.includes('fish')) {
    return 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=400&q=80';
  }
  // Default Slots / Jackpots
  return 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=400&q=80';
};

export const ALL_PROJECT_GAMES: Game[] = RAW_GAME_LIST.map((item) => {
  const isHot = item.badge === 'HOT';
  const isNew = item.badge === 'NEW';
  let jackpot: string | undefined = undefined;
  if (item.badge === 'JACKPOT') {
    jackpot = '৳ 1,850,000';
  }

  // Determine provider name
  let provider = 'JILI';
  if (item.id.includes('aviator') || item.id.includes('flyx')) provider = 'SPRIBE';
  else if (item.id.includes('playtech')) provider = 'Playtech';
  else if (item.id.includes('evolution') || item.id.includes('crazy_time')) provider = 'Evolution';
  else if (item.id.includes('9wickets') || item.id.includes('sports')) provider = 'Betfair/Saba';
  else if (item.id.includes('aztec') || item.id.includes('wild_bounty')) provider = 'PG Soft';
  else if (item.id.includes('kingmaker')) provider = 'Kingmaker';

  return {
    ...item,
    title: item.titleEn || item.id,
    titleBn: item.titleBn || item.id,
    provider,
    category: (item.category === 'hot' ? 'slots' : item.category) as any,
    image: item.customImageUrl || getFallbackImage(item.id, item.category, item.iconEmoji),
    rating: 4.8,
    isHot,
    isNew,
    jackpot,
    minBet: item.minBet || 10,
    playersCount: item.playersCount || 1200
  };
});
