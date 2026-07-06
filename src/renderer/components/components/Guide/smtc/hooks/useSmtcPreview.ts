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
 * @file useSmtcPreview.ts
 * @description 引导 SMTC 媒体测试 — 订阅 SMTC 实时更新
 * @author 鸡哥
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { NowPlayingInfo } from '../../../../../../preload/types/media';
import type { SmtcTestStatus, SmtcMediaMeta, UseSmtcTestReturn } from '../types';
import { extractDominantColor } from '../utils/smtcUtils';

/**
 * SMTC 媒体测试 Hook
 * @description 订阅 SMTC 实时推送，自动更新封面、元数据与播放状态
 */
export function useSmtcTest(): UseSmtcTestReturn {
  const [status, setStatus] = useState<SmtcTestStatus>('loading');
  const [meta, setMeta] = useState<SmtcMediaMeta | null>(null);
  const dominantColorCache = useRef<Map<string, [number, number, number]>>(new Map());
  const sourceAppIdRef = useRef('');
  /** 缓存当前封面与主色，时间戳变化时复用 */
  const coverRef = useRef<string | null>(null);
  const colorRef = useRef<[number, number, number]>([0, 0, 0]);
  /** 进度插值基准 */
  const progressRef = useRef({ baseMs: 0, timestamp: 0, isPlaying: false });
  const rafRef = useRef<number>(0);

  /** 处理 SMTC 推送 */
  const handleNowPlaying = useCallback(async (info: NowPlayingInfo | null) => {
    if (!info || !info.title) {
      setStatus('no-media');
      return;
    }

    // 封面：仅当推送中携带 thumbnail 时更新（时间戳变化不带封面）
    const hasThumbnail = Object.prototype.hasOwnProperty.call(info, 'thumbnail');
    if (hasThumbnail) {
      const newCover = info.thumbnail ?? null;
      coverRef.current = newCover;

      // 主色：按封面数据缓存，相同封面不重复提取
      if (newCover) {
        const cached = dominantColorCache.current.get(newCover);
        if (cached) {
          colorRef.current = cached;
        } else {
          colorRef.current = await extractDominantColor(newCover);
          dominantColorCache.current.set(newCover, colorRef.current);
        }
      } else {
        colorRef.current = [0, 0, 0];
      }
    }

    // 首次获取播放源（仅查询一次）
    if (!sourceAppIdRef.current) {
      try {
        const result = await window.api.musicDetectSourceAppId();
        const sources = result?.sources ?? [];
        const active = sources.find((s) => s.isPlaying && s.hasTitle) ?? sources[0];
        if (active) sourceAppIdRef.current = active.sourceAppId;
      } catch { /* ignore */ }
    }

    // 更新进度插值基准
    progressRef.current = {
      baseMs: info.position_ms,
      timestamp: Date.now(),
      isPlaying: info.isPlaying,
    };

    setMeta({
      title: info.title,
      artist: info.artist,
      album: info.album ?? '',
      coverImage: coverRef.current,
      dominantColor: colorRef.current,
      isPlaying: info.isPlaying,
      durationMs: info.duration_ms,
      positionMs: info.position_ms,
      sourceAppId: sourceAppIdRef.current,
    });
    setStatus('success');
  }, []);

  /** 订阅 SMTC + 主动拉取一次（防止推送还没到） */
  useEffect(() => {
    window.api.mediaCurrentInfoGet().then(handleNowPlaying).catch(() => {});
    const unsubscribe = window.api.onNowPlayingInfo(handleNowPlaying);
    return () => { unsubscribe(); };
  }, [handleNowPlaying]);

  /** requestAnimationFrame 驱动进度插值 */
  useEffect(() => {
    let lastWrite = 0;
    const tick = (): void => {
      const p = progressRef.current;
      if (p.isPlaying && p.timestamp > 0) {
        const now = Date.now();
        if (now - lastWrite >= 66) {
          lastWrite = now;
          const pos = p.baseMs + (now - p.timestamp);
          setMeta((prev) => prev ? { ...prev, positionMs: pos } : prev);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(rafRef.current); };
  }, []);

  /** 重试：重新获取当前信息 */
  const retry = useCallback(async () => {
    setStatus('loading');
    sourceAppIdRef.current = '';
    try {
      const info = await window.api.mediaCurrentInfoGet();
      await handleNowPlaying(info);
    } catch {
      setStatus('no-media');
    }
  }, [handleNowPlaying]);

  return { status, meta, retry };
}
