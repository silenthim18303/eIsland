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
 * @file checkP0Count.ts
 * @description 检查 P0 待办数量工具函数
 * @author 鸡哥
 */

/** 检查本地存储中未完成的 P0 待办数量 */
export function checkP0Count(): number {
  try {
    const raw = localStorage.getItem('eIsland_todos');
    if (!raw) return 0;
    const todos = JSON.parse(raw) as { done?: boolean; priority?: string }[];
    return todos.filter(t => !t.done && t.priority === 'P0').length;
  } catch { return 0; }
}
