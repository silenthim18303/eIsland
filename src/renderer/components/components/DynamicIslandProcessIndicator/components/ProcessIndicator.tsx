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
 * @file ProcessIndicator.tsx
 * @description 分段进度条组件，每段代表一个步骤
 * @author 鸡哥
 */

import { useEffect } from 'react';
import type { ReactElement } from 'react';
import type { ProcessIndicatorProps } from '../types';
import '../styles/process-indicator.css';

let previousRenderedCurrent: number | null = null;
let previousRenderedTotal: number | null = null;
const PROGRESS_ANIMATION_MS = 620;

/**
 * 分段进度条
 * @description 白色分段进度条，已完成步骤高亮，当前步骤半透明，未完成步骤微弱显示
 */
export function ProcessIndicator({ total, current }: ProcessIndicatorProps): ReactElement {
  const previousCurrent = previousRenderedTotal === total ? previousRenderedCurrent : null;
  const progressStart = previousCurrent ?? current;
  const isProgressIncreasing = previousCurrent !== null && current > previousCurrent;

  useEffect(() => {
    if (!isProgressIncreasing) {
      previousRenderedCurrent = current;
      previousRenderedTotal = total;
      return;
    }

    const updatePreviousProgress = setTimeout(() => {
      previousRenderedCurrent = current;
      previousRenderedTotal = total;
    }, PROGRESS_ANIMATION_MS);

    return () => {
      clearTimeout(updatePreviousProgress);
    };
  }, [current, isProgressIncreasing, total]);

  return (
    <div className="process-indicator">
      {Array.from({ length: total }, (_, i) => {
        const isCompleted = i < current;
        const isActive = i === current;
        const isProgressing = isProgressIncreasing && i > progressStart && i <= current;

        return (
          <div
            key={i}
            className={`process-indicator-segment${isCompleted ? ' completed' : ''}${isActive ? ' active' : ''}${isProgressing ? ' progressing' : ''}`}
          />
        );
      })}
    </div>
  );
}
