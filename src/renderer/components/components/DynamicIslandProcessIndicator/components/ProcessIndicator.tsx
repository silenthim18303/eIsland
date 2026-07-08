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

import type { ReactElement } from 'react';
import type { ProcessIndicatorProps } from '../types';
import '../styles/process-indicator.css';

/**
 * 分段进度条
 * @description 白色分段进度条，已完成步骤高亮，当前步骤半透明，未完成步骤微弱显示
 */
export function ProcessIndicator({ total, current }: ProcessIndicatorProps): ReactElement {
  return (
    <div className="process-indicator">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`process-indicator-segment${i < current ? ' completed' : ''}${i === current ? ' active' : ''}`}
        />
      ))}
    </div>
  );
}
