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
 * @description 汽水音乐逐字歌词拉取 — 多策略搜索 + 评分匹配 → 详情接口 → 明文 KRC 前缀式音节解析
 *              移植自 Lyrix fetchers/soda_music.rs + searchers/soda_music.rs
 * @author 鸡哥
 * @docs https://github.com/cXp1r/lyricify-lyrics-provider-rs
 */

import { requestJsonWithLog } from '../../normal/request';
import { logger } from '../../../../../utils/logger';
import { parseSyncedLines } from '../parsers';
import { searchWithScoring } from '../../normal/matcher';
import type { SearchCandidate } from '../../normal/searchTypes';
import type { KaraokeLine } from '../types';

const LOG_TAG = '[KaraokeSodaMusic]';
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
      .filter((c) => c !== null);
  });
}

/* ── 详情 + 逐字歌词获取 ───────────────────────────────────────────── */

async function fetchKaraokeByTrackId(trackId: string): Promise<KaraokeLine[] | null> {
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

  // 汽水音乐 KRC 为前缀式 `<s,d>text` 或 `(s,d)text`，偏移已是相对值
  const lines = parseSyncedLines(content, 'prefix', 'relative');
  const withSyllables = lines.filter((l) => l.syllables.length > 0);
  if (withSyllables.length === 0) {
    logger.warn(`${LOG_TAG} 解析出 0 行逐字, trackId=${trackId}`);
    return null;
  }
  logger.info(`${LOG_TAG} 获取成功, trackId=${trackId}, 行数=${withSyllables.length}`);
  return withSyllables;
}

/* ── 对外入口 ──────────────────────────────────────────────────────── */

export async function fetchKaraokeFromSodaMusic(title: string, artist: string): Promise<KaraokeLine[] | null> {
  logger.info(`${LOG_TAG} 开始获取逐字, title="${title}", artist="${artist}"`);

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
  return fetchKaraokeByTrackId(matched.id);
}
