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
 * @file StandaloneWindow.tsx
 * @description 倒数日/TODOs/设置 独立窗口根组件 — 浏览器风格顶部 Tab 切换
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { StandaloneWindowBackground } from './components/StandaloneWindowBackground';
import { StandaloneWindowChrome } from './components/StandaloneWindowChrome';
import { StandaloneWindowViewport } from './components/StandaloneWindowViewport';
import { useStandaloneWindowShell } from './hooks/useStandaloneWindowShell';
import { TAB_LIST } from './config/standaloneWindowConfig';
import useIslandStore from '../store/slices';
import windowIcon from '../../../resources/icon/eisland.svg';

/**
 * 独立窗口根组件
 * @description 提供待办、倒数日与设置三个页签的窗口化视图
 */
export function StandaloneWindow(): ReactElement {
  const { t } = useTranslation();
  const state = useIslandStore((s) => s.state);
  const {
    activeTab,
    switchTab,
    bgMedia,
    bgVideoFit,
    bgVideoMuted,
    bgVideoVolume,
    bgVideoHwDecode,
    bgVideoElementRef,
    bgImageOpacity,
    bgImageBlur,
    standaloneMacControls,
    handleVideoLoadedMetadata,
    handleVideoCanPlay,
  } = useStandaloneWindowShell();

  return (
    <div className="cw-root">
      <StandaloneWindowBackground
        bgMedia={bgMedia}
        bgImageOpacity={bgImageOpacity}
        bgImageBlur={bgImageBlur}
        bgVideoHwDecode={bgVideoHwDecode}
        bgVideoElementRef={bgVideoElementRef}
        bgVideoMuted={bgVideoMuted}
        bgVideoVolume={bgVideoVolume}
        bgVideoFit={bgVideoFit}
        onVideoLoadedMetadata={handleVideoLoadedMetadata}
        onVideoCanPlay={handleVideoCanPlay}
      />
      <StandaloneWindowChrome
        windowIcon={windowIcon}
        tabList={TAB_LIST}
        activeTab={activeTab}
        switchTab={switchTab}
        standaloneMacControls={standaloneMacControls}
        t={t}
      />

      <StandaloneWindowViewport
        activeTab={activeTab}
        state={state}
      />
    </div>
  );
}
