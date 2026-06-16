export interface NativeRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface NativeMonitorInfo extends NativeRect {
  isPrimary: boolean;
}

export interface FullscreenWindowInfo {
  hwnd: string;
  title: string;
  processId: number;
  bounds: NativeRect;
  monitor: NativeMonitorInfo;
  isForeground: boolean;
}

export function getForegroundFullscreenWindow(): FullscreenWindowInfo | null;
export function getFullscreenWindows(): FullscreenWindowInfo[];
export function isAnyFullscreenWindow(): boolean;