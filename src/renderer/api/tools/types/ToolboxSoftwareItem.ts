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
 * @file ToolboxSoftwareItem.ts
 * @description 工具箱软件项数据结构定义
 * @author 鸡哥
 */

/** 工具箱软件项 */
export interface ToolboxSoftwareItem {
  /** 软件ID */
  id: number;
  /** 软件名称 */
  name: string;
  /** 软件描述 */
  description: string;
  /** 下载链接 */
  url: string;
  /** 图标URL */
  iconUrl: string;
}
