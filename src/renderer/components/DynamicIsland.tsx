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

import React, { useRef, useLayoutEffect } from 'react';
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
import { useIslandTimerAndAlarm } from './hooks/useIslandTimerAndAlarm';
import { useIslandBackgroundVideoSync } from './hooks/useIslandBackgroundVideoSync';
import { useIslandStateBridges } from './hooks/useIslandStateBridges';
import { useIslandBackgroundMediaController } from './hooks/useIslandBackgroundMediaController';
import { useIslandShellPresentation } from './hooks/useIslandShellPresentation';

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
  const setNotificationRef = useRef(setNotification);
  const expandLeaveIdleRef = useRef(false);
  const maxExpandLeaveIdleRef = useRef(false);
  const idleClickExpandRef = useRef(false);
  const pendingAnnouncementAfterGuideRef = useRef(false);
  const pendingAnnouncementAppVersionRef = useRef('');
  const startupAutoCheckHandledRef = useRef(false);
  const {
    bgOpacityRef,
    bgBlurRef,
    bgVideoFit,
    bgVideoMuted,
    bgVideoLoop,
    bgVideoVolume,
    bgVideoRate,
    bgVideoHwDecode,
    bgVideoElementRef,
    bgMedia,
    setBgVideoFit,
    setBgVideoMuted,
    setBgVideoLoop,
    setBgVideoVolume,
    setBgVideoRate,
    setBgVideoHwDecode,
    applyBgMedia,
    handleVideoLoadedMetadata,
    handleVideoCanPlay,
  } = useIslandBackgroundMediaController();

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

  useIslandTimerAndAlarm({
    language: i18n.resolvedLanguage,
    timerData,
    setTimerData,
    setNotificationRef,
    t,
  });

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

  useIslandStateBridges({
    state,
    timerState: timerData?.state ?? 'idle',
    isPlaying,
    syncedLyrics,
    lyricsLoading,
    setLyrics,
    setAgentVoiceInput,
    setIdle,
  });

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

  useIslandBackgroundVideoSync({
    bgMedia,
    bgVideoElementRef,
    bgVideoVolume,
    bgVideoRate,
    bgVideoLoop,
    bgVideoHwDecode,
  });

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

  const {
    shellClassName,
    shellStyle,
  } = useIslandShellPresentation({
    state,
    morphing,
    fromState,
    showGlow,
    springAnimation,
    animationSpeed,
    dominantColor,
  });

  return (
    <div
      className={shellClassName}
      onClick={handleIslandClick}
      style={shellStyle}
    >
      <DynamicIslandBackground
        bgMedia={bgMedia}
        bgVideoElementRef={bgVideoElementRef}
        bgVideoHwDecode={bgVideoHwDecode}
        bgVideoMuted={bgVideoMuted}
        bgVideoVolume={bgVideoVolume}
        bgVideoFit={bgVideoFit}
        onVideoLoadedMetadata={handleVideoLoadedMetadata}
        onVideoCanPlay={handleVideoCanPlay}
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
