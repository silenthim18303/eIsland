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
 * @file clipboardHistoryConfig.ts
 * @description 剪贴板历史模块常量定义。
 * @author 鸡哥
 */

/** 持久化键（store） */
export const STORE_KEY = 'clipboard-history-recent';
/** 持久化键（localStorage 兜底） */
export const LOCAL_STORAGE_KEY = 'eIsland_clipboard_history_recent';
/** 历史记录启用状态持久化键 */
export const HISTORY_ENABLED_STORE_KEY = 'clipboard-history-enabled';
/** 历史记录条数上限持久化键 */
export const HISTORY_LIMIT_STORE_KEY = 'clipboard-history-limit';
/** 复制后退出最大展开态持久化键 */
export const EXIT_MAX_EXPAND_ON_COPY_STORE_KEY = 'clipboard-history-exit-max-expand-on-copy';
/** 默认历史记录条数上限 */
export const DEFAULT_HISTORY_LIMIT = 10;
/** 剪贴板轮询间隔（ms） */
export const POLL_INTERVAL_MS = 1000;
/** 选择模式收起动画时长（ms） */
export const SELECTION_COLLAPSE_ANIMATION_MS = 180;
/** 毫秒/小时 */
export const MS_PER_HOUR = 60 * 60 * 1000;
/** 毫秒/天 */
export const MS_PER_DAY = 24 * MS_PER_HOUR;
/** 反馈提示显示时长（ms） */
export const FEEDBACK_DURATION_MS = 1800;
