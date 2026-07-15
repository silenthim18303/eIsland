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
 * @file alarmUtils.ts
 * @description 闹钟模块工具函数：持久化、数据规范化、格式化。
 * @author 鸡哥
 */

import { normalizeSystemAlarmRingtone } from '../../../../../../utils/audio/alarmSound';
import type { AlarmItem } from '../types/alarmTypes';
import { STORE_KEY } from '../types/alarmTypes';

/** 通过 IPC 写入文件 */
export function persistAlarms(items: AlarmItem[]): void {
  window.api.storeWrite(STORE_KEY, items).catch(() => {});
}

/** 规范化旧数据 */
export function normalizeAlarms(items: AlarmItem[]): AlarmItem[] {
  return items.map((a) => ({
    ...a,
    hour: a.hour ?? 0,
    minute: a.minute ?? 0,
    second: a.second ?? 0,
    label: a.label ?? '',
    enabled: a.enabled ?? true,
    repeat: Array.isArray(a.repeat) ? a.repeat : [],
    ringtone: normalizeSystemAlarmRingtone(a.ringtone),
    loop: typeof a.loop === 'boolean' ? a.loop : true,
    createdAt: a.createdAt ?? Date.now(),
  }));
}

/** 格式化时间 HH:MM:SS */
export function formatTime(h: number, m: number, s: number): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** 切换星期 */
export function toggleWeekday(list: import('../types/alarmTypes').Weekday[], day: import('../types/alarmTypes').Weekday): import('../types/alarmTypes').Weekday[] {
  return list.includes(day) ? list.filter((d) => d !== day) : [...list, day];
}
