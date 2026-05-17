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
 * @file MiniGameTab.tsx
 * @description MaxExpand 迷你游戏占位 Tab 组件
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import eislandLogo from '../../../../../../resources/icon/eisland.svg';

/**
 * 迷你游戏 Tab 内容
 * @returns React 元素
 */
export function MiniGameTab(): ReactElement {
  const { t } = useTranslation();

  return (
    <div
      className="mini-game-tab-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        textAlign: 'center',
        gap: '10px',
      }}
    >
      <img src={eislandLogo} alt={t('common.appName')} style={{ width: '56px', height: '56px' }} draggable={false} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '6px' }}>
        <div style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1.4 }}>{t('miniGameTab.title')}</div>
        <div style={{ fontSize: '14px', opacity: 0.8, lineHeight: 1.5 }}>{t('miniGameTab.subtitle')}</div>
      </div>
    </div>
  );
}
