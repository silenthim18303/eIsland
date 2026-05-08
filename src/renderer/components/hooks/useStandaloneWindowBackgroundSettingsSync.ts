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

import { useEffect } from 'react';
import {
  ISLAND_BG_MEDIA_STORE_KEY,
  ISLAND_BG_IMAGE_STORE_KEY,
  ISLAND_BG_VIDEO_FIT_STORE_KEY,
  ISLAND_BG_VIDEO_MUTED_STORE_KEY,
  ISLAND_BG_VIDEO_LOOP_STORE_KEY,
  ISLAND_BG_VIDEO_VOLUME_STORE_KEY,
  ISLAND_BG_VIDEO_RATE_STORE_KEY,
  ISLAND_BG_VIDEO_HW_DECODE_STORE_KEY,
  LOCAL_ISLAND_BG_SYNC_EVENT,
  normalizeBgMediaConfig,
  resolveBgMediaPreviewUrl,
} from '../config/dynamicIslandConfig';
import type { IslandBgMediaConfig } from '../config/dynamicIslandConfig';
import {
  ISLAND_BG_OPACITY_STORE_KEY,
  ISLAND_BG_BLUR_STORE_KEY,
  STANDALONE_WINDOW_MAC_CONTROLS_STORE_KEY,
} from '../config/standaloneWindowConfig';

interface UseStandaloneWindowBackgroundSettingsSyncOptions {
  setBgVideoFit: React.Dispatch<React.SetStateAction<'cover' | 'contain'>>;
  setBgVideoMuted: React.Dispatch<React.SetStateAction<boolean>>;
  setBgVideoLoop: React.Dispatch<React.SetStateAction<boolean>>;
  setBgVideoVolume: React.Dispatch<React.SetStateAction<number>>;
  setBgVideoRate: React.Dispatch<React.SetStateAction<number>>;
  setBgVideoHwDecode: React.Dispatch<React.SetStateAction<boolean>>;
  setStandaloneMacControls: React.Dispatch<React.SetStateAction<boolean>>;
  applyBgMedia: (media: IslandBgMediaConfig | null, previewUrl: string | null) => void;
  applyBgOpacity: (opacityValue: unknown) => void;
  applyBgBlur: (blurValue: unknown) => void;
}

export function useStandaloneWindowBackgroundSettingsSync(options: UseStandaloneWindowBackgroundSettingsSyncOptions): void {
  const {
    setBgVideoFit,
    setBgVideoMuted,
    setBgVideoLoop,
    setBgVideoVolume,
    setBgVideoRate,
    setBgVideoHwDecode,
    setStandaloneMacControls,
    applyBgMedia,
    applyBgOpacity,
    applyBgBlur,
  } = options;

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      window.api.storeRead(ISLAND_BG_MEDIA_STORE_KEY),
      window.api.storeRead(ISLAND_BG_IMAGE_STORE_KEY) as Promise<string | null>,
      window.api.storeRead(ISLAND_BG_VIDEO_FIT_STORE_KEY) as Promise<'cover' | 'contain' | null>,
      window.api.storeRead(ISLAND_BG_VIDEO_MUTED_STORE_KEY) as Promise<boolean | null>,
      window.api.storeRead(ISLAND_BG_VIDEO_LOOP_STORE_KEY) as Promise<boolean | null>,
      window.api.storeRead(ISLAND_BG_VIDEO_VOLUME_STORE_KEY) as Promise<number | null>,
      window.api.storeRead(ISLAND_BG_VIDEO_RATE_STORE_KEY) as Promise<number | null>,
      window.api.storeRead(ISLAND_BG_VIDEO_HW_DECODE_STORE_KEY) as Promise<boolean | null>,
    ]).then(async ([mediaRaw, legacyImage, videoFit, videoMuted, videoLoop, videoVolume, videoRate, videoHwDecode]) => {
      if (cancelled) return;
      if (videoFit === 'cover' || videoFit === 'contain') setBgVideoFit(videoFit);
      if (typeof videoMuted === 'boolean') setBgVideoMuted(videoMuted);
      if (typeof videoLoop === 'boolean') setBgVideoLoop(videoLoop);
      if (typeof videoVolume === 'number' && Number.isFinite(videoVolume)) setBgVideoVolume(Math.max(0, Math.min(1, videoVolume)));
      if (typeof videoRate === 'number' && Number.isFinite(videoRate)) setBgVideoRate(Math.max(0.25, Math.min(3, videoRate)));
      if (typeof videoHwDecode === 'boolean') setBgVideoHwDecode(videoHwDecode);

      const media = normalizeBgMediaConfig(mediaRaw)
        ?? (typeof legacyImage === 'string' ? normalizeBgMediaConfig(legacyImage) : null);
      if (!media) {
        applyBgMedia(null, null);
        return;
      }
      const previewUrl = await resolveBgMediaPreviewUrl(media);
      if (cancelled) return;
      applyBgMedia(media, previewUrl);
    }).catch(() => {});

    window.api.storeRead(ISLAND_BG_OPACITY_STORE_KEY).then((opacity) => {
      if (!cancelled) applyBgOpacity(opacity);
    }).catch(() => {});

    window.api.storeRead(ISLAND_BG_BLUR_STORE_KEY).then((blur) => {
      if (!cancelled) applyBgBlur(blur);
    }).catch(() => {});

    window.api.storeRead(STANDALONE_WINDOW_MAC_CONTROLS_STORE_KEY).then((value) => {
      if (!cancelled && typeof value === 'boolean') setStandaloneMacControls(value);
    }).catch(() => {});

    const unsub = window.api.onSettingsChanged((channel: string, value: unknown) => {
      if (cancelled) return;
      if (channel === `store:${ISLAND_BG_MEDIA_STORE_KEY}`) {
        const media = normalizeBgMediaConfig(value);
        if (!media) {
          applyBgMedia(null, null);
          return;
        }
        resolveBgMediaPreviewUrl(media).then((previewUrl) => {
          if (!cancelled) applyBgMedia(media, previewUrl);
        }).catch(() => {});
      }
      if (channel === `store:${ISLAND_BG_OPACITY_STORE_KEY}`) applyBgOpacity(value);
      if (channel === `store:${ISLAND_BG_BLUR_STORE_KEY}`) applyBgBlur(value);
      if (channel === `store:${ISLAND_BG_VIDEO_FIT_STORE_KEY}` && (value === 'cover' || value === 'contain')) setBgVideoFit(value);
      if (channel === `store:${ISLAND_BG_VIDEO_MUTED_STORE_KEY}` && typeof value === 'boolean') setBgVideoMuted(value);
      if (channel === `store:${ISLAND_BG_VIDEO_LOOP_STORE_KEY}` && typeof value === 'boolean') setBgVideoLoop(value);
      if (channel === `store:${ISLAND_BG_VIDEO_VOLUME_STORE_KEY}` && typeof value === 'number' && Number.isFinite(value)) setBgVideoVolume(Math.max(0, Math.min(1, value)));
      if (channel === `store:${ISLAND_BG_VIDEO_RATE_STORE_KEY}` && typeof value === 'number' && Number.isFinite(value)) setBgVideoRate(Math.max(0.25, Math.min(3, value)));
      if (channel === `store:${ISLAND_BG_VIDEO_HW_DECODE_STORE_KEY}` && typeof value === 'boolean') setBgVideoHwDecode(value);
      if (channel === `store:${STANDALONE_WINDOW_MAC_CONTROLS_STORE_KEY}` && typeof value === 'boolean') setStandaloneMacControls(value);
    });

    const localBgSyncHandler = (event: Event): void => {
      const customEvent = event as CustomEvent<{ media?: IslandBgMediaConfig | null; previewUrl?: string | null; image?: string | null; opacity?: number; blur?: number; videoFit?: 'cover' | 'contain'; videoMuted?: boolean; videoLoop?: boolean; videoVolume?: number; videoRate?: number; videoHwDecode?: boolean }>;
      const detail = customEvent.detail;
      if (!detail || typeof detail !== 'object') return;
      const hasMediaPayload = 'media' in detail || 'previewUrl' in detail;
      if (hasMediaPayload) applyBgMedia(detail.media ?? null, detail.previewUrl ?? null);
      if (!hasMediaPayload && 'image' in detail) {
        const media = typeof detail.image === 'string' ? normalizeBgMediaConfig(detail.image) : null;
        applyBgMedia(media, detail.image ?? null);
      }
      if ('opacity' in detail) applyBgOpacity(detail.opacity);
      if ('blur' in detail) applyBgBlur(detail.blur);
      if (detail.videoFit === 'cover' || detail.videoFit === 'contain') setBgVideoFit(detail.videoFit);
      if (typeof detail.videoMuted === 'boolean') setBgVideoMuted(detail.videoMuted);
      if (typeof detail.videoLoop === 'boolean') setBgVideoLoop(detail.videoLoop);
      if (typeof detail.videoVolume === 'number' && Number.isFinite(detail.videoVolume)) setBgVideoVolume(Math.max(0, Math.min(1, detail.videoVolume)));
      if (typeof detail.videoRate === 'number' && Number.isFinite(detail.videoRate)) setBgVideoRate(Math.max(0.25, Math.min(3, detail.videoRate)));
      if (typeof detail.videoHwDecode === 'boolean') setBgVideoHwDecode(detail.videoHwDecode);
    };

    window.addEventListener(LOCAL_ISLAND_BG_SYNC_EVENT, localBgSyncHandler as EventListener);

    return () => {
      cancelled = true;
      unsub();
      window.removeEventListener(LOCAL_ISLAND_BG_SYNC_EVENT, localBgSyncHandler as EventListener);
    };
  }, [
    setBgVideoFit,
    setBgVideoMuted,
    setBgVideoLoop,
    setBgVideoVolume,
    setBgVideoRate,
    setBgVideoHwDecode,
    setStandaloneMacControls,
    applyBgMedia,
    applyBgOpacity,
    applyBgBlur,
  ]);
}
