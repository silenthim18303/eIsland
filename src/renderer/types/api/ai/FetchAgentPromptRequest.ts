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
 * @file FetchAgentPromptRequest.ts
 * @description 获取 Agent 提示词请求类型定义
 * @author 鸡哥
 */

/** 获取 Agent 提示词请求 */
export interface FetchAgentPromptRequest {
  /** 用户 token */
  token: string;
  /** Agent 模式 */
  agentMode?: string;
  /** 是否启用快照模式 */
  snapshotMode?: boolean;
  /** 是否启用本地模式 */
  localMode?: boolean;
  /** 工作空间列表 */
  workspaces?: string[];
  /** 技能列表 */
  skills?: Array<{ name: string; content: string }>;
}
