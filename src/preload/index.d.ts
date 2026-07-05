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
 * @file index.d.ts
 * @description 渲染进程全局类型声明，扩展 Window 接口以包含 Electron API 和自定义 API
 * @author 鸡哥
 */

import { ElectronAPI } from '@electron-toolkit/preload';

/** 歌曲信息类型（来自 SMTC Worker 主进程推送） */
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

export interface RunningProcessInfo {
  name: string;
  iconDataUrl: string | null;
}

export interface RunningWindowInfo {
  id: string;
  title: string;
  processName: string;
  processPath: string | null;
  processId: number | null;
  iconDataUrl: string | null;
}

export interface PerformanceHardwareSelection {
  cpu?: string;
  gpu?: string;
  disk?: string;
}

export interface PerformanceHardwareOption {
  id: string;
  label: string;
}

export interface PerformanceHardwareOptions {
  cpu: PerformanceHardwareOption[];
  gpu: PerformanceHardwareOption[];
  disk: PerformanceHardwareOption[];
}

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

export interface ClaudeCodeHookEventDetailItem {
  label: string;
  value: string;
}

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

export interface ClaudeCodeHookMutationResult {
  ok: boolean;
  message: string;
  snapshot: ClaudeCodeStatusSnapshot;
}

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      enableMousePassthrough: () => void;
      disableMousePassthrough: () => void;
      expandWindow: () => void;
      expandWindowNotification: () => void;
      expandWindowLyrics: () => void;
      expandWindowLyricsTranslation: () => void;
      expandWindowFull: () => void;
      expandWindowSettings: () => void;
      collapseWindow: () => void;
      hideWindow: () => void;
      getMousePosition: () => Promise<{ x: number; y: number }>;
      getWindowBounds: () => Promise<{ x: number; y: number; width: number; height: number }>;
      getIslandDisplays: () => Promise<Array<{ id: string; width: number; height: number; isPrimary: boolean }>>;
      getIslandDisplaySelection: () => Promise<string>;
      setIslandDisplaySelection: (selection: string) => Promise<boolean>;
      getIslandPositionOffset: () => Promise<{ x: number; y: number }>;
      setIslandPositionOffset: (offset: { x: number; y: number }) => Promise<boolean>;
      onIslandPositionOffsetChanged: (callback: (offset: { x: number; y: number }) => void) => () => void;
      quitApp: () => void;
      restartApp: () => Promise<boolean>;
      openLogsFolder: () => Promise<boolean>;
      pickFeedbackLogFile: () => Promise<string | null>;
      pickFeedbackScreenshotFile: () => Promise<string | null>;
      pickLocalSearchDirectory: () => Promise<string | null>;
      pickSkillFile: () => Promise<string | null>;
      readTextFile: (filePath: string) => Promise<string | null>;
      saveTextFile: (payload: {
        defaultPath: string;
        content: string;
        filters?: Array<{ name: string; extensions: string[] }>;
      }) => Promise<{ ok: boolean; canceled: boolean; filePath: string | null }>;
      searchLocalFiles: (
        rootDir: string,
        keyword: string,
        options?: {
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
        },
      ) => Promise<Array<{ name: string; path: string; isDirectory: boolean }>>;
      executeAgentLocalTool: (request: {
        tool: string;
        arguments?: Record<string, unknown>;
        workspaces?: string[];
      }) => Promise<{
        success: boolean;
        result: unknown;
        error: string;
        durationMs: number;
      }>;
      ollamaPing: (baseUrl?: string) => Promise<boolean>;
      ollamaModels: (baseUrl?: string) => Promise<string[]>;
      ollamaDetectBaseUrl: () => Promise<string | null>;
      ollamaChatStart: (
        sessionId: string,
        request: {
          model: string;
          systemPrompt: string;
          userMessage: string;
          context?: string;
          baseUrl?: string;
          temperature?: number;
        },
      ) => Promise<{ started: boolean; sessionId: string }>;
      ollamaChatAbort: (sessionId: string) => Promise<{ aborted: boolean }>;
      onOllamaChatEvent: (
        sessionId: string,
        callback: (event: { type: string; payload: Record<string, unknown> }) => void,
      ) => () => void;
      customDirectChatStart: (
        sessionId: string,
        request: {
          model: string;
          systemPrompt: string;
          userMessage: string;
          context?: string;
          baseUrl: string;
          apiKey: string;
          temperature?: number;
        },
      ) => Promise<{ started: boolean; sessionId: string }>;
      customDirectChatAbort: (sessionId: string) => Promise<{ aborted: boolean }>;
      onCustomDirectChatEvent: (
        sessionId: string,
        callback: (event: { type: string; payload: Record<string, unknown> }) => void,
      ) => () => void;
      clearLogsCache: () => Promise<{ success: boolean; freedBytes: number }>;
      windowMinimize: () => void;
      windowMaximize: () => void;
      windowClose: () => void;
      openStandaloneWindow: () => Promise<boolean>;
      closeStandaloneWindow: () => Promise<boolean>;
      mediaPlayPause: () => Promise<void>;
      mediaNext: () => Promise<void>;
      mediaPrev: () => Promise<void>;
      mediaSeek: (positionMs: number) => Promise<void>;
      mediaGetVolume: () => Promise<number>;
      mediaSetVolume: (volume: number) => Promise<void>;
      mediaCurrentInfoGet: () => Promise<NowPlayingInfo | null>;
      onNowPlayingInfo: (callback: (info: NowPlayingInfo | null) => void) => () => void;
      screenshot: () => Promise<string | null>;
      startRegionScreenshot: () => Promise<boolean>;
      openTaskManager: () => void;
      getPerformanceSnapshot: (
        selection?: PerformanceHardwareSelection,
        includeHardwareOptions?: boolean,
      ) => Promise<PerformanceSnapshot>;
      getPathForFile: (file: File) => string;
      getFileIcon: (filePath: string) => Promise<string | null>;
      openFile: (filePath: string) => Promise<boolean>;
      openInExplorer: (filePath: string) => Promise<boolean>;
      pickFileForHash: () => Promise<string | null>;
      computeFileHash: (filePath: string, algorithm: string) => Promise<{
        hash: string;
        algorithm: string;
        fileName: string;
        fileSize: number;
      } | null>;
      imageCompressionPickImages: () => Promise<string[]>;
      imageCompressionPickOutputDir: () => Promise<string | null>;
      imageCompressionStart: (payload: {
        inputPaths: string[];
        outputDir?: string;
        quality?: number;
      }) => Promise<{
        ok: boolean;
        results?: Array<{
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
        }>;
        message?: string;
      }>;
      imageCompressionList: () => Promise<Array<{
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
      }>>;
      imageCompressionRemove: (taskId: string) => Promise<boolean>;
      onImageCompressionTaskUpdated: (callback: (task: {
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
      }) => void) => () => void;
      saveImageAs: (sourcePath: string) => Promise<{ ok: boolean; canceled: boolean; filePath: string | null }>;
      resolveShortcut: (lnkPath: string) => Promise<{ target: string; name: string } | null>;
      openImageDialog: () => Promise<string | null>;
      openVideoDialog: () => Promise<string | null>;
      loadWallpaperFile: (filePath: string) => Promise<string | null>;
      clearWallpaperCache: () => Promise<void>;
      setSystemDesktopWallpaper: (payload: { sourcePath?: string | null; previewUrl?: string | null; clear?: boolean }) => Promise<boolean>;
      wallpaperVideoCover: (sourcePath: string) => Promise<string | null>;
      readLocalFileAsBuffer: (filePath: string) => Promise<Uint8Array | null>;
      pickVideoForExtract: () => Promise<{ filePath: string; fileSize: number | null } | null>;
      extractVideoTrack: (options: {
        filePath: string;
        trackType: string;
        outputFormat: string;
      }) => Promise<{ success: boolean; outputPath?: string; error?: string; fileSize?: number }>;
      netFetch: (url: string, options?: {
        method?: string;
        headers?: Record<string, string>;
        body?: string;
        timeoutMs?: number;
      }) => Promise<{ ok: boolean; status: number; body: string }>;
      mailInboxList: (configOrLimit?: Record<string, unknown> | number, limit?: number) => Promise<{ ok: boolean; items: Array<{ uid: string; subject: string; from: string; to: string; date: string; size: number; preview: string; body: string }>; message: string }>;
      storeRead: (key: string) => Promise<unknown>;
      storeWrite: (key: string, data: unknown) => Promise<boolean>;
      hotkeyGet: () => Promise<string>;
      hotkeySet: (accelerator: string) => Promise<boolean>;
      hotkeySuspend: () => Promise<boolean>;
      hotkeyResume: () => Promise<boolean>;
      quitHotkeyGet: () => Promise<string>;
      quitHotkeySet: (accelerator: string) => Promise<boolean>;
      screenshotHotkeyGet: () => Promise<string>;
      screenshotHotkeySet: (accelerator: string) => Promise<boolean>;
      nextSongHotkeyGet: () => Promise<string>;
      nextSongHotkeySet: (accelerator: string) => Promise<boolean>;
      playPauseSongHotkeyGet: () => Promise<string>;
      playPauseSongHotkeySet: (accelerator: string) => Promise<boolean>;
      resetPositionHotkeyGet: () => Promise<string>;
      resetPositionHotkeySet: (accelerator: string) => Promise<boolean>;
      toggleTrayHotkeyGet: () => Promise<string>;
      toggleTrayHotkeySet: (accelerator: string) => Promise<boolean>;
      showSettingsWindowHotkeyGet: () => Promise<string>;
      showSettingsWindowHotkeySet: (accelerator: string) => Promise<boolean>;
      openClipboardHistoryHotkeyGet: () => Promise<string>;
      openClipboardHistoryHotkeySet: (accelerator: string) => Promise<boolean>;
      togglePassthroughHotkeyGet: () => Promise<string>;
      togglePassthroughHotkeySet: (accelerator: string) => Promise<boolean>;
      toggleUiLockHotkeyGet: () => Promise<string>;
      toggleUiLockHotkeySet: (accelerator: string) => Promise<boolean>;
      agentVoiceInputHotkeyGet: () => Promise<string>;
      agentVoiceInputHotkeySet: (accelerator: string) => Promise<boolean>;
      onAgentVoiceInputState: (callback: (active: boolean) => void) => () => void;
      cliGlowShow: () => Promise<boolean>;
      cliGlowHide: () => Promise<boolean>;
      onPassthroughLockChanged: (callback: (locked: boolean) => void) => () => void;
      logWrite: (level: string, message: string) => void;
      musicWhitelistGet: () => Promise<string[]>;
      musicWhitelistSet: (list: string[]) => Promise<boolean>;
      musicLyricsSourceGet: () => Promise<string>;
      musicLyricsSourceSet: (source: string) => Promise<boolean>;
      musicLyricsEnabledGet: () => Promise<boolean>;
      musicLyricsEnabledSet: (enabled: boolean) => Promise<boolean>;
      musicLyricsTranslationEnabledGet: () => Promise<boolean>;
      musicLyricsTranslationEnabledSet: (enabled: boolean) => Promise<boolean>;
      musicLyricsKaraokeGet: () => Promise<boolean>;
      musicLyricsKaraokeSet: (enabled: boolean) => Promise<boolean>;
      musicLyricsClockGet: () => Promise<boolean>;
      musicLyricsClockSet: (enabled: boolean) => Promise<boolean>;
      musicLyricsCalibrateEnabledGet: () => Promise<boolean>;
      musicLyricsCalibrateEnabledSet: (enabled: boolean) => Promise<boolean>;
      musicLyricsCalibrateDelayGet: () => Promise<number>;
      musicLyricsCalibrateDelaySet: (delaySec: number) => Promise<boolean>;
      musicSmtcUnsubscribeMsGet: () => Promise<number>;
      musicSmtcUnsubscribeMsSet: (valueMs: number) => Promise<boolean>;
      musicDetectSourceAppId: () => Promise<{ ok: boolean; sources: Array<{ sourceAppId: string; isPlaying: boolean; hasTitle: boolean; thumbnail: string | null }>; message: string }>;
      smtcGetTimestamp: () => Promise<{ isAvailable: boolean; playbackStatus: string; timeline: { startTime: number; endTime: number; position: number; minSeekTime: number; maxSeekTime: number } | null }>;
      getRunningNonSystemProcesses: () => Promise<string[]>;
      getRunningNonSystemProcessesWithIcons: () => Promise<RunningProcessInfo[]>;
      getOpenWindowsWithIcons: () => Promise<RunningWindowInfo[]>;
      getFocusedWindow: () => Promise<RunningWindowInfo | null>;
      hideProcessListGet: () => Promise<string[]>;
      hideProcessListSet: (list: string[]) => Promise<boolean>;
      autoHideFullscreenWindowsGet: () => Promise<boolean>;
      autoHideFullscreenWindowsSet: (enabled: boolean) => Promise<boolean>;
      onSourceSwitchRequest: (callback: (data: { sourceAppId: string; title: string; artist: string }) => void) => () => void;
      mediaAcceptSourceSwitch: () => Promise<void>;
      mediaRejectSourceSwitch: () => Promise<void>;
      themeModeGet: () => Promise<string>;
      themeModeSet: (mode: string) => Promise<boolean>;
      settingsPreview: (channel: string, value: unknown) => Promise<boolean>;
      onSettingsChanged: (callback: (channel: string, value: unknown) => void) => () => void;
      islandOpacityGet: () => Promise<number>;
      islandOpacitySet: (opacity: number) => Promise<boolean>;
      expandMouseleaveIdleGet: () => Promise<boolean>;
      expandMouseleaveIdleSet: (enabled: boolean) => Promise<boolean>;
      maxexpandMouseleaveIdleGet: () => Promise<boolean>;
      maxexpandMouseleaveIdleSet: (enabled: boolean) => Promise<boolean>;
      idleClickExpandGet: () => Promise<boolean>;
      idleClickExpandSet: (enabled: boolean) => Promise<boolean>;
      springAnimationGet: () => Promise<boolean>;
      springAnimationSet: (enabled: boolean) => Promise<boolean>;
      animationSpeedGet: () => Promise<string>;
      animationSpeedSet: (speed: string) => Promise<boolean>;
      clipboardReadText: () => Promise<string>;
      clipboardWriteText: (text: string) => Promise<boolean>;
      clipboardUrlMonitorGet: () => Promise<boolean>;
      clipboardUrlMonitorSet: (enabled: boolean) => Promise<boolean>;
      clipboardUrlDetectModeGet: () => Promise<'https-only' | 'http-https' | 'domain-only'>;
      clipboardUrlDetectModeSet: (mode: 'https-only' | 'http-https' | 'domain-only') => Promise<boolean>;
      clipboardUrlBlacklistGet: () => Promise<string[]>;
      clipboardUrlBlacklistSet: (list: string[]) => Promise<boolean>;
      clipboardUrlBlacklistAddDomain: (domain: string) => Promise<boolean>;
      autostartGet: () => Promise<string>;
      autostartSet: (mode: string) => Promise<boolean>;
      navOrderGet: () => Promise<{ visibleOrder: string[]; hiddenOrder: string[] }>;
      navOrderSet: (payload: { visibleOrder: string[]; hiddenOrder: string[] }) => Promise<boolean>;
      downloadStart: (payload: { url: string; savePath?: string; threads?: number }) => Promise<{
        ok: boolean;
        task?: {
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
        };
        message?: string;
      }>;
      downloadCancel: (taskId: string) => Promise<boolean>;
      downloadPause: (taskId: string) => Promise<boolean>;
      downloadResume: (taskId: string) => Promise<{
        ok: boolean;
        task?: {
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
        };
        message?: string;
      }>;
      downloadRemove: (taskId: string) => Promise<boolean>;
      downloadList: () => Promise<Array<{
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
      }>>;
      downloadPickSavePath: (suggestedName?: string) => Promise<string | null>;
      downloadGetDefaultDir: () => Promise<string>;
      onDownloadTaskUpdated: (callback: (task: {
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
      }) => void) => () => void;
      updaterCheck: (source?: string, resolvedUrl?: string) => Promise<{ available: boolean; version?: string; releaseNotes?: string; currentVersion?: string; error?: string }>;
      updaterDownload: (source?: string, resolvedUrl?: string) => Promise<boolean>;
      updaterInstall: () => Promise<boolean>;
      updaterVersion: () => Promise<string>;
      onUpdaterProgress: (callback: (progress: { percent: number; transferred: number; total: number; bytesPerSecond: number }) => void) => () => void;
      onUpdaterDownloaded: (callback: (data: { version: string }) => void) => () => void;
      onUpdaterAvailable: (callback: (data: { version: string; releaseNotes: string }) => void) => () => void;
      onUpdaterNotAvailable: (callback: (data: { version: string }) => void) => () => void;
      onUpdaterStartupAutoCheckRequest: (callback: (data: { requestedAt: number }) => void) => () => void;
      onClipboardUrlsDetected: (callback: (data: { urls: string[]; title: string }) => void) => () => void;
      clipboardOpenUrl: (url: string) => Promise<boolean>;
      onExternalAgentStarted: (callback: (data: { agentNames: string[] }) => void) => () => void;
      onExternalAgentStopped: (callback: (data: { agentNames: string[] }) => void) => () => void;
      claudeCodeStatusGet: () => Promise<ClaudeCodeStatusSnapshot>;
      claudeCodeHookInstall: () => Promise<ClaudeCodeHookMutationResult>;
      claudeCodeHookUninstall: () => Promise<ClaudeCodeHookMutationResult>;
      claudeCodeEventsClear: () => Promise<ClaudeCodeStatusSnapshot>;
      claudeCodeSessionsDelete: (sessionIds: string[]) => Promise<ClaudeCodeStatusSnapshot>;
      claudeCodePermissionResolve: (sessionId: string, decision: 'allow' | 'always' | 'deny') => Promise<ClaudeCodeStatusSnapshot>;
      onClaudeCodeStatusUpdated: (callback: (snapshot: ClaudeCodeStatusSnapshot) => void) => () => void;
    };
  }
}
