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
 * @file volume.ts
 * @description 渲染端声音音量配置读取与换算工具。
 * @author 鸡哥
 */

export const GLOBAL_SOUND_VOLUME_STORE_KEY = 'sound-volume-global';
export const ALARM_SOUND_VOLUME_STORE_KEY = 'sound-volume-alarm';
export const EFFECT_SOUND_VOLUME_STORE_KEY = 'sound-volume-effect';

export const SOUND_VOLUME_STORE_KEYS = new Set<string>([
  GLOBAL_SOUND_VOLUME_STORE_KEY,
  ALARM_SOUND_VOLUME_STORE_KEY,
  EFFECT_SOUND_VOLUME_STORE_KEY,
]);

const DEFAULT_VOLUME = 1;

/**
 * 将音量值限制在 0 到 1 之间。
 * @param value - 原始音量值。
 * @returns 限制后的音量值。
 */
export function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_VOLUME;
  return Math.max(0, Math.min(1, value));
}

async function readVolumeByKey(key: string, fallback = DEFAULT_VOLUME): Promise<number> {
  const value = await window.api?.storeRead(key).catch(() => fallback);
  return typeof value === 'number' ? clampVolume(value) : fallback;
}

export async function readEffectiveAudioVolume(category: 'alarm' | 'effect'): Promise<number> {
  const [globalVolume, categoryVolume] = await Promise.all([
    readVolumeByKey(GLOBAL_SOUND_VOLUME_STORE_KEY),
    readVolumeByKey(category === 'alarm' ? ALARM_SOUND_VOLUME_STORE_KEY : EFFECT_SOUND_VOLUME_STORE_KEY),
  ]);
  return clampVolume(globalVolume * categoryVolume);
}
