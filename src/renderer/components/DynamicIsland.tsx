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
 * @file DynamicIsland.tsx
 * @description 灵动岛主组件，使用状态模式管理 idle/hover/expanded 等状态
 * @author 鸡哥
 */

import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useIslandStore from '../store/isLandStore';
import { DynamicIslandBackground } from './components/DynamicIslandBackground';
import { DynamicIslandStateContent } from './components/DynamicIslandStateContent';
import { useDynamicIslandShell } from './hooks/useDynamicIslandShell';
import { useIslandDominantColor } from './hooks/useIslandDominantColor';
import { useIslandTimeStrings } from './hooks/useIslandTimeStrings';
import { useIslandHoverInteraction } from './hooks/useIslandHoverInteraction';
import { useIslandNowPlayingSync } from './hooks/useIslandNowPlayingSync';
import { useIslandNotificationSubscriptions } from './hooks/useIslandNotificationSubscriptions';
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
  UPDATE_SOURCE_STORE_KEY,
  UPDATE_AUTO_PROMPT_STORE_KEY,
  WEATHER_ALERT_ENABLED_STORE_KEY,
  STATE_AREA,
  getStateClassName,
  normalizeUpdateSource,
  isProOnlyUpdateSource,
  getRoleFromToken,
  normalizeBgMediaConfig,
  resolveBgMediaPreviewUrl,
} from './config/dynamicIslandConfig';
import type { UpdateSourceKey, IslandBgMediaType, IslandBgMediaConfig } from './config/dynamicIslandConfig';
import { SvgIcon } from '../utils/SvgIcon';
import { fetchStartupWeatherAlerts } from '../api/weather/weatherApi';
import { fetchUpdateSourceUrl } from '../api/user/userAccountApi';
import {
  fetchCurrentAnnouncement,
  readAnnouncementLastShownAppVersion,
  readAnnouncementShowMode,
  writeAnnouncementLastShownAppVersion,
} from '../api/announcement/announcementApi';
import { readLocalToken } from '../utils/userAccount';

export type { IslandState } from './hooks/useDynamicIslandShell';
export { AI_CHAT_CLIPBOARD_URL_EVENT, getStateClassName, STATE_CONFIGS } from './config/dynamicIslandConfig';

/**
 * 灵动岛主组件
 * @description 使用状态模式管理不同状态的 UI 渲染，通过 requestAnimationFrame 检测鼠标位置实现可靠的 hover 交互
 */
function DynamicIsland(): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const { state, weather, setHover, setIdle, setExpanded, setLyrics, setGuide, setAnnouncement, setAgentVoiceInput, timerData, setTimerData, notification, setNotification, handleNowPlayingUpdate, updateProgress, coverImage, isMusicPlaying, isPlaying, dominantColor, setDominantColor, setSyncedLyrics, setLyricsLoading, syncedLyrics, lyricsLoading, pomodoroRunning, pomodoroRemaining, springAnimation, animationSpeed } = useIslandStore();

  const initRef = useRef(false);
  const isHoveringRef = useRef(false);
  const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const setNotificationRef = useRef(setNotification);
  const expandLeaveIdleRef = useRef(false);
  const maxExpandLeaveIdleRef = useRef(false);
  const idleClickExpandRef = useRef(false);
  const pendingAnnouncementAfterGuideRef = useRef(false);
  const pendingAnnouncementAppVersionRef = useRef('');
  const startupAutoCheckHandledRef = useRef(false);
  const bgOpacityRef = useRef<number>(30);
  const bgBlurRef = useRef<number>(0);
  const [bgVideoFit, setBgVideoFit] = useState<'cover' | 'contain'>('cover');
  const [bgVideoMuted, setBgVideoMuted] = useState<boolean>(true);
  const [bgVideoLoop, setBgVideoLoop] = useState<boolean>(true);
  const [bgVideoVolume, setBgVideoVolume] = useState<number>(0.6);
  const [bgVideoRate, setBgVideoRate] = useState<number>(1);
  const [bgVideoHwDecode, setBgVideoHwDecode] = useState<boolean>(true);
  const bgVideoElementRef = useRef<HTMLVideoElement | null>(null);
  const [bgMedia, setBgMedia] = useState<{ type: IslandBgMediaType; previewUrl: string } | null>(null);

  const {
    morphing,
    fromState,
    showGlow,
    handleIslandClick,
  } = useDynamicIslandShell({
    state,
    animationSpeed,
    isMusicPlaying,
    coverImage,
    isPlaying,
    setHover,
    setExpanded,
    idleClickExpandRef,
    isHoveringRef,
  });

  const applyBgMedia = (media: IslandBgMediaConfig | null, previewUrl: string | null): void => {
    const el = document.getElementById('island-bg-layer');
    if (!el) return;
    const applyLayerVisibility = (): void => {
      el.style.opacity = String(Math.max(0, Math.min(100, bgOpacityRef.current)) / 100);
      const safeBlur = Math.max(0, Math.min(20, Math.round(bgBlurRef.current)));
      el.style.filter = safeBlur > 0 ? `blur(${safeBlur}px)` : 'none';
    };
    if (media?.type === 'image' && previewUrl) {
      el.style.backgroundImage = `url(${previewUrl})`;
      applyLayerVisibility();
      setBgMedia(null);
      return;
    }
    el.style.backgroundImage = '';
    if (media?.type === 'video' && previewUrl) {
      applyLayerVisibility();
      setBgMedia({ type: 'video', previewUrl });
      return;
    }
    el.style.opacity = '0';
    el.style.filter = 'none';
    setBgMedia(null);
  };

  // 同步 ref 以在回调中使用最新函数
  useLayoutEffect(() => {
    setNotificationRef.current = setNotification;
  });

  useIslandNowPlayingSync({
    handleNowPlayingUpdate,
    updateProgress,
    setSyncedLyrics,
    setLyricsLoading,
  });

  useIslandDominantColor({
    coverImage,
    setDominantColor,
  });

  const {
    timeStr,
    dayStr,
    fullTimeStr,
    lunarStr,
  } = useIslandTimeStrings({
    t,
    language: i18n.resolvedLanguage,
  });

  // 全局计时器逻辑
  useEffect(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    if (timerData?.state === 'running' && timerData.remainingSeconds > 0) {
      timerIntervalRef.current = setInterval(() => {
        const next = (timerData.remainingSeconds ?? 0) - 1;
        if (next <= 0) {
          setTimerData({
            state: 'idle',
            remainingSeconds: 0,
            inputHours: '00',
            inputMinutes: '00',
            inputSeconds: '00',
          });
          setNotificationRef.current({
            title: t('notification.timer.title', { defaultValue: '计时器' }),
            body: t('notification.timer.finished', { defaultValue: '倒计时已结束' }),
            icon: SvgIcon.TIMER
          });
        } else {
          setTimerData({ remainingSeconds: next });
        }
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [timerData?.state, timerData?.remainingSeconds, setTimerData, i18n.resolvedLanguage]);

  const alarmFiredSetRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const ALARM_STORE_KEY = 'alarms';
    const alarmInterval = setInterval(async () => {
      try {
        const data = await window.api?.storeRead(ALARM_STORE_KEY);
        if (!Array.isArray(data) || data.length === 0) return;
        const now = new Date();
        const h = now.getHours();
        const m = now.getMinutes();
        const s = now.getSeconds();
        const weekday = now.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
        const timeKey = `${h}:${m}:${s}`;
        const disableOnceAlarmIds: number[] = [];

        data.forEach((alarm) => {
          if (!alarm || !alarm.enabled) return;
          if (alarm.hour !== h || alarm.minute !== m || alarm.second !== s) return;
          const hasRepeat = Array.isArray(alarm.repeat) && alarm.repeat.length > 0;
          if (hasRepeat && !alarm.repeat.includes(weekday)) return;

          const firedKey = `${alarm.id}-${timeKey}`;
          if (alarmFiredSetRef.current.has(firedKey)) return;
          alarmFiredSetRef.current.add(firedKey);

          const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
          const label = alarm.label ? `${alarm.label}` : '';
          const body = label
            ? t('notification.alarm.bodyWithLabel', { defaultValue: '{{time}} — {{label}}', time: timeStr, label })
            : t('notification.alarm.body', { defaultValue: '{{time}}', time: timeStr });
          setNotificationRef.current({
            title: t('notification.alarm.title', { defaultValue: '闹钟提醒' }),
            body,
          });

          if (!hasRepeat) {
            disableOnceAlarmIds.push(alarm.id);
          }
        });

        if (disableOnceAlarmIds.length > 0) {
          const updated = data.map((a: { id: number }) =>
            disableOnceAlarmIds.includes(a.id) ? { ...a, enabled: false } : a,
          );
          await window.api?.storeWrite(ALARM_STORE_KEY, updated).catch(() => {});
        }

        if (alarmFiredSetRef.current.size > 200) {
          alarmFiredSetRef.current.clear();
        }
      } catch { /* noop */ }
    }, 1000);
    return () => clearInterval(alarmInterval);
  }, [i18n.resolvedLanguage]);

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      window.api?.enableMousePassthrough();
      window.api?.expandMouseleaveIdleGet?.().then((v) => { expandLeaveIdleRef.current = v; }).catch(() => {});
      window.api?.maxexpandMouseleaveIdleGet?.().then((v) => { maxExpandLeaveIdleRef.current = v; }).catch(() => {});
      window.api?.idleClickExpandGet?.().then((v) => { idleClickExpandRef.current = v; }).catch(() => {});
      window.api?.springAnimationGet?.().then((v) => { useIslandStore.getState().setSpringAnimation(v); }).catch(() => {});
      window.api?.animationSpeedGet?.().then((v) => { const s = v === 'slow' || v === 'medium' || v === 'fast' ? v : 'medium'; useIslandStore.getState().setAnimationSpeed(s); }).catch(() => {});

      Promise.all([
        window.api?.storeRead?.(ISLAND_BG_MEDIA_STORE_KEY),
        window.api?.storeRead?.(ISLAND_BG_IMAGE_STORE_KEY) as Promise<string | null>,
        window.api?.storeRead?.(ISLAND_BG_VIDEO_FIT_STORE_KEY) as Promise<'cover' | 'contain' | null>,
        window.api?.storeRead?.(ISLAND_BG_VIDEO_MUTED_STORE_KEY) as Promise<boolean | null>,
        window.api?.storeRead?.(ISLAND_BG_VIDEO_LOOP_STORE_KEY) as Promise<boolean | null>,
        window.api?.storeRead?.('island-bg-opacity') as Promise<number | null>,
        window.api?.storeRead?.('island-bg-blur') as Promise<number | null>,
        window.api?.storeRead?.(ISLAND_BG_VIDEO_VOLUME_STORE_KEY) as Promise<number | null>,
        window.api?.storeRead?.(ISLAND_BG_VIDEO_RATE_STORE_KEY) as Promise<number | null>,
        window.api?.storeRead?.(ISLAND_BG_VIDEO_HW_DECODE_STORE_KEY) as Promise<boolean | null>,
      ]).then(async ([mediaRaw, legacyImage, videoFit, videoMuted, videoLoop, bgOpacity, bgBlur, videoVolume, videoRate, videoHwDecode]) => {
        const el = document.getElementById('island-bg-layer');
        if (!el) return;
        if (videoFit === 'cover' || videoFit === 'contain') {
          setBgVideoFit(videoFit);
        }
        if (typeof videoMuted === 'boolean') {
          setBgVideoMuted(videoMuted);
        }
        if (typeof videoLoop === 'boolean') {
          setBgVideoLoop(videoLoop);
        }
        if (typeof videoVolume === 'number' && Number.isFinite(videoVolume)) {
          setBgVideoVolume(Math.max(0, Math.min(1, videoVolume)));
        }
        if (typeof videoRate === 'number' && Number.isFinite(videoRate)) {
          setBgVideoRate(Math.max(0.25, Math.min(3, videoRate)));
        }
        if (typeof videoHwDecode === 'boolean') {
          setBgVideoHwDecode(videoHwDecode);
        }
        if (typeof bgOpacity === 'number' && Number.isFinite(bgOpacity)) {
          bgOpacityRef.current = Math.max(0, Math.min(100, bgOpacity));
        }
        if (typeof bgBlur === 'number' && Number.isFinite(bgBlur)) {
          bgBlurRef.current = Math.max(0, Math.min(20, Math.round(bgBlur)));
        }
        const media = normalizeBgMediaConfig(mediaRaw)
          ?? (typeof legacyImage === 'string' ? normalizeBgMediaConfig(legacyImage) : null);
        if (media) {
          const previewUrl = await resolveBgMediaPreviewUrl(media);
          if (previewUrl) {
            applyBgMedia(media, previewUrl);
          }
        } else {
          el.style.opacity = String(bgOpacityRef.current / 100);
          const safeBlur = bgBlurRef.current;
          el.style.filter = safeBlur > 0 ? `blur(${safeBlur}px)` : 'none';
        }
      }).catch(() => {});

      // 首次启动或更新后显示引导页
      Promise.all([
        window.api?.storeRead?.('guide-shown-version') as Promise<string | null>,
        window.api?.updaterVersion?.(),
      ]).then(([shownVersion, currentVersion]) => {
        if (currentVersion && shownVersion !== currentVersion) {
          setTimeout(() => setGuide(), 800);
        }
      }).catch(() => {});

      // 跨窗口设置同步
      window.api?.onSettingsChanged?.((channel: string, value: unknown) => {
        if (channel === 'shortcut:open-clipboard-history') {
          const store = useIslandStore.getState();
          store.setMaxExpandTab('clipboardHistory');
          store.setMaxExpand();
        }
        if (channel === 'shortcut:toggle-ui-lock') {
          const store = useIslandStore.getState();
          store.toggleUiStateLock();
        }
        if (channel === 'notification:show') {
          if (value && typeof value === 'object' && 'title' in (value as object) && 'body' in (value as object)) {
            setNotificationRef.current(value as {
              title: string;
              body: string;
              icon?: string;
              type?: 'default' | 'source-switch' | 'update-available' | 'update-downloading' | 'update-ready' | 'weather-alert-startup' | 'clipboard-url' | 'restart-required';
              sourceAppId?: string;
              updateVersion?: string;
              updateSourceLabel?: string;
              weatherAlertTime?: string;
              startupUpdateSource?: UpdateSourceKey;
              startupUpdateResolvedUrl?: string;
              urls?: string[];
            });
          }
        }
        if (channel === 'guide:show') {
          setGuide();
        }
        if (channel === 'island:opacity') {
          const v = typeof value === 'number' ? Math.max(10, Math.min(100, Math.round(value))) : 100;
          document.documentElement.style.setProperty('--island-opacity', String(v));
        }
        if (channel === 'island:expand-mouseleave-idle') {
          expandLeaveIdleRef.current = Boolean(value);
        }
        if (channel === 'island:maxexpand-mouseleave-idle') {
          maxExpandLeaveIdleRef.current = Boolean(value);
        }
        if (channel === 'island:idle-click-expand') {
          idleClickExpandRef.current = Boolean(value);
        }
        if (channel === 'island:spring-animation') {
          useIslandStore.getState().setSpringAnimation(Boolean(value));
        }
        if (channel === 'island:animation-speed') {
          const v = value === 'slow' || value === 'medium' || value === 'fast' ? value : 'medium';
          useIslandStore.getState().setAnimationSpeed(v);
        }
        if (channel === 'store:island-bg-media') {
          const media = normalizeBgMediaConfig(value);
          if (!media) {
            applyBgMedia(null, null);
            return;
          }
          resolveBgMediaPreviewUrl(media).then((previewUrl) => {
            if (!previewUrl) {
              applyBgMedia(null, null);
              return;
            }
            applyBgMedia(media, previewUrl);
          }).catch(() => {});
        }
        if (channel === 'store:island-bg-opacity') {
          const el = document.getElementById('island-bg-layer');
          if (!el) return;
          const v = typeof value === 'number' && Number.isFinite(value) ? value : 100;
          bgOpacityRef.current = Math.max(0, Math.min(100, v));
          el.style.opacity = String(bgOpacityRef.current / 100);
        }
        if (channel === 'store:island-bg-blur') {
          const el = document.getElementById('island-bg-layer');
          if (!el) return;
          const v = typeof value === 'number' && Number.isFinite(value) ? value : 0;
          bgBlurRef.current = Math.max(0, Math.min(20, Math.round(v)));
          el.style.filter = bgBlurRef.current > 0 ? `blur(${bgBlurRef.current}px)` : 'none';
        }
        if (channel === `store:${ISLAND_BG_VIDEO_FIT_STORE_KEY}`) {
          if (value === 'cover' || value === 'contain') {
            setBgVideoFit(value);
          }
        }
        if (channel === `store:${ISLAND_BG_VIDEO_MUTED_STORE_KEY}`) {
          if (typeof value === 'boolean') {
            setBgVideoMuted(value);
          }
        }
        if (channel === `store:${ISLAND_BG_VIDEO_LOOP_STORE_KEY}`) {
          if (typeof value === 'boolean') {
            setBgVideoLoop(value);
          }
        }
        if (channel === `store:${ISLAND_BG_VIDEO_VOLUME_STORE_KEY}`) {
          if (typeof value === 'number' && Number.isFinite(value)) {
            setBgVideoVolume(Math.max(0, Math.min(1, value)));
          }
        }
        if (channel === `store:${ISLAND_BG_VIDEO_RATE_STORE_KEY}`) {
          if (typeof value === 'number' && Number.isFinite(value)) {
            setBgVideoRate(Math.max(0.25, Math.min(3, value)));
          }
        }
        if (channel === `store:${ISLAND_BG_VIDEO_HW_DECODE_STORE_KEY}`) {
          if (typeof value === 'boolean') {
            setBgVideoHwDecode(value);
          }
        }
        if (channel === 'island:position') {
          const offset = value as { x: number; y: number };
          if (offset && typeof offset.x === 'number' && typeof offset.y === 'number') {
            window.api?.setIslandPositionOffset?.(offset).catch(() => {});
          }
        }
      });

      // 同窗口内（集成模式）背景媒体同步：设置页直接 DOM 操作 + 本地事件
      const localBgSyncHandler = (event: Event): void => {
        const customEvent = event as CustomEvent<{ media?: IslandBgMediaConfig | null; previewUrl?: string | null; opacity?: number; blur?: number; videoFit?: 'cover' | 'contain'; videoMuted?: boolean; videoLoop?: boolean; videoVolume?: number; videoRate?: number; videoHwDecode?: boolean }>;
        const detail = customEvent.detail;
        if (!detail || typeof detail !== 'object') return;
        if ('media' in detail || 'previewUrl' in detail) {
          applyBgMedia(detail.media ?? null, detail.previewUrl ?? null);
        }
        if (detail.videoFit === 'cover' || detail.videoFit === 'contain') {
          setBgVideoFit(detail.videoFit);
        }
        if (typeof detail.videoMuted === 'boolean') {
          setBgVideoMuted(detail.videoMuted);
        }
        if (typeof detail.videoLoop === 'boolean') {
          setBgVideoLoop(detail.videoLoop);
        }
        if (typeof detail.videoVolume === 'number' && Number.isFinite(detail.videoVolume)) {
          setBgVideoVolume(Math.max(0, Math.min(1, detail.videoVolume)));
        }
        if (typeof detail.videoRate === 'number' && Number.isFinite(detail.videoRate)) {
          setBgVideoRate(Math.max(0.25, Math.min(3, detail.videoRate)));
        }
        if (typeof detail.videoHwDecode === 'boolean') {
          setBgVideoHwDecode(detail.videoHwDecode);
        }
      };
      window.addEventListener(LOCAL_ISLAND_BG_SYNC_EVENT, localBgSyncHandler as EventListener);
    }
  }, [i18n.resolvedLanguage]);

  // Agent 语音输入快捷键触发时切换灵动岛状态
  useEffect(() => {
    const unsub = window.api?.onAgentVoiceInputState?.((active: boolean) => {
      if (active) {
        setAgentVoiceInput();
      } else {
        setIdle(true);
      }
    });
    return () => { unsub?.(); };
  }, [setAgentVoiceInput, setIdle]);

  // idle 状态下：正在播放且歌词已识别/加载中时，自动切到歌词态
  useEffect(() => {
    if (state !== 'idle') return;
    if (timerData?.state !== 'idle') return;
    if (isPlaying && ((syncedLyrics?.length ?? 0) > 0 || lyricsLoading)) {
      setLyrics();
    }
  }, [state, timerData?.state, isPlaying, syncedLyrics, lyricsLoading, setLyrics]);

  useEffect(() => {
    const unsub = window.api?.onUpdaterStartupAutoCheckRequest?.(() => {
      if (startupAutoCheckHandledRef.current) return;
      startupAutoCheckHandledRef.current = true;
      void (async () => {
        const autoPromptValue = await window.api?.storeRead?.(UPDATE_AUTO_PROMPT_STORE_KEY).catch(() => null);
        const autoPromptEnabled = typeof autoPromptValue === 'boolean' ? autoPromptValue : true;
        if (!autoPromptEnabled) return;

        const token = readLocalToken();
        const isProUser = getRoleFromToken(token) === 'pro';
        const sourceRaw = await window.api?.storeRead?.(UPDATE_SOURCE_STORE_KEY).catch(() => null);
        let startupSource = normalizeUpdateSource(sourceRaw);
        let startupResolvedUrl: string | undefined;

        if (isProOnlyUpdateSource(startupSource)) {
          if (!token || !isProUser) {
            startupSource = 'cloudflare-r2';
          } else {
            const resolved = await fetchUpdateSourceUrl(token, startupSource);
            if (resolved.ok && resolved.data?.url) {
              startupResolvedUrl = resolved.data.url;
            } else {
              startupSource = 'cloudflare-r2';
            }
          }
        }

        const continueStartupUpdateCheck = async (): Promise<void> => {
          await window.api?.updaterCheck(startupSource, startupResolvedUrl).catch(() => {});
        };

        const weatherAlertEnabledValue = await window.api?.storeRead?.(WEATHER_ALERT_ENABLED_STORE_KEY).catch(() => null);
        const weatherAlertEnabled = typeof weatherAlertEnabledValue === 'boolean' ? weatherAlertEnabledValue : true;
        if (!weatherAlertEnabled || !isProUser || !token) {
          await continueStartupUpdateCheck();
          return;
        }

        try {
          const weatherAlertPayload = await fetchStartupWeatherAlerts(token);
          if (weatherAlertPayload.alerts.length > 0) {
            const firstAlert = weatherAlertPayload.alerts[0];
            const firstAlertTitle = firstAlert.title
              || firstAlert.typeName
              || t('notification.weatherAlert.defaultTitle', { defaultValue: '天气预警' });
            const city = weatherAlertPayload.location.city
              || t('notification.weatherAlert.unknownCity', { defaultValue: '当前位置' });
            const body = weatherAlertPayload.alerts.length > 1
              ? t('notification.weatherAlert.bodyWithMore', {
                  defaultValue: '{{city}}：{{title}}，另有 {{count}} 条预警。',
                  city,
                  title: firstAlertTitle,
                  count: weatherAlertPayload.alerts.length - 1,
                })
              : t('notification.weatherAlert.bodySingle', {
                  defaultValue: '{{city}}：{{title}}',
                  city,
                  title: firstAlertTitle,
                });
            setNotificationRef.current({
              title: t('notification.weatherAlert.title', { defaultValue: '天气预警提醒' }),
              body,
              icon: SvgIcon.WEATHER,
              type: 'weather-alert-startup',
              weatherAlertTime: firstAlert.pubTime,
              startupUpdateSource: startupSource,
              startupUpdateResolvedUrl: startupResolvedUrl,
            });
            return;
          }
        } catch (error) {
          console.warn('[Updater] startup weather alert pre-check failed:', error);
        }

        await continueStartupUpdateCheck();
      })();
    });
    return () => {
      unsub?.();
    };
  }, [i18n.resolvedLanguage, t]);

  useEffect(() => {
    const unsub = window.api?.onUpdaterNotAvailable?.(() => {
      void (async () => {
        const current = useIslandStore.getState().state;
        if (current === 'login' || current === 'register' || current === 'payment') return;

        const mode = await readAnnouncementShowMode();
        const currentVersion = await window.api?.updaterVersion?.() ?? '';
        if (mode === 'version-update-only') {
          const lastShownVersion = await readAnnouncementLastShownAppVersion();
          if (currentVersion && lastShownVersion === currentVersion) return;
        }

        const announcement = await fetchCurrentAnnouncement();
        if (!announcement) return;

        const applyShownVersion = async (): Promise<void> => {
          if (mode !== 'version-update-only' || !currentVersion) return;
          await writeAnnouncementLastShownAppVersion(currentVersion);
        };

        if (current === 'guide') {
          pendingAnnouncementAfterGuideRef.current = true;
          pendingAnnouncementAppVersionRef.current = mode === 'version-update-only' ? currentVersion : '';
          return;
        }

        setAnnouncement();
        await applyShownVersion();
      })();
    });
    return () => {
      unsub?.();
    };
  }, [setAnnouncement]);

  useEffect(() => {
    if (!pendingAnnouncementAfterGuideRef.current) return;
    if (state === 'guide' || state === 'login' || state === 'register' || state === 'payment') return;

    pendingAnnouncementAfterGuideRef.current = false;
    setAnnouncement();

    const pendingVersion = pendingAnnouncementAppVersionRef.current;
    pendingAnnouncementAppVersionRef.current = '';
    if (pendingVersion) {
      void writeAnnouncementLastShownAppVersion(pendingVersion);
    }
  }, [state, setAnnouncement]);

  // 背景视频的音量 / 速度随设置变更即时生效，避免重建 <video>
  useEffect(() => {
    const el = bgVideoElementRef.current;
    if (!el) return;
    el.volume = Math.max(0, Math.min(1, bgVideoVolume));
    el.playbackRate = Math.max(0.25, Math.min(3, bgVideoRate));
  }, [bgVideoVolume, bgVideoRate]);

  // 用 ref 保存最新的循环开关，让下面的原生事件监听随时读到最新值
  const bgVideoLoopRef = useRef<boolean>(bgVideoLoop);
  useEffect(() => { bgVideoLoopRef.current = bgVideoLoop; }, [bgVideoLoop]);

  // 自定义背景视频循环：绕开 React 合成事件与 Chromium 原生 loop 的偶发失效，
  // 直接用 DOM 级 addEventListener 监听 ended + timeupdate 双重触发。
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
      if (duration - el.currentTime <= 0.12) {
        restart();
      }
    };
    el.addEventListener('ended', onEnded);
    el.addEventListener('timeupdate', onTimeUpdate);
    return () => {
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [bgMedia?.previewUrl, bgMedia?.type, bgVideoHwDecode]);

  // 用户在视频已经播完后再开启循环，需要立刻重启
  useEffect(() => {
    if (!bgVideoLoop) return;
    const el = bgVideoElementRef.current;
    if (!el) return;
    if (el.ended) {
      try { el.currentTime = 0; } catch { /* ignore */ }
      el.play().catch(() => {});
    }
  }, [bgVideoLoop]);

  useIslandNotificationSubscriptions({
    language: i18n.resolvedLanguage,
    t,
    setNotificationRef,
  });

  useIslandHoverInteraction({
    state,
    setHover,
    setIdle,
    setLyrics,
    isHoveringRef,
    idleClickExpandRef,
    expandLeaveIdleRef,
    maxExpandLeaveIdleRef,
    enterTimerRef,
    leaveTimerRef,
  });

  const [r, g, b] = dominantColor;

  return (
    <div
      className={`island-shell ${getStateClassName(state)}${morphing ? ' morphing' : ''}${fromState ? ` from-${fromState}` : ''}${morphing && fromState && (STATE_AREA[fromState] ?? 0) > (STATE_AREA[state] ?? 0) ? ' instant-resize' : ''}${showGlow ? ' music-glow' : ''}${showGlow === 'paused' ? ' music-paused' : ''}${springAnimation ? ' spring-animation' : ''} speed-${animationSpeed}`}
      onClick={handleIslandClick}
      style={showGlow ? {
        '--glow-r': r,
        '--glow-g': g,
        '--glow-b': b,
      } as React.CSSProperties : undefined}
    >
      <DynamicIslandBackground
        bgMedia={bgMedia}
        bgVideoElementRef={bgVideoElementRef}
        bgVideoHwDecode={bgVideoHwDecode}
        bgVideoMuted={bgVideoMuted}
        bgVideoVolume={bgVideoVolume}
        bgVideoFit={bgVideoFit}
        onVideoLoadedMetadata={(event) => {
          event.currentTarget.loop = false;
          event.currentTarget.volume = Math.max(0, Math.min(1, bgVideoVolume));
          event.currentTarget.playbackRate = Math.max(0.25, Math.min(3, bgVideoRate));
        }}
        onVideoCanPlay={(event) => {
          event.currentTarget.loop = false;
          event.currentTarget.volume = Math.max(0, Math.min(1, bgVideoVolume));
          event.currentTarget.playbackRate = Math.max(0.25, Math.min(3, bgVideoRate));
          event.currentTarget.play().catch(() => {});
        }}
      />
      <DynamicIslandStateContent
        state={state}
        timeStr={timeStr}
        dayStr={dayStr}
        weather={weather}
        timerState={timerData?.state ?? 'idle'}
        remainingSeconds={timerData?.remainingSeconds ?? 0}
        pomodoroRunning={pomodoroRunning}
        pomodoroRemaining={pomodoroRemaining}
        fullTimeStr={fullTimeStr}
        lunarStr={lunarStr}
        notification={notification}
      />
    </div>
  );
}

export default DynamicIsland;
