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
 * @file useIslandNowPlayingSync.ts
 * @description 音乐播放信息与歌词同步 Hook。
 * @author 鸡哥
 */

import { useEffect, useLayoutEffect, useRef } from 'react';
import type { NowPlayingInfo } from '../../store/isLandStore';
import type { SyncedLyricLine } from '../../store/types';
import { fetchLyrics } from '../../api/lyrics/lrcApi';
import { fetchKaraokeLyrics } from '../../api/lyrics/lrcs/karaoke';
import type { KaraokeLine } from '../../api/lyrics/lrcs/karaoke';

/**
 * 歌词校准：歌词获取完成后，读取 SMTC 当前播放位置，修正歌词时间偏移
 * @description 解决歌词源时间轴与 SMTC 播放位置不对齐的问题
 * @param lyrics - 原始歌词数据
 * @returns 校准后的歌词数据
 */
async function calibrateLyrics(lyrics: SyncedLyricLine[]): Promise<SyncedLyricLine[]> {
  try {
    const ts = await window.api.smtcGetTimestamp();
    if (!ts?.isAvailable || !ts.timeline) {
      console.log('[LyricsCalibrate] SMTC 时间戳不可用，跳过校准');
      return lyrics;
    }

    const smtcPositionMs = ts.timeline.position * 1000;

    // 找到当前播放位置对应的歌词行
    let matchedLine: SyncedLyricLine | undefined;
    for (let i = 0; i < lyrics.length; i++) {
      const line = lyrics[i];
      const next = lyrics[i + 1];
      if (smtcPositionMs >= line.time_ms && (!next || smtcPositionMs < next.time_ms)) {
        matchedLine = line;
        break;
      }
    }
    if (!matchedLine) {
      console.log('[LyricsCalibrate] 未找到匹配歌词行，跳过校准');
      return lyrics;
    }

    // 计算偏差：SMTC 位置 vs 歌词期望位置
    const offsetMs = smtcPositionMs - matchedLine.time_ms;
    // 仅当偏差超过 100ms 时校准，避免无意义的微调
    if (Math.abs(offsetMs) < 100) {
      console.log(`[LyricsCalibrate] 偏差 ${offsetMs.toFixed(0)}ms 在容忍范围内，无需校准`);
      return lyrics;
    }

    console.log(`[LyricsCalibrate] 校准触发: offset=${offsetMs.toFixed(0)}ms, SMTC=${smtcPositionMs.toFixed(0)}ms, 歌词=${matchedLine.time_ms.toFixed(0)}ms, 行="${matchedLine.text}"`);

    // 应用偏移量到所有歌词行
    return lyrics.map((line) => ({
      ...line,
      time_ms: line.time_ms + offsetMs,
    }));
  } catch {
    return lyrics;
  }
}

/** 校准延迟时间（毫秒），等待播放进入歌词区域后再校准 */
const CALIBRATE_DELAY_MS = 20_000;

/**
 * 延迟校准：先设置歌词，20 秒后再读取 SMTC 时间戳校准
 * @param lyrics - 原始歌词数据
 * @param capturedKey - 当前歌曲标识，用于检测切歌
 * @param songKeyRef - 歌曲标识 ref
 * @param setSyncedLyricsRef - 设置歌词的 ref
 */
function scheduleCalibration(
  lyrics: SyncedLyricLine[],
  capturedKey: string,
  songKeyRef: React.MutableRefObject<string>,
  setSyncedLyricsRef: React.MutableRefObject<(lyrics: SyncedLyricLine[] | null) => void>,
): void {
  setTimeout(async () => {
    if (songKeyRef.current !== capturedKey) return;
    const calibrated = await calibrateLyrics(lyrics);
    if (songKeyRef.current !== capturedKey) return;
    setSyncedLyricsRef.current(calibrated);
  }, CALIBRATE_DELAY_MS);
}

interface UseIslandNowPlayingSyncOptions {
  handleNowPlayingUpdate: (info: NowPlayingInfo | null) => void;
  updateProgress: (positionMs: number) => void;
  setSyncedLyrics: (lyrics: SyncedLyricLine[] | null) => void;
  setLyricsLoading: (loading: boolean) => void;
}

/**
 * @description 同步系统播放信息、进度与歌词数据。
 * @param options - 播放信息同步配置。
 */
export function useIslandNowPlayingSync(options: UseIslandNowPlayingSyncOptions): void {
  const {
    handleNowPlayingUpdate,
    updateProgress,
    setSyncedLyrics,
    setLyricsLoading,
  } = options;

  const handleNowPlayingUpdateRef = useRef(handleNowPlayingUpdate);
  const updateProgressRef = useRef(updateProgress);
  const setSyncedLyricsRef = useRef(setSyncedLyrics);
  const setLyricsLoadingRef = useRef(setLyricsLoading);
  const songKeyRef = useRef('');
  const progressBaseRef = useRef({ positionMs: 0, durationMs: 0, timestamp: 0 });
  const progressRafRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    handleNowPlayingUpdateRef.current = handleNowPlayingUpdate;
  });

  useLayoutEffect(() => {
    updateProgressRef.current = updateProgress;
  });

  useLayoutEffect(() => {
    setSyncedLyricsRef.current = setSyncedLyrics;
    setLyricsLoadingRef.current = setLyricsLoading;
  });

  useEffect(() => {
    const stopProgressRAF = () => {
      if (progressRafRef.current !== null) {
        cancelAnimationFrame(progressRafRef.current);
        progressRafRef.current = null;
      }
    };

    const unsubscribe = window.api?.onNowPlayingInfo((info: NowPlayingInfo | null) => {
      handleNowPlayingUpdateRef.current(info);

      const newKey = info ? `${info.title}||${info.artist}` : '';
      if (newKey && newKey !== songKeyRef.current) {
        songKeyRef.current = newKey;
        setSyncedLyricsRef.current(null);
        setLyricsLoadingRef.current(true);
        const capturedKey = newKey;
        const title = info!.title;
        const artist = info!.artist;
        const deviceId = info!.deviceId;

        const loadLyrics = async (): Promise<void> => {
          let karaokeEnabled = false;
          try {
            karaokeEnabled = await window.api.musicLyricsKaraokeGet();
          } catch {
            karaokeEnabled = false;
          }

          if (karaokeEnabled) {
            try {
              const karaoke = await fetchKaraokeLyrics(title, artist, deviceId);
              if (songKeyRef.current !== capturedKey) return;
              if (karaoke && karaoke.length > 0) {
                const mapped: SyncedLyricLine[] = karaoke.map((line: KaraokeLine) => ({
                  time_ms: line.time_ms,
                  text: line.text,
                  duration_ms: line.duration_ms,
                  syllables: line.syllables,
                }));
                setSyncedLyricsRef.current(mapped);
                scheduleCalibration(mapped, capturedKey, songKeyRef, setSyncedLyricsRef);
                return;
              }
            } catch {
              // fallback to normal lyrics source
            }
            if (songKeyRef.current !== capturedKey) return;
          }

          try {
            const result = await fetchLyrics(title, artist, deviceId);
            if (songKeyRef.current !== capturedKey) return;
            setSyncedLyricsRef.current(result);
            if (result && result.length > 0) {
              scheduleCalibration(result, capturedKey, songKeyRef, setSyncedLyricsRef);
            }
          } catch {
            if (songKeyRef.current === capturedKey) setSyncedLyricsRef.current(null);
          }
        };

        loadLyrics();
      } else if (!newKey) {
        songKeyRef.current = '';
        setSyncedLyricsRef.current(null);
      }

      if (info && info.position_ms !== undefined) {
        if (info.isPlaying) {
          progressBaseRef.current = {
            positionMs: info.position_ms,
            durationMs: info.duration_ms,
            timestamp: Date.now(),
          };

          if (progressRafRef.current === null) {
            let lastProgressWrite = 0;
            const tick = () => {
              const now = Date.now();
              const base = progressBaseRef.current;
              const elapsed = now - base.timestamp;
              if (now - lastProgressWrite >= 66) {
                lastProgressWrite = now;
                updateProgressRef.current(base.positionMs + elapsed);
              }
              progressRafRef.current = requestAnimationFrame(tick);
            };
            progressRafRef.current = requestAnimationFrame(tick);
          }
        } else {
          stopProgressRAF();
          updateProgressRef.current(info.position_ms);
        }
      }
    });

    return () => {
      unsubscribe?.();
      stopProgressRAF();
    };
  }, []);
}
