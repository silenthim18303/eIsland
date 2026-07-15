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
import { useAlarmState } from '../hooks/useAlarmState';
import { AlarmEditor } from './AlarmEditor';
import { AlarmSidebar } from './AlarmSidebar';

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
      <AlarmSidebar
        t={t}
        showEditor={showEditor}
        adding={adding}
        setAdding={setAdding}
        closeEditor={closeEditor}
        loaded={loaded}
        sortedAlarms={sortedAlarms}
        editingId={editingId}
        weekdayLabel={weekdayLabel}
        repeatSummary={repeatSummary}
        nextRingDesc={nextRingDesc}
        startEdit={startEdit}
        deleteAlarm={deleteAlarm}
        toggleEnabled={toggleEnabled}
        setNewHour={setNewHour}
        setNewMinute={setNewMinute}
        setNewSecond={setNewSecond}
      />
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
