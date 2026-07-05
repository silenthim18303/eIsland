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
 * @file GlowBackground.tsx
 * @description 背景光晕组件
 * @author 鸡哥
 */

import type { ReactElement } from 'react';

interface GlowBackgroundProps {
  isMusicPlaying: boolean;
  isPlaying: boolean;
  coverImage: string | null;
  glowEnabled: boolean;
  dominantColor: [number, number, number];
}

/**
 * @description 渲染音乐播放时的背景光晕效果。
 * @param props - 光晕参数。
 * @returns 光晕节点。
 */
export function GlowBackground(props: GlowBackgroundProps): ReactElement {
  const { isMusicPlaying, isPlaying, coverImage, glowEnabled, dominantColor } = props;
  const [r, g, b] = dominantColor;

  return (
    <div
      className={`idle-glow${isMusicPlaying && coverImage && glowEnabled ? ' active' : ''}${isMusicPlaying && coverImage && !isPlaying && glowEnabled ? ' paused' : ''}`}
      style={isMusicPlaying && coverImage && glowEnabled
        ? { background: `radial-gradient(ellipse at 10% 50%, rgba(${r}, ${g}, ${b}, 0.35) 0%, transparent 60%)` }
        : undefined}
    />
  );
}
