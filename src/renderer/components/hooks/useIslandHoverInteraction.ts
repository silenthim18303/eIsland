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

import { useCallback, useEffect } from 'react';
import useIslandStore from '../../store/isLandStore';
import type { IslandState } from './useDynamicIslandShell';
import { STATE_CONFIGS, isMouseInWindow } from '../config/dynamicIslandConfig';

interface UseIslandHoverInteractionOptions {
  state: IslandState;
  setHover: () => void;
  setIdle: (force?: boolean) => void;
  setLyrics: () => void;
  isHoveringRef: React.MutableRefObject<boolean>;
  idleClickExpandRef: React.MutableRefObject<boolean>;
  expandLeaveIdleRef: React.MutableRefObject<boolean>;
  maxExpandLeaveIdleRef: React.MutableRefObject<boolean>;
  enterTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  leaveTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
}

export function useIslandHoverInteraction(options: UseIslandHoverInteractionOptions): void {
  const {
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
  } = options;

  const clearAllTimers = useCallback(() => {
    if (enterTimerRef.current !== null) {
      clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }
    if (leaveTimerRef.current !== null) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  }, [enterTimerRef, leaveTimerRef]);

  useEffect(() => {
    let rafId: number | null = null;
    let aborted = false;
    let lastCheckTime = 0;
    const CHECK_INTERVAL = 16;

    if (state === 'maxExpand' || state === 'expanded' || state === 'announcement') {
      isHoveringRef.current = true;
    }

    const checkMousePosition = async (): Promise<void> => {
      if (aborted) return;

      const now = Date.now();
      if (now - lastCheckTime < CHECK_INTERVAL) {
        rafId = requestAnimationFrame(checkMousePosition);
        return;
      }
      lastCheckTime = now;

      const inWindow = await isMouseInWindow();
      if (aborted) return;

      if (useIslandStore.getState().uiStateLocked) {
        clearAllTimers();
        if (!aborted) {
          rafId = requestAnimationFrame(checkMousePosition);
        }
        return;
      }

      const config = STATE_CONFIGS[state];
      const sliderCaptchaActive = Boolean(document.querySelector('.slider-captcha-overlay'));

      if (sliderCaptchaActive) {
        if (leaveTimerRef.current !== null) {
          clearTimeout(leaveTimerRef.current);
          leaveTimerRef.current = null;
        }
        isHoveringRef.current = true;
        window.api?.disableMousePassthrough();
        if (!aborted) {
          rafId = requestAnimationFrame(checkMousePosition);
        }
        return;
      }

      if (state === 'notification' || state === 'agent' || state === 'stt' || state === 'agentVoiceInput' || state === 'guide' || state === 'login' || state === 'register' || state === 'payment' || state === 'announcement') {
        if (inWindow) {
          window.api?.disableMousePassthrough();
        }
        if (!aborted) {
          rafId = requestAnimationFrame(checkMousePosition);
        }
        return;
      }

      if (inWindow) {
        if (leaveTimerRef.current !== null) {
          clearTimeout(leaveTimerRef.current);
          leaveTimerRef.current = null;
        }

        if (!isHoveringRef.current && enterTimerRef.current === null) {
          if (state === 'idle' && idleClickExpandRef.current) {
            if (config.mousePassthrough) {
              window.api?.disableMousePassthrough();
            }
          } else {
            enterTimerRef.current = setTimeout(() => {
              enterTimerRef.current = null;
              if (aborted || isHoveringRef.current) return;

              isHoveringRef.current = true;
              if (config.mousePassthrough) {
                window.api?.disableMousePassthrough();
              }
              setHover();
            });
          }
        }
      } else {
        if (enterTimerRef.current !== null) {
          clearTimeout(enterTimerRef.current);
          enterTimerRef.current = null;
        }

        if (state === 'idle' && idleClickExpandRef.current && !isHoveringRef.current) {
          window.api?.enableMousePassthrough();
        }

        if (isHoveringRef.current && leaveTimerRef.current === null) {
          const shouldLeave =
            state === 'expanded' ? expandLeaveIdleRef.current
              : state === 'maxExpand' ? maxExpandLeaveIdleRef.current
                : true;

          if (shouldLeave) {
            leaveTimerRef.current = setTimeout(() => {
              leaveTimerRef.current = null;
              if (aborted || !isHoveringRef.current) return;

              isHoveringRef.current = false;
              const store = useIslandStore.getState();
              if (store.isPlaying && store.timerData.state === 'idle' && ((store.syncedLyrics?.length ?? 0) > 0 || store.lyricsLoading)) {
                setLyrics();
              } else {
                setIdle(true);
              }
            });
          }
        }
      }

      if (!aborted) {
        rafId = requestAnimationFrame(checkMousePosition);
      }
    };

    rafId = requestAnimationFrame(checkMousePosition);

    return () => {
      aborted = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      clearAllTimers();
    };
  }, [
    state,
    setHover,
    setIdle,
    setLyrics,
    clearAllTimers,
    isHoveringRef,
    idleClickExpandRef,
    expandLeaveIdleRef,
    maxExpandLeaveIdleRef,
    enterTimerRef,
    leaveTimerRef,
  ]);
}
