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
 * @file countdownConfig.ts
 * @description 倒数日模块常量定义。
 * @author 鸡哥
 */

import type { EventType } from '../types/countdownTypes';

/** 持久化键 */
export const STORE_KEY = 'countdown-dates';

/** 支持的事件类型列表 */
export const EVENT_TYPES: EventType[] = ['countdown', 'anniversary', 'birthday', 'holiday', 'exam'];

/** 预设颜色列表 */
export const COLOR_PRESETS = [
  '#ff5252', '#ff7043', '#ffab40', '#ffd740',
  '#69f0ae', '#81c784', '#69c0ff', '#448aff',
  '#7c4dff', '#ce93d8', '#f48fb1', '#80deea',
];
