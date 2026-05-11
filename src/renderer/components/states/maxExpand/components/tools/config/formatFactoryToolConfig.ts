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
 * @file formatFactoryToolConfig.ts
 * @description 工具箱格式工厂模块配置常量与类型
 * @author 鸡哥
 */

export const FORMAT_FACTORY_PAGES = ['image', 'video'] as const;
export type FormatFactoryPageKey = (typeof FORMAT_FACTORY_PAGES)[number];

export const FORMAT_FACTORY_IMAGE_OUTPUT_FORMATS = ['png', 'jpg', 'webp', 'bmp', 'ico'] as const;
export type FormatFactoryImageOutputFormat = (typeof FORMAT_FACTORY_IMAGE_OUTPUT_FORMATS)[number];

export const FORMAT_FACTORY_ICO_OUTPUT_SIZES = [16, 32, 64, 128, 256] as const;
export type FormatFactoryIcoOutputSize = (typeof FORMAT_FACTORY_ICO_OUTPUT_SIZES)[number];

export const FORMAT_FACTORY_VIDEO_EXTRACT_TRACKS = ['audio', 'video'] as const;
export type FormatFactoryVideoExtractTrack = (typeof FORMAT_FACTORY_VIDEO_EXTRACT_TRACKS)[number];

export const FORMAT_FACTORY_AUDIO_OUTPUT_FORMATS = ['mp3', 'aac', 'wav', 'flac', 'ogg'] as const;
export type FormatFactoryAudioOutputFormat = (typeof FORMAT_FACTORY_AUDIO_OUTPUT_FORMATS)[number];

export const FORMAT_FACTORY_VIDEO_OUTPUT_FORMATS = ['mp4', 'mkv', 'avi', 'webm'] as const;
export type FormatFactoryVideoOutputFormat = (typeof FORMAT_FACTORY_VIDEO_OUTPUT_FORMATS)[number];
