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
 * @file registerConstants.ts
 * @description 注册组件常量与类型定义
 * @author 鸡哥
 */

/** 独立窗口模式存储键 */
export const STANDALONE_WINDOW_MODE_STORE_KEY = 'standalone-window-mode';

/** 旧版倒数日窗口模式存储键 */
export const LEGACY_COUNTDOWN_WINDOW_MODE_STORE_KEY = 'countdown-window-mode';

/** 反馈类型 */
export type FeedbackType = 'success' | 'error' | 'info';

/** 反馈数据 */
export interface Feedback {
  type: FeedbackType;
  text: string;
}

/** 用户名允许字符正则（中文、英文、数字） */
export const USERNAME_ALLOWED_PATTERN = /^[A-Za-z0-9一-鿿]+$/;

export { EMAIL_PATTERN } from '../../../config/patterns';
