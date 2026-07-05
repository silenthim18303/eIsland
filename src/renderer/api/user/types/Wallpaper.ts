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
 * @file Wallpaper.ts
 * @description 壁纸市场相关数据结构定义
 * @author 鸡哥
 */

/** 壁纸市场项 */
export interface WallpaperMarketItem {
  /** 壁纸ID */
  id: number;
  /** 作者用户名 */
  ownerUsername: string;
  /** 作者头像 */
  ownerAvatar?: string;
  /** 标题 */
  title: string;
  /** 描述 */
  description: string;
  /** 类型：图片或视频 */
  type: 'image' | 'video';
  /** 状态 */
  status: string;
  /** 原始URL */
  originalUrl?: string;
  /** 320px缩略图URL */
  thumb320Url?: string;
  /** 720px缩略图URL */
  thumb720Url?: string;
  /** 1280px缩略图URL */
  thumb1280Url?: string;
  /** 视频时长（毫秒） */
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

/** 壁纸市场列表数据 */
export interface WallpaperMarketListData {
  /** 壁纸列表 */
  items: WallpaperMarketItem[];
  /** 总数 */
  total?: number;
}

/** 上传壁纸载荷 */
export interface UploadWallpaperPayload {
  /** 标题 */
  title: string;
  /** 描述 */
  description?: string;
  /** 标签 */
  tags?: string;
  /** 类型 */
  type?: 'image' | 'video';
  /** 版权声明 */
  copyrightDeclared: boolean;
  /** 版权信息 */
  copyrightInfo?: string;
  /** 宽度 */
  width?: number;
  /** 高度 */
  height?: number;
  /** 视频时长（毫秒） */
  durationMs?: number;
  /** 帧率 */
  frameRate?: number;
  /** 原始文件 */
  original: File;
  /** 320px缩略图 */
  thumb320: File;
  /** 720px缩略图 */
  thumb720: File;
  /** 1280px缩略图 */
  thumb1280: File;
}

/** 上传壁纸选项 */
export interface UploadWallpaperOptions {
  /** 上传进度回调 */
  onUploadProgress?: (percent: number) => void;
}

/** 壁纸标签项 */
export interface WallpaperTagItem {
  /** 标签ID */
  id: number;
  /** 标签名称 */
  name: string;
  /** 标签slug */
  slug: string;
  /** 使用次数 */
  usageCount?: number;
}
