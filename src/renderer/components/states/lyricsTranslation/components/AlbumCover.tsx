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
 * @file AlbumCover.tsx
 * @description 专辑封面组件
 * @author 鸡哥
 */

import type { ReactElement } from 'react';

interface AlbumCoverProps {
  isMusicPlaying: boolean;
  isPlaying: boolean;
  coverImage: string | null;
  glowEnabled: boolean;
  dominantColor: [number, number, number];
}

/**
 * @description 渲染左侧专辑封面及光晕效果。
 * @param props - 封面参数。
 * @returns 专辑封面节点。
 */
export function AlbumCover(props: AlbumCoverProps): ReactElement {
  const { isMusicPlaying, isPlaying, coverImage, glowEnabled, dominantColor } = props;
  const [r, g, b] = dominantColor;

  return (
    <div className="lyrics-left">
      <div
        className={`idle-album-cover${!isPlaying ? ' paused' : ''}${isMusicPlaying && coverImage && glowEnabled ? ' glowing' : ''}`}
        style={{
          backgroundImage: coverImage ? `url(${coverImage})` : undefined,
          ...(isMusicPlaying && coverImage && glowEnabled ? { boxShadow: `0 0 12px 4px rgba(${r}, ${g}, ${b}, 0.5)` } : {}),
        }}
      />
    </div>
  );
}
