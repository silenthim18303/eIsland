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
 * @file AlarmEditor.tsx
 * @description 闹钟编辑面板组件（新建 / 编辑共用）。
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import {
  previewAlarmSound,
  SYSTEM_ALARM_RINGTONE_OPTIONS,
  type SystemAlarmRingtone,
} from '../../../../../../utils/audio/alarmSound';
import type { Weekday } from '../types/alarmTypes';
import { ALL_WEEKDAYS } from '../types/alarmTypes';
import { toggleWeekday } from '../utils/alarmUtils';
import { WheelPicker } from './WheelPicker';

/** AlarmEditor 组件 Props */
interface AlarmEditorProps {
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

/** 闹钟编辑面板 */
export function AlarmEditor({
  adding,
  visible,
  hour, minute, second,
  label, repeat, ringtone, loop,
  previewPlaying,
  repeatSummary, weekdayLabel,
  setHour, setMinute, setSecond,
  setLabel, setRepeat, setRingtone, setLoop,
  onCancel, onSave,
}: AlarmEditorProps): ReactElement {
  const { t } = useTranslation();

  return (
    <div className={`alarm-editor-panel${visible ? ' alarm-editor-panel--visible' : ''}`}>
      {/* 固定顶栏：标题 + 操作按钮 */}
      <div className="alarm-editor-panel-header">
        <div className="alarm-editor-panel-title">
          {adding
            ? t('maxExpand.alarm.newTitle', { defaultValue: '新建闹钟' })
            : t('maxExpand.alarm.editTitle', { defaultValue: '编辑闹钟' })}
        </div>
        <div className="alarm-editor-actions">
          <button className="alarm-editor-cancel-btn" type="button" onClick={onCancel}>
            {t('maxExpand.alarm.cancel', { defaultValue: '取消' })}
          </button>
          <button className="alarm-editor-save-btn" type="button" onClick={onSave}>
            {t('maxExpand.alarm.save', { defaultValue: '保存' })}
          </button>
        </div>
      </div>

      {/* 可滚动表单区域 */}
      <div className="alarm-editor-panel-body">
        <div className="alarm-editor-time-row">
          <WheelPicker min={0} max={23} value={hour} onChange={setHour} />
          <span className="alarm-editor-time-sep">:</span>
          <WheelPicker min={0} max={59} value={minute} onChange={setMinute} />
          <span className="alarm-editor-time-sep">:</span>
          <WheelPicker min={0} max={59} value={second} onChange={setSecond} />
        </div>

        <div className="alarm-editor-field">
          <div className="alarm-editor-field-label">{t('maxExpand.alarm.labelField', { defaultValue: '备注' })}</div>
          <input
            className="alarm-editor-label-input"
            type="text"
            placeholder={t('maxExpand.alarm.labelPlaceholder', { defaultValue: '闹钟备注（可选）' })}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>

        <div className="alarm-editor-field">
          <div className="alarm-editor-field-label-row">
            <span className="alarm-editor-field-label">{t('maxExpand.alarm.repeatField', { defaultValue: '重复' })}</span>
            <span className="alarm-editor-repeat-hint">{repeatSummary(repeat)}</span>
          </div>
          <div className="alarm-editor-weekdays">
            {ALL_WEEKDAYS.map((d) => (
              <button
                key={d}
                className={`alarm-weekday-btn${repeat.includes(d) ? ' alarm-weekday-btn--active' : ''}`}
                type="button"
                onClick={() => setRepeat(toggleWeekday(repeat, d))}
              >
                {weekdayLabel(d)}
              </button>
            ))}
          </div>
        </div>

        <div className="alarm-editor-field">
          <div className="alarm-editor-field-label-row">
            <span className="alarm-editor-field-label">{t('maxExpand.alarm.ringtoneField', { defaultValue: '铃声' })}</span>
            <button
              className="alarm-editor-preview-btn"
              type="button"
              onClick={() => previewAlarmSound(ringtone)}
            >
              {previewPlaying
                ? t('maxExpand.alarm.pausePreviewRingtone', { defaultValue: '暂停' })
                : t('maxExpand.alarm.previewRingtone', { defaultValue: '试听' })}
            </button>
          </div>
          <div className="alarm-editor-ringtone-options">
            {SYSTEM_ALARM_RINGTONE_OPTIONS.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`alarm-editor-ringtone-btn${ringtone === item.value ? ' alarm-editor-ringtone-btn--active' : ''}`}
                onClick={() => setRingtone(item.value)}
              >
                {t(item.labelKey, { defaultValue: item.defaultLabel })}
              </button>
            ))}
          </div>
        </div>

        <div className="alarm-editor-field">
          <label className="alarm-editor-check-row">
            <input
              type="checkbox"
              checked={loop}
              onChange={(e) => setLoop(e.target.checked)}
            />
            {t('maxExpand.alarm.loopPlayback', { defaultValue: '循环播放铃声' })}
          </label>
        </div>
      </div>
    </div>
  );
}
