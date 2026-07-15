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
 * @file AlarmTab.tsx
 * @description 最大展开模式 闹钟 Tab — 多闹钟管理，支持新建、编辑、删除、重复日选择、开关
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { SvgIcon } from '../../../../../../utils/SvgIcon';
import { useAlarmState } from '../hooks/useAlarmState';
import { AlarmCard } from './AlarmCard';
import { AlarmEditor } from './AlarmEditor';

/**
 * Alarm Tab
 * @description 最大展开模式下的闹钟管理面板
 */
export function AlarmTab(): ReactElement {
  const { t } = useTranslation();
  const state = useAlarmState();

  const {
    loaded, previewPlaying,
    editingId,
    editHour, editMinute, editSecond, editLabel, editRepeat, editRingtone, editLoop,
    setEditHour, setEditMinute, setEditSecond, setEditLabel, setEditRepeat, setEditRingtone, setEditLoop,
    adding, setAdding,
    newHour, newMinute, newSecond, newLabel, newRepeat, newRingtone, newLoop,
    setNewHour, setNewMinute, setNewSecond, setNewLabel, setNewRepeat, setNewRingtone, setNewLoop,
    weekdayLabel, repeatSummary, nextRingDesc,
    addAlarm, closeEditor, deleteAlarm, toggleEnabled, startEdit, saveEdit,
    sortedAlarms, showEditor,
  } = state;

  /** 当前编辑器用到的时/分/秒/标签/重复/铃声/循环 */
  const editorHour = adding ? newHour : editHour;
  const editorMinute = adding ? newMinute : editMinute;
  const editorSecond = adding ? newSecond : editSecond;
  const editorLabel = adding ? newLabel : editLabel;
  const editorRepeat = adding ? newRepeat : editRepeat;
  const editorRingtone = adding ? newRingtone : editRingtone;
  const editorLoop = adding ? newLoop : editLoop;
  const setEditorHour = adding ? setNewHour : setEditHour;
  const setEditorMinute = adding ? setNewMinute : setEditMinute;
  const setEditorSecond = adding ? setNewSecond : setEditSecond;
  const setEditorLabel = adding ? setNewLabel : setEditLabel;
  const setEditorRepeat = adding ? setNewRepeat : setEditRepeat;
  const setEditorRingtone = adding ? setNewRingtone : setEditRingtone;
  const setEditorLoop = adding ? setNewLoop : setEditLoop;

  return (
    <div className={`alarm-tab-container${showEditor ? ' alarm-tab-container--split' : ''}`}>
      {/* ── 左侧：闹钟列表（编辑时为侧边栏） ── */}
      <div className={`alarm-tab-sidebar${showEditor ? ' alarm-tab-sidebar--compact' : ''}`}>
        <div className="alarm-tab-header">
          <div className="alarm-tab-title">{t('maxExpand.alarm.title', { defaultValue: '闹钟' })}</div>
          <button
            className={`alarm-tab-add-btn${adding ? ' alarm-tab-add-btn--active' : ''}`}
            type="button"
            onClick={() => {
              if (adding) { closeEditor(); }
              else { const _now = new Date(); setNewHour(_now.getHours()); setNewMinute(_now.getMinutes()); setNewSecond(_now.getSeconds()); setAdding(true); }
            }}
            title={t('maxExpand.alarm.add', { defaultValue: '新建闹钟' })}
          >
            <img src={adding ? SvgIcon.CANCEL : SvgIcon.PLUS} alt="" className="alarm-tab-btn-icon" />
          </button>
        </div>

        <div className="alarm-tab-list">
          {!loaded && <div className="alarm-tab-loading">{t('maxExpand.alarm.loading', { defaultValue: '加载中…' })}</div>}
          {loaded && sortedAlarms.length === 0 && (
            <div className="alarm-tab-empty">
              <span className="alarm-tab-empty-text">{t('maxExpand.alarm.empty', { defaultValue: '暂无闹钟，点击 + 新建' })}</span>
            </div>
          )}
          {sortedAlarms.map((alarm) => (
            <AlarmCard
              key={alarm.id}
              alarm={alarm}
              isActive={editingId === alarm.id}
              weekdayLabel={weekdayLabel}
              repeatSummary={repeatSummary}
              nextRingDesc={nextRingDesc}
              onStartEdit={startEdit}
              onDelete={deleteAlarm}
              onToggle={toggleEnabled}
            />
          ))}
        </div>
      </div>

      {/* ── 右侧：编辑面板（始终渲染，通过 CSS 类控制展开） ── */}
      <AlarmEditor
        adding={adding}
        visible={showEditor}
        hour={editorHour}
        minute={editorMinute}
        second={editorSecond}
        label={editorLabel}
        repeat={editorRepeat}
        ringtone={editorRingtone}
        loop={editorLoop}
        previewPlaying={previewPlaying}
        repeatSummary={repeatSummary}
        weekdayLabel={weekdayLabel}
        setHour={setEditorHour}
        setMinute={setEditorMinute}
        setSecond={setEditorSecond}
        setLabel={setEditorLabel}
        setRepeat={setEditorRepeat}
        setRingtone={setEditorRingtone}
        setLoop={setEditorLoop}
        onCancel={closeEditor}
        onSave={adding ? addAlarm : saveEdit}
      />
    </div>
  );
}
