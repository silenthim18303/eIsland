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
 * @file PerformanceSettingsPage.tsx
 * @description 设置页面 - 性能设置页。
 * @author 鸡哥
 */

import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import useIslandStore from '../../../../../../../../store/slices';
import { SvgIcon } from '../../../../../../../../utils/SvgIcon';
import {
  MAXEXPAND_PERFORMANCE_MODE_STORE_KEY,
  cacheMaxExpandPerformanceModeEnabled,
  normalizeMaxExpandPerformanceModeEnabled,
  readCachedMaxExpandPerformanceModeEnabled,
} from '../../../utils/performanceSettings';
import { preloadMaxExpandContentEager } from '../../../../../maxExpandContentEagerLoader';

const DISABLE_FRAME_RATE_LIMIT_STORE_KEY = 'disable-frame-rate-limit';

/**
 * 渲染性能设置页面。
 */
export function PerformanceSettingsPage(): ReactElement {
  const { t } = useTranslation();
  const setNotification = useIslandStore((s) => s.setNotification);
  const [performanceModeEnabled, setPerformanceModeEnabled] = useState(readCachedMaxExpandPerformanceModeEnabled);
  const [disableFrameRateLimit, setDisableFrameRateLimit] = useState(false);

  useEffect(() => {
    let cancelled = false;
    window.api.storeRead(MAXEXPAND_PERFORMANCE_MODE_STORE_KEY).then((value) => {
      if (cancelled) return;
      const enabled = normalizeMaxExpandPerformanceModeEnabled(value);
      cacheMaxExpandPerformanceModeEnabled(enabled);
      setPerformanceModeEnabled(enabled);
    }).catch(() => {});
    const unsubscribe = window.api.onSettingsChanged((channel: string, value: unknown) => {
      if (cancelled) return;
      if (channel === `store:${MAXEXPAND_PERFORMANCE_MODE_STORE_KEY}`) {
        const enabled = normalizeMaxExpandPerformanceModeEnabled(value);
        cacheMaxExpandPerformanceModeEnabled(enabled);
        setPerformanceModeEnabled(enabled);
      }
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    window.api.storeRead(DISABLE_FRAME_RATE_LIMIT_STORE_KEY).then((value) => {
      if (cancelled) return;
      setDisableFrameRateLimit(value === true);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const handlePerformanceModeChange = (enabled: boolean): void => {
    setPerformanceModeEnabled(enabled);
    cacheMaxExpandPerformanceModeEnabled(enabled);
    if (!enabled) preloadMaxExpandContentEager();
    window.api.storeWrite(MAXEXPAND_PERFORMANCE_MODE_STORE_KEY, enabled).catch(() => {});
    window.api.settingsPreview(`store:${MAXEXPAND_PERFORMANCE_MODE_STORE_KEY}`, enabled).catch(() => {});
    window.dispatchEvent(new CustomEvent('maxexpand-performance-mode-changed', { detail: enabled }));
  };

  const handleDisableFrameRateLimitChange = (enabled: boolean): void => {
    setDisableFrameRateLimit(enabled);
    window.api.storeWrite(DISABLE_FRAME_RATE_LIMIT_STORE_KEY, enabled).catch(() => {});

    const restartRequiredNotification = {
      title: t('settings.app.notifications.configChanged.title', { defaultValue: '配置变更' }),
      body: t('settings.app.performance.frameRateLimitRestartHint', { defaultValue: '帧率限制设置已变更，重启后生效。' }),
      icon: SvgIcon.SETTING,
      type: 'restart-required',
    } as const;

    setNotification(restartRequiredNotification);
    window.api.settingsPreview('notification:show', restartRequiredNotification).catch(() => {});
  };

  return (
    <div className="max-expand-settings-section settings-performance-page-panel">
      <div className="settings-cards">
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-title">{t('settings.app.performance.modeTitle', { defaultValue: '启用性能模式' })}</div>
            <div className="settings-card-subtitle">{t('settings.app.performance.modeHint', { defaultValue: '启用后 MaxExpand 首次进入将延迟加载各页面，降低首次切换卡顿；关闭后使用旧版一次性加载方式。' })}</div>
          </div>
          <div className="settings-card-inline-row">
            <label className="settings-card-check">
              <input
                type="checkbox"
                checked={performanceModeEnabled}
                onChange={(event) => handlePerformanceModeChange(event.target.checked)}
              />
              <span>{t('settings.app.performance.modeToggle', { defaultValue: '启用性能模式' })}</span>
            </label>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-title">{t('settings.app.performance.frameRateLimitTitle', { defaultValue: '解除帧率限制' })}</div>
            <div className="settings-card-subtitle">{t('settings.app.performance.frameRateLimitHint', { defaultValue: '启用后将解除 Chromium 帧率上限，适用于高刷新率显示器。更改后需重启应用生效。' })}</div>
          </div>
          <div className="settings-card-inline-row">
            <label className="settings-card-check">
              <input
                type="checkbox"
                checked={disableFrameRateLimit}
                onChange={(event) => handleDisableFrameRateLimitChange(event.target.checked)}
              />
              <span>{t('settings.app.performance.frameRateLimitToggle', { defaultValue: '解除帧率限制' })}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
