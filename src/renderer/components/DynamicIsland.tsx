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
import { useIslandSettingsSync } from './hooks/useIslandSettingsSync';
import { useIslandStartupAnnouncements } from './hooks/useIslandStartupAnnouncements';
import {
  STATE_AREA,
  getStateClassName,
} from './config/dynamicIslandConfig';
import type { IslandBgMediaType, IslandBgMediaConfig } from './config/dynamicIslandConfig';
import { SvgIcon } from '../utils/SvgIcon';

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

  useIslandSettingsSync({
    language: i18n.resolvedLanguage,
    initRef,
    setGuide,
    setNotificationRef,
    applyBgMedia,
    expandLeaveIdleRef,
    maxExpandLeaveIdleRef,
    idleClickExpandRef,
    bgOpacityRef,
    bgBlurRef,
    setBgVideoFit,
    setBgVideoMuted,
    setBgVideoLoop,
    setBgVideoVolume,
    setBgVideoRate,
    setBgVideoHwDecode,
  });

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

  useIslandStartupAnnouncements({
    language: i18n.resolvedLanguage,
    state,
    setAnnouncement,
    startupAutoCheckHandledRef,
    pendingAnnouncementAfterGuideRef,
    pendingAnnouncementAppVersionRef,
    setNotificationRef,
    t,
  });

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
