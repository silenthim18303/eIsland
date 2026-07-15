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
 * @file chatConstants.ts
 * @description AI 对话配置常量与纯校验函数。
 * @author 鸡哥
 */

import { SvgIcon } from '../../../../../../utils/SvgIcon';

export const CONTEXT_LIMIT_OPTIONS = [
  { value: 200_000 as const, label: '200K', proOnly: false },
  { value: 400_000 as const, label: '400K', proOnly: false },
  { value: 1_000_000 as const, label: '1M', proOnly: true },
] as const;

export const STREAM_UI_FLUSH_INTERVAL_MS = 90;
export const VISIBLE_CHAT_WINDOW_SIZE_DEFAULT = 4;
export const VISIBLE_CHAT_WINDOW_SIZE_R1PXC = 25;
export const VISIBLE_CHAT_WINDOW_STEP_DEFAULT = 4;
export const VISIBLE_CHAT_WINDOW_STEP_R1PXC = 25;

export const SETTINGS_OPEN_TAB_STORE_KEY = 'settings-open-tab';
export const SETTINGS_ABOUT_FEEDBACK_PREFILL_STORE_KEY = 'settings-about-feedback-prefill';
export const STANDALONE_WINDOW_MODE_STORE_KEY = 'standalone-window-mode';
export const LEGACY_COUNTDOWN_WINDOW_MODE_STORE_KEY = 'countdown-window-mode';
export const STANDALONE_WINDOW_ACTIVE_TAB_STORE_KEY = 'standalone-window-active-tab';

export const ATTACHMENT_MAX_SIZE_BYTES = 102400;
export const ATTACHMENT_MAX_COUNT = 5;
export const ATTACHMENT_ACCEPT_EXTENSIONS = '.txt,.md,.json,.log,.csv,.xml,.yaml,.yml,.toml,.ini,.cfg,.conf,.env,.sh,.bat,.ps1,.py,.js,.ts,.jsx,.tsx,.html,.css,.scss,.less,.sql,.c,.cpp,.h,.hpp,.java,.kt,.swift,.go,.rs,.rb,.php,.lua,.diff,.patch';

const ATTACHMENT_ACCEPT_EXT_SET = new Set(
  ATTACHMENT_ACCEPT_EXTENSIONS
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean),
);

export const EMPTY_GREETING_DEFAULTS = [
  '你好呀，今天想一起处理点什么？',
  '嗨，我在这儿，随时可以帮你。',
  '欢迎回来，先聊聊你现在最想解决的问题吧。',
  '今天也一起高效一点，你想从哪件事开始？',
] as const;

export type AgentMode = 'mihtnelis' | 'r1pxc' | 'edoc';

export const AGENT_MODES: ReadonlyArray<{
  id: AgentMode;
  label: string;
  desc: string;
  icon: string;
  noFilter?: boolean;
  badgeIcon?: string;
}> = [
  { id: 'mihtnelis', label: 'mihtnelis', desc: '全能', icon: SvgIcon.AI },
  { id: 'r1pxc', label: 'r1pxc', desc: '女友', icon: SvgIcon.LOVER, noFilter: true, badgeIcon: SvgIcon.VERIFIED },
  { id: 'edoc', label: 'edoc', desc: 'coding', icon: SvgIcon.CODING },
] as const;

const AGENT_MODE_STORAGE_KEY = 'eIsland_agentMode';

/** 读取本地 agent 模式，异常时回退默认模式。 */
export function loadAgentMode(): AgentMode {
  try {
    const raw = localStorage.getItem(AGENT_MODE_STORAGE_KEY);
    if (raw && AGENT_MODES.some((m) => m.id === raw)) return raw as AgentMode;
  } catch { /* ignore */ }
  return 'mihtnelis';
}

/** 持久化当前 agent 模式。 */
export function saveAgentMode(mode: AgentMode): void {
  try { localStorage.setItem(AGENT_MODE_STORAGE_KEY, mode); } catch { /* ignore */ }
}

const CLIENT_LOCAL_TOOL_PREFIXES = [
  'file.',
  'cmd.',
  'sys.',
  'win.',
  'clipboard.',
  'notification.',
  'net.',
  'monitor.',
  'volume.',
  'brightness.',
  'display.',
  'power.',
  'wifi.',
  'registry.',
  'service.',
  'schedule.',
  'firewall.',
  'defender.',
  'island.',
  'alarm.',
  'todolist.',
] as const;

const CLIENT_LOCAL_TOOL_EXACT_NAMES = new Set(['web.search']);

const HIGH_RISK_LOCAL_TOOL_PREFIXES = [
  'file.delete',
  'file.rename',
  'file.trash',
  'cmd.exec',
  'cmd.powershell',
  'win.close',
  'win.minimize',
  'win.maximize',
  'win.restore',
  'power.',
  'registry.write',
  'registry.delete',
  'service.start',
  'service.stop',
  'service.restart',
  'schedule.task.create',
  'net.proxy',
  'net.hosts',
  'defender.scan',
  'island.settings.write',
  'island.theme.set',
  'island.opacity.set',
  'island.restart',
  'alarm.delete',
  'todolist.delete',
] as const;

/** 判断工具名是否属于客户端本地工具。 */
export function isClientLocalToolName(tool: string): boolean {
  const normalized = tool.trim().toLowerCase();
  return CLIENT_LOCAL_TOOL_EXACT_NAMES.has(normalized)
    || CLIENT_LOCAL_TOOL_PREFIXES.some(prefix => normalized.startsWith(prefix));
}

/** 判断工具名是否属于高风险本地工具。 */
export function isHighRiskLocalToolName(tool: string): boolean {
  const normalized = tool.trim().toLowerCase();
  return HIGH_RISK_LOCAL_TOOL_PREFIXES.some(prefix => normalized.startsWith(prefix));
}

/** 判断模型名是否属于 MiniMax 系列。 */
export function isMinimaxModel(modelName: string): boolean {
  return modelName.toLowerCase().startsWith('minimax-');
}

/** 判断附件扩展名是否在允许列表中。 */
export function isAcceptedAttachmentFile(fileName: string): boolean {
  const lowerName = (fileName ?? '').toLowerCase();
  if (!lowerName) {
    return false;
  }
  return Array.from(ATTACHMENT_ACCEPT_EXT_SET).some((ext) => lowerName.endsWith(ext));
}
