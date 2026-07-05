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
 * @file qqmusic.ts
 * @description QQ 音乐歌词拉取 — 多策略搜索 + 评分匹配 + JSONP 歌词接口 + Base64 UTF-8 解码
 *              移植自 Lyrix fetchers/qqmusic.rs + searchers/qqmusic.rs
 * @author 鸡哥
 * @docs https://github.com/cXp1r/lyricify-lyrics-provider-rs
 */

import type { LyricsFetchResult, LyricLine, TranslationLyricsResult } from '../types';
import { parseSyncedLrc } from '../helpers';
import { parseTranslationLyrics } from '../translation';
import { requestJsonWithLog, requestTextWithLog } from '../request';
import { logger } from '../../../../../utils/logger';
import { searchWithScoring } from '../matcher';
import type { SearchCandidate } from '../searchTypes';

const LOG_TAG = '[QQMusic]';
const QQ_HEADERS = {
  Referer: 'https://c.y.qq.com/',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
};

/* ── JSONP / Base64 工具 ───────────────────────────────────────────── */

function resolveJsonpResponse(callback: string, raw: string): string {
  const prefix = `${callback}(`;
  if (!raw.startsWith(prefix)) return '';
  return raw.slice(prefix.length, raw.endsWith(')') ? raw.length - 1 : raw.length);
}

function base64DecodeUtf8(encoded: string): string {
  try {
    const raw = atob(encoded);
    const bytes = Uint8Array.from(raw, (ch) => ch.charCodeAt(0));
    return new TextDecoder('utf-8').decode(bytes);
  } catch (err) {
    logger.error(`${LOG_TAG} Base64/UTF-8 解码失败:`, err);
    return '';
  }
}

/* ── 主搜索接口（page 1 → page 2 回退）────────────────────────────── */

interface QQSong {
  id?: number;
  mid?: string;
  title?: string;
  name?: string;
  singer?: Array<{ title?: string; name?: string }>;
  album?: { title?: string; name?: string };
  interval?: number;
}

async function searchPrimary(query: string, page: string = '1'): Promise<SearchCandidate[]> {
  const searchPayload = {
    req_1: {
      method: 'DoSearchForQQMusicDesktop',
      module: 'music.search.SearchCgiService',
      param: {
        num_per_page: '20',
        page_num: page,
        query,
        search_type: 0,
      },
    },
  };

  const json = await requestJsonWithLog<Record<string, unknown>>(
    'https://u.y.qq.com/cgi-bin/musicu.fcg',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...QQ_HEADERS },
      body: JSON.stringify(searchPayload),
    },
  );
  if (!json) return [];

  const req1 = json.req_1 as Record<string, unknown> | undefined;
  const data = req1?.data as Record<string, unknown> | undefined;
  const body = data?.body as Record<string, unknown> | undefined;
  const songList = body?.song as Record<string, unknown> | undefined;
  const songs = songList?.list as QQSong[] | undefined;
  if (!songs || songs.length === 0) return [];

  return songs.map((song) => ({
    id: String(song.id ?? ''),
    mid: song.mid ?? '',
    title: song.title ?? song.name ?? '',
    artists: (song.singer ?? []).map((s) => s.title ?? s.name ?? ''),
    album: song.album?.title ?? song.album?.name ?? '',
    durationMs: song.interval !== undefined ? song.interval * 1000 : undefined,
  }));
}

/* ── 备用搜索接口（Lyrix search2）──────────────────────────────────── */

interface QQSong2 {
  songname?: string;
  albumname?: string;
  songid?: number;
  songmid?: string;
  singer?: Array<{ name?: string }>;
  interval?: number;
}

async function searchFallback(query: string): Promise<SearchCandidate[]> {
  const url = `https://shc.y.qq.com/soso/fcgi-bin/search_for_qq_cp?_=1657641526460&g_tk=1037878909&uin=1804681355&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&zhidaqu=1&catZhida=1&t=0&flag=1&ie=utf-8&sem=&aggr=0&perpage=20&n=20&p=1&remoteplace=txt.mqq.all&w=${encodeURIComponent(query)}`;

  const json = await requestJsonWithLog<Record<string, unknown>>(url, { headers: QQ_HEADERS });
  if (!json) return [];

  const data = json.data as Record<string, unknown> | undefined;
  const song = data?.song as Record<string, unknown> | undefined;
  const list = song?.list as QQSong2[] | undefined;
  if (!list || list.length === 0) return [];

  return list.map((song) => ({
    id: String(song.songid ?? ''),
    mid: song.songmid ?? '',
    title: song.songname ?? '',
    artists: (song.singer ?? []).map((s) => s.name ?? ''),
    album: song.albumname ?? '',
    durationMs: song.interval !== undefined ? song.interval * 1000 : undefined,
  }));
}

/* ── 统一搜索函数（主搜索 page 1→2 → 备用搜索）────────────────────── */

async function searchQQMusicAll(query: string): Promise<SearchCandidate[]> {
  // 主搜索 page 1
  let results = await searchPrimary(query, '1');
  if (results.length > 0) return results;

  // 主搜索 page 2
  results = await searchPrimary(query, '2');
  if (results.length > 0) return results;

  // 备用搜索接口
  return searchFallback(query);
}

/* ── LRC 歌词获取（POST form，与 Lyrix 对齐）───────────────────────── */

async function fetchLrc(songMid: string): Promise<LyricsFetchResult | null> {
  const callback = 'MusicJsonCallback_lrc';
  const pcachetime = Date.now().toString();
  const params = new URLSearchParams({
    callback,
    pcachetime,
    songmid: songMid,
    g_tk: '5381',
    jsonpCallback: callback,
    loginUin: '0',
    hostUin: '0',
    format: 'jsonp',
    inCharset: 'utf8',
    outCharset: 'utf8',
    notice: '0',
    platform: 'yqq',
    needNewCode: '0',
  });

  const rawText = await requestTextWithLog(
    'https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Referer: 'https://y.qq.com/',
        'User-Agent': 'Mozilla/5.0',
      },
      body: params.toString(),
    },
  );
  if (!rawText) {
    logger.warn(`${LOG_TAG} LRC 接口返回空, mid=${songMid}`);
    return null;
  }

  const jsonStr = resolveJsonpResponse(callback, rawText);
  if (!jsonStr) {
    logger.warn(`${LOG_TAG} JSONP 外壳解析失败, mid=${songMid}, 前 120 字=`, rawText.slice(0, 120));
    return null;
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (err) {
    logger.error(`${LOG_TAG} JSONP 内 JSON 解析失败, mid=${songMid}:`, err);
    return null;
  }

  const lyricB64 = typeof parsed.lyric === 'string' ? parsed.lyric : null;
  if (!lyricB64) {
    logger.warn(`${LOG_TAG} 响应中缺少 lyric 字段, mid=${songMid}`);
    return null;
  }

  const decoded = base64DecodeUtf8(lyricB64);
  if (!decoded) {
    logger.warn(`${LOG_TAG} lyric Base64 解码后为空, mid=${songMid}`);
    return null;
  }

  const lines = parseSyncedLrc(decoded);
  if (lines.length === 0) {
    logger.warn(`${LOG_TAG} LRC 解析后 0 行, mid=${songMid}`);
    return null;
  }
  const transB64 = typeof parsed.trans === 'string' ? parsed.trans : null;
  const translation: TranslationLyricsResult = parseTranslationLyrics(
    transB64 ? base64DecodeUtf8(transB64) : null,
  );

  logger.info(`${LOG_TAG} LRC 获取成功, mid=${songMid}, 行数=${lines.length}`);
  return { lyrics: lines, translation };
}

/* ── 对外入口 ──────────────────────────────────────────────────────── */

export async function fetchLyricsWithTranslationFromQQMusic(
  title: string,
  artist: string,
): Promise<LyricsFetchResult | null> {
  logger.info(`${LOG_TAG} 开始获取 LRC, title="${title}", artist="${artist}"`);

  const matched = await searchWithScoring(
    { title, artist },
    searchQQMusicAll,
    5,   // minScore
    7,   // wowScore
    '/', // splitChar (QQ Music 用 '/' 分隔艺术家)
  );

  if (!matched) {
    logger.warn(`${LOG_TAG} 无匹配歌曲`);
    return null;
  }

  logger.info(`${LOG_TAG} 匹配到: "${matched.title}" - "${matched.artists.join(', ')}" (id=${matched.id}, mid=${matched.mid})`);

  // 优先用 mid 获取 LRC
  if (matched.mid) {
    const result = await fetchLrc(matched.mid);
    if (result) return result;
  }

  logger.warn(`${LOG_TAG} LRC 获取失败, mid=${matched.mid}`);
  return null;
}

export async function fetchLyricsFromQQMusic(title: string, artist: string): Promise<LyricLine[] | null> {
  const result = await fetchLyricsWithTranslationFromQQMusic(title, artist);
  return result?.lyrics ?? null;
}
