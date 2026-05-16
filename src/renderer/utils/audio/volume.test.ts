import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readEffectiveAudioVolume, clampVolume } from './volume';

describe('audio volume utils', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'window', {
      value: {
        api: {
          storeRead: vi.fn(async (key: string) => {
            if (key === 'sound-volume-global') return 0.8;
            if (key === 'sound-volume-alarm') return 0.5;
            if (key === 'sound-volume-effect') return 2;
            return null;
          }),
        },
      },
      configurable: true,
      writable: true,
    });
  });

  it('clamps invalid and out-of-range values', () => {
    expect(clampVolume(Number.NaN)).toBe(1);
    expect(clampVolume(-1)).toBe(0);
    expect(clampVolume(2)).toBe(1);
    expect(clampVolume(0.6)).toBe(0.6);
  });

  it('combines global and category volume', async () => {
    await expect(readEffectiveAudioVolume('alarm')).resolves.toBe(0.4);
    await expect(readEffectiveAudioVolume('effect')).resolves.toBe(0.8);
  });
});
