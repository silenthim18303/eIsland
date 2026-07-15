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
 * @file alarmTypes.ts
 * @description 闹钟模块类型定义与常量。
 * @author 鸡哥
 */

import type { SystemAlarmRingtone } from '../../../../../../utils/audio/alarmSound';

/** 星期几 0=周日 ... 6=周六 */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** 单条闹钟 */
export interface AlarmItem {
  id: number;
  hour: number;
  minute: number;
  second: number;
  label: string;
  enabled: boolean;
  repeat: Weekday[];
  ringtone: SystemAlarmRingtone;
  loop: boolean;
  createdAt: number;
}

/** 持久化存储 key */
export const STORE_KEY = 'alarms';

/** 全部星期（周一到周日顺序） */
export const ALL_WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

/** AlarmSidebar 组件属性 */
export interface AlarmSidebarProps {
  t: (key: string, opts?: Record<string, unknown>) => string;
  showEditor: boolean;
  adding: boolean;
  setAdding: (v: boolean) => void;
  closeEditor: () => void;
  loaded: boolean;
  sortedAlarms: AlarmItem[];
  editingId: number | null;
  weekdayLabel: (d: Weekday) => string;
  repeatSummary: (repeat: Weekday[]) => string;
  nextRingDesc: (alarm: AlarmItem) => string;
  startEdit: (alarm: AlarmItem) => void;
  deleteAlarm: (id: number) => void;
  toggleEnabled: (id: number) => void;
  setNewHour: (v: number) => void;
  setNewMinute: (v: number) => void;
  setNewSecond: (v: number) => void;
}
