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
 * @description 启动画面组件，显示图标、应用名和加载动画
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import eislandSvg from '../../../resources/icon/eisland.svg';
import { useSplash } from './hooks/useSplash';

/** 启动画面组件 */
export function SplashScreen(): ReactElement {
  const { fadeOut, version } = useSplash();

  return (
    <div className={`splash-container${fadeOut ? ' fade-out' : ''}`}>
      <div className="splash-icon-wrapper">
        <img src={eislandSvg} alt="eIsland" draggable={false} />
      </div>
      <div className="splash-app-name">eIsland</div>
      <div className="splash-app-subtitle">灵动岛 · 正在启动</div>
      <div className="splash-loading-pill">
        <div className="splash-loading-pill-dot">
          <span />
          <span />
          <span />
        </div>
      </div>
      {version && <div className="splash-version">v{version}</div>}
    </div>
  );
}
