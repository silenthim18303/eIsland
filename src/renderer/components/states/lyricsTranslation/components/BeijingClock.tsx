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
 * @file BeijingClock.tsx
 * @description 北京时间显示组件
 * @author 鸡哥
 */

import type { ReactElement } from 'react';

interface BeijingClockProps {
  clockEnabled: boolean;
  clockText: string | null;
}

/**
 * @description 渲染当前北京时间。
 * @param props - 时钟参数。
 * @returns 时钟节点；未启用或无文本时返回 null。
 */
export function BeijingClock(props: BeijingClockProps): ReactElement | null {
  const { clockEnabled, clockText } = props;

  if (!clockEnabled || !clockText) return null;

  return <span className="lyrics-time">{clockText}</span>;
}
