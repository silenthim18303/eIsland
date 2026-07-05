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
 * @file sodaMusic.ts
 * @description 汽水音乐歌词拉取 — 多策略搜索 + 评分匹配 → 详情接口 → KRC 格式解析
 *              移植自 Lyrix fetchers/soda_music.rs + searchers/soda_music.rs
 * @author 鸡哥
 * @docs https://github.com/cXp1r/lyricify-lyrics-provider-rs
 */

import type { LyricsFetchResult, LyricLine } from '../types';
import { parseKrc } from '../helpers';
import { parseTranslationLyrics } from '../translation';
import { requestJsonWithLog } from '../request';
import { logger } from '../../../../../utils/logger';
import { searchWithScoring } from '../matcher';
import type { SearchCandidate } from '../searchTypes';

const LOG_TAG = '[SodaMusic]';
const SODA_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  Referer: 'https://api.qishui.com/',
};

/* ── 搜索 ──────────────────────────────────────────────────────────── */

interface SodaTrack {
  id?: number | string;
  name?: string;
  artists?: Array<{ name?: string }>;
  album?: { name?: string };
  duration?: number;
}

async function searchSodaMusicApi(query: string): Promise<SearchCandidate[]> {
  const searchUrl =
    `https://api.qishui.com/luna/pc/search/track?aid=386088&app_name=&region=&geo_region=&os_region=&sim_region=&device_id=&cdid=&iid=&version_name=&version_code=&channel=&build_mode=&network_carrier=&ac=&tz_name=&resolution=&device_platform=&device_type=&os_version=&fp=&q=${encodeURIComponent(query)}&cursor=&search_id=&search_method=input&debug_params=&from_search_id=&search_scene=`;

  const json = await requestJsonWithLog<Record<string, unknown>>(searchUrl, { headers: SODA_HEADERS });
  if (!json) return [];

  const resultGroups = json.result_groups as unknown[] | undefined;
  if (!resultGroups || resultGroups.length === 0) return [];

  return resultGroups.flatMap((group) => {
    const g = group as Record<string, unknown>;
    const items = g.data as unknown[] | undefined;
    if (!items) return [];
    return items
      .map((item) => {
        const it = item as Record<string, unknown>;
        const entity = it.entity as Record<string, unknown> | undefined;
        const track = entity?.track as SodaTrack | undefined;
        if (!track?.id) return null;
        return {
          id: String(track.id),
          title: track.name ?? '',
          artists: (track.artists ?? []).map((a) => a.name ?? ''),
          album: track.album?.name ?? '',
          durationMs: track.duration,
        };
      })
      .filter((c): c is SearchCandidate => c !== null);
  });
}

/* ── 详情 + 歌词获取 ───────────────────────────────────────────────── */

async function fetchLyricsByTrackId(trackId: string): Promise<LyricsFetchResult | null> {
  const detailUrl =
    `https://api.qishui.com/luna/pc/track_v2?track_id=${encodeURIComponent(trackId)}&media_type=track&queue_type=&aid=386088&iid=114514`;

  const detailJson = await requestJsonWithLog<Record<string, unknown>>(detailUrl, { headers: SODA_HEADERS });
  if (!detailJson) {
    logger.warn(`${LOG_TAG} 详情接口返回空, trackId=${trackId}`);
    return null;
  }

  const lyricInfo = detailJson.lyric as Record<string, unknown> | undefined;
  const content = typeof lyricInfo?.content === 'string' ? lyricInfo.content : null;
  if (!content || content.length === 0) {
    logger.warn(`${LOG_TAG} 歌词内容为空, trackId=${trackId}`);
    return null;
  }

  const lines = parseKrc(content);
  if (lines.length === 0) {
    logger.warn(`${LOG_TAG} KRC 解析后 0 行, trackId=${trackId}`);
    return null;
  }
  const rawTranslations = lyricInfo?.translations;
  logger.info(`${LOG_TAG} translations 字段类型=${typeof rawTranslations}, 值=${JSON.stringify(rawTranslations)?.slice(0, 200)}`);

  let translationText: string | null = null;
  if (typeof rawTranslations === 'string') {
    translationText = rawTranslations;
  } else if (Array.isArray(rawTranslations) && rawTranslations.length > 0) {
    // API 可能返回 [{lang: "zh", content: "[00:01.00]..."}] 格式
    const first = rawTranslations[0] as Record<string, unknown> | undefined;
    if (first && typeof first.content === 'string') {
      translationText = first.content;
    }
  } else if (rawTranslations && typeof rawTranslations === 'object' && !Array.isArray(rawTranslations)) {
    // API 返回 {cn: "[00:01.00]...", en: "..."} 格式（语言代码为 key）
    const obj = rawTranslations as Record<string, unknown>;
    for (const value of Object.values(obj)) {
      if (typeof value === 'string' && value.trim().length > 0) {
        translationText = value;
        break;
      }
    }
  }

  const translation = parseTranslationLyrics(translationText);

  logger.info(`${LOG_TAG} 获取成功, trackId=${trackId}, 行数=${lines.length}, 翻译歌词状态=${translation.status}`);
  return { lyrics: lines, translation };
}

/* ── 对外入口 ──────────────────────────────────────────────────────── */

export async function fetchLyricsWithTranslationFromSodaMusic(
  title: string,
  artist: string,
): Promise<LyricsFetchResult | null> {
  logger.info(`${LOG_TAG} 开始获取, title="${title}", artist="${artist}"`);

  const matched = await searchWithScoring(
    { title, artist },
    searchSodaMusicApi,
    5, // minScore
    7, // wowScore
  );

  if (!matched) {
    logger.warn(`${LOG_TAG} 无匹配歌曲`);
    return null;
  }

  logger.info(`${LOG_TAG} 匹配到: "${matched.title}" - "${matched.artists.join(', ')}" (id=${matched.id})`);
  return fetchLyricsByTrackId(matched.id);
}

export async function fetchLyricsFromSodaMusic(title: string, artist: string): Promise<LyricLine[] | null> {
  const result = await fetchLyricsWithTranslationFromSodaMusic(title, artist);
  return result?.lyrics ?? null;
}
