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
 * @file alarmEditorTypes.ts
 * @description 闹钟编辑面板组件类型定义。
 * @author 鸡哥
 */

import type { SystemAlarmRingtone } from '../../../../../../utils/audio/alarmSound';
import type { Weekday } from './alarmTypes';

/** AlarmEditor 组件 Props */
export interface AlarmEditorProps {
  adding: boolean;
  visible: boolean;
  hour: number;
  minute: number;
  second: number;
  label: string;
  repeat: Weekday[];
  ringtone: SystemAlarmRingtone;
  loop: boolean;
  previewPlaying: boolean;
  repeatSummary: (repeat: Weekday[]) => string;
  weekdayLabel: (d: Weekday) => string;
  setHour: (v: number) => void;
  setMinute: (v: number) => void;
  setSecond: (v: number) => void;
  setLabel: (v: string) => void;
  setRepeat: (v: Weekday[]) => void;
  setRingtone: (v: SystemAlarmRingtone) => void;
  setLoop: (v: boolean) => void;
  onCancel: () => void;
  onSave: () => void;
}
