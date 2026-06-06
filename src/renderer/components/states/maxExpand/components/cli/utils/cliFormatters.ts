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
 * @file cliFormatters.ts
 * @description CLI 面板格式化与匹配工具函数
 * @author 鸡哥
 */

import type { CliHookEvent, CliSessionSnapshot } from '../config/types';
import type { CliEventFilter } from '../config/cliFilters';

/** 将时间戳格式化为 HH:MM:SS */
export function formatTime(timestamp: number): string {
  if (!timestamp) return '--';
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/** 将会话阶段转为可读标签 */
export function phaseLabel(phase: CliSessionSnapshot['phase'], t: (key: string, opts?: Record<string, unknown>) => string): string {
  if (phase === 'waiting_permission') return t('maxExpand.cli.phase.waiting', { defaultValue: '等待授权' });
  if (phase === 'running') return t('maxExpand.cli.phase.running', { defaultValue: '运行中' });
  if (phase === 'completed') return t('maxExpand.cli.phase.completed', { defaultValue: '已完成' });
  return t('maxExpand.cli.phase.idle', { defaultValue: '空闲' });
}

/** 将详情项标签转为 i18n 文本 */
export function detailLabel(label: string, t: (key: string, opts?: Record<string, unknown>) => string): string {
  return t(`maxExpand.cli.detail.${label}`, { defaultValue: label });
}

/** 将筛选项转为 i18n 文本 */
export function filterLabel(filter: CliEventFilter, t: (key: string, opts?: Record<string, unknown>) => string): string {
  return t(`maxExpand.cli.filters.${filter}`, { defaultValue: filter });
}

/** 判断事件是否匹配当前筛选条件 */
export function matchesFilter(event: CliHookEvent, filter: CliEventFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'output') return event.detailItems.some((item) => item.label === 'assistantOutput' || item.label === 'toolResult');
  return event.kind === filter;
}
