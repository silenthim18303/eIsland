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
 * @file smtcUtils.ts
 * @description 引导 SMTC 模块 — 工具函数
 * @author 鸡哥
 */

import { getColor } from 'colorthief';
import type { SvgIconKey } from '../../../../../utils/SvgIcon';

/**
 * 提取封面主色
 * @param coverImage - 封面 data URL
 * @returns RGB 主色
 */
export async function extractDominantColor(coverImage: string): Promise<[number, number, number]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = coverImage;
    img.onload = async () => {
      try {
        const color = await getColor(img, { colorSpace: 'rgb' });
        if (color) {
          const { r, g, b } = color.rgb();
          resolve([r, g, b]);
          return;
        }
      } catch { /* fallback */ }
      resolve([0, 0, 0]);
    };
    img.onerror = () => resolve([0, 0, 0]);
  });
}

/**
 * 从 sourceAppId 提取可读播放器名
 * @param sourceAppId - 播放源标识
 * @returns 可读播放器名称
 */
export function extractPlayerName(sourceAppId: string): string {
  if (!sourceAppId) return '未知';
  const name = sourceAppId.replace(/^.*[/\\]/, '').replace(/\.exe$/i, '');
  return name || sourceAppId;
}

/** 播放器 exe 名 → SvgIcon 键映射表 */
const PLAYER_ICON_MAP: Record<string, SvgIconKey> = {
  Spotify: 'PLAYER_SPOTIFY',
  cloudmusic: 'PLAYER_NETEASE',
  QQMusic: 'PLAYER_QQMUSIC',
  KuGoo: 'PLAYER_KUGOU',
  汽水音乐: 'PLAYER_SODAMUSIC',
  iTunes: 'PLAYER_APPLE_MUSIC',
};

/**
 * 根据播放源标识获取对应播放器图标键
 * @param sourceAppId - 播放源标识
 * @returns SvgIcon 键名，未匹配时返回 undefined
 */
export function getPlayerIcon(sourceAppId: string): SvgIconKey | undefined {
  if (!sourceAppId) return undefined;
  const name = sourceAppId.replace(/^.*[/\\]/, '').replace(/\.exe$/i, '');
  return PLAYER_ICON_MAP[name];
}
