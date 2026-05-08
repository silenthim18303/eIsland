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

import { useEffect, useRef, useState } from 'react';
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
import type { IslandBgMediaConfig, IslandBgMediaType } from '../config/dynamicIslandConfig';
import {
  ACTIVE_TAB_STORE_KEY,
  LEGACY_ACTIVE_TAB_STORE_KEY,
  AUTH_INTENT_STORE_KEY,
  ISLAND_BG_OPACITY_STORE_KEY,
  ISLAND_BG_BLUR_STORE_KEY,
  STANDALONE_WINDOW_MAC_CONTROLS_STORE_KEY,
  VALID_TABS,
  applyAuthIntent,
  type WindowTab,
} from '../config/standaloneWindowConfig';

interface StandaloneWindowShellState {
  activeTab: WindowTab;
  switchTab: (tab: WindowTab) => void;
  bgMedia: { type: IslandBgMediaType; previewUrl: string } | null;
  bgVideoFit: 'cover' | 'contain';
  bgVideoMuted: boolean;
  bgVideoLoop: boolean;
  bgVideoVolume: number;
  bgVideoRate: number;
  bgVideoHwDecode: boolean;
  bgVideoElementRef: React.MutableRefObject<HTMLVideoElement | null>;
  bgImageOpacity: number;
  bgImageBlur: number;
  standaloneMacControls: boolean;
  handleVideoLoadedMetadata: React.ReactEventHandler<HTMLVideoElement>;
  handleVideoCanPlay: React.ReactEventHandler<HTMLVideoElement>;
}

export function useStandaloneWindowShell(): StandaloneWindowShellState {
  const [activeTab, setActiveTab] = useState<WindowTab>('todo');
  const [bgMedia, setBgMedia] = useState<{ type: IslandBgMediaType; previewUrl: string } | null>(null);
  const [bgVideoFit, setBgVideoFit] = useState<'cover' | 'contain'>('cover');
  const [bgVideoMuted, setBgVideoMuted] = useState<boolean>(true);
  const [bgVideoLoop, setBgVideoLoop] = useState<boolean>(true);
  const [bgVideoVolume, setBgVideoVolume] = useState<number>(0.6);
  const [bgVideoRate, setBgVideoRate] = useState<number>(1);
  const [bgVideoHwDecode, setBgVideoHwDecode] = useState<boolean>(true);
  const bgVideoElementRef = useRef<HTMLVideoElement | null>(null);
  const [bgImageOpacity, setBgImageOpacity] = useState<number>(30);
  const [bgImageBlur, setBgImageBlur] = useState<number>(0);
  const [standaloneMacControls, setStandaloneMacControls] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    const applyBgMedia = (media: IslandBgMediaConfig | null, previewUrl: string | null): void => {
      if (!media || !previewUrl) {
        setBgMedia(null);
        return;
      }
      setBgMedia({ type: media.type, previewUrl });
    };

    const applyBgOpacity = (opacityValue: unknown): void => {
      const safe = typeof opacityValue === 'number' && Number.isFinite(opacityValue)
        ? Math.max(0, Math.min(100, Math.round(opacityValue)))
        : 30;
      setBgImageOpacity(safe);
    };

    const applyBgBlur = (blurValue: unknown): void => {
      const safe = typeof blurValue === 'number' && Number.isFinite(blurValue)
        ? Math.max(0, Math.min(20, Math.round(blurValue)))
        : 0;
      setBgImageBlur(safe);
    };

    window.api.storeRead(ACTIVE_TAB_STORE_KEY).then((tab) => {
      if (cancelled) return;
      if (VALID_TABS.has(tab as WindowTab)) {
        setActiveTab(tab as WindowTab);
        return;
      }
      window.api.storeRead(LEGACY_ACTIVE_TAB_STORE_KEY).then((legacyTab) => {
        if (cancelled) return;
        if (VALID_TABS.has(legacyTab as WindowTab)) {
          setActiveTab(legacyTab as WindowTab);
        }
      }).catch(() => {});
    }).catch(() => {});

    window.api.storeRead(AUTH_INTENT_STORE_KEY).then((intent) => {
      if (cancelled) return;
      if (intent === 'login' || intent === 'register') {
        setActiveTab('settings');
        applyAuthIntent(intent);
        window.api.storeWrite(AUTH_INTENT_STORE_KEY, null).catch(() => {});
      }
    }).catch(() => {});

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
      if (channel === `store:${ACTIVE_TAB_STORE_KEY}` && VALID_TABS.has(value as WindowTab)) {
        setActiveTab(value as WindowTab);
      }
      if (channel === `store:${AUTH_INTENT_STORE_KEY}` && (value === 'login' || value === 'register')) {
        setActiveTab('settings');
        applyAuthIntent(value);
        window.api.storeWrite(AUTH_INTENT_STORE_KEY, null).catch(() => {});
      }
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
  }, []);

  const bgVideoLoopRef = useRef<boolean>(bgVideoLoop);
  useEffect(() => { bgVideoLoopRef.current = bgVideoLoop; }, [bgVideoLoop]);

  useEffect(() => {
    if (bgMedia?.type !== 'video') return;
    const el = bgVideoElementRef.current;
    if (!el) return;
    el.loop = false;
    const restart = (): void => {
      if (!bgVideoLoopRef.current) return;
      try { el.currentTime = 0; } catch { /* ignore */ }
      el.play().catch(() => {});
    };
    const onEnded = (): void => { restart(); };
    const onTimeUpdate = (): void => {
      if (!bgVideoLoopRef.current) return;
      const duration = el.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;
      if (duration - el.currentTime <= 0.12) restart();
    };
    el.addEventListener('ended', onEnded);
    el.addEventListener('timeupdate', onTimeUpdate);
    return () => {
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [bgMedia?.previewUrl, bgMedia?.type, bgVideoHwDecode]);

  useEffect(() => {
    if (!bgVideoLoop) return;
    const el = bgVideoElementRef.current;
    if (!el) return;
    if (el.ended) {
      try { el.currentTime = 0; } catch { /* ignore */ }
      el.play().catch(() => {});
    }
  }, [bgVideoLoop]);

  useEffect(() => {
    const el = bgVideoElementRef.current;
    if (!el) return;
    el.volume = Math.max(0, Math.min(1, bgVideoVolume));
    el.playbackRate = Math.max(0.25, Math.min(3, bgVideoRate));
  }, [bgVideoVolume, bgVideoRate]);

  const switchTab = (tab: WindowTab): void => {
    setActiveTab(tab);
    window.api.storeWrite(ACTIVE_TAB_STORE_KEY, tab).catch(() => {});
  };

  const handleVideoLoadedMetadata: React.ReactEventHandler<HTMLVideoElement> = (event) => {
    event.currentTarget.loop = false;
    event.currentTarget.volume = Math.max(0, Math.min(1, bgVideoVolume));
    event.currentTarget.playbackRate = Math.max(0.25, Math.min(3, bgVideoRate));
  };

  const handleVideoCanPlay: React.ReactEventHandler<HTMLVideoElement> = (event) => {
    event.currentTarget.loop = false;
    event.currentTarget.volume = Math.max(0, Math.min(1, bgVideoVolume));
    event.currentTarget.playbackRate = Math.max(0.25, Math.min(3, bgVideoRate));
    event.currentTarget.play().catch(() => {});
  };

  return {
    activeTab,
    switchTab,
    bgMedia,
    bgVideoFit,
    bgVideoMuted,
    bgVideoLoop,
    bgVideoVolume,
    bgVideoRate,
    bgVideoHwDecode,
    bgVideoElementRef,
    bgImageOpacity,
    bgImageBlur,
    standaloneMacControls,
    handleVideoLoadedMetadata,
    handleVideoCanPlay,
  };
}
