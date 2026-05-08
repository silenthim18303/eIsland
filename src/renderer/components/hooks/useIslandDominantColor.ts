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
 * @file useIslandDominantColor.ts
 * @description 专辑封面主色提取 Hook。
 * @author 鸡哥
 */

import { useEffect } from 'react';
import { getColor } from 'colorthief';

interface UseIslandDominantColorOptions {
  coverImage: string | null;
  setDominantColor: (color: [number, number, number]) => void;
}

/**
 * @description 根据封面图提取并更新主色。
 * @param options - 主色提取配置。
 */
export function useIslandDominantColor(options: UseIslandDominantColorOptions): void {
  const { coverImage, setDominantColor } = options;

  useEffect(() => {
    if (!coverImage) {
      setDominantColor([0, 0, 0]);
      return;
    }

    let isStale = false;
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = coverImage;
    img.onload = async () => {
      if (isStale) return;
      try {
        const color = await getColor(img, { colorSpace: 'rgb' });
        if (color && !isStale) {
          const { r, g, b } = color.rgb();
          setDominantColor([r, g, b]);
        }
      } catch (error) {
        console.error('ColorThief error:', error);
      }
    };

    return () => {
      isStale = true;
      img.onload = null;
      img.src = '';
    };
  }, [coverImage, setDominantColor]);
}
