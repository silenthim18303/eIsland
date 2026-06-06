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
 * @file claudeCodeStatusService.ts
 * @description Claude Code CLI hook 状态采集服务。
 * @author 鸡哥
 */

import { BrowserWindow, app } from 'electron';
import http from 'http';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

export type ClaudeCodeHookEventKind = 'session' | 'message' | 'tool' | 'permission' | 'notification' | 'completed' | 'unknown';
export type ClaudeCodeSessionPhase = 'idle' | 'running' | 'waiting_permission' | 'completed';

export interface ClaudeCodeHookEventDetailItem {
  label: string;
  value: string;
}

export interface ClaudeCodeHookEvent {
  id: string;
  eventName: string;
  kind: ClaudeCodeHookEventKind;
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

export interface ClaudeCodeSessionSnapshot {
  id: string;
  title: string;
  phase: ClaudeCodeSessionPhase;
  cwd: string | null;
  transcriptPath: string | null;
  lastSummary: string;
  lastEventAt: number;
  pendingPermission: ClaudeCodeHookEvent | null;
  events: ClaudeCodeHookEvent[];
}

export interface ClaudeCodeStatusSnapshot {
  enabled: boolean;
  receiverRunning: boolean;
  receiverUrl: string | null;
  settingsPath: string;
  hookScriptPath: string;
  sessions: ClaudeCodeSessionSnapshot[];
  events: ClaudeCodeHookEvent[];
  updatedAt: number;
}

interface CreateClaudeCodeStatusServiceOptions {
  getMainWindow: () => BrowserWindow | null;
  port?: number;
}

interface ClaudeSettingsMutationResult {
  ok: boolean;
  message: string;
  snapshot: ClaudeCodeStatusSnapshot;
}

export interface ClaudeCodeStatusService {
  start: () => Promise<void>;
  stop: () => void;
  getSnapshot: () => ClaudeCodeStatusSnapshot;
  installHook: () => Promise<ClaudeSettingsMutationResult>;
  uninstallHook: () => Promise<ClaudeSettingsMutationResult>;
  clearEvents: () => ClaudeCodeStatusSnapshot;
}

const MAX_EVENTS = 120;
const MAX_SESSION_EVENTS = 40;
const DEFAULT_PORT = 17861;
const MANAGED_MARKER = 'eisland-claude-code-status';
const HOOK_EVENTS: Array<{ name: string; matcher?: string; timeout?: number }> = [
  { name: 'UserPromptSubmit' },
  { name: 'SessionStart' },
  { name: 'SessionEnd' },
  { name: 'Stop' },
  { name: 'StopFailure' },
  { name: 'Notification', matcher: '*' },
  { name: 'PreToolUse', matcher: '*' },
  { name: 'PermissionRequest', matcher: '*', timeout: 86400 },
  { name: 'PostToolUse', matcher: '*' },
  { name: 'PostToolUseFailure', matcher: '*' },
  { name: 'PermissionDenied', matcher: '*' },
];

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function stringifyPreview(value: unknown, maxLength = 220): string | null {
  if (value === null || value === undefined) return null;
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  if (!text) return null;
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function detailValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value.trim() || null;
  return JSON.stringify(value, null, 2);
}

function firstDetailValue(payload: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = detailValue(payload[key]);
    if (value) return value;
  }
  return null;
}

function textFromContent(value: unknown): string | null {
  if (typeof value === 'string') return value.trim() || null;
  if (!Array.isArray(value)) return null;
  const text = value
    .map((item) => {
      if (typeof item === 'string') return item;
      const record = asRecord(item);
      const type = asString(record.type);
      if (type && type !== 'text') return '';
      return asString(record.text) ?? asString(record.content) ?? '';
    })
    .filter(Boolean)
    .join('\n')
    .trim();
  return text || null;
}

function transcriptTextFromRole(transcriptPath: string | null, roleName: 'user' | 'assistant'): string | null {
  if (!transcriptPath || !existsSync(transcriptPath)) return null;
  try {
    const lines = readFileSync(transcriptPath, 'utf-8').trim().split(/\r?\n/).slice(-120).reverse();
    for (const line of lines) {
      const entry = asRecord(JSON.parse(line));
      const message = asRecord(entry.message);
      const role = asString(message.role) ?? asString(entry.role);
      if (role !== roleName) continue;
      const content = textFromContent(message.content) ?? textFromContent(entry.content);
      if (content) return content;
    }
  } catch {
    return null;
  }
  return null;
}

function userInputFromTranscript(transcriptPath: string | null): string | null {
  return transcriptTextFromRole(transcriptPath, 'user');
}

function assistantOutputFromTranscript(transcriptPath: string | null): string | null {
  return transcriptTextFromRole(transcriptPath, 'assistant');
}

function inferUserInput(payload: Record<string, unknown>, transcriptPath: string | null): string | null {
  return firstDetailValue(payload, ['prompt', 'user_prompt', 'userPrompt', 'user_input', 'userInput'])
    ?? userInputFromTranscript(transcriptPath);
}

function inferDetailItems(
  payload: Record<string, unknown>,
  toolInput: unknown,
  userInput: string | null,
  assistantOutput: string | null,
): ClaudeCodeHookEventDetailItem[] {
  const detailSpecs: Array<[string, string | null]> = [
    ['userInput', userInput],
    ['assistantOutput', assistantOutput],
    ['toolInput', detailValue(toolInput)],
    ['toolResult', firstDetailValue(payload, ['tool_response', 'toolResponse', 'response', 'result', 'output'])],
    ['error', firstDetailValue(payload, ['error', 'error_details', 'errorDetails'])],
    ['reason', firstDetailValue(payload, ['reason', 'permission_decision', 'permissionDecision'])],
    ['rawEvent', detailValue(payload)],
  ];
  return detailSpecs
    .filter((item): item is [string, string] => Boolean(item[1]))
    .map(([label, value]) => ({ label, value }));
}

function inferEventName(payload: Record<string, unknown>): string {
  return asString(payload.hook_event_name)
    ?? asString(payload.hookEventName)
    ?? asString(payload.event_name)
    ?? asString(payload.eventName)
    ?? asString(payload.event)
    ?? asString(payload.type)
    ?? 'Unknown';
}

function inferSessionId(payload: Record<string, unknown>, transcriptPath: string | null, cwd: string | null): string {
  return asString(payload.session_id)
    ?? asString(payload.sessionID)
    ?? asString(payload.sessionId)
    ?? transcriptPath
    ?? cwd
    ?? 'claude-code';
}

function inferKind(eventName: string): ClaudeCodeHookEventKind {
  if (eventName === 'PermissionRequest' || eventName === 'PermissionDenied') return 'permission';
  if (eventName === 'PreToolUse' || eventName === 'PostToolUse' || eventName === 'PostToolUseFailure') return 'tool';
  if (eventName === 'UserPromptSubmit') return 'message';
  if (eventName === 'Notification') return 'notification';
  if (eventName === 'Stop' || eventName === 'StopFailure' || eventName === 'SessionEnd') return 'completed';
  if (eventName === 'SessionStart') return 'session';
  return 'unknown';
}

function inferSummary(eventName: string, payload: Record<string, unknown>, toolName: string | null): string {
  const direct = asString(payload.message)
    ?? asString(payload.prompt)
    ?? asString(payload.reason)
    ?? asString(payload.summary)
    ?? asString(payload.notification);
  if (direct) return direct;
  if (eventName === 'PreToolUse' && toolName) return `正在使用 ${toolName}`;
  if (eventName === 'PostToolUse' && toolName) return `${toolName} 已完成`;
  if (eventName === 'PermissionRequest') return toolName ? `${toolName} 请求授权` : '请求授权';
  if (eventName === 'PermissionDenied') return toolName ? `${toolName} 授权被拒绝` : '授权被拒绝';
  if (eventName === 'UserPromptSubmit') return '收到用户输入';
  if (eventName === 'SessionStart') return '会话开始';
  if (eventName === 'SessionEnd') return '会话结束';
  if (eventName === 'Stop') return '本轮完成';
  if (eventName === 'StopFailure') return '本轮异常结束';
  return eventName;
}

function sessionTitleFrom(cwd: string | null, sessionId: string): string {
  if (!cwd) return sessionId === 'claude-code' ? 'Claude Code' : sessionId;
  const normalized = cwd.replace(/\\/g, '/');
  return normalized.split('/').filter(Boolean).pop() ?? cwd;
}

function phaseAfterEvent(current: ClaudeCodeSessionPhase, event: ClaudeCodeHookEvent): ClaudeCodeSessionPhase {
  if (event.eventName === 'PermissionRequest') return 'waiting_permission';
  if (event.eventName === 'SessionEnd') return 'completed';
  if (event.eventName === 'Stop' || event.eventName === 'StopFailure') return 'idle';
  if (event.eventName === 'PostToolUse' && current === 'waiting_permission') return 'running';
  if (event.kind === 'tool' || event.kind === 'message' || event.kind === 'session') return 'running';
  return current;
}

function createHookScript(port: number): string {
  return `const http = require('http');\nconst hookEventName = process.argv[2] || null;\nlet input = '';\nprocess.stdin.setEncoding('utf8');\nprocess.stdin.on('data', chunk => { input += chunk; });\nprocess.stdin.on('end', () => {\n  let payload = {};\n  try { payload = input.trim() ? JSON.parse(input) : {}; } catch (error) { payload = { parseError: String(error), raw: input }; }\n  if (hookEventName && !payload.hook_event_name) payload.hook_event_name = hookEventName;\n  const body = JSON.stringify(payload);\n  const req = http.request({ hostname: '127.0.0.1', port: ${port}, path: '/claude-code/hook', method: 'POST', headers: { 'content-type': 'application/json', 'content-length': Buffer.byteLength(body) }, timeout: 1500 }, res => { res.resume(); res.on('end', () => process.exit(0)); });\n  req.on('timeout', () => { req.destroy(); process.exit(0); });\n  req.on('error', () => process.exit(0));\n  req.write(body);\n  req.end();\n});\nsetTimeout(() => process.exit(0), 2000);\n`;
}

function shellQuote(value: string): string {
  return `"${value.replace(/"/g, '\\"')}"`;
}

function buildManagedCommand(scriptPath: string, eventName: string): string {
  return `${shellQuote(process.execPath)} ${shellQuote(scriptPath)} ${shellQuote(eventName)} # ${MANAGED_MARKER}`;
}

function managedHook(command: string, matcher?: string, timeout?: number): Record<string, unknown> {
  const hook: Record<string, unknown> = { type: 'command', command };
  if (typeof timeout === 'number') hook.timeout = timeout;
  const group: Record<string, unknown> = { hooks: [hook] };
  if (matcher) group.matcher = matcher;
  return group;
}

function removeManagedGroups(groups: unknown): Record<string, unknown>[] {
  if (!Array.isArray(groups)) return [];
  return groups
    .map((item) => asRecord(item))
    .map((group) => {
      const hooks = Array.isArray(group.hooks) ? group.hooks : [];
      return {
        ...group,
        hooks: hooks.filter((hook) => !String(asRecord(hook).command ?? '').includes(MANAGED_MARKER)),
      };
    })
    .filter((group) => Array.isArray(group.hooks) && group.hooks.length > 0);
}

export function createClaudeCodeStatusService(options: CreateClaudeCodeStatusServiceOptions): ClaudeCodeStatusService {
  const port = options.port ?? DEFAULT_PORT;
  const settingsPath = join(app.getPath('home'), '.claude', 'settings.json');
  const hookScriptPath = join(app.getPath('userData'), 'claude-code-hook.cjs');
  const sessions = new Map<string, ClaudeCodeSessionSnapshot>();
  let events: ClaudeCodeHookEvent[] = [];
  let server: http.Server | null = null;
  let receiverUrl: string | null = null;
  let updatedAt = Date.now();

  const emitSnapshot = (): void => {
    updatedAt = Date.now();
    const win = options.getMainWindow();
    if (!win || win.isDestroyed()) return;
    win.webContents.send('claude-code:status-updated', getSnapshot());
  };

  const isHookInstalled = (): boolean => {
    try {
      if (!existsSync(settingsPath)) return false;
      return readFileSync(settingsPath, 'utf-8').includes(MANAGED_MARKER);
    } catch {
      return false;
    }
  };

  const syncInstalledHookCommands = (): void => {
    try {
      if (!existsSync(settingsPath)) return;
      const raw = readFileSync(settingsPath, 'utf-8');
      if (!raw.includes(MANAGED_MARKER)) return;
      const root = asRecord(JSON.parse(raw));
      const hooks = asRecord(root.hooks);
      let changed = false;
      for (const spec of HOOK_EVENTS) {
        const currentGroups = removeManagedGroups(hooks[spec.name]);
        const nextGroups = [...currentGroups, managedHook(buildManagedCommand(hookScriptPath, spec.name), spec.matcher, spec.timeout)];
        if (JSON.stringify(hooks[spec.name]) !== JSON.stringify(nextGroups)) {
          hooks[spec.name] = nextGroups;
          changed = true;
        }
      }
      if (changed) writeFileSync(settingsPath, JSON.stringify({ ...root, hooks }, null, 2), 'utf-8');
    } catch {
      // Keep status receiver available even if Claude settings cannot be migrated.
    }
  };

  const getSnapshot = (): ClaudeCodeStatusSnapshot => ({
    enabled: isHookInstalled(),
    receiverRunning: Boolean(server),
    receiverUrl,
    settingsPath,
    hookScriptPath,
    sessions: Array.from(sessions.values()).sort((a, b) => b.lastEventAt - a.lastEventAt),
    events,
    updatedAt,
  });

  const withDetailItem = (event: ClaudeCodeHookEvent, label: string, value: string): ClaudeCodeHookEvent => ({
    ...event,
    detailItems: [
      { label, value },
      ...event.detailItems.filter((item) => item.label !== label),
    ],
  });

  const backfillDetailItem = (
    eventId: string,
    sessionId: string,
    label: string,
    valueFromTranscript: () => string | null,
  ): void => {
    const value = valueFromTranscript();
    if (!value) return;
    events = events.map((event) => (event.id === eventId ? withDetailItem(event, label, value) : event));
    const session = sessions.get(sessionId);
    if (session) {
      sessions.set(sessionId, {
        ...session,
        events: session.events.map((event) => (event.id === eventId ? withDetailItem(event, label, value) : event)),
      });
    }
    emitSnapshot();
  };

  const scheduleDetailBackfill = (
    event: ClaudeCodeHookEvent,
    label: string,
    valueFromTranscript: () => string | null,
  ): void => {
    if (event.detailItems.some((item) => item.label === label)) return;
    setTimeout(() => backfillDetailItem(event.id, event.sessionId, label, valueFromTranscript), 350);
    setTimeout(() => backfillDetailItem(event.id, event.sessionId, label, valueFromTranscript), 1200);
  };

  const scheduleEventBackfill = (event: ClaudeCodeHookEvent): void => {
    if (event.eventName === 'UserPromptSubmit') {
      scheduleDetailBackfill(event, 'userInput', () => userInputFromTranscript(event.transcriptPath));
    }
    if (event.eventName === 'Stop' || event.eventName === 'SessionEnd') {
      scheduleDetailBackfill(event, 'assistantOutput', () => assistantOutputFromTranscript(event.transcriptPath));
    }
  };

  const addEvent = (payload: Record<string, unknown>): void => {
    const eventName = inferEventName(payload);
    const cwd = asString(payload.cwd) ?? asString(payload.workspace) ?? asString(payload.project_dir) ?? asString(payload.projectDir);
    const transcriptPath = asString(payload.transcript_path) ?? asString(payload.transcriptPath);
    const sessionId = inferSessionId(payload, transcriptPath, cwd);
    const toolName = asString(payload.tool_name) ?? asString(payload.toolName) ?? asString(payload.name);
    const toolInput = payload.tool_input ?? payload.toolInput ?? payload.input;
    const userInput = inferUserInput(payload, transcriptPath);
    const assistantOutput = eventName === 'Stop' || eventName === 'SessionEnd'
      ? assistantOutputFromTranscript(transcriptPath)
      : null;
    const detailItems = inferDetailItems(payload, toolInput, userInput, assistantOutput);
    const event: ClaudeCodeHookEvent = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      eventName,
      kind: inferKind(eventName),
      sessionId,
      cwd,
      transcriptPath,
      summary: inferSummary(eventName, payload, toolName),
      detail: asString(payload.reason)
        ?? asString(payload.error)
        ?? asString(payload.error_details)
        ?? asString(payload.errorDetails)
        ?? stringifyPreview(payload.message)
        ?? stringifyPreview(payload.tool_response)
        ?? stringifyPreview(payload.toolResponse),
      detailItems,
      toolName,
      toolInputPreview: stringifyPreview(toolInput),
      createdAt: Date.now(),
      raw: payload,
    };

    events = [event, ...events].slice(0, MAX_EVENTS);
    const current = sessions.get(sessionId);
    const nextEvents = [event, ...(current?.events ?? [])].slice(0, MAX_SESSION_EVENTS);
    const nextPhase = phaseAfterEvent(current?.phase ?? 'idle', event);
    sessions.set(sessionId, {
      id: sessionId,
      title: current?.title ?? sessionTitleFrom(cwd, sessionId),
      phase: nextPhase,
      cwd: cwd ?? current?.cwd ?? null,
      transcriptPath: transcriptPath ?? current?.transcriptPath ?? null,
      lastSummary: event.summary,
      lastEventAt: event.createdAt,
      pendingPermission: nextPhase === 'waiting_permission' ? event : null,
      events: nextEvents,
    });
    scheduleEventBackfill(event);
    emitSnapshot();
  };

  const handleRequest = (request: http.IncomingMessage, response: http.ServerResponse): void => {
    if (request.method !== 'POST' || request.url !== '/claude-code/hook') {
      response.writeHead(404);
      response.end();
      return;
    }
    let body = '';
    request.setEncoding('utf-8');
    request.on('data', (chunk) => { body += chunk; });
    request.on('end', () => {
      try {
        addEvent(asRecord(JSON.parse(body || '{}')));
        response.writeHead(200, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ ok: true }));
      } catch (error) {
        response.writeHead(400, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ ok: false, error: String(error) }));
      }
    });
  };

  async function start(): Promise<void> {
    if (server) return;
    mkdirSync(dirname(hookScriptPath), { recursive: true });
    writeFileSync(hookScriptPath, createHookScript(port), 'utf-8');
    syncInstalledHookCommands();
    await new Promise<void>((resolve) => {
      server = http.createServer(handleRequest);
      server.listen(port, '127.0.0.1', () => {
        receiverUrl = `http://127.0.0.1:${port}/claude-code/hook`;
        resolve();
      });
      server.on('error', () => {
        server = null;
        receiverUrl = null;
        resolve();
      });
    });
    emitSnapshot();
  }

  function stop(): void {
    if (!server) return;
    server.close();
    server = null;
    receiverUrl = null;
    emitSnapshot();
  }

  async function installHook(): Promise<ClaudeSettingsMutationResult> {
    try {
      await start();
      mkdirSync(dirname(settingsPath), { recursive: true });
      const root = existsSync(settingsPath) ? asRecord(JSON.parse(readFileSync(settingsPath, 'utf-8'))) : {};
      const hooks = asRecord(root.hooks);
      for (const spec of HOOK_EVENTS) {
        const currentGroups = removeManagedGroups(hooks[spec.name]);
        hooks[spec.name] = [...currentGroups, managedHook(buildManagedCommand(hookScriptPath, spec.name), spec.matcher, spec.timeout)];
      }
      writeFileSync(settingsPath, JSON.stringify({ ...root, hooks }, null, 2), 'utf-8');
      emitSnapshot();
      return { ok: true, message: 'Claude Code 状态 hook 已启用。', snapshot: getSnapshot() };
    } catch (error) {
      return { ok: false, message: String(error), snapshot: getSnapshot() };
    }
  }

  async function uninstallHook(): Promise<ClaudeSettingsMutationResult> {
    try {
      if (!existsSync(settingsPath)) return { ok: true, message: 'Claude Code 配置不存在。', snapshot: getSnapshot() };
      const root = asRecord(JSON.parse(readFileSync(settingsPath, 'utf-8')));
      const hooks = asRecord(root.hooks);
      for (const spec of HOOK_EVENTS) {
        const currentGroups = removeManagedGroups(hooks[spec.name]);
        if (currentGroups.length > 0) hooks[spec.name] = currentGroups;
        else delete hooks[spec.name];
      }
      const nextRoot = Object.keys(hooks).length > 0 ? { ...root, hooks } : { ...root };
      if (Object.keys(hooks).length === 0) delete nextRoot.hooks;
      writeFileSync(settingsPath, JSON.stringify(nextRoot, null, 2), 'utf-8');
      emitSnapshot();
      return { ok: true, message: 'Claude Code 状态 hook 已关闭。', snapshot: getSnapshot() };
    } catch (error) {
      return { ok: false, message: String(error), snapshot: getSnapshot() };
    }
  }

  function clearEvents(): ClaudeCodeStatusSnapshot {
    events = [];
    sessions.clear();
    emitSnapshot();
    return getSnapshot();
  }

  return { start, stop, getSnapshot, installHook, uninstallHook, clearEvents };
}