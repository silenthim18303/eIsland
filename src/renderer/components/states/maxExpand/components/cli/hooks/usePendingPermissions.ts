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
 * @file usePendingPermissions.ts
 * @description 待授权事件 id 派生 Hook
 * @author 鸡哥
 */

import { useMemo } from 'react';
import type { CliSessionSnapshot } from '../types/types';

/**
 * 从会话列表中派生仍在等待授权的事件 id 集合
 * @param sessions - 当前会话列表
 * @returns 待授权事件 id 集合
 */
export function usePendingPermissions(sessions: CliSessionSnapshot[]): Set<string> {
  return useMemo(() => {
    return new Set<string>(
      sessions
        .filter((session) => session.phase === 'waiting_permission' && session.pendingPermission)
        .map((session) => session.pendingPermission!.id),
    );
  }, [sessions]);
}
