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
 * @file StartRealtimeSttRequest.ts
 * @description 启动实时语音识别请求类型定义
 * @author 鸡哥
 */

import type { RealtimeSttEvent } from './RealtimeSttEvent';

/** 启动实时语音识别请求 */
export interface StartRealtimeSttRequest {
  /** 用户 token */
  token: string;
  /** 语言 */
  language?: 'zh-CN' | 'en-US';
  /** 事件回调 */
  onEvent: (event: RealtimeSttEvent) => void;
  /** 连接打开回调 */
  onOpen?: () => void;
  /** 连接关闭回调 */
  onClose?: () => void;
}
