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
 * @file BreakReminderSettingsPage.tsx
 * @description 设置页面 - 软件设置/休息提醒子界面
 * @author 鸡哥
 */

import { useEffect, useState, useCallback } from 'react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

const BREAK_REMINDER_STORE_KEY = 'break-reminder-items';

interface BreakReminderItem {
  id: string;
  name: string;
  intervalMinutes: number;
  enabled: boolean;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getDefaultReminders(t: (key: string, opts?: Record<string, string>) => string): BreakReminderItem[] {
  return [
    { id: generateId(), name: t('settings.breakReminder.defaultSedentary', { defaultValue: '久坐提醒' }), intervalMinutes: 30, enabled: true },
    { id: generateId(), name: t('settings.breakReminder.defaultHydration', { defaultValue: '喝水提醒' }), intervalMinutes: 60, enabled: true },
  ];
}

/**
 * 渲染软件设置中的休息提醒配置区块
 * @returns 休息提醒配置区块
 */
export function BreakReminderSettingsPage(): ReactElement {
  const { t } = useTranslation();
  const [items, setItems] = useState<BreakReminderItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    window.api.storeRead(BREAK_REMINDER_STORE_KEY).then((value: unknown) => {
      if (cancelled) return;
      if (Array.isArray(value) && value.length > 0) {
        setItems(value as BreakReminderItem[]);
      } else {
        const defaults = getDefaultReminders(t);
        setItems(defaults);
        window.api.storeWrite(BREAK_REMINDER_STORE_KEY, defaults).catch(() => {});
      }
      setLoaded(true);
    }).catch(() => {
      if (!cancelled) {
        const defaults = getDefaultReminders(t);
        setItems(defaults);
        setLoaded(true);
      }
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = useCallback((next: BreakReminderItem[]) => {
    setItems(next);
    window.api.storeWrite(BREAK_REMINDER_STORE_KEY, next).catch(() => {});
  }, []);

  const handleAdd = (): void => {
    const next: BreakReminderItem[] = [...items, { id: generateId(), name: '', intervalMinutes: 30, enabled: true }];
    persist(next);
  };

  const handleDelete = (id: string): void => {
    persist(items.filter((item) => item.id !== id));
  };

  const handleChange = (id: string, field: keyof BreakReminderItem, value: string | number | boolean): void => {
    persist(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  if (!loaded) return <div className="max-expand-settings-section" />;

  return (
    <div className="max-expand-settings-section">
      <div className="settings-cards">
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-title">{t('settings.breakReminder.listTitle', { defaultValue: '提醒事项' })}</div>
            <div className="settings-card-subtitle">{t('settings.breakReminder.listHint', { defaultValue: '开启后，到达设定的间隔时间将弹出休息提醒通知。' })}</div>
          </div>

          <div className="settings-card-inline-row">
            <button type="button" className="settings-lyrics-source-btn active" onClick={handleAdd}>
              {t('settings.breakReminder.addBtn', { defaultValue: '新建提醒' })}
            </button>
          </div>

          {items.length === 0 ? (
            <div className="settings-card-subtitle" style={{ textAlign: 'center', padding: '12px 0' }}>
              {t('settings.breakReminder.emptyHint', { defaultValue: '暂无提醒事项，点击上方按钮新建。' })}
            </div>
          ) : (
            <div className="break-reminder-list">
              {items.map((item) => (
                <div key={item.id} className="break-reminder-row">
                  <input
                    className="break-reminder-name"
                    type="text"
                    value={item.name}
                    placeholder={t('settings.breakReminder.nameLabel', { defaultValue: '提醒名称' })}
                    onChange={(e) => handleChange(item.id, 'name', e.target.value)}
                  />
                  <input
                    className="break-reminder-interval"
                    type="number"
                    min={1}
                    max={1440}
                    value={item.intervalMinutes}
                    title={t('settings.breakReminder.intervalLabel', { defaultValue: '间隔（分钟）' })}
                    onChange={(e) => {
                      const v = Math.max(1, Math.min(1440, Math.round(Number(e.target.value) || 1)));
                      handleChange(item.id, 'intervalMinutes', v);
                    }}
                  />
                  <span className="break-reminder-unit">min</span>
                  <label className="settings-card-check break-reminder-toggle">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(e) => handleChange(item.id, 'enabled', e.target.checked)}
                    />
                  </label>
                  <button
                    type="button"
                    className="break-reminder-delete"
                    title={t('settings.breakReminder.deleteBtn', { defaultValue: '删除' })}
                    onClick={() => handleDelete(item.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
