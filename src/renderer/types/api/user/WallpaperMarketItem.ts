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
 * @file WallpaperMarketItem.ts
 * @description 壁纸市场项类型定义
 * @author 鸡哥
 */

/** 壁纸市场项 */
export interface WallpaperMarketItem {
  /** 壁纸 ID */
  id: number;
  /** 所有者用户名 */
  ownerUsername: string;
  /** 所有者头像 */
  ownerAvatar?: string;
  /** 标题 */
  title: string;
  /** 描述 */
  description: string;
  /** 类型 */
  type: 'image' | 'video';
  /** 状态 */
  status: string;
  /** 原始 URL */
  originalUrl?: string;
  /** 320px 缩略图 URL */
  thumb320Url?: string;
  /** 720px 缩略图 URL */
  thumb720Url?: string;
  /** 1280px 缩略图 URL */
  thumb1280Url?: string;
  /** 时长（毫秒） */
  durationMs?: number;
  /** 帧率 */
  frameRate?: number;
  /** 标签文本 */
  tagsText?: string;
  /** 版权信息 */
  copyrightInfo?: string;
  /** 平均评分 */
  ratingAvg?: number;
  /** 评分数量 */
  ratingCount?: number;
  /** 下载次数 */
  downloadCount?: number;
  /** 应用次数 */
  applyCount?: number;
  /** 创建时间 */
  createdAt?: string;
  /** 发布时间 */
  publishedAt?: string;
}
