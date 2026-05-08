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

import { useEffect, useRef } from 'react';
import { SvgIcon } from '../../utils/SvgIcon';
import type { NotificationData, TimerData } from '../../store/types';

interface UseIslandTimerAndAlarmOptions {
  language: string | undefined;
  timerData: TimerData;
  setTimerData: (data: Partial<TimerData>) => void;
  setNotificationRef: React.MutableRefObject<(data: NotificationData) => void>;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export function useIslandTimerAndAlarm(options: UseIslandTimerAndAlarmOptions): void {
  const {
    language,
    timerData,
    setTimerData,
    setNotificationRef,
    t,
  } = options;

  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const alarmFiredSetRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    if (timerData?.state === 'running' && timerData.remainingSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        const next = (timerData.remainingSeconds ?? 0) - 1;
        if (next <= 0) {
          setTimerData({
            state: 'idle',
            remainingSeconds: 0,
            inputHours: '00',
            inputMinutes: '00',
            inputSeconds: '00',
          });
          setNotificationRef.current({
            title: t('notification.timer.title', { defaultValue: '计时器' }),
            body: t('notification.timer.finished', { defaultValue: '倒计时已结束' }),
            icon: SvgIcon.TIMER,
          });
        } else {
          setTimerData({ remainingSeconds: next });
        }
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [timerData?.state, timerData?.remainingSeconds, setTimerData, language, setNotificationRef, t]);

  useEffect(() => {
    const ALARM_STORE_KEY = 'alarms';
    const alarmInterval = setInterval(async () => {
      try {
        const data = await window.api?.storeRead(ALARM_STORE_KEY);
        if (!Array.isArray(data) || data.length === 0) return;
        const now = new Date();
        const h = now.getHours();
        const m = now.getMinutes();
        const s = now.getSeconds();
        const weekday = now.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
        const timeKey = `${h}:${m}:${s}`;
        const disableOnceAlarmIds: number[] = [];

        data.forEach((alarm) => {
          if (!alarm || !alarm.enabled) return;
          if (alarm.hour !== h || alarm.minute !== m || alarm.second !== s) return;
          const hasRepeat = Array.isArray(alarm.repeat) && alarm.repeat.length > 0;
          if (hasRepeat && !alarm.repeat.includes(weekday)) return;

          const firedKey = `${alarm.id}-${timeKey}`;
          if (alarmFiredSetRef.current.has(firedKey)) return;
          alarmFiredSetRef.current.add(firedKey);

          const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
          const label = alarm.label ? `${alarm.label}` : '';
          const body = label
            ? t('notification.alarm.bodyWithLabel', { defaultValue: '{{time}} — {{label}}', time: timeStr, label })
            : t('notification.alarm.body', { defaultValue: '{{time}}', time: timeStr });
          setNotificationRef.current({
            title: t('notification.alarm.title', { defaultValue: '闹钟提醒' }),
            body,
          });

          if (!hasRepeat) {
            disableOnceAlarmIds.push(alarm.id);
          }
        });

        if (disableOnceAlarmIds.length > 0) {
          const updated = data.map((a: { id: number }) =>
            disableOnceAlarmIds.includes(a.id) ? { ...a, enabled: false } : a,
          );
          await window.api?.storeWrite(ALARM_STORE_KEY, updated).catch(() => {});
        }

        if (alarmFiredSetRef.current.size > 200) {
          alarmFiredSetRef.current.clear();
        }
      } catch {
        // noop
      }
    }, 1000);
    return () => clearInterval(alarmInterval);
  }, [language, setNotificationRef, t]);
}
