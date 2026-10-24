export type NonAviatorBehavior = 'none' | 'slow_net' | 'not_found_420' | 'updating';

export const isAviatorGame = (gameId: string, title?: string): boolean => {
  const lowerId = (gameId || '').toLowerCase();
  const lowerTitle = (title || '').toLowerCase();
  return lowerId.includes('aviator') || lowerTitle.includes('aviator');
};

export const getGameBehavior = (gameId: string, title?: string): NonAviatorBehavior => {
  if (isAviatorGame(gameId, title)) {
    return 'none';
  }
  let hash = 0;
  const str = gameId || title || '';
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  const mod = Math.abs(hash) % 4;
  if (mod === 0) return 'none';
  if (mod === 1) return 'slow_net';
  if (mod === 2) return 'not_found_420';
  return 'updating';
};
