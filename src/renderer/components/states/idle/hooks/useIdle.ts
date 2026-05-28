import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useIslandStore from '../../../../store/slices';
import { MUSIC_OUTER_GLOW_EFFECT_STORE_KEY, type IdleContentProps } from '../config/idleConfig';
import { checkP0Count } from '../utils/checkP0Count';
import { padZero } from '../utils/padZero';

export function useIdle(props: IdleContentProps) {
  const { t } = useTranslation();
  const { isMusicPlaying, coverImage, isPlaying, handleNowPlayingUpdate, dominantColor } = useIslandStore();
  const { remainingSeconds, pomodoroRemaining, timerState, pomodoroRunning } = props;

  const isTimerActive = timerState === 'running' || timerState === 'paused';
  const isPomodoroActive = pomodoroRunning;

  const checkP0 = useCallback((): number => checkP0Count(), []);
  const [p0Count, setP0Count] = useState(checkP0);
  const [musicOuterGlowEffectEnabled, setMusicOuterGlowEffectEnabled] = useState<boolean>(true);

  useEffect(() => {
    const id = setInterval(() => setP0Count(checkP0()), 2000);
    return () => clearInterval(id);
  }, [checkP0]);

  useEffect(() => {
    let cancelled = false;
    window.api.storeRead(MUSIC_OUTER_GLOW_EFFECT_STORE_KEY).then((value) => {
      if (cancelled) return;
      if (typeof value === 'boolean') {
        setMusicOuterGlowEffectEnabled(value);
      }
    }).catch(() => {});

    const handler = (e: Event): void => {
      if (cancelled) return;
      const val = (e as CustomEvent).detail;
      if (typeof val === 'boolean') setMusicOuterGlowEffectEnabled(val);
    };
    window.addEventListener('music-outer-glow-effect-changed', handler);

    return () => {
      cancelled = true;
      window.removeEventListener('music-outer-glow-effect-changed', handler);
    };
  }, []);

  useEffect(() => {
    if (!isMusicPlaying || isPlaying) {
      return;
    }
    const timer = setTimeout(() => {
      handleNowPlayingUpdate(null);
    }, 10 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [isPlaying, isMusicPlaying, handleNowPlayingUpdate]);

  const h = Math.floor(remainingSeconds / 3600);
  const m = Math.floor((remainingSeconds % 3600) / 60);
  const s = remainingSeconds % 60;

  const pomodoroM = Math.floor(pomodoroRemaining / 60);
  const pomodoroS = pomodoroRemaining % 60;

  const [r, g, b] = dominantColor;

  return {
    ...props,
    t,
    isMusicPlaying,
    coverImage,
    isPlaying,
    musicOuterGlowEffectEnabled,
    isTimerActive,
    isPomodoroActive,
    p0Count,
    h,
    m,
    s,
    pomodoroM,
    pomodoroS,
    r,
    g,
    b,
    padZero,
  };
}
