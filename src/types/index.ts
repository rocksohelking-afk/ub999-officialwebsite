export type GameCategoryType = 'sports' | 'casino' | 'slots' | 'crash' | 'table' | 'fishing' | 'lottery' | 'arcade' | 'live' | string;

export type GameServerStatus = 'ACTIVE' | 'MAINTENANCE' | 'BUSY';

export interface GameItem {
  id: string;
  titleBn?: string;
  titleEn?: string;
  category: GameCategoryType;
  badge?: string | null;
  iconEmoji?: string;
  minBet?: number;
  playersCount?: number;
  serverStatus?: GameServerStatus;
  customImageUrl?: string | null;
}

export interface Game extends GameItem {
  title: string;
  provider: string;
  category: any;
  image: string;
  rating?: number;
  isHot?: boolean;
  isNew?: boolean;
  jackpot?: string;
}

export interface MatchOdds {
  id: string;
  teamA: string;
  teamB: string;
  teamABn: string;
  teamBBn: string;
  tournament: string;
  status: 'LIVE' | 'UPCOMING';
  time: string;
  score?: string;
  oddsA: number;
  oddsDraw?: number;
  oddsB: number;
}

export interface WinnerRecord {
  id: string;
  user: string;
  game: string;
  amount: number;
  avatar: string;
}

export type Language = 'bn' | 'en';
