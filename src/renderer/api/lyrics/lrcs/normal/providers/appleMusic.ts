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
 * @file appleMusic.ts
 * @description Apple Music 歌词拉取 — 搜索 iTunes 搜索API → 匹配歌曲 → 取 TTML 歌词 → 解析为行级同步歌词
 * @author 鸡哥
 * @docs https://github.com/cXp1r/lyricify-lyrics-provider-rs
 */

import type { LyricLine } from '../types';
import { cleanArtist, cleanTitle } from '../helpers';
import { requestJsonWithLog } from '../request';
import { logger } from '../../../../../utils/logger';

const LOG_TAG = '[AppleMusic]';

// Apple Music API 常量
const SEARCH_URL = 'https://itunes.apple.com/search';
const LOOKUP_URL = 'https://itunes.apple.com/lookup';

// 从 Lyrix 移植的 Bearer JWT（需定期更新）
const BEARER_TOKEN = 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IldlYlBsYXlLaWQifQ.eyJpc3MiOiJBTVBXZWJQbGF5IiwiaWF0IjoxNzc3MjQwMjk4LCJleHAiOjE3ODQ0OTc4OTgsInJvb3RfaHR0cHNfb3JpZ2luIjpbImFwcGxlLmNvbSJdfQ.VYQzXEvKE1lE7AUim5cnBwge3aOWDOi1Y5E0gf6cUQeF3qLOS8clnzOkmiHySfr0wgGcDKM49l4YQe-K5GiuZg';

interface AppleMusicTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  trackTimeMillis?: number;
}

interface SearchResult {
  resultCount: number;
  results: AppleMusicTrack[];
}

/**
 * 在 iTunes Search API 搜索歌曲
 */
async function searchTracks(query: string): Promise<AppleMusicTrack[]> {
  const url = `${SEARCH_URL}?term=${encodeURIComponent(query)}&entity=song&limit=20&country=CN`;
  try {
    const json = await requestJsonWithLog<SearchResult>(url);
    if (!json?.results) return [];
    return json.results;
  } catch {
    return [];
  }
}

/**
 * 简单匹配: 标题包含 + 艺术家包含
 */
function matchTrack(tracks: AppleMusicTrack[], title: string, artist: string): AppleMusicTrack | null {
  const lowTitle = title.toLowerCase();
  const lowArtist = artist.toLowerCase();

  // 精确匹配
  const exact = tracks.find(
    (t) => t.trackName.toLowerCase() === lowTitle && t.artistName.toLowerCase().includes(lowArtist),
  );
  if (exact) return exact;

  // 标题包含
  const fuzzy = tracks.find(
    (t) =>
      (t.trackName.toLowerCase().includes(lowTitle) || lowTitle.includes(t.trackName.toLowerCase())) &&
      (t.artistName.toLowerCase().includes(lowArtist) || lowArtist.includes(t.artistName.toLowerCase())),
  );
  if (fuzzy) return fuzzy;

  // 仅标题匹配
  const titleOnly = tracks.find(
    (t) => t.trackName.toLowerCase().includes(lowTitle) || lowTitle.includes(t.trackName.toLowerCase()),
  );
  return titleOnly ?? tracks[0] ?? null;
}

/**
 * 从 TTML 提取行级歌词（非逐字模式）
 * 简单解析: 提取 `<p>` 标签中的纯文本作为歌词行
 */
function extractLinesFromTTML(ttml: string): LyricLine[] {
  if (!ttml) return [];
  const lines: LyricLine[] = [];
  const pRe = /<p\b([^>]*)>([\s\S]*?)<\/p>/g;
  let m: RegExpExecArray | null;

  while ((m = pRe.exec(ttml)) !== null) {
    const attrs = m[1];
    const content = m[2];

    // 提取行级时间
    const startStr = extractAttr(attrs, 'in');
    if (!startStr) continue;
    const timeMs = parseAppleTime(startStr);

    // 提取纯文本（去除所有 XML 标签）
    const text = content.replace(/<[^>]*>/g, '').trim();
    if (!text) continue;

    lines.push({ time_ms: timeMs, text });
  }

  lines.sort((a, b) => a.time_ms - b.time_ms);
  return lines;
}

function extractAttr(attrs: string, name: string): string | null {
  const marker = `${name}="`;
  const start = attrs.indexOf(marker);
  if (start === -1) return null;
  const valueStart = start + marker.length;
  const valueEnd = attrs.indexOf('"', valueStart);
  if (valueEnd === -1) return null;
  return attrs.substring(valueStart, valueEnd);
}

/** 解析 Apple Music 时间格式 (MM:SS.cs 或 HH:MM:SS.cs) */
function parseAppleTime(tag: string): number {
  const t = tag.trim();
  const parts = t.split(':');
  let ms = 0;
  if (parts.length === 3) {
    ms += parseInt(parts[0], 10) * 3_600_000;
    ms += parseInt(parts[1], 10) * 60_000;
    const [sec, cs] = parts[2].split('.');
    ms += parseInt(sec, 10) * 1_000;
    ms += parseInt(cs, 10) * 10;
  } else if (parts.length === 2) {
    ms += parseInt(parts[0], 10) * 60_000;
    const [sec, cs] = parts[1].split('.');
    ms += parseInt(sec, 10) * 1_000;
    ms += parseInt(cs, 10) * 10;
  }
  return ms;
}

/**
 * 通过 trackId 获取 TTML 歌词
 */
async function fetchTTML(trackId: number): Promise<string | null> {
  const url = `https://amp-api.music.apple.com/v1/catalog/cn/songs/${trackId}/syllable-lyrics?${encodeURIComponent('l[lyrics]')}=${encodeURIComponent('zh-hans-cn')}&${encodeURIComponent('l[script]')}=${encodeURIComponent('zh-Hans')}&extend=ttmlLocalizations`;

  try {
    const json = await requestJsonWithLog<Record<string, unknown>>(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        Origin: 'https://music.apple.com',
      },
    });
    if (!json) return null;

    const data = json.data as unknown[] | undefined;
    if (!data || data.length === 0) return null;

    const item = data[0] as Record<string, unknown>;
    const attrs = item.attributes as Record<string, unknown> | undefined;
    const ttml = attrs?.ttmlLocalizations as string | undefined;
    return ttml || null;
  } catch {
    return null;
  }
}

/**
 * 搜索并获取 Apple Music 歌词
 */
async function searchAppleMusic(queryTitle: string, queryArtist: string): Promise<LyricLine[] | null> {
  const query = `${queryTitle} ${queryArtist}`.trim();
  try {
    const tracks = await searchTracks(query);
    if (tracks.length === 0) return null;

    const matched = matchTrack(tracks, queryTitle, queryArtist);
    if (!matched) return null;

    const ttml = await fetchTTML(matched.trackId);
    if (!ttml) return null;

    const lines = extractLinesFromTTML(ttml);
    return lines.length > 0 ? lines : null;
  } catch (err) {
    logger.warn(`${LOG_TAG} 获取失败:`, err);
    return null;
  }
}

/**
 * Apple Music 歌词对外入口 — 原词失败则用 cleanTitle/cleanArtist 重试
 */
export async function fetchLyricsFromAppleMusic(title: string, artist: string): Promise<LyricLine[] | null> {
  const raw = await searchAppleMusic(title, artist);
  if (raw) return raw;

  const cleanedTitle = cleanTitle(title);
  const cleanedArtist = cleanArtist(artist);
  if (cleanedTitle !== title || cleanedArtist !== artist) {
    return searchAppleMusic(cleanedTitle, cleanedArtist);
  }
  return null;
}
