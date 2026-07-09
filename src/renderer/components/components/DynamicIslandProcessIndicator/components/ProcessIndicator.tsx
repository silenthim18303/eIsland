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

import type { CSSProperties, ReactElement } from 'react';
import type { ProcessIndicatorProps } from '../types';
import { PROGRESS_ANIMATION_MS } from '../config';
import { useProcessIndicator } from '../hooks/useProcessIndicator';
import '../styles/process-indicator.css';

/**
 * 分段进度条
 * @description 白色分段进度条，已完成步骤高亮，当前步骤从左至白色填充，未完成步骤微弱显示
 */
export function ProcessIndicator({ total, current }: ProcessIndicatorProps): ReactElement {
  const segments = useProcessIndicator(total, current);
  const style = { '--process-indicator-duration': `${PROGRESS_ANIMATION_MS}ms` } as CSSProperties;

  return (
    <div className="process-indicator" style={style}>
      {segments.map((segment, i) => (
        <div
          key={i}
          className={`process-indicator-segment ${segment.status}${segment.motion !== 'none' ? ` ${segment.motion}` : ''}`}
        />
      ))}
    </div>
  );
}
