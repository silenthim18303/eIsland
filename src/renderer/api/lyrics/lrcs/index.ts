/*
 * eIsland - A sleek, Apple Dynamic Island inspired floating widget for Windows, built with Electron.
 * https://github.com/JNTMTMTM/eIsland
 *
 * Copyright (C) 2026 JNTMTMTM
 * Copyright (C) 2026 pyisland.com
 *
 * Original author: JNTMTMTM[](https://github.com/JNTMTMTM)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */

/**
 * @file index.ts
 * @description 歌词拉取统一入口 — 按 SMTC 进程自动选源 + 多级回退 + LRCLIB 兜底
 * @author 鸡哥
 */

import type { LyricLine, LyricsFetchResult } from './normal/types';
import { fetchLyricsFromLrclib } from './normal/providers/lrclib';
import { fetchLyricsWithTranslationFromNetease } from './normal/providers/netease';
import { fetchLyricsWithTranslationFromQQMusic } from './normal/providers/qqmusic';
import { fetchLyricsFromKugou } from './normal/providers/kugou';
import { fetchLyricsWithTranslationFromSodaMusic } from './normal/providers/sodaMusic';
import { fetchLyricsFromAppleMusic } from './normal/providers/appleMusic';
import { fetchLyricsFromSpotify } from './normal/providers/spotify';
import { fetchLyricsFromMoeKoe } from './normal/providers/moeKoe';
import { unsupportedTranslationLyrics } from './normal/translation';

export type {
  LyricLine,
  LyricsFetchResult,
  TranslationLyricsResult,
  TranslationLyricsStatus,
} from './normal/types';
export { fetchLyricsFromLrclib } from './normal/providers/lrclib';
export { fetchLyricsFromNetease, fetchLyricsWithTranslationFromNetease } from './normal/providers/netease';
export { fetchLyricsFromQQMusic, fetchLyricsWithTranslationFromQQMusic } from './normal/providers/qqmusic';
export { fetchLyricsFromKugou } from './normal/providers/kugou';
export { fetchLyricsFromSodaMusic, fetchLyricsWithTranslationFromSodaMusic } from './normal/providers/sodaMusic';
export { fetchLyricsFromAppleMusic } from './normal/providers/appleMusic';
export { fetchLyricsFromSpotify } from './normal/providers/spotify';
export { fetchLyricsFromMoeKoe } from './normal/providers/moeKoe';

type Provider = 'netease' | 'qqmusic' | 'kugou' | 'sodamusic' | 'applemusic' | 'spotify' | 'moekoe';

type FetchFn = (title: string, artist: string) => Promise<LyricsFetchResult | null>;

async function fetchWithUnsupportedTranslation(
  fetchLyricsOnly: (title: string, artist: string) => Promise<LyricLine[] | null>,
  title: string,
  artist: string,
): Promise<LyricsFetchResult | null> {
  const lyrics = await fetchLyricsOnly(title, artist);
  return lyrics && lyrics.length > 0
    ? { lyrics, translation: unsupportedTranslationLyrics() }
    : null;
}

const PROVIDER_MAP: Record<Provider, FetchFn> = {
  netease: fetchLyricsWithTranslationFromNetease,
  qqmusic: fetchLyricsWithTranslationFromQQMusic,
  kugou: (title, artist) => fetchWithUnsupportedTranslation(fetchLyricsFromKugou, title, artist),
  sodamusic: fetchLyricsWithTranslationFromSodaMusic,
  applemusic: (title, artist) => fetchWithUnsupportedTranslation(fetchLyricsFromAppleMusic, title, artist),
  spotify: (title, artist) => fetchWithUnsupportedTranslation(fetchLyricsFromSpotify, title, artist),
  moekoe: (title, artist) => fetchWithUnsupportedTranslation(fetchLyricsFromMoeKoe, title, artist),
};

const ALL_PROVIDERS: Provider[] = ['netease', 'qqmusic', 'kugou', 'sodamusic', 'applemusic', 'spotify', 'moekoe'];

const PROCESS_TO_PROVIDER: Array<{ pattern: RegExp; provider: Provider }> = [
  { pattern: /cloudmusic/i, provider: 'netease' },
  { pattern: /QQMusic/i, provider: 'qqmusic' },
  { pattern: /kugou/i, provider: 'kugou' },
  { pattern: /汽水音乐/i, provider: 'sodamusic' },
  { pattern: /qishui/i, provider: 'sodamusic' },
  { pattern: /soda.?music/i, provider: 'sodamusic' },
  { pattern: /AppleMusicWin|AppleInc\.AppleMusic/i, provider: 'applemusic' },
  { pattern: /Spotify/i, provider: 'spotify' },
  { pattern: /MoeKoe/i, provider: 'moekoe' },
];

function detectProviderFromProcess(sourceAppId: string): Provider | null {
  if (!sourceAppId) return null;
  const lower = sourceAppId.toLowerCase();
  const matched = PROCESS_TO_PROVIDER.find(({ pattern }) => pattern.test(lower));
  return matched?.provider ?? null;
}

async function tryProviders(
  providers: Provider[],
  title: string,
  artist: string,
): Promise<LyricsFetchResult | null> {
  return providers.reduce<Promise<LyricsFetchResult | null>>(async (prevPromise, provider) => {
    const prev = await prevPromise;
    if (prev) return prev;
    try {
      const result = await PROVIDER_MAP[provider](title, artist);
      return result && result.lyrics.length > 0 ? result : null;
    } catch {
      return null;
    }
  }, Promise.resolve(null));
}

const SOURCE_SETTING_TO_PROVIDER: Record<string, Provider> = {
  'netease-only': 'netease',
  'qqmusic-only': 'qqmusic',
  'kugou-only': 'kugou',
  'sodamusic-only': 'sodamusic',
  'applemusic-only': 'applemusic',
  'spotify-only': 'spotify',
  'moekoe-only': 'moekoe',
};

async function readLyricsSourceSetting(): Promise<string> {
  try {
    return await window.api.musicLyricsSourceGet();
  } catch {
    return 'auto';
  }
}

export async function fetchLyricsWithTranslation(
  title: string,
  artist: string,
  sourceAppId?: string,
): Promise<LyricsFetchResult | null> {
  const setting = await readLyricsSourceSetting();

  if (setting === 'lrclib-only') {
    return fetchWithUnsupportedTranslation(fetchLyricsFromLrclib, title, artist);
  }

  const forced = SOURCE_SETTING_TO_PROVIDER[setting];
  if (forced) {
    const result = await tryProviders([forced], title, artist);
    if (result) return result;
    return fetchWithUnsupportedTranslation(fetchLyricsFromLrclib, title, artist);
  }

  const appId = sourceAppId ?? await resolveSourceAppId();
  const primary = detectProviderFromProcess(appId);

  if (primary) {
    const fallback = ALL_PROVIDERS.filter((p) => p !== primary);
    const result = await tryProviders([primary, ...fallback], title, artist);
    if (result) return result;
  } else {
    const result = await tryProviders(ALL_PROVIDERS, title, artist);
    if (result) return result;
  }

  return fetchWithUnsupportedTranslation(fetchLyricsFromLrclib, title, artist);
}

export async function fetchLyrics(
  title: string,
  artist: string,
  sourceAppId?: string,
): Promise<LyricLine[] | null> {
  const result = await fetchLyricsWithTranslation(title, artist, sourceAppId);
  return result?.lyrics ?? null;
}

async function resolveSourceAppId(): Promise<string> {
  try {
    const resp = await window.api.musicDetectSourceAppId();
    if (!resp?.ok || !resp.sources || resp.sources.length === 0) return '';
    const playing = resp.sources.find((s) => s.isPlaying && s.hasTitle);
    return (playing ?? resp.sources[0]).sourceAppId ?? '';
  } catch {
    return '';
  }
}

/**
 * 获取当前播放位置对应的歌词行
 * @param lyrics - 同步歌词行数组
 * @param positionMs - 当前播放位置（毫秒）
 * @returns 当前歌词行，无匹配时返回 null
 */
export function getCurrentLyric(lyrics: LyricLine[], positionMs: number): LyricLine | null {
  if (lyrics.length === 0) return null;
  return lyrics.reduce<LyricLine | null>((acc, line) => (line.time_ms <= positionMs ? line : acc), null);
}

/**
 * 获取当前歌词行及其附近行（前2行 + 当前 + 后2行）
 * @param lyrics - 同步歌词行数组
 * @param positionMs - 当前播放位置（毫秒）
 * @returns 附近歌词行数组，每项包含 text 和 isCurrent 标记
 */
export function getNearbyLyrics(
  lyrics: LyricLine[],
  positionMs: number,
): Array<{ text: string; isCurrent: boolean }> {
  if (lyrics.length === 0) return [];

  const currentIdx = lyrics.reduce<number | null>((acc, line, index) => (line.time_ms <= positionMs ? index : acc), null);
  if (currentIdx === null) return [];

  const start = Math.max(0, currentIdx - 2);
  const end = Math.min(lyrics.length, currentIdx + 3);

  return lyrics.slice(start, end).map((line, i) => ({
    text: line.text,
    isCurrent: start + i === currentIdx,
  }));
}
