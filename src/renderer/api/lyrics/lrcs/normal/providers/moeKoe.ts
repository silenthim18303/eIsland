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
 * @file moeKoe.ts
 * @description MoeKoe Music 歌词拉取 — WebSocket 连接本地 MoeKoe 客户端 → 接收 KRC 格式歌词 → 解析为行级同步歌词
 * @author 鸡哥
 * @docs https://github.com/cXp1r/lyricify-lyrics-provider-rs
 */

import type { LyricLine } from '../types';
import { parseKrc } from '../helpers';
import { logger } from '../../../../../utils/logger';

const LOG_TAG = '[MoeKoe]';
const WS_URL = 'ws://127.0.0.1:6520';
const RECEIVE_TIMEOUT_MS = 2000;

interface WsEnvelope {
  type: string;
  data?: {
    lyricsData?: string;
  };
}

/**
 * 通过 WebSocket 从 MoeKoe Music 获取歌词数据
 * @returns KRC 格式歌词文本，失败返回 null
 */
function fetchLyricsViaWebSocket(): Promise<string | null> {
  return new Promise((resolve) => {
    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        ws.close();
        resolve(null);
      }
    }, RECEIVE_TIMEOUT_MS);

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      logger.info(`${LOG_TAG} WebSocket 已连接`);
    };

    ws.onmessage = (event) => {
      if (settled) return;
      try {
        const text = typeof event.data === 'string' ? event.data : '';
        if (!text) return;

        const envelope: WsEnvelope = JSON.parse(text);
        if (envelope.type !== 'lyrics') return;

        const lyricsData = envelope.data?.lyricsData;
        if (!lyricsData) return;

        settled = true;
        clearTimeout(timeout);
        ws.close();
        resolve(lyricsData);
      } catch {
        // 非 JSON 消息忽略
      }
    };

    ws.onerror = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        resolve(null);
      }
    };

    ws.onclose = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        resolve(null);
      }
    };
  });
}

/**
 * MoeKoe Music 歌词对外入口
 * 注意: MoeKoe 需要运行桌面客户端，且当前歌曲有歌词才能获取
 * @param _title - 未使用（歌词由 MoeKoe 客户端直接提供）
 * @param _artist - 未使用
 * @returns 行级同步歌词行
 */
export async function fetchLyricsFromMoeKoe(_title: string, _artist: string): Promise<LyricLine[] | null> {
  logger.info(`${LOG_TAG} 尝试通过 WebSocket 获取歌词`);
  try {
    const krcContent = await fetchLyricsViaWebSocket();
    if (!krcContent) {
      logger.warn(`${LOG_TAG} 未收到歌词数据（MoeKoe 未运行或无歌词）`);
      return null;
    }

    // parseKrc 返回的是行级同步歌词（time_ms + text）
    const lines = parseKrc(krcContent);
    if (lines.length === 0) {
      logger.warn(`${LOG_TAG} KRC 解析出 0 行`);
      return null;
    }

    logger.info(`${LOG_TAG} 获取成功, 行数=${lines.length}`);
    return lines;
  } catch (err) {
    logger.error(`${LOG_TAG} 未预期异常:`, err);
    return null;
  }
}
