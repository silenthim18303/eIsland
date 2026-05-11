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
 * @file toolboxConfig.ts
 * @description 工具箱页面公共配置常量与类型
 * @author 鸡哥
 */

export const SETTINGS_OPEN_TAB_STORE_KEY = 'settings-open-tab';

export const TOOLBOX_SIDEBAR_KEYS = ['download', 'software', 'translate', 'fileService', 'encodingService', 'networkService', 'formatFactory'] as const;
export type ToolboxSidebarKey = (typeof TOOLBOX_SIDEBAR_KEYS)[number];

export const TRANSLATE_LANGUAGES = [
  { code: 'auto', labelKey: 'maxExpand.toolbox.translate.lang.auto' },
  { code: 'zh', labelKey: 'maxExpand.toolbox.translate.lang.zh' },
  { code: 'en', labelKey: 'maxExpand.toolbox.translate.lang.en' },
  { code: 'ja', labelKey: 'maxExpand.toolbox.translate.lang.ja' },
  { code: 'ko', labelKey: 'maxExpand.toolbox.translate.lang.ko' },
  { code: 'fr', labelKey: 'maxExpand.toolbox.translate.lang.fr' },
  { code: 'de', labelKey: 'maxExpand.toolbox.translate.lang.de' },
  { code: 'es', labelKey: 'maxExpand.toolbox.translate.lang.es' },
  { code: 'ru', labelKey: 'maxExpand.toolbox.translate.lang.ru' },
] as const;

export const TRANSLATE_TARGET_LANGUAGES = TRANSLATE_LANGUAGES.filter((lang) => lang.code !== 'auto');

export const FORMAT_FACTORY_PAGES = ['image', 'video'] as const;
export type FormatFactoryPageKey = (typeof FORMAT_FACTORY_PAGES)[number];

export const FORMAT_FACTORY_IMAGE_OUTPUT_FORMATS = ['png', 'jpg', 'webp', 'bmp', 'ico'] as const;
export type FormatFactoryImageOutputFormat = (typeof FORMAT_FACTORY_IMAGE_OUTPUT_FORMATS)[number];

export const FORMAT_FACTORY_ICO_OUTPUT_SIZES = [16, 32, 64, 128, 256] as const;
export type FormatFactoryIcoOutputSize = (typeof FORMAT_FACTORY_ICO_OUTPUT_SIZES)[number];

export type DownloadTaskStatus = 'downloading' | 'paused' | 'completed' | 'failed' | 'canceled';

export interface DownloadTaskSnapshot {
  id: string;
  url: string;
  savePath: string;
  fileName: string;
  totalBytes: number;
  downloadedBytes: number;
  progress: number;
  speedBytesPerSecond: number;
  estimatedFinishAt: number | null;
  threads: number;
  status: DownloadTaskStatus;
  errorMessage?: string;
  createdAt: number;
  updatedAt: number;
}
