import { describe, expect, it, vi } from 'vitest';
import { applyChromiumPerformanceFlags } from '../chromiumFlags';

describe('applyChromiumPerformanceFlags', () => {
  it('appends expected chromium switches', () => {
    const appendSwitch = vi.fn();

    applyChromiumPerformanceFlags({
      commandLine: { appendSwitch },
    } as any);

    expect(appendSwitch).toHaveBeenCalledWith('disable-software-rasterizer');
    expect(appendSwitch).toHaveBeenCalledWith('disable-gpu-shader-disk-cache');
    expect(appendSwitch).toHaveBeenCalledWith('disable-backgrounding-occluded-windows');
    expect(appendSwitch).toHaveBeenCalledWith('disable-renderer-backgrounding');
    expect(appendSwitch).toHaveBeenCalledWith('disable-background-timer-throttling');
    expect(appendSwitch).toHaveBeenCalledWith('enable-features', 'BackForwardCache');
    expect(appendSwitch).toHaveBeenCalledWith('autoplay-policy', 'no-user-gesture-required');
    expect(appendSwitch).toHaveBeenCalledWith('disable-dev-shm-usage');

    const disableFeaturesCall = appendSwitch.mock.calls.find(([name]) => name === 'disable-features');
    expect(disableFeaturesCall?.[1]).toContain('HardwareMediaKeyHandling');
    expect(disableFeaturesCall?.[1]).toContain('CalculateNativeWinOcclusion');
  });
});
