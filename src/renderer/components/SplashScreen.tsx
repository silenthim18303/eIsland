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
 * @description 启动画面组件（开场视频 + 纯黑背景）
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

/** 启动画面组件 */
export function SplashScreen(): ReactElement {
  const [fadeOut, setFadeOut] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  /** 视频播放完成，通知主进程 */
  const handleVideoEnded = useCallback(() => {
    window.electron.ipcRenderer.send('splash:video-ended');
  }, []);

  /** 监听主进程指令：开始播放视频 */
  useEffect(() => {
    const removeListener = window.electron.ipcRenderer.on('splash:play-video', () => {
      videoRef.current?.play().catch(() => {});
    });
    return removeListener;
  }, []);

  /** 监听主进程指令：淡出 */
  useEffect(() => {
    const removeListener = window.electron.ipcRenderer.on('splash:fade-out', () => {
      setFadeOut(true);
    });
    return removeListener;
  }, []);

  return (
    <div className={`splash-container${fadeOut ? ' fade-out' : ''}`}>
      <video
        ref={videoRef}
        className="splash-video"
        src="/video/sign.mp4"
        muted
        onEnded={handleVideoEnded}
      />
    </div>
  );
}
