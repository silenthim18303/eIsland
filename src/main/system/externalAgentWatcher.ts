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
 * @file externalAgentWatcher.ts
 * @description 桌面 Agent 进程检测模块 — 轮询检测外部 AI Agent 进程启动与关闭并发送通知
 * @author 鸡哥
 */

import { BrowserWindow } from 'electron';
import { hasAnyRunningProcess } from './runningProcesses';

/** 受监控的桌面 Agent 进程名与其显示名映射 */
const AGENT_PROCESS_MAP: Record<string, string> = {
  'Claude.exe': 'Claude Code',
  'claude.exe': 'Claude Code',
  'Cursor.exe': 'Cursor',
  'cursor.exe': 'Cursor',
  'Codex.exe': 'Codex',
  'codex.exe': 'Codex',
  'Gemini CLI.exe': 'Gemini CLI',
  'OpenCode.exe': 'OpenCode',
  'opencode.exe': 'OpenCode',
};

const AGENT_PROCESS_NAMES = Object.keys(AGENT_PROCESS_MAP);

interface CreateExternalAgentWatcherOptions {
  getMainWindow: () => BrowserWindow | null;
  pollIntervalMs?: number;
}

interface ExternalAgentWatcherService {
  start: () => void;
  stop: () => void;
}

/**
 * 创建外部 Agent 进程检测服务
 * @description 轮询检测桌面 Agent 进程启动与关闭，通过 IPC 通知渲染进程
 * @param options - 服务配置选项
 * @returns 外部 Agent 检测服务对象
 */
export function createExternalAgentWatcher(options: CreateExternalAgentWatcherOptions): ExternalAgentWatcherService {
  const pollIntervalMs = options.pollIntervalMs ?? 4000;

  let watcherTimer: NodeJS.Timeout | null = null;
  let checkInFlight = false;
  /** 已发送过启动通知的进程名集合，避免重复通知 */
  const notifiedProcesses = new Set<string>();
  /** 当前已知正在运行的进程名集合，用于检测关闭 */
  const knownRunningProcesses = new Set<string>();

  async function checkNow(): Promise<void> {
    if (checkInFlight) return;
    const mainWindow = options.getMainWindow();
    if (!mainWindow || mainWindow.isDestroyed()) return;

    checkInFlight = true;
    try {
      const startedNames: string[] = [];
      const stoppedNames: string[] = [];

      await AGENT_PROCESS_NAMES.reduce(async (prev, processName) => {
        await prev;
        const running = await hasAnyRunningProcess([processName]);
        const agentName = AGENT_PROCESS_MAP[processName] ?? processName;

        if (running) {
          if (!knownRunningProcesses.has(processName)) {
            knownRunningProcesses.add(processName);
            if (!notifiedProcesses.has(processName)) {
              notifiedProcesses.add(processName);
              startedNames.push(agentName);
            }
          }
        } else if (knownRunningProcesses.has(processName)) {
          knownRunningProcesses.delete(processName);
          notifiedProcesses.delete(processName);
          stoppedNames.push(agentName);
        }
      }, Promise.resolve());

      if (startedNames.length > 0) {
        mainWindow.webContents.send('external-agent:started', { agentNames: [...new Set(startedNames)] });
      }
      if (stoppedNames.length > 0) {
        mainWindow.webContents.send('external-agent:stopped', { agentNames: [...new Set(stoppedNames)] });
      }
    } finally {
      checkInFlight = false;
    }
  }

  function start(): void {
    if (watcherTimer) {
      clearInterval(watcherTimer);
      watcherTimer = null;
    }

    watcherTimer = setInterval(() => {
      checkNow().catch(() => {});
    }, pollIntervalMs);
  }

  function stop(): void {
    if (watcherTimer) {
      clearInterval(watcherTimer);
      watcherTimer = null;
    }
  }

  return { start, stop };
}
