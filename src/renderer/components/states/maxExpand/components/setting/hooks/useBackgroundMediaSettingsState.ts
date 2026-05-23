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
 * @file useBackgroundMediaSettingsState.ts
 * @description 设置页背景媒体状态 Hook，统一管理背景预览、持久化与桌面壁纸同步
 * @author 鸡哥
 */

import { useRef, useState } from 'react';
import {
  LOCAL_ISLAND_BG_SYNC_EVENT,
  ISLAND_BG_MEDIA_STORE_KEY,
  ISLAND_BG_IMAGE_STORE_KEY,
  ISLAND_BG_VIDEO_FIT_STORE_KEY,
  ISLAND_BG_VIDEO_MUTED_STORE_KEY,
  ISLAND_BG_VIDEO_LOOP_STORE_KEY,
  ISLAND_BG_VIDEO_VOLUME_STORE_KEY,
  ISLAND_BG_VIDEO_RATE_STORE_KEY,
  ISLAND_BG_VIDEO_HW_DECODE_STORE_KEY,
  isDirectBgMediaUrl,
  resolveBgMediaPreviewUrl,
  type IslandBgMediaConfig,
} from '../config/settingsTabConfig';

/**
 * 管理背景媒体配置状态与相关操作。
 * @returns 背景媒体状态、持久化方法、预览应用方法与用户交互处理函数
 */
export default function useBackgroundMediaSettingsState() {
  const [bgMedia, setBgMedia] = useState<IslandBgMediaConfig | null>(null);
  const [bgMediaPreviewUrl, setBgMediaPreviewUrl] = useState<string | null>(null);
  const [bgVideoFit, setBgVideoFit] = useState<'cover' | 'contain'>('cover');
  const [bgVideoMuted, setBgVideoMuted] = useState<boolean>(true);
  const [bgVideoLoop, setBgVideoLoop] = useState<boolean>(true);
  const [bgVideoVolume, setBgVideoVolume] = useState<number>(0.6);
  const [bgVideoRate, setBgVideoRate] = useState<number>(1);
  const [bgVideoHwDecode, setBgVideoHwDecode] = useState<boolean>(true);
  const [syncDesktopWallpaperOnBackgroundChange, setSyncDesktopWallpaperOnBackgroundChange] = useState<boolean>(false);
  const [bgImageOpacity, setBgImageOpacity] = useState<number>(30);
  const [bgImageBlur, setBgImageBlur] = useState<number>(0);

  const bgOpacitySaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bgBlurSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyBgMedia = (media: IslandBgMediaConfig | null, previewUrl: string | null): void => {
    const el = document.getElementById('island-bg-layer');
    if (el) {
      if (media?.type === 'image' && previewUrl) {
        el.style.backgroundImage = `url(${previewUrl})`;
        el.style.opacity = String(bgImageOpacity / 100);
        el.style.filter = `blur(${bgImageBlur}px)`;
      } else if (media?.type === 'video' && previewUrl) {
        el.style.backgroundImage = '';
        el.style.opacity = String(bgImageOpacity / 100);
        el.style.filter = `blur(${bgImageBlur}px)`;
      } else {
        el.style.backgroundImage = '';
        el.style.opacity = '0';
        el.style.filter = 'none';
      }
    }
    setBgMedia(media);
    setBgMediaPreviewUrl(previewUrl);
    window.dispatchEvent(new CustomEvent(LOCAL_ISLAND_BG_SYNC_EVENT, {
      detail: {
        media,
        previewUrl,
        image: media?.type === 'image' ? previewUrl : null,
      },
    }));
  };

  const applyBgOpacity = (value: number): void => {
    const el = document.getElementById('island-bg-layer');
    if (el) el.style.opacity = String(value / 100);
    window.dispatchEvent(new CustomEvent(LOCAL_ISLAND_BG_SYNC_EVENT, {
      detail: { opacity: value },
    }));
  };

  const applyBgBlur = (value: number): void => {
    const el = document.getElementById('island-bg-layer');
    if (el) {
      el.style.filter = value > 0 ? `blur(${value}px)` : 'none';
    }
    window.dispatchEvent(new CustomEvent(LOCAL_ISLAND_BG_SYNC_EVENT, {
      detail: { blur: value },
    }));
  };

  const applyBgVideoFit = (value: 'cover' | 'contain'): void => {
    window.dispatchEvent(new CustomEvent(LOCAL_ISLAND_BG_SYNC_EVENT, {
      detail: { videoFit: value },
    }));
  };

  const applyBgVideoMuted = (value: boolean): void => {
    window.dispatchEvent(new CustomEvent(LOCAL_ISLAND_BG_SYNC_EVENT, {
      detail: { videoMuted: value },
    }));
  };

  const applyBgVideoLoop = (value: boolean): void => {
    window.dispatchEvent(new CustomEvent(LOCAL_ISLAND_BG_SYNC_EVENT, {
      detail: { videoLoop: value },
    }));
  };

  const applyBgVideoVolume = (value: number): void => {
    const safe = Math.max(0, Math.min(1, value));
    window.dispatchEvent(new CustomEvent(LOCAL_ISLAND_BG_SYNC_EVENT, {
      detail: { videoVolume: safe },
    }));
  };

  const applyBgVideoRate = (value: number): void => {
    const safe = Math.max(0.25, Math.min(3, value));
    window.dispatchEvent(new CustomEvent(LOCAL_ISLAND_BG_SYNC_EVENT, {
      detail: { videoRate: safe },
    }));
  };

  const applyBgVideoHwDecode = (value: boolean): void => {
    window.dispatchEvent(new CustomEvent(LOCAL_ISLAND_BG_SYNC_EVENT, {
      detail: { videoHwDecode: value },
    }));
  };

  const persistBgMedia = (media: IslandBgMediaConfig | null): void => {
    window.api.storeWrite(ISLAND_BG_MEDIA_STORE_KEY, media).catch(() => {});
    const legacyImage = media?.type === 'image' ? media.source : null;
    window.api.storeWrite(ISLAND_BG_IMAGE_STORE_KEY, legacyImage).catch(() => {});
  };

  const persistBgVideoFit = (value: 'cover' | 'contain'): void => {
    window.api.storeWrite(ISLAND_BG_VIDEO_FIT_STORE_KEY, value).catch(() => {});
  };

  const persistBgVideoMuted = (value: boolean): void => {
    window.api.storeWrite(ISLAND_BG_VIDEO_MUTED_STORE_KEY, value).catch(() => {});
  };

  const persistBgVideoLoop = (value: boolean): void => {
    window.api.storeWrite(ISLAND_BG_VIDEO_LOOP_STORE_KEY, value).catch(() => {});
  };

  const persistBgVideoVolume = (value: number): void => {
    const safe = Math.max(0, Math.min(1, value));
    window.api.storeWrite(ISLAND_BG_VIDEO_VOLUME_STORE_KEY, safe).catch(() => {});
  };

  const persistBgVideoRate = (value: number): void => {
    const safe = Math.max(0.25, Math.min(3, value));
    window.api.storeWrite(ISLAND_BG_VIDEO_RATE_STORE_KEY, safe).catch(() => {});
  };

  const persistBgVideoHwDecode = (value: boolean): void => {
    window.api.storeWrite(ISLAND_BG_VIDEO_HW_DECODE_STORE_KEY, value).catch(() => {});
  };

  const resolveDesktopWallpaperPreviewUrl = (previewUrl: string | null): string | null => {
    if (!previewUrl) return null;
    const trimmed = previewUrl.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('file://')) {
      return trimmed;
    }
    try {
      return new URL(trimmed, window.location.href).toString();
    } catch {
      return trimmed;
    }
  };

  const syncSystemDesktopWallpaperIfNeeded = async (
    media: IslandBgMediaConfig | null,
    previewUrl: string | null,
  ): Promise<void> => {
    if (!syncDesktopWallpaperOnBackgroundChange) return;
    if (!media) return;

    if (media.type === 'video') {
      const sourcePath = !isDirectBgMediaUrl(media.source) ? media.source : null;
      if (sourcePath) {
        const coverPath = await window.api.wallpaperVideoCover(sourcePath).catch(() => null);
        if (coverPath) {
          await window.api.setSystemDesktopWallpaper({ sourcePath: coverPath, previewUrl: coverPath }).catch(() => false);
          return;
        }
      }
    }

    const sourcePath = !isDirectBgMediaUrl(media.source) ? media.source : null;
    const normalizedPreview = resolveDesktopWallpaperPreviewUrl(previewUrl);
    await window.api.setSystemDesktopWallpaper({ sourcePath, previewUrl: normalizedPreview }).catch(() => false);
  };

  const persistBgOpacity = (value: number): void => {
    window.api.storeWrite('island-bg-opacity', value).catch(() => {});
  };

  const persistBgBlur = (value: number): void => {
    window.api.storeWrite('island-bg-blur', value).catch(() => {});
  };

  const handleSelectBgImage = async (): Promise<void> => {
    const filePath = await window.api.openImageDialog();
    if (!filePath) return;
    const dataUrl = await window.api.loadWallpaperFile(filePath);
    if (!dataUrl) return;
    const media: IslandBgMediaConfig = { type: 'image', source: filePath };
    applyBgMedia(media, dataUrl);
    persistBgMedia(media);
    void syncSystemDesktopWallpaperIfNeeded(media, dataUrl);
  };

  const handleSelectBgVideo = async (): Promise<void> => {
    const filePath = await window.api.openVideoDialog();
    if (!filePath) return;
    const media: IslandBgMediaConfig = { type: 'video', source: filePath };
    const previewUrl = await resolveBgMediaPreviewUrl(media);
    if (!previewUrl) return;
    applyBgMedia(media, previewUrl);
    persistBgMedia(media);
    void syncSystemDesktopWallpaperIfNeeded(media, previewUrl);
  };

  const handleClearBgImage = (): void => {
    applyBgMedia(null, null);
    persistBgMedia(null);
    window.api.storeWrite(ISLAND_BG_IMAGE_STORE_KEY, null).catch(() => {});
    window.api.settingsPreview('store:island-bg-image', null).catch(() => {});
    window.api.setSystemDesktopWallpaper({ clear: true }).catch(() => false);
    window.api.clearWallpaperCache?.().catch(() => {});
  };

  const handleSelectBuiltinBgImage = (src: string, defaultOpacity: number): void => {
    const media: IslandBgMediaConfig = { type: 'image', source: src };
    setBgImageOpacity(defaultOpacity);
    applyBgMedia(media, src);
    applyBgOpacity(defaultOpacity);
    persistBgMedia(media);
    persistBgOpacity(defaultOpacity);
    void syncSystemDesktopWallpaperIfNeeded(media, src);
  };

  const handleApplyMarketplaceWallpaper = (mediaUrl: string, options?: { type?: 'image' | 'video' }): void => {
    if (!mediaUrl) return;
    const mediaType: 'image' | 'video' = options?.type === 'video' ? 'video' : 'image';
    const media: IslandBgMediaConfig = { type: mediaType, source: mediaUrl };
    applyBgMedia(media, mediaUrl);
    persistBgMedia(media);
    void syncSystemDesktopWallpaperIfNeeded(media, mediaUrl);
    if (mediaType === 'image') {
      window.api.settingsPreview('store:island-bg-image', mediaUrl).catch(() => {});
    }
    window.api.settingsPreview('store:island-bg-media', media).catch(() => {});
  };

  return {
    bgMedia,
    setBgMedia,
    bgMediaPreviewUrl,
    setBgMediaPreviewUrl,
    bgVideoFit,
    setBgVideoFit,
    bgVideoMuted,
    setBgVideoMuted,
    bgVideoLoop,
    setBgVideoLoop,
    bgVideoVolume,
    setBgVideoVolume,
    bgVideoRate,
    setBgVideoRate,
    bgVideoHwDecode,
    setBgVideoHwDecode,
    syncDesktopWallpaperOnBackgroundChange,
    setSyncDesktopWallpaperOnBackgroundChange,
    bgImageOpacity,
    setBgImageOpacity,
    bgImageBlur,
    setBgImageBlur,
    bgOpacitySaveTimerRef,
    bgBlurSaveTimerRef,
    applyBgMedia,
    applyBgOpacity,
    applyBgBlur,
    applyBgVideoFit,
    applyBgVideoMuted,
    applyBgVideoLoop,
    applyBgVideoVolume,
    applyBgVideoRate,
    applyBgVideoHwDecode,
    persistBgMedia,
    persistBgVideoFit,
    persistBgVideoMuted,
    persistBgVideoLoop,
    persistBgVideoVolume,
    persistBgVideoRate,
    persistBgVideoHwDecode,
    persistBgOpacity,
    persistBgBlur,
    handleSelectBgImage,
    handleSelectBgVideo,
    handleClearBgImage,
    handleSelectBuiltinBgImage,
    handleApplyMarketplaceWallpaper,
  };
}
