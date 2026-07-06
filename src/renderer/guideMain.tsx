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
 * @file guideMain.tsx
 * @description 引导配置窗口 React 渲染入口
 * @description 首次启动时引导用户完成基础配置，splash 动画结束后通过
 *   FIRST_LAUNCH_STORE_KEY 判断是否进入配置界面（dev 模式下默认进入）
 * @author 鸡哥
 */

import { StrictMode, useState, useCallback } from 'react';
import type { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/guide.css';
import { WaveEffect } from './components/components/WaveEffect';
import { LanguageStep } from './components/components/Guide/language';

/** 引导窗口根组件 */
function GuideApp(): ReactElement {
  /** 通知主进程引导完成，关闭引导窗口并显示主窗口 */
  const handleComplete = useCallback((): void => {
    window.electron.ipcRenderer.send('guide:complete');
  }, []);

  /** 语言选择完成，进入下一步（暂直接完成） */
  const handleLanguageNext = useCallback((): void => {
    handleComplete();
  }, [handleComplete]);

  return (
    <div className="guide-container">
      <WaveEffect />
      <div className="guide-content">
        <LanguageStep onNext={handleLanguageNext} />
      </div>
    </div>
  );
}

const root = document.getElementById('root');
if (!root) {
  throw new Error('[GuideRenderer] 未找到 #root 挂载节点');
}

createRoot(root).render(
  <StrictMode>
    <GuideApp />
  </StrictMode>
);
