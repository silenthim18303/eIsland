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
 * @file IdleContent.tsx
 * @description Idle 状态内容组件
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import type { IdleContentProps } from './config/idleConfig';
import { useIdle } from './hooks/useIdle';
import { IdleForm } from './components/IdleForm';
import '../../../styles/shell/shell.css';

/** Idle 状态内容组件 */
export function IdleContent(props: IdleContentProps): ReactElement {
  const idle = useIdle(props);
  return (
    <IdleForm
      timeStr={idle.timeStr}
      dayStr={idle.dayStr}
      weather={idle.weather}
      timerState={idle.timerState}
      remainingSeconds={idle.remainingSeconds}
      pomodoroRunning={idle.pomodoroRunning}
      pomodoroRemaining={idle.pomodoroRemaining}
      t={idle.t}
      isMusicPlaying={idle.isMusicPlaying}
      coverImage={idle.coverImage}
      isPlaying={idle.isPlaying}
      musicOuterGlowEffectEnabled={idle.musicOuterGlowEffectEnabled}
      isTimerActive={idle.isTimerActive}
      isPomodoroActive={idle.isPomodoroActive}
      p0Count={idle.p0Count}
      h={idle.h}
      m={idle.m}
      s={idle.s}
      pomodoroM={idle.pomodoroM}
      pomodoroS={idle.pomodoroS}
      r={idle.r}
      g={idle.g}
      b={idle.b}
      padZero={idle.padZero}
    />
  );
}
