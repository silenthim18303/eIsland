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
 * @file useSplash.ts
 * @description 启动画面交互逻辑聚合 Hook
 * @author 鸡哥
 */

import { useSplashFadeOut } from './useSplashFadeOut';
import { useSplashVideo } from './useSplashVideo';

/** 启动画面交互逻辑聚合 Hook */
export function useSplash() {
  const { fadeOut } = useSplashFadeOut();
  const { videoRef, handleVideoEnded } = useSplashVideo();

  return { fadeOut, videoRef, handleVideoEnded };
}
