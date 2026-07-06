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
 * @file claudeCode.ts
 * @description Claude Code 集成相关类型定义
 * @author 鸡哥
 */

/** Claude Code Hook 事件详情项 */
export interface ClaudeCodeHookEventDetailItem {
  label: string;
  value: string;
}

/** Claude Code Hook 事件 */
export interface ClaudeCodeHookEvent {
  id: string;
  eventName: string;
  kind: 'session' | 'message' | 'tool' | 'permission' | 'notification' | 'completed' | 'unknown';
  sessionId: string;
  cwd: string | null;
  transcriptPath: string | null;
  summary: string;
  detail: string | null;
  detailItems: ClaudeCodeHookEventDetailItem[];
  toolName: string | null;
  toolInputPreview: string | null;
  createdAt: number;
  raw: Record<string, unknown>;
}

/** Claude Code 会话快照 */
export interface ClaudeCodeSessionSnapshot {
  id: string;
  title: string;
  phase: 'idle' | 'running' | 'waiting_permission' | 'completed';
  cwd: string | null;
  transcriptPath: string | null;
  lastSummary: string;
  lastEventAt: number;
  pendingPermission: ClaudeCodeHookEvent | null;
  events: ClaudeCodeHookEvent[];
}

/** Claude Code 状态快照 */
export interface ClaudeCodeStatusSnapshot {
  enabled: boolean;
  receiverRunning: boolean;
  receiverUrl: string | null;
  settingsPath: string;
  hookScriptPath: string;
  sessions: ClaudeCodeSessionSnapshot[];
  events: ClaudeCodeHookEvent[];
  heatmap: Record<string, { session: number; tool: number; prompt: number }>;
  updatedAt: number;
}

/** Claude Code Hook 变更结果 */
export interface ClaudeCodeHookMutationResult {
  ok: boolean;
  message: string;
  snapshot: ClaudeCodeStatusSnapshot;
}
