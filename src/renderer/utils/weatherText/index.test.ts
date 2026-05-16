import { describe, expect, it, vi } from 'vitest';
import { abbreviateWeatherDescription } from './index';

describe('abbreviateWeatherDescription', () => {
  it('returns empty string for blank input', () => {
    expect(abbreviateWeatherDescription('  ')).toBe('');
  });

  it('maps weather by keyword with fallback text', () => {
    expect(abbreviateWeatherDescription('Heavy rain')).toBe('暴雨');
    expect(abbreviateWeatherDescription('多云转晴')).toBe('多云');
  });

  it('uses i18n translator when provided', () => {
    const t = vi.fn((key: string, options?: Record<string, unknown>) => `${key}:${String(options?.defaultValue ?? '')}`);
    const result = abbreviateWeatherDescription('Thunderstorm', t);

    expect(result).toBe('weatherAbbr.thunder:雷雨');
    expect(t).toHaveBeenCalledWith('weatherAbbr.thunder', { defaultValue: '雷雨' });
  });

  it('keeps original text when no mapping matched', () => {
    expect(abbreviateWeatherDescription('Alien Weather')).toBe('Alien Weather');
  });
});
