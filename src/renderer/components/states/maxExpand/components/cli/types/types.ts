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
 * @file types.ts
 * @description Claude Code CLI 面板类型。
 * @author 鸡哥
 */

import type { RefObject } from 'react';
import type { HeatmapGrid } from '../utils/heatmapGrid';

export type CliStatusSnapshot = Awaited<ReturnType<typeof window.api.claudeCodeStatusGet>>;
export type CliSessionSnapshot = CliStatusSnapshot['sessions'][number];
export type CliHookEvent = CliStatusSnapshot['events'][number];
export type CliHeatmapDaily = CliStatusSnapshot['heatmap'];

export type HeatmapMetric = 'session' | 'tool' | 'prompt';

export interface ActivityHeatmapProps {
  /** 按天累计的指标数据，键为 `年-月-日` */
  heatmap: CliHeatmapDaily;
  /** 紧凑模式：在用户中心等空间受限处显示更小的格子 */
  compact?: boolean;
  /** 可见性：折叠面板从隐藏切换为显示时，重新把今日滚动到水平居中 */
  visible?: boolean;
}

/** 热力图网格计算结果 */
export interface HeatmapGridResult extends HeatmapGrid {
  totals: { session: number; tool: number; prompt: number };
  /** 把数量映射到 0-4 档色阶强度 */
  levelOf: (count: number) => number;
}

/** 热力图滚动引用 */
export interface HeatmapScrollRefs {
  scrollRef: RefObject<HTMLDivElement | null>;
  todayRef: RefObject<HTMLSpanElement | null>;
}

export const EMPTY_CLI_STATUS: CliStatusSnapshot = {
  enabled: false,
  receiverRunning: false,
  receiverUrl: null,
  settingsPath: '',
  hookScriptPath: '',
  sessions: [],
  events: [],
  heatmap: {},
  updatedAt: 0,
};