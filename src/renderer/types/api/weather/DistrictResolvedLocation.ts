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
 * @file DistrictResolvedLocation.ts
 * @description 行政区解析位置类型定义
 * @author 鸡哥
 */

/** 行政区解析位置 */
export interface DistrictResolvedLocation {
  /** 纬度 */
  latitude: number;
  /** 经度 */
  longitude: number;
  /** 城市 */
  city: string;
  /** 行政区编码 */
  adcode?: string;
}
