export const MAXEXPAND_PERFORMANCE_MODE_STORE_KEY = 'maxexpand-performance-mode-enabled';
export const MAXEXPAND_PERFORMANCE_MODE_CACHE_KEY = 'eIsland:maxexpand-performance-mode-enabled';
export const DEFAULT_MAXEXPAND_PERFORMANCE_MODE_ENABLED = true;

export function normalizeMaxExpandPerformanceModeEnabled(value: unknown): boolean {
  return value !== false;
}

export function readCachedMaxExpandPerformanceModeEnabled(): boolean {
  try {
    const cached = window.localStorage.getItem(MAXEXPAND_PERFORMANCE_MODE_CACHE_KEY);
    if (cached === 'false') return false;
    if (cached === 'true') return true;
  } catch {
    return DEFAULT_MAXEXPAND_PERFORMANCE_MODE_ENABLED;
  }
  return DEFAULT_MAXEXPAND_PERFORMANCE_MODE_ENABLED;
}

export function cacheMaxExpandPerformanceModeEnabled(enabled: boolean): void {
  try {
    window.localStorage.setItem(MAXEXPAND_PERFORMANCE_MODE_CACHE_KEY, String(enabled));
  } catch {
  }
}
