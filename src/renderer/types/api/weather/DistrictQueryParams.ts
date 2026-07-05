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
 * @file DistrictQueryParams.ts
 * @description 行政区查询参数类型定义
 * @author 鸡哥
 */

/** 行政区查询参数 */
export interface DistrictQueryParams {
  /** 行政区编码（可选，与 keyword 二选一或同时提供） */
  adcode?: string;
  /** 区域关键字（支持中文/英文） */
  keyword?: string;
  /** 区域关键字（兼容 SDK 字段） */
  keywords?: string;
  /** 子级深度：0-3 */
  subdistrict?: 0 | 1 | 2 | 3;
  /** 分页页码（从 1 开始） */
  page?: number;
  /** 每页数量 */
  pageSize?: number;
}
