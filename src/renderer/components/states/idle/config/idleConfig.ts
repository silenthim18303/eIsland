export const MUSIC_OUTER_GLOW_EFFECT_STORE_KEY = 'music-outer-glow-effect-enabled';

export type TimerState = 'idle' | 'running' | 'paused';

export interface IdleContentProps {
  timeStr: string;
  dayStr: string;
  weather: {
    temperature: number;
    description?: string;
  };
  timerState: TimerState;
  remainingSeconds: number;
  pomodoroRunning: boolean;
  pomodoroRemaining: number;
}
