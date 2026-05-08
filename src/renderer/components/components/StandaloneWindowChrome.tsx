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
 * @file StandaloneWindowChrome.tsx
 * @description 独立窗口标题栏与标签栏组件。
 * @author 鸡哥
 */

import type { JSX } from 'react';
import type { WindowTab } from '../config/standaloneWindowConfig';

interface StandaloneWindowChromeProps {
  windowIcon: string;
  tabList: { key: WindowTab; labelKey: string }[];
  activeTab: WindowTab;
  switchTab: (tab: WindowTab) => void;
  standaloneMacControls: boolean;
  t: (key: string) => string;
}

/**
 * @description 渲染独立窗口 Chrome 区域。
 * @param props - 独立窗口标题栏渲染参数。
 * @returns 独立窗口 Chrome 节点。
 */
export function StandaloneWindowChrome(props: StandaloneWindowChromeProps): JSX.Element {
  const {
    windowIcon,
    tabList,
    activeTab,
    switchTab,
    standaloneMacControls,
    t,
  } = props;

  return (
    <div className="cw-chrome">
      <img className="cw-window-icon" src={windowIcon} alt="eIsland" />
      <div className="cw-tabs">
        {tabList.map((tab) => (
          <button
            key={tab.key}
            className={`cw-tab ${activeTab === tab.key ? 'cw-tab--active' : ''}`}
            onClick={() => switchTab(tab.key)}
            type="button"
          >
            <span className="cw-tab__label">{t(tab.labelKey)}</span>
          </button>
        ))}
      </div>
      <div className="cw-chrome__drag" />
      <div className={`cw-chrome__controls ${standaloneMacControls ? 'cw-chrome__controls--mac' : ''}`}>
        {standaloneMacControls ? (
          <>
            <button className="cw-ctrl cw-ctrl--mac cw-ctrl--mac-minimize" type="button" title={t('standalone.controls.minimize')} onClick={() => window.api.windowMinimize()}>
              <span className="cw-ctrl-dot" />
            </button>
            <button className="cw-ctrl cw-ctrl--mac cw-ctrl--mac-maximize" type="button" title={t('standalone.controls.maximize')} onClick={() => window.api.windowMaximize()}>
              <span className="cw-ctrl-dot" />
            </button>
            <button className="cw-ctrl cw-ctrl--mac cw-ctrl--mac-close" type="button" title={t('standalone.controls.close')} onClick={() => window.api.windowClose()}>
              <span className="cw-ctrl-dot" />
            </button>
          </>
        ) : (
          <>
            <button className="cw-ctrl" type="button" title={t('standalone.controls.minimize')} onClick={() => window.api.windowMinimize()}>
              <svg width="10" height="1" viewBox="0 0 10 1"><rect width="10" height="1" fill="currentColor"/></svg>
            </button>
            <button className="cw-ctrl" type="button" title={t('standalone.controls.maximize')} onClick={() => window.api.windowMaximize()}>
              <svg width="10" height="10" viewBox="0 0 10 10"><rect x="0.5" y="0.5" width="9" height="9" rx="1" fill="none" stroke="currentColor" strokeWidth="1"/></svg>
            </button>
            <button className="cw-ctrl cw-ctrl--close" type="button" title={t('standalone.controls.close')} onClick={() => window.api.windowClose()}>
              <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
