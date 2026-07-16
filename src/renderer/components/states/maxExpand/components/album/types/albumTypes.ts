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

import { UseAlbumViewerReturn } from "../hooks/useAlbumViewer";

/**
 * @file albumTypes.ts
 * @description 相册模块常量与类型定义。
 * @author 鸡哥
 */

/** 持久化键（store） */
export const STORE_KEY = 'photo-album-items';
/** 持久化键（localStorage 兜底） */
export const LOCAL_STORAGE_KEY = 'eIsland_photo_album_items';
/** 总览每行列数持久化键 */
export const COLUMNS_STORE_KEY = 'photo-album-columns';
/** 总览排序模式持久化键 */
export const SORT_STORE_KEY = 'photo-album-sort';
/** 总览浏览模式持久化键 */
export const GROUP_MODE_STORE_KEY = 'photo-album-group-mode';
/** 灵动岛背景本地同步事件名（与设置页保持一致） */
export const LOCAL_ISLAND_BG_SYNC_EVENT = 'island-bg-local-sync';
/** 灵动岛背景媒体持久化键 */
export const ISLAND_BG_MEDIA_STORE_KEY = 'island-bg-media';
/** 兼容旧逻辑的背景图片键 */
export const ISLAND_BG_IMAGE_STORE_KEY = 'island-bg-image';
/** 支持的图片扩展名（小写、不含点） */
export const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'];
/** 支持的视频扩展名（小写、不含点） */
export const VIDEO_EXTS = ['mp4', 'webm', 'mov', 'm4v'];
/** 支持的媒体扩展名（小写、不含点） */
export const SUPPORTED_EXTS = [...IMAGE_EXTS, ...VIDEO_EXTS];
/** 总览每行最少列数 */
export const MIN_COLUMNS = 3;
/** 总览每行最大列数 */
export const MAX_COLUMNS = 8;
/** 默认每行列数 */
export const DEFAULT_COLUMNS = 5;
/** 单图视图缩放范围（最小 / 最大） */
export const ZOOM_MIN = 0.2;
export const ZOOM_MAX = 6;
/** 单图滚轮缩放步长 */
export const ZOOM_STEP = 0.15;
/** MaxExpand 切换动画缓冲（ms）：结束后再开始批量媒体加载，避免首帧卡顿 */
export const MEDIA_LOAD_DELAY_MS = 320;

/** 相册条目排序模式 */
export type AlbumSortMode = 'addedDesc' | 'addedAsc' | 'nameAsc' | 'nameDesc' | 'durationDesc' | 'durationAsc';
export type AlbumFilterMode = 'all' | 'image' | 'video';
export type AlbumGroupMode = 'none' | 'folder' | 'date';
export type AlbumMediaType = 'image' | 'video';

/** 相册条目（持久化结构） */
export interface AlbumItem {
  /** 唯一 ID（一般取首次添加时的时间戳） */
  id: number;
  /** 文件绝对路径 */
  path: string;
  /** 文件名（含扩展名） */
  name: string;
  /** 小写扩展名（不含点） */
  ext: string;
  /** 媒体类型 */
  mediaType: AlbumMediaType;
  /** 添加到相册的时间戳（ms） */
  addedAt: number;
}

/** 灵动岛背景媒体配置 */
export interface IslandBgMediaConfig {
  type: 'image' | 'video';
  source: string;
}

/** 相册条目运行时元数据（不持久化） */
export interface AlbumMeta {
  /** data URL，用于 <img> 显示 */
  dataUrl?: string;
  /** 视频预览地址 */
  videoUrl?: string;
  /** 图片像素宽度 */
  width?: number;
  /** 图片像素高度 */
  height?: number;
  /** 视频时长（秒） */
  durationSec?: number;
  /** 视频编码（尽力识别） */
  videoCodec?: string;
  /** 视频帧率（受浏览器能力限制，可能无法读取） */
  fps?: number;
  /** 估算的文件大小（字节） */
  sizeBytes?: number;
  /** 是否正在加载 */
  loading?: boolean;
  /** 加载是否失败 */
  loadFailed?: boolean;
  /** 简易 EXIF 信息（仅 JPEG 尝试解析） */
  exif?: AlbumExifData;
}

/** 简易 EXIF 信息 */
export interface AlbumExifData {
  /** 厂商，如 Canon */
  make?: string;
  /** 机型，如 EOS R5 */
  model?: string;
  /** 拍摄时间，原始字符串（YYYY:MM:DD HH:MM:SS） */
  dateTimeOriginal?: string;
  /** 曝光时间，文本，如 1/250s */
  exposureTime?: string;
  /** 光圈值，如 2.8 */
  fNumber?: number;
  /** 感光度，如 100 */
  iso?: number;
  /** 焦距（mm） */
  focalLength?: number;
}

export interface AlbumViewerProps {
  /** useAlbumViewer hook 返回值 */
  viewer: UseAlbumViewerReturn;
  /** 筛选后条目数（导航按钮禁用判断） */
  filteredCount: number;
  /** 返回总览 */
  onBack: () => void;
  /** 原始缩放 */
  onOriginalZoom: () => void;
  /** 资源管理器定位 */
  onOpenInExplorer: (item: AlbumItem) => void;
  /** 另存为 */
  onSaveAs: (item: AlbumItem) => void;
  /** 设为灵动岛背景 */
  onSetAsIslandBackground: (item: AlbumItem) => void;
}