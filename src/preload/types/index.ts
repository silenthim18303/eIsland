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
 * @file index.ts
 * @description 预加载脚本共享类型定义
 * @author 鸡哥
 */

// ===== 通用 =====

/** 二维坐标 */
export interface Point {
  x: number;
  y: number;
}

/** 窗口边界 */
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ===== 窗口/显示器 =====

/** 灵动岛可用显示器信息 */
export interface IslandDisplayInfo {
  id: string;
  width: number;
  height: number;
  isPrimary: boolean;
}

// ===== 文件/应用 =====

/** 本地文件搜索选项 */
export interface SearchLocalFilesOptions {
  limit?: number;
  maxDepth?: number;
  includeDirectories?: boolean;
  includeFiles?: boolean;
  includeHidden?: boolean;
  caseSensitive?: boolean;
  matchMode?: 'contains' | 'startsWith' | 'endsWith' | 'exact';
  matchScope?: 'name' | 'path';
  extensions?: string[];
  excludeDirs?: string[];
}

/** 本地文件搜索结果项 */
export interface SearchLocalFileResult {
  name: string;
  path: string;
  isDirectory: boolean;
}

/** 文件哈希计算结果 */
export interface ComputeFileHashResult {
  hash: string;
  algorithm: string;
  fileName: string;
  fileSize: number;
}

/** 保存文本文件载荷 */
export interface SaveTextFilePayload {
  defaultPath: string;
  content: string;
  filters?: Array<{ name: string; extensions: string[] }>;
}

/** 保存文本文件结果 */
export interface SaveTextFileResult {
  ok: boolean;
  canceled: boolean;
  filePath: string | null;
}

/** 保存图片结果 */
export interface SaveImageAsResult {
  ok: boolean;
  canceled: boolean;
  filePath: string | null;
}

/** 快捷方式解析结果 */
export interface ResolveShortcutResult {
  target: string;
  name: string;
}

// ===== 系统性能 =====

/** 性能监控硬件选择 */
export interface PerformanceHardwareSelection {
  cpu?: string;
  gpu?: string;
  disk?: string;
}

/** 性能监控硬件选项 */
export interface PerformanceHardwareOption {
  id: string;
  label: string;
}

/** 性能监控硬件选项集合 */
export interface PerformanceHardwareOptions {
  cpu: PerformanceHardwareOption[];
  gpu: PerformanceHardwareOption[];
  disk: PerformanceHardwareOption[];
}

/** 性能快照 */
export interface PerformanceSnapshot {
  timestamp: number;
  host: {
    hostname: string;
    platform: string;
    release: string;
    arch: string;
    uptimeSeconds: number;
  };
  cpu: {
    manufacturer: string;
    brand: string;
    cores: number;
    physicalCores: number;
    speedGhz: number | null;
    speedMaxGhz: number | null;
    loadPercent: number;
    temperatureCelsius: number | null;
  };
  memory: {
    totalBytes: number;
    usedBytes: number;
    availableBytes: number;
    usagePercent: number;
  };
  gpu: {
    vendor: string;
    model: string;
    vramTotalMb: number | null;
    loadPercent: number | null;
    temperatureCelsius: number | null;
  } | null;
  disk: {
    totalBytes: number;
    usedBytes: number;
    usagePercent: number;
    temperatureCelsius: number | null;
  };
  hardwareOptions: PerformanceHardwareOptions;
}

// ===== 进程/窗口 =====

/** 运行中进程信息 */
export interface RunningProcessInfo {
  name: string;
  iconDataUrl: string | null;
}

/** 运行中窗口信息 */
export interface RunningWindowInfo {
  id: string;
  title: string;
  processName: string;
  processPath: string | null;
  processId: number | null;
  iconDataUrl: string | null;
}

// ===== 媒体/音乐 =====

/** 正在播放的歌曲信息 */
export interface NowPlayingInfo {
  title: string;
  artist: string;
  album: string;
  duration_ms: number;
  position_ms: number;
  isPlaying: boolean;
  thumbnail?: string | null;
  canFastForward: boolean;
  canSkip: boolean;
  canLike: boolean;
  canChangeVolume: boolean;
  canSetOutput: boolean;
}

/** SMTC 播放源信息 */
export interface SmtcSourceInfo {
  sourceAppId: string;
  isPlaying: boolean;
  hasTitle: boolean;
  thumbnail: string | null;
}

/** SMTC 播放源检测结果 */
export interface DetectSourceAppIdResult {
  ok: boolean;
  sources: SmtcSourceInfo[];
  message: string;
}

/** SMTC 时间线信息 */
export interface SmtcTimeline {
  startTime: number;
  endTime: number;
  position: number;
  minSeekTime: number;
  maxSeekTime: number;
}

/** SMTC 时间戳结果 */
export interface SmtcTimestampResult {
  isAvailable: boolean;
  playbackStatus: string;
  timeline: SmtcTimeline | null;
}

/** 播放源切换请求数据 */
export interface SourceSwitchRequestData {
  sourceAppId: string;
  title: string;
  artist: string;
}

// ===== AI/Agent =====

/** Agent 本地工具执行请求 */
export interface ExecuteAgentLocalToolRequest {
  tool: string;
  arguments?: Record<string, unknown>;
  workspaces?: string[];
}

/** Agent 本地工具执行结果 */
export interface ExecuteAgentLocalToolResult {
  success: boolean;
  result: unknown;
  error: string;
  durationMs: number;
}

/** Ollama 聊天请求 */
export interface OllamaChatRequest {
  model: string;
  systemPrompt: string;
  userMessage: string;
  context?: string;
  baseUrl?: string;
  temperature?: number;
}

/** 自定义直连聊天请求 */
export interface CustomDirectChatRequest {
  model: string;
  systemPrompt: string;
  userMessage: string;
  context?: string;
  baseUrl: string;
  apiKey: string;
  temperature?: number;
}

/** 聊天会话事件 */
export interface ChatEvent {
  type: string;
  payload: Record<string, unknown>;
}

/** 聊天会话启动结果 */
export interface ChatStartResult {
  started: boolean;
  sessionId: string;
}

/** 聊天会话中止结果 */
export interface ChatAbortResult {
  aborted: boolean;
}

// ===== Claude Code =====

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

// ===== 图片压缩 =====

/** 图片压缩任务 */
export interface ImageCompressionTask {
  id: string;
  fileName: string;
  inputPath: string;
  outputPath: string;
  quality: number;
  status: 'completed' | 'failed';
  success: boolean;
  originalBytes: number;
  compressedBytes: number;
  ratio: number;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

/** 图片压缩启动载荷 */
export interface ImageCompressionStartPayload {
  inputPaths: string[];
  outputDir?: string;
  quality?: number;
}

/** 图片压缩启动结果 */
export interface ImageCompressionStartResult {
  ok: boolean;
  results?: ImageCompressionTask[];
  message?: string;
}

// ===== 下载 =====

/** 下载任务 */
export interface DownloadTask {
  id: string;
  url: string;
  savePath: string;
  fileName: string;
  totalBytes: number;
  downloadedBytes: number;
  progress: number;
  speedBytesPerSecond: number;
  estimatedFinishAt: number | null;
  threads: number;
  status: 'downloading' | 'paused' | 'completed' | 'failed' | 'canceled';
  errorMessage?: string;
  createdAt: number;
  updatedAt: number;
}

/** 下载启动载荷 */
export interface DownloadStartPayload {
  url: string;
  savePath?: string;
  threads?: number;
}

/** 下载启动结果 */
export interface DownloadStartResult {
  ok: boolean;
  task?: DownloadTask;
  message?: string;
}

// ===== 格式工厂 =====

/** 视频提取选项 */
export interface ExtractVideoTrackOptions {
  filePath: string;
  trackType: string;
  outputFormat: string;
}

/** 视频提取结果 */
export interface ExtractVideoTrackResult {
  success: boolean;
  outputPath?: string;
  error?: string;
  fileSize?: number;
}

/** 选择视频文件结果 */
export interface PickVideoForExtractResult {
  filePath: string;
  fileSize: number | null;
}

// ===== 网络 =====

/** HTTP 代理请求选项 */
export interface NetFetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
}

/** HTTP 代理响应结果 */
export interface NetFetchResult {
  ok: boolean;
  status: number;
  body: string;
}

// ===== 邮件 =====

/** 邮件列表结果项 */
export interface MailInboxItem {
  uid: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  size: number;
  preview: string;
  body: string;
}

/** 邮件列表结果 */
export interface MailInboxResult {
  ok: boolean;
  items: MailInboxItem[];
  message: string;
}

// ===== 更新器 =====

/** 更新检查结果 */
export interface UpdaterCheckResult {
  available: boolean;
  version?: string;
  releaseNotes?: string;
  currentVersion?: string;
  error?: string;
}

/** 更新下载进度 */
export interface UpdaterProgress {
  percent: number;
  transferred: number;
  total: number;
  bytesPerSecond: number;
}

/** 更新下载完成数据 */
export interface UpdaterDownloadedData {
  version: string;
}

/** 更新可用数据 */
export interface UpdaterAvailableData {
  version: string;
  releaseNotes: string;
}

/** 更新不可用数据 */
export interface UpdaterNotAvailableData {
  version: string;
}

/** 启动自动检查更新请求数据 */
export interface UpdaterStartupAutoCheckRequestData {
  requestedAt: number;
}

// ===== 剪贴板 =====

/** 剪贴板 URL 检测结果 */
export interface ClipboardUrlsDetectedData {
  urls: string[];
  title: string;
}

/** 外部 Agent 事件数据 */
export interface ExternalAgentData {
  agentNames: string[];
}

// ===== 快速导航 =====

/** 导航卡片顺序配置 */
export interface NavOrderPayload {
  visibleOrder: string[];
  hiddenOrder: string[];
}

// ===== 设置 =====

/** 壁纸设置载荷 */
export interface SetWallpaperPayload {
  sourcePath?: string | null;
  previewUrl?: string | null;
  clear?: boolean;
}

// ===== 搜索本地文件结果（快捷方式用） =====

/** 选择反馈日志文件结果 */
export type FilePathOrNull = string | null;
