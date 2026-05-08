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
 * @file agentMode.ts
 * @description Agent 模式读取工具。
 * @author 鸡哥
 */

import { AGENT_MODE_STORAGE_KEY, VALID_AGENT_MODES } from '../config/agentContentConfig';

/**
 * @description 从本地存储读取 Agent 模式。
 */
export function loadAgentMode(): string {
  try {
    const raw = localStorage.getItem(AGENT_MODE_STORAGE_KEY);
    if (raw && VALID_AGENT_MODES.has(raw)) return raw;
  } catch {
    // ignore
  }
  return 'mihtnelis';
}
