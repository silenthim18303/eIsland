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
 * @file UploadWallpaperPayload.ts
 * @description 上传壁纸负载类型定义
 * @author 鸡哥
 */

/** 上传壁纸负载 */
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
  /** 时长（毫秒） */
  durationMs?: number;
  /** 帧率 */
  frameRate?: number;
  /** 原始文件 */
  original: File;
  /** 320px 缩略图 */
  thumb320: File;
  /** 720px 缩略图 */
  thumb720: File;
  /** 1280px 缩略图 */
  thumb1280: File;
}
