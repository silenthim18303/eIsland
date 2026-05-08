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

import { useEffect, useLayoutEffect, useRef } from 'react';
import type { NowPlayingInfo } from '../../store/isLandStore';
import type { SyncedLyricLine } from '../../store/types';
import { fetchLyrics } from '../../api/lyrics/lrcApi';
import { fetchKaraokeLyrics } from '../../api/lyrics/lrcs/karaoke';
import type { KaraokeLine } from '../../api/lyrics/lrcs/karaoke';

interface UseIslandNowPlayingSyncOptions {
  handleNowPlayingUpdate: (info: NowPlayingInfo | null) => void;
  updateProgress: (positionMs: number) => void;
  setSyncedLyrics: (lyrics: SyncedLyricLine[] | null) => void;
  setLyricsLoading: (loading: boolean) => void;
}

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
