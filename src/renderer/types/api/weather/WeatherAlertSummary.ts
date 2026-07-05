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
 * @file WeatherAlertSummary.ts
 * @description 天气预警摘要类型定义
 * @author 鸡哥
 */

/** 天气预警摘要 */
export interface WeatherAlertSummary {
  /** 预警 ID */
  id: string;
  /** 标题 */
  title: string;
  /** 内容 */
  text: string;
  /** 级别 */
  level: string;
  /** 严重程度 */
  severity: string;
  /** 严重程度颜色 */
  severityColor: string;
  /** 类型名称 */
  typeName: string;
  /** 发布者 */
  sender: string;
  /** 发布时间 */
  pubTime: string;
}
