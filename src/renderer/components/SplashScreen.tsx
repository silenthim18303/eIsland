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
 * @file SplashScreen.tsx
 * @description 启动画面组件（开场视频 + 电子音浪背景）
 * @author 鸡哥
 */

import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { useSplash } from './hooks/useSplash';
import { SPLASH_VIDEO_SRC } from './config/splashWindowConfig';
import { WaveEffect } from './components/DynamicIslandSharedWaveEffect';

/** 启动画面默认背景颜色 */
const DEFAULT_BG_COLOR = '#000000';

/** 启动画面组件 */
export function SplashScreen(): ReactElement {
  const { fadeOut, videoRef, handleVideoEnded } = useSplash();
  const [bgColor, setBgColor] = useState(DEFAULT_BG_COLOR);

  useEffect(() => {
    window.api.storeRead('splash-bg-color').then((v) => {
      if (typeof v === 'string') setBgColor(v);
    }).catch(() => {});
  }, []);

  return (
    <div
      className={`splash-container${fadeOut ? ' fade-out' : ''}`}
      style={{ background: bgColor }}
    >
      <WaveEffect />
      <video
        ref={videoRef}
        className="splash-video"
        src={SPLASH_VIDEO_SRC}
        muted
        onEnded={handleVideoEnded}
      />
    </div>
  );
}
