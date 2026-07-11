export interface ScreenshotResult {
  data: Buffer;
  size: number;
  format: 'png';
}

export function capturePrimaryDisplayPng(): ScreenshotResult | null;
export function getLastError(): string;