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
 * @file ThemeStep.tsx
 * @description 引导配置 — 主题与透明度设置步骤组件
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { THEME_MODE_OPTIONS, OPACITY_MIN, OPACITY_MAX } from '../config/themeOptions';
import { useThemeSetting } from '../hooks/useThemeSetting';
import type { ThemeStepProps } from '../types';

/**
 * 主题设置步骤组件
 * @description 选择深色/浅色/跟随系统主题，调整灵动岛透明度
 */
export function ThemeStep({ onNext, onPrev }: ThemeStepProps): ReactElement {
  const { t } = useTranslation();
  const { mode, opacity, setMode, setOpacity } = useThemeSetting();

  return (
    <div className="guide-step">
      <div className="guide-step-header">
        <h2>{t('guide.theme.title', { defaultValue: '外观设置' })}</h2>
        <p>{t('guide.theme.subtitle', { defaultValue: '选择主题模式并调整透明度' })}</p>
      </div>
      <div className="guide-theme-content">
        <div className="guide-theme-section">
          <span className="guide-theme-label">
            {t('guide.theme.modeLabel', { defaultValue: '主题模式' })}
          </span>
          <div className="guide-theme-mode-list">
            {THEME_MODE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`guide-theme-mode-btn${mode === opt.value ? ' selected' : ''}`}
                onClick={(): void => { setMode(opt.value); }}
              >
                {t(opt.labelKey, { defaultValue: opt.value })}
              </button>
            ))}
          </div>
        </div>
        <div className="guide-theme-section">
          <span className="guide-theme-label">
            {t('guide.theme.opacityLabel', { defaultValue: '透明度' })}
          </span>
          <div className="guide-theme-opacity">
            <input
              type="range"
              min={OPACITY_MIN}
              max={OPACITY_MAX}
              value={opacity}
              className="guide-theme-slider"
              onInput={(e): void => {
                setOpacity(Number((e.target as HTMLInputElement).value));
              }}
            />
            <span className="guide-theme-opacity-value">{opacity}%</span>
          </div>
        </div>
      </div>
      <div className="guide-step-footer">
        <button className="guide-prev-btn" onClick={onPrev}>
          {t('guide.actions.prev', { defaultValue: '上一步' })}
        </button>
        <button className="guide-next-btn" onClick={onNext}>
          {t('guide.actions.next', { defaultValue: '下一步' })}
        </button>
      </div>
    </div>
  );
}
