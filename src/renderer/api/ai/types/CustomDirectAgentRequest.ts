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
 * @file CustomDirectAgentRequest.ts
 * @description 自定义 API 直连 Agent 请求类型定义
 * @author 鸡哥
 */

import type { MihtnelisAgentStreamEvent } from './MihtnelisAgentStreamEvent';

/** 自定义 API 直连 Agent 请求 */
export interface CustomDirectAgentRequest {
  /** 用户 token */
  token: string;
  /** 用户消息 */
  message: string;
  /** 模型名称 */
  model: string;
  /** Agent 模式 */
  agentMode?: string;
  /** 上下文信息 */
  context?: string;
  /** 工作空间列表 */
  workspaces?: string[];
  /** 技能列表 */
  skills?: Array<{ name: string; content: string }>;
  /** 是否启用快照模式 */
  snapshotMode?: boolean;
  /** 基础 URL */
  baseUrl: string;
  /** API 密钥 */
  apiKey: string;
  /** 温度参数 */
  temperature?: number;
  /** 中止信号 */
  signal?: AbortSignal;
  /** 事件回调 */
  onEvent?: (event: MihtnelisAgentStreamEvent) => void;
}
