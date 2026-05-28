import type { ReactElement } from 'react';
import type { useIdle } from '../hooks/useIdle';
import { SvgIcon } from '../../../../utils/SvgIcon';
import { abbreviateWeatherDescription } from '../../../../utils/weatherText';

type IdleFormProps = ReturnType<typeof useIdle>;

export function IdleForm(props: IdleFormProps): ReactElement {
  const {
    timeStr,
    dayStr,
    weather,
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
  } = props;

  const renderStatusInfo = (pomodoroIconSize: number): ReactElement => {
    if (isTimerActive) {
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[var(--color-island-text)] opacity-60">{t('hover.timer.title', { defaultValue: '倒计时' })}</span>
          <span className="text-sm text-[var(--color-island-text)] font-medium tabular-nums">
            {padZero(h)}:{padZero(m)}:{padZero(s)}
          </span>
        </div>
      );
    }
    if (isPomodoroActive) {
      return (
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 text-xs text-[var(--color-island-text)] opacity-60">
            <img src={SvgIcon.POMODORO} alt="番茄钟" style={{ width: pomodoroIconSize, height: pomodoroIconSize }} />
            番茄钟
          </span>
          <span className="text-sm text-[var(--color-island-text)] font-medium tabular-nums">
            {padZero(pomodoroM)}:{padZero(pomodoroS)}
          </span>
        </div>
      );
    }
    if (p0Count > 0) {
      return (
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium" style={{ color: '#ff5252' }}>•</span>
          <span className="text-xs font-medium" style={{ color: '#ff5252', opacity: 0.9 }}>P0-TODO</span>
          <span style={{ fontSize: 9, fontWeight: 600, color: '#fff', background: '#ff5252', borderRadius: 6, padding: '0 4px', lineHeight: '14px', minWidth: 14, textAlign: 'center' as const }}>{p0Count}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-[var(--color-island-text)] opacity-60">
          {abbreviateWeatherDescription(weather.description, t) || '—'}
        </span>
        <span className="text-sm text-[var(--color-island-text)] font-medium tabular-nums">
          {weather.temperature > 0 ? `${weather.temperature}°` : '--°'}
        </span>
      </div>
    );
  };

  return (
    <div className="idle-content">
      <div
        className={`idle-glow${isMusicPlaying && coverImage && musicOuterGlowEffectEnabled ? ' active' : ''}${isMusicPlaying && coverImage && !isPlaying && musicOuterGlowEffectEnabled ? ' paused' : ''}`}
        style={isMusicPlaying && coverImage && musicOuterGlowEffectEnabled
          ? { background: `radial-gradient(ellipse at 10% 50%, rgba(${r}, ${g}, ${b}, 0.35) 0%, transparent 60%)` }
          : undefined}
      />
      {isMusicPlaying && coverImage ? (
        <>
          <div className="flex items-center gap-2">
            <div
              className={`idle-album-cover${!isPlaying ? ' paused' : ''}${isMusicPlaying && coverImage && musicOuterGlowEffectEnabled ? ' glowing' : ''}`}
              style={{
                backgroundImage: `url(${coverImage})`,
                ...(isMusicPlaying && coverImage && musicOuterGlowEffectEnabled ? { boxShadow: `0 0 12px 4px rgba(${r}, ${g}, ${b}, 0.5)` } : {})
              }}
            />
            <div className="flex items-center gap-1">
              <span className="text-sm text-[var(--color-island-text)] font-medium tabular-nums">
                {timeStr}
              </span>
              <span className="text-xs text-[var(--color-island-text)] opacity-50">
                {dayStr}
              </span>
            </div>
          </div>
          {renderStatusInfo(12)}
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-island-text)] font-medium tabular-nums">
              {timeStr}
            </span>
            <span className="text-xs text-[var(--color-island-text)] opacity-50">
              {dayStr}
            </span>
          </div>
          {renderStatusInfo(15)}
        </>
      )}
    </div>
  );
}
