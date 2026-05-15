import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MAXEXPAND_PERFORMANCE_MODE_STORE_KEY,
  cacheMaxExpandPerformanceModeEnabled,
  normalizeMaxExpandPerformanceModeEnabled,
  readCachedMaxExpandPerformanceModeEnabled,
} from '../../../utils/performanceSettings';
import { preloadMaxExpandContentEager } from '../../../../../maxExpandContentEagerLoader';

export function PerformanceSettingsPage(): ReactElement {
  const { t } = useTranslation();
  const [performanceModeEnabled, setPerformanceModeEnabled] = useState(readCachedMaxExpandPerformanceModeEnabled);

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

  const handlePerformanceModeChange = (enabled: boolean): void => {
    setPerformanceModeEnabled(enabled);
    cacheMaxExpandPerformanceModeEnabled(enabled);
    if (!enabled) preloadMaxExpandContentEager();
    window.api.storeWrite(MAXEXPAND_PERFORMANCE_MODE_STORE_KEY, enabled).catch(() => {});
    window.api.settingsPreview(`store:${MAXEXPAND_PERFORMANCE_MODE_STORE_KEY}`, enabled).catch(() => {});
    window.dispatchEvent(new CustomEvent('maxexpand-performance-mode-changed', { detail: enabled }));
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
      </div>
    </div>
  );
}
