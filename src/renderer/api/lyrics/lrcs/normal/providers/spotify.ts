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
 * @file spotify.ts
 * @description Spotify 歌词拉取 — TOTP 认证 → GraphQL 搜索 → color-lyrics API → LINE_SYNCED 解析
 * @author 鸡哥
 * @docs https://github.com/cXp1r/lyricify-lyrics-provider-rs
 */

import type { LyricLine } from '../types';
import { cleanArtist, cleanTitle } from '../helpers';
import { requestJsonWithLog, requestTextWithLog } from '../request';
import { logger } from '../../../../../utils/logger';
import { buildTotp, totpGenerateNow } from './spotifyTotp';

const LOG_TAG = '[Spotify]';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

/* ── Token 管理 ────────────────────────────────────────────────────── */

interface SpotifyTokens {
  accessToken: string;
  clientId: string;
  clientToken: string;
  expiresAt: number; // Date.now() + TTL
}

let cachedTokens: SpotifyTokens | null = null;

async function initTokens(): Promise<SpotifyTokens | null> {
  try {
    const totpConfig = buildTotp(0);
    const totp = totpGenerateNow(totpConfig);

    // Step 1: Get access_token
    const tokenUrl = `https://open.spotify.com/api/token?reason=init&productType=web-player&totp=${totp}&totpServer=${totp}&totpVer=${totpConfig.version}`;
    const tokenResp = await requestJsonWithLog<Record<string, unknown>>(tokenUrl, {
      method: 'GET',
      headers: {
        Referer: 'https://open.spotify.com/',
        'User-Agent': USER_AGENT,
      },
    });
    if (!tokenResp) {
      logger.warn(`${LOG_TAG} 获取 access_token 失败`);
      return null;
    }

    const accessToken = tokenResp.accessToken as string;
    const clientId = tokenResp.clientId as string;
    if (!accessToken || !clientId) {
      logger.warn(`${LOG_TAG} access_token 响应缺少字段`);
      return null;
    }

    // Step 2: Get Client-Token
    const ctBody = JSON.stringify({
      client_data: {
        client_version: '1.2.91.72.g5337566e',
        client_id: clientId,
        js_sdk_data: {
          device_brand: 'unknown',
          device_model: 'unknown',
          os: 'windows',
          os_version: 'NT 10.0',
          device_id: '325e4218-3239-4c14-9d62-39d4919b1570',
          device_type: 'computer',
        },
      },
    });

    const ctResp = await requestJsonWithLog<Record<string, unknown>>(
      'https://clienttoken.spotify.com/v1/clienttoken',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Origin: 'https://open.spotify.com',
          Referer: 'https://open.spotify.com/',
          'User-Agent': USER_AGENT,
          'Content-Type': 'application/json',
        },
        body: ctBody,
      },
    );
    if (!ctResp) {
      logger.warn(`${LOG_TAG} 获取 Client-Token 失败`);
      return null;
    }

    const granted = ctResp.granted_token as Record<string, unknown> | undefined;
    const clientToken = granted?.token as string;
    if (!clientToken) {
      logger.warn(`${LOG_TAG} Client-Token 响应缺少字段`);
      return null;
    }

    const tokens: SpotifyTokens = {
      accessToken,
      clientId,
      clientToken,
      expiresAt: Date.now() + 30 * 60 * 1000, // 30 分钟有效期
    };
    cachedTokens = tokens;
    logger.info(`${LOG_TAG} Token 初始化成功`);
    return tokens;
  } catch (err) {
    logger.error(`${LOG_TAG} Token 初始化异常:`, err);
    return null;
  }
}

async function getTokens(): Promise<SpotifyTokens | null> {
  if (cachedTokens && Date.now() < cachedTokens.expiresAt) {
    return cachedTokens;
  }
  return initTokens();
}

/* ── 搜索 ──────────────────────────────────────────────────────────── */

interface SpotifySearchItem {
  item?: {
    data?: {
      id?: string;
      name?: string;
      artists?: { items?: Array<{ profile?: { name?: string } }> };
      duration?: { totalMilliseconds?: number };
      albumOfTrack?: { name?: string };
    };
  };
}

interface SpotifySearchResponse {
  data?: {
    searchV2?: {
      topResultsV2?: {
        itemsV2?: SpotifySearchItem[];
      };
    };
  };
}

async function searchSpotify(keyword: string): Promise<{ id: string; name: string; artists: string[] } | null> {
  const tokens = await getTokens();
  if (!tokens) return null;

  const body = JSON.stringify({
    variables: {
      query: keyword,
      limit: 30,
      numberOfTopResults: 30,
      offset: 0,
      includeAuthors: false,
      includeAlbumPreReleases: false,
      includeEpisodeContentRatingsV2: false,
    },
    operationName: 'searchSuggestions',
    extensions: {
      persistedQuery: {
        version: 1,
        sha256Hash: '556f5a15b2fdd3a7113ffd377ad9805e38a3a27b8bb1ca7d6d76bad54aa8ee12',
      },
    },
  });

  const json = await requestJsonWithLog<SpotifySearchResponse>(
    'https://api-partner.spotify.com/pathfinder/v2/query',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Client-Token': tokens.clientToken,
        Origin: 'https://open.spotify.com',
        Referer: 'https://open.spotify.com/',
        'User-Agent': USER_AGENT,
        'Content-Type': 'application/json',
        'App-platform': 'WebPlayer',
      },
      body,
    },
  );

  if (!json) return null;

  const items = json.data?.searchV2?.topResultsV2?.itemsV2;
  if (!items || items.length === 0) return null;

  const first = items[0]?.item?.data;
  if (!first?.id) return null;

  return {
    id: first.id,
    name: first.name ?? '',
    artists: first.artists?.items?.map((a) => a.profile?.name ?? '') ?? [],
  };
}

/* ── 歌词获取 ──────────────────────────────────────────────────────── */

interface SpotifyLyricsLine {
  startTimeMs?: string;
  words?: string;
  endTimeMs?: string;
}

interface SpotifyLyricsResponse {
  lyrics?: {
    syncType?: string;
    lines?: SpotifyLyricsLine[];
  };
}

async function fetchTrackLyrics(trackId: string): Promise<LyricLine[] | null> {
  const tokens = await getTokens();
  if (!tokens) return null;

  const url = `https://spclient.wg.spotify.com/color-lyrics/v2/track/${encodeURIComponent(trackId)}?format=json&market=from_token`;
  const json = await requestJsonWithLog<SpotifyLyricsResponse>(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      'Client-Token': tokens.clientToken,
      Origin: 'https://open.spotify.com',
      Referer: 'https://open.spotify.com/',
      'User-Agent': USER_AGENT,
      'App-platform': 'WebPlayer',
    },
  });

  if (!json?.lyrics) return null;

  const { syncType, lines } = json.lyrics;
  if (syncType !== 'LINE_SYNCED' || !lines) {
    logger.warn(`${LOG_TAG} 歌词非 LINE_SYNCED 格式, syncType=${syncType}`);
    return null;
  }

  const result: LyricLine[] = [];
  for (const line of lines) {
    const words = line.words ?? '';
    if (!words) continue;

    const timeMs = parseInt(line.startTimeMs ?? '0', 10);
    result.push({ time_ms: timeMs, text: words });
  }

  return result.length > 0 ? result : null;
}

/* ── 对外入口 ──────────────────────────────────────────────────────── */

/**
 * 搜索并获取 Spotify 歌词
 */
async function searchSpotifyLyrics(queryTitle: string, queryArtist: string): Promise<LyricLine[] | null> {
  const query = `${queryTitle} ${queryArtist}`.trim();
  logger.info(`${LOG_TAG} 开始获取, query="${query}"`);
  try {
    const result = await searchSpotify(query);
    if (!result) {
      logger.warn(`${LOG_TAG} 搜索无结果, query="${query}"`);
      return null;
    }

    logger.info(`${LOG_TAG} 匹配到: "${result.name}" - "${result.artists.join(', ')}" (id=${result.id})`);

    const lines = await fetchTrackLyrics(result.id);
    if (!lines) {
      logger.warn(`${LOG_TAG} 无歌词, trackId=${result.id}`);
      return null;
    }

    logger.info(`${LOG_TAG} 获取成功, trackId=${result.id}, 行数=${lines.length}`);
    return lines;
  } catch (err) {
    logger.error(`${LOG_TAG} 未预期异常, query="${query}":`, err);
    return null;
  }
}

/**
 * Spotify 歌词对外入口 — 原词失败则用 cleanTitle/cleanArtist 重试
 */
export async function fetchLyricsFromSpotify(title: string, artist: string): Promise<LyricLine[] | null> {
  const raw = await searchSpotifyLyrics(title, artist);
  if (raw) return raw;

  const cleanedTitle = cleanTitle(title);
  const cleanedArtist = cleanArtist(artist);
  if (cleanedTitle !== title || cleanedArtist !== artist) {
    return searchSpotifyLyrics(cleanedTitle, cleanedArtist);
  }
  return null;
}
