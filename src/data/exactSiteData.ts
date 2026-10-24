export interface ExactGameCard {
  id: string;
  title: string;
  provider: string;
  badge?: string; // e.g. "BONUS", "2X BONUS", "10000X", "JL"
  image: string;
  tag?: string;
}

export const EXACT_HOT_GAMES: ExactGameCard[] = [
  {
    id: 'super-ace',
    title: 'Super Ace',
    provider: 'JILI',
    image: '/banners/img_super_ace_official.png',
  },
  {
    id: 'slot_fortune_gems_3',
    title: 'Fortune Gems 3',
    provider: 'JILI',
    badge: 'JL',
    image: '/banners/img_fortune_gems_3_official.png',
  },
  {
    id: 'flyx',
    title: 'FlyX',
    provider: 'Microgaming',
    image: '/banners/img_flyx_microgaming-1.png',
  },
  {
    id: 'aviator',
    title: 'Aviator',
    provider: 'SPRIBE',
    image: '/banners/img_aviator_official.png',
  },
  {
    id: 'wild-bounty',
    title: 'Wild Bounty Showdown',
    provider: 'PG SOFT',
    image: '/banners/img_wild_bounty.png',
  },
  {
    id: 'boxing_king',
    title: 'Boxing King',
    provider: 'JILI',
    badge: 'JL',
    image: '/banners/img_boxing_king.png',
  }
];

export const EXACT_JACKPOT_GAMES: ExactGameCard[] = [
  {
    id: 'slot_super_ace_deluxe',
    title: 'Super Ace Deluxe',
    provider: 'JILI',
    badge: 'HOT',
    image: '/banners/img_suparace_deluxe.png',
  },
  {
    id: 'slot_jetx',
    title: 'JetX Crash',
    provider: 'SMARTSOFT',
    badge: '10000X',
    image: '/banners/img_jetx.png',
  },
  {
    id: 'coin-up',
    title: 'COIN UP HOT FIRE',
    provider: 'BNG',
    badge: 'HOT',
    image: '/banners/img_coin_up.png',
  }
];

export const EXACT_SLOTS_GAMES: ExactGameCard[] = [
  {
    id: 'slot_treasures_of_aztec',
    title: 'Treasures of Aztec',
    provider: 'PG SOFT',
    badge: 'HOT',
    image: '/banners/img_treasuresof_ajtec.png',
  },
  {
    id: 'fortune_garuda',
    title: 'Fortune Garuda 500',
    provider: 'JILI',
    badge: 'POPULAR',
    image: '/banners/img_fortunegaruda_500.png',
  },
  {
    id: 'super-elements',
    title: 'Super Elements',
    provider: 'FA CHAI',
    badge: 'HOT',
    image: '/banners/img_super_elements.png',
  },
  {
    id: 'slot_kingmaker',
    title: 'Kingmaker Slots',
    provider: 'KINGMAKER',
    badge: 'POPULAR',
    image: '/banners/img_kingmaker.png',
  },
  {
    id: 'slot_royale_house',
    title: 'Royale House',
    provider: 'JILI',
    badge: 'HOT',
    image: '/banners/img_royale_house.png',
  },
  {
    id: 'slot_dragon_gems',
    title: 'Dragon Gems',
    provider: 'JILI',
    badge: 'JL',
    image: '/banners/img_dragongems.png',
  }
];

export const EXACT_LIVE_CASINO_GAMES: ExactGameCard[] = [
  {
    id: 'crazy_time',
    title: 'CRAZY TIME SHOW',
    provider: 'EVOLUTION',
    badge: 'LIVE',
    image: '/banners/img_cray_time.png',
  },
  {
    id: 'evo-live',
    title: 'EVOLUTION GAMING',
    provider: 'LIVE CASINO',
    badge: 'LIVE',
    image: '/banners/img_evolution_gaming.png',
  },
  {
    id: 'w-casino-live',
    title: 'SEXY GAMING / W CASINO',
    provider: 'LIVE CASINO',
    badge: 'LIVE',
    image: '/banners/img_sexy_gaming.png',
  },
  {
    id: 'via-casino',
    title: 'VIA CASINO',
    provider: 'LIVE CASINO',
    badge: 'LIVE',
    image: '/banners/img_viacasino.png',
  }
];

export const EXACT_SPORTS_GAMES: ExactGameCard[] = [
  {
    id: '9wickets',
    title: '9WICKETS CRICKET',
    provider: 'SPORTS',
    badge: 'LIVE',
    image: '/banners/img_9wickets.png',
  },
  {
    id: 'lucky-sports',
    title: 'LUCKY SPORTS',
    provider: 'SPORTS',
    badge: 'LIVE',
    image: '/banners/img_saba.png',
  },
  {
    id: 'saba-sports',
    title: 'SABA SPORTS / RCB',
    provider: 'SPORTS',
    badge: 'LIVE',
    image: '/banners/img_rcb_horse_racing.png',
  }
];

export const EXACT_ESPORTS_GAMES: ExactGameCard[] = [
  {
    id: 'tf-gaming',
    title: 'TF GAMING',
    provider: 'E-SPORTS',
    image: '/banners/img_tf_gaming.png',
  },
  {
    id: 'ilustre-analytics',
    title: 'ILUSTRE ANALYTICS',
    provider: 'E-SPORTS',
    image: '/banners/img_ilustre_analytics.png',
  }
];

export const EXACT_POKER_GAMES: ExactGameCard[] = [
  {
    id: '7up-7down',
    title: '7 Up 7 Down',
    provider: 'KINGMAKER',
    badge: 'BONUS',
    image: '/banners/img_7up_7dawn.png',
  },
  {
    id: 'andar-bahar',
    title: 'Andar Bahar',
    provider: 'KINGMAKER',
    badge: 'JL',
    image: '/banners/img_andar_bahar.png',
  },
  {
    id: 'triple-chance',
    title: 'Triple Chance',
    provider: 'KINGMAKER',
    badge: '2X BONUS',
    image: '/banners/img_jriple_chance.png',
  }
];

export const EXACT_LOTTERY_GAMES: ExactGameCard[] = [
  {
    id: 'tcg-sea',
    title: 'TCG SEA',
    provider: 'LOTTERY',
    image: '/banners/img_tcg_sea.png',
  }
];

export const PROVIDER_LOGOS = [
  'JILI', 'SPRIBE', 'PG', 'BNG', 'FC', 'Microgaming',
  'JDB', 'SMARTSOFT', 'PLAYSTAR', 'askmeslot', 'AMIGO', 'VA GAMING',
  'FIRST PERSON', 'FASTSPIN', 'EVOPLAY', 'HACKSAW', 'NAGA', 'MAH GAMING',
  'GEMINI', 'AVATARUX', 'YELLOW BAT', 'BT GAMING', 'BAISON', 'AMEBA'
];
