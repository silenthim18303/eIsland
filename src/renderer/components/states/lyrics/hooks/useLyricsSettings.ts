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
 * @file useLyricsSettings.ts
 * @description 歌词相关设置 Hook（逐字扫光、时钟、外发光）
 * @author 鸡哥
 */

import { useEffect, useState } from 'react';
import { MUSIC_OUTER_GLOW_EFFECT_STORE_KEY } from '../config/lyricsConstants';

interface UseLyricsSettingsResult {
  karaokeEnabled: boolean;
  clockEnabled: boolean;
  musicOuterGlowEffectEnabled: boolean;
}

/**
 * 加载并监听歌词相关设置项。
 * @returns 逐字扫光、时钟、外发光三项开关状态。
 */
export function useLyricsSettings(): UseLyricsSettingsResult {
  const [karaokeEnabled, setKaraokeEnabled] = useState(false);
  const [clockEnabled, setClockEnabled] = useState(true);
  const [musicOuterGlowEffectEnabled, setMusicOuterGlowEffectEnabled] = useState(true);

  /** 加载逐字扫光与时钟配置 */
  useEffect(() => {
    window.api?.musicLyricsKaraokeGet().then(setKaraokeEnabled).catch(() => {});
    window.api?.musicLyricsClockGet().then(setClockEnabled).catch(() => {});
  }, []);

  /** 监听外发光效果开关 */
  useEffect(() => {
    let cancelled = false;
    window.api.storeRead(MUSIC_OUTER_GLOW_EFFECT_STORE_KEY).then((value) => {
      if (cancelled) return;
      if (typeof value === 'boolean') setMusicOuterGlowEffectEnabled(value);
    }).catch(() => {});

    const handler = (e: Event): void => {
      if (cancelled) return;
      const val = (e as CustomEvent).detail;
      if (typeof val === 'boolean') setMusicOuterGlowEffectEnabled(val);
    };
    window.addEventListener('music-outer-glow-effect-changed', handler);

    return () => {
      cancelled = true;
      window.removeEventListener('music-outer-glow-effect-changed', handler);
    };
  }, []);

  return { karaokeEnabled, clockEnabled, musicOuterGlowEffectEnabled };
}
