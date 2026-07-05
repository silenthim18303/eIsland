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
 * @file WeatherAlert.ts
 * @description 天气预警相关数据结构定义
 * @author 鸡哥
 */

/** 天气预警位置 */
export interface WeatherAlertLocation {
  /** 纬度 */
  latitude: number;
  /** 经度 */
  longitude: number;
  /** 城市 */
  city: string;
}

/** 天气预警摘要 */
export interface WeatherAlertSummary {
  /** 预警ID */
  id: string;
  /** 预警标题 */
  title: string;
  /** 预警内容 */
  text: string;
  /** 预警等级 */
  level: string;
  /** 严重程度 */
  severity: string;
  /** 严重程度颜色 */
  severityColor: string;
  /** 预警类型 */
  typeName: string;
  /** 发布者 */
  sender: string;
  /** 发布时间 */
  pubTime: string;
}

/** 启动天气预警载荷 */
export interface StartupWeatherAlertPayload {
  /** 位置信息 */
  location: WeatherAlertLocation;
  /** 预警列表 */
  alerts: WeatherAlertSummary[];
}
