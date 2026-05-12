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
 * @file MiniSettingIsland.tsx
 * @description 迷你设置岛演示组件 — 带实际生效的设置切换按钮
 * @author 鸡哥
 */

import React, { useEffect, useState } from 'react';
import { setThemeMode as applyThemeMode, getThemeMode, type ThemeMode } from '../../../../utils/theme';
import i18n from '../../../../i18n';
import type { MiniSettingDemo } from '../config/guideContentConfig';

/** 迷你设置岛演示组件 — 带实际生效的设置切换按钮 */
export function MiniSettingIsland({ demo }: { demo: MiniSettingDemo }): React.ReactElement {
  const tr = (key: string, fallback: string): string => i18n.t(key, { defaultValue: fallback });
  const [themeMode, setThemeMode] = useState<ThemeMode>(getThemeMode);
  const [opacity, setOpacity] = useState(100);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [autostart, setAutostart] = useState<string>('disabled');

  useEffect(() => {
    if (demo === 'opacity') {
      window.api.islandOpacityGet().then((v) => {
        const safe = typeof v === 'number' ? Math.max(10, Math.min(100, Math.round(v))) : 100;
        setOpacity(safe);
      }).catch(() => {});
    }
    if (demo === 'position') {
      window.api.getIslandPositionOffset().then(setOffset).catch(() => {});
    }
    if (demo === 'autostart') {
      window.api.autostartGet().then((v) => setAutostart(v || 'disabled')).catch(() => {});
    }
  }, [demo]);

  const handleTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    applyThemeMode(mode);
  };

  const handleOpacity = (delta: number) => {
    setOpacity((prev) => {
      const next = Math.max(10, Math.min(100, prev + delta));
      document.documentElement.style.setProperty('--island-opacity', String(next));
      window.api.islandOpacitySet(next).catch(() => {});
      return next;
    });
  };

  const handleOffset = (dx: number, dy: number) => {
    setOffset((prev) => {
      const next = { x: prev.x + dx, y: prev.y + dy };
      window.api.setIslandPositionOffset(next).catch(() => {});
      return next;
    });
  };

  const handleAutostart = (mode: string) => {
    setAutostart(mode);
    window.api.autostartSet(mode).catch(() => {});
  };

  const renderDemo = () => {
    switch (demo) {
      case 'theme': {
        const visual = themeMode === 'system' ? 'auto' : themeMode;
        return (
          <div className="ms-theme">
            <div className={`ms-theme-preview ms-theme-${visual}`}>
              <div className="ms-theme-island" />
              <div className="ms-theme-label">{visual === 'dark' ? tr('guide.mini.setting.theme.dark', '深色') : visual === 'light' ? tr('guide.mini.setting.theme.light', '浅色') : tr('guide.mini.setting.theme.auto', '自动')}</div>
            </div>
          </div>
        );
      }
      case 'opacity':
        return (
          <div className="ms-opacity">
            <div className="ms-opacity-preview" style={{ opacity: opacity / 100 }}>
              <div className="ms-opacity-island" />
            </div>
            <span className="ms-opacity-val">{opacity}%</span>
          </div>
        );
      case 'position':
        return (
          <div className="ms-position">
            <div className="ms-position-preview">
              <div
                className="ms-position-island"
                style={{ transform: `translate(${offset.x * 0.3}px, ${offset.y * 0.3}px)` }}
              />
            </div>
            <span className="ms-position-val">x:{offset.x} y:{offset.y}</span>
          </div>
        );
      case 'autostart': {
        const label = autostart === 'enabled'
          ? tr('guide.mini.setting.autostart.on', '已开启')
          : autostart === 'high-priority'
            ? tr('guide.mini.setting.autostart.highPriority', '高优先级')
            : tr('guide.mini.setting.autostart.off', '已关闭');
        const isOn = autostart !== 'disabled';
        return (
          <div className="ms-autostart">
            <div className={`ms-autostart-indicator${isOn ? ' on' : ''}${autostart === 'high-priority' ? ' elevated' : ''}`} />
            <span className="ms-autostart-label">{label}</span>
          </div>
        );
      }
      case 'shortcut':
        return (
          <div className="ms-shortcut">
            <div className="ms-shortcut-list">
              <div className="ms-shortcut-row">
                <span className="ms-shortcut-label">{tr('guide.mini.setting.shortcut.toggleIsland', '隐藏/显示')}</span>
                <span className="ms-shortcut-keys"><kbd>Alt</kbd><span className="ms-shortcut-plus">+</span><kbd>X</kbd></span>
              </div>
              <div className="ms-shortcut-row">
                <span className="ms-shortcut-label">{tr('guide.mini.setting.shortcut.quitIsland', '关闭灵动岛')}</span>
                <span className="ms-shortcut-keys"><kbd>Alt</kbd><span className="ms-shortcut-plus">+</span><kbd>C</kbd></span>
              </div>
              <div className="ms-shortcut-row">
                <span className="ms-shortcut-label">{tr('guide.mini.setting.shortcut.resetPosition', '还原默认位置快捷键')}</span>
                <span className="ms-shortcut-keys"><kbd>Alt</kbd><span className="ms-shortcut-plus">+</span><kbd>B</kbd></span>
              </div>
              <div className="ms-shortcut-row">
                <span className="ms-shortcut-label">{tr('guide.mini.setting.shortcut.screenshot', '选区截图')}</span>
                <span className="ms-shortcut-keys"><kbd>Alt</kbd><span className="ms-shortcut-plus">+</span><kbd>V</kbd></span>
              </div>
              <div className="ms-shortcut-row">
                <span className="ms-shortcut-label">{tr('guide.mini.setting.shortcut.switchSong', '切换歌曲')}</span>
                <span className="ms-shortcut-keys"><kbd>Alt</kbd><span className="ms-shortcut-plus">+</span><kbd>S</kbd></span>
              </div>
            </div>
          </div>
        );
    }
  };

  const renderControls = () => {
    switch (demo) {
      case 'theme':
        return (
          <div className="ms-controls">
            {(['dark', 'light', 'system'] as ThemeMode[]).map((m) => (
              <button
                key={m}
                className={`ms-ctrl-btn${themeMode === m ? ' active' : ''}`}
                onClick={() => handleTheme(m)}
              >
                {m === 'dark' ? tr('guide.mini.setting.theme.dark', '深色') : m === 'light' ? tr('guide.mini.setting.theme.light', '浅色') : tr('guide.mini.setting.theme.system', '系统')}
              </button>
            ))}
          </div>
        );
      case 'opacity':
        return (
          <div className="ms-controls">
            <button className="ms-ctrl-btn" onClick={() => handleOpacity(-10)}>−10</button>
            <button className="ms-ctrl-btn" onClick={() => handleOpacity(-5)}>−5</button>
            <button className="ms-ctrl-btn" onClick={() => handleOpacity(5)}>+5</button>
            <button className="ms-ctrl-btn" onClick={() => handleOpacity(10)}>+10</button>
          </div>
        );
      case 'position':
        return (
          <div className="ms-controls ms-controls-grid">
            <button className="ms-ctrl-btn" onClick={() => handleOffset(0, -10)}>↑</button>
            <button className="ms-ctrl-btn" onClick={() => handleOffset(-10, 0)}>←</button>
            <button className="ms-ctrl-btn ms-ctrl-reset" onClick={() => handleOffset(-offset.x, -offset.y)}>●</button>
            <button className="ms-ctrl-btn" onClick={() => handleOffset(10, 0)}>→</button>
            <button className="ms-ctrl-btn" onClick={() => handleOffset(0, 10)}>↓</button>
          </div>
        );
      case 'autostart':
        return (
          <div className="ms-controls">
            {(['disabled', 'enabled', 'high-priority'] as string[]).map((m) => (
              <button
                key={m}
                className={`ms-ctrl-btn${autostart === m ? ' active' : ''}`}
                onClick={() => handleAutostart(m)}
              >
                {m === 'disabled'
                  ? tr('guide.mini.setting.controls.autostart.disabled', '关闭')
                  : m === 'enabled'
                    ? tr('guide.mini.setting.controls.autostart.enabled', '开启')
                    : tr('guide.mini.setting.controls.autostart.highPriority', '高优先级')}
              </button>
            ))}
          </div>
        );
      case 'shortcut':
        return null;
    }
  };

  return (
    <div className="mini-island-wrapper">
      <div className="mini-marquee-frame marquee-active">
        <div className="mini-island mini-setting-expanded">
          {renderDemo()}
        </div>
      </div>
      {renderControls()}
    </div>
  );
}
