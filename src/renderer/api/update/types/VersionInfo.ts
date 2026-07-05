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
 * @file VersionInfo.ts
 * @description 版本信息数据结构定义
 * @author 鸡哥
 */

/** 版本信息 */
export interface VersionInfo {
  /** 应用名称 */
  appName: string;
  /** 版本号 */
  version: string;
  /** 版本描述 */
  description: string;
  /** 下载链接 */
  downloadUrl: string;
  /** 版本ID */
  id: number;
  /** 更新时间 */
  updatedAt: string;
}
