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
 * @file useIslandBreakReminder.ts
 * @description 休息提醒调度器 —— 按用户配置的间隔定时弹出通知
 * @author 鸡哥
 */

import { useEffect, useRef } from 'react';
import { SvgIcon } from '../../utils/SvgIcon';
import type { NotificationData } from '../../store/types';

const BREAK_REMINDER_STORE_KEY = 'break-reminder-items';
const POLL_INTERVAL_MS = 10_000;

interface BreakReminderItem {
  id: string;
  name: string;
  intervalMinutes: number;
  enabled: boolean;
  icon?: string;
}

interface UseIslandBreakReminderOptions {
  language: string | undefined;
  setNotificationRef: React.MutableRefObject<(data: NotificationData) => void>;
  t: (key: string, options?: Record<string, unknown>) => string;
}

/**
 * 休息提醒调度 hook
 * 每 {@link POLL_INTERVAL_MS} 毫秒读取 store 中的提醒列表，
 * 对每个启用的提醒条目按 intervalMinutes 触发通知。
 */
export function useIslandBreakReminder(options: UseIslandBreakReminderOptions): void {
  const { language, setNotificationRef, t } = options;

  /** 记录每个提醒条目上次触发的时间戳 (ms) */
  const lastFiredRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const check = async (): Promise<void> => {
      try {
        const data = await window.api?.storeRead(BREAK_REMINDER_STORE_KEY);
        if (!Array.isArray(data) || data.length === 0) return;

        let items = data as BreakReminderItem[];
        if (items.some((i) => i && !i.icon)) {
          items = items.map((i) => i.icon ? i : { ...i, icon: SvgIcon.BREAK });
          window.api?.storeWrite(BREAK_REMINDER_STORE_KEY, items).catch(() => {});
        }

        const now = Date.now();
        const firedMap = lastFiredRef.current;

        items.forEach((item) => {
          if (!item || !item.enabled || !item.intervalMinutes || !item.name?.trim()) return;

          const intervalMs = item.intervalMinutes * 60_000;
          const lastFired = firedMap.get(item.id);

          if (lastFired === undefined) {
            // 首次发现该条目，初始化计时起点为当前时刻
            firedMap.set(item.id, now);
            return;
          }

          if (now - lastFired >= intervalMs) {
            firedMap.set(item.id, now);
            const name = item.name || t('settings.breakReminder.notificationTitle', { defaultValue: '休息提醒' });
            setNotificationRef.current({
              title: t('settings.breakReminder.notificationTitle', { defaultValue: '休息提醒' }),
              body: t('settings.breakReminder.notificationBody', { defaultValue: '该{{name}}啦！', name }),
              icon: item.icon || SvgIcon.BREAK,
            });
          }
        });

        // 清理已不存在的条目
        const activeIds = new Set((data as BreakReminderItem[]).map((i) => i.id));
        for (const key of firedMap.keys()) {
          if (!activeIds.has(key)) firedMap.delete(key);
        }
      } catch {
        // noop
      }
    };

    const interval = setInterval(check, POLL_INTERVAL_MS);
    // 启动后立即执行一次初始化
    check().catch(() => {});

    return () => clearInterval(interval);
  }, [language, setNotificationRef, t]);
}
