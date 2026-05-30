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
 * @file weatherApi.test.ts
 * @description 单元测试文件
 * @author 鸡哥
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

/* ------------------------------------------------------------------ */
/*  hoisted mocks                                                     */
/* ------------------------------------------------------------------ */

const { mockNetFetch, mockLoadNetworkConfig, mockLoadWeatherProviderConfig,
  mockLoadLocationFromStorage, mockLoadWeatherLocationConfig,
  mockSaveLocationToStorage, mockReadLocalToken,
  mockRequestUserAccountApi, mockFetchLocation, mockLogger } = vi.hoisted(() => ({
    mockNetFetch: vi.fn(),
    mockLoadNetworkConfig: vi.fn(() => ({ timeoutMs: 10000 })),
    mockLoadWeatherProviderConfig: vi.fn(() => ({ primaryProvider: 'open-meteo' as const })),
    mockLoadLocationFromStorage: vi.fn(() => null),
    mockLoadWeatherLocationConfig: vi.fn(() => ({ priority: 'ip' as const, customLocation: null })),
    mockSaveLocationToStorage: vi.fn(),
    mockReadLocalToken: vi.fn(() => null),
    mockRequestUserAccountApi: vi.fn(),
    mockFetchLocation: vi.fn(),
    mockLogger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  }));

vi.mock('../../../store/utils/storage', () => ({
  loadNetworkConfig: mockLoadNetworkConfig,
  loadWeatherProviderConfig: mockLoadWeatherProviderConfig,
  loadLocationFromStorage: mockLoadLocationFromStorage,
  loadWeatherLocationConfig: mockLoadWeatherLocationConfig,
  saveLocationToStorage: mockSaveLocationToStorage,
}));

vi.mock('../../../utils/userAccount', () => ({
  readLocalToken: mockReadLocalToken,
}));

vi.mock('../../user/userAccountApi.client', () => ({
  request: mockRequestUserAccountApi,
}));

vi.mock('../locationApi', () => ({
  fetchLocation: mockFetchLocation,
}));

vi.mock('../../../utils/logger', () => ({
  logger: mockLogger,
}));

/* ------------------------------------------------------------------ */
/*  helpers                                                           */
/* ------------------------------------------------------------------ */

type TestWindow = {
  location?: { hostname: string };
  api?: {
    netFetch: ReturnType<typeof vi.fn>;
  };
};

const setTestWindow = (value: TestWindow): void => {
  Object.defineProperty(globalThis, 'window', {
    value,
    configurable: true,
    writable: true,
  });
};

const makeOpenMeteoBody = (overrides?: Record<string, unknown>): string => {
  const base = {
    current: {
      temperature_2m: 25,
      weather_code: 0,
      relative_humidity_2m: 60,
      wind_speed_10m: 12,
    },
    daily: {
      temperature_2m_max: [28, 30, 27],
      temperature_2m_min: [18, 20, 17],
      weather_code: [0, 2, 61],
      wind_speed_10m_max: [15, 18, 10],
      uv_index_max: [6, 7, 4],
      precipitation_probability_max: [10, 20, 80],
    },
  };
  const merged = overrides
    ? { ...base, current: { ...base.current, ...overrides.current }, daily: { ...base.daily, ...overrides.daily } }
    : base;
  return JSON.stringify(merged);
};

const makeUapiBody = (overrides?: Record<string, unknown>): string => {
  const base = {
    data: {
      weather: '晴',
      weather_icon: '100',
      temperature: 26,
      humidity: 55,
      uv: 5,
      wind_power: '3-4级',
      temp_max: 29,
      temp_min: 19,
      forecast: [
        { temp_max: 30, temp_min: 20, weather_day: '多云', weather_night: '晴', wind_speed_day: 10, uv_index: 6, precip: 5, weather_icon: '101' },
        { temp_max: 28, temp_min: 18, weather_day: '小雨', weather_night: '阴', wind_speed_day: 12, uv_index: 3, precip: 60, weather_icon: '305' },
      ],
    },
  };
  const merged = overrides ? { ...base, ...overrides } : base;
  return JSON.stringify(merged);
};

const makeQWeatherAlertResponseBody = () => JSON.stringify({
  code: '200',
  warning: [
    {
      id: 'alert-001',
      sender: '中国气象局',
      pubTime: '2026-05-30T08:00:00+08:00',
      title: '暴雨黄色预警',
      level: 'III',
      severity: 'Moderate',
      severityColor: '#FFD700',
      typeName: '暴雨',
      text: '预计未来24小时内将有大到暴雨。',
    },
  ],
});

/* ------------------------------------------------------------------ */
/*  tests                                                             */
/* ------------------------------------------------------------------ */

describe('weatherApi', () => {
  beforeEach(() => {
    vi.resetModules();
    mockNetFetch.mockReset();
    mockLoadNetworkConfig.mockReset();
    mockLoadWeatherProviderConfig.mockReset();
    mockLoadLocationFromStorage.mockReset();
    mockLoadWeatherLocationConfig.mockReset();
    mockSaveLocationToStorage.mockReset();
    mockReadLocalToken.mockReset();
    mockRequestUserAccountApi.mockReset();
    mockFetchLocation.mockReset();

    mockLoadNetworkConfig.mockReturnValue({ timeoutMs: 10000 });
    mockLoadWeatherProviderConfig.mockReturnValue({ primaryProvider: 'open-meteo' });
    mockLoadLocationFromStorage.mockReturnValue(null);
    mockLoadWeatherLocationConfig.mockReturnValue({ priority: 'ip', customLocation: null });

    setTestWindow({
      location: { hostname: 'localhost' },
      api: { netFetch: mockNetFetch },
    });
  });

  /* ============================================================= */
  /*  fetchWeather — open-meteo provider                            */
  /* ============================================================= */

  describe('fetchWeather with open-meteo provider', () => {
    it('returns mapped WeatherData on success', async () => {
      mockNetFetch.mockResolvedValue({
        ok: true,
        status: 200,
        body: makeOpenMeteoBody(),
      });

      const { fetchWeather } = await import('../weatherApi');
      const data = await fetchWeather({ latitude: 39.9, longitude: 116.4 });

      expect(data.temperature).toBe(25);
      expect(data.description).toBe('晴');
      expect(data.humidity).toBe(60);
      expect(data.windSpeed).toBe(12);
      expect(data.uvIndex).toBe(6);
      expect(data.iconCode).toBe(0);
      expect(data.forecast).toHaveLength(2);
      expect(data.forecast[0].temperatureMax).toBe(30);
      expect(data.forecast[0].temperatureMin).toBe(20);
      expect(data.forecast[0].description).toBe('多云');
      expect(data.forecast[1].description).toBe('小雨');
      expect(data.forecast[1].precipitationProbability).toBe(80);
    });

    it('builds correct Open-Meteo URL with query params', async () => {
      mockNetFetch.mockResolvedValue({
        ok: true,
        status: 200,
        body: makeOpenMeteoBody(),
      });

      const { fetchWeather } = await import('../weatherApi');
      await fetchWeather({ latitude: 31.2, longitude: 121.5 });

      const calledUrl: string = mockNetFetch.mock.calls[0][0];
      expect(calledUrl).toContain('api.open-meteo.com');
      expect(calledUrl).toContain('latitude=31.2');
      expect(calledUrl).toContain('longitude=121.5');
    });

    it('throws when all providers fail with HTTP error', async () => {
      mockNetFetch.mockResolvedValue({
        ok: false,
        status: 503,
        body: 'Service Unavailable',
      });

      const { fetchWeather } = await import('../weatherApi');
      await expect(fetchWeather({ latitude: 39.9, longitude: 116.4 }))
        .rejects.toThrow('HTTP 503');
    });

    it('throws when response body is HTML (non-JSON)', async () => {
      mockNetFetch.mockResolvedValue({
        ok: true,
        status: 200,
        body: '<!DOCTYPE html><html><body>Error</body></html>',
      });

      const { fetchWeather } = await import('../weatherApi');
      await expect(fetchWeather({ latitude: 39.9, longitude: 116.4 }))
        .rejects.toThrow('非 JSON');
    });

    it('throws when response body is HTML with ok=false (gateway error)', async () => {
      mockNetFetch.mockResolvedValue({
        ok: false,
        status: 502,
        body: '<!DOCTYPE html><html><body>Bad Gateway</body></html>',
      });

      const { fetchWeather } = await import('../weatherApi');
      await expect(fetchWeather({ latitude: 39.9, longitude: 116.4 }))
        .rejects.toThrow('HTTP 502');
    });
  });

  /* ============================================================= */
  /*  fetchWeather — uapi provider                                  */
  /* ============================================================= */

  describe('fetchWeather with uapi provider', () => {
    it('returns mapped WeatherData from uapi response', async () => {
      mockLoadWeatherProviderConfig.mockReturnValue({ primaryProvider: 'uapi' });
      mockNetFetch.mockResolvedValue({
        ok: true,
        status: 200,
        body: makeUapiBody(),
      });

      const { fetchWeather } = await import('../weatherApi');
      const data = await fetchWeather({ latitude: 39.9, longitude: 116.4 });

      expect(data.temperature).toBe(26);
      expect(data.description).toBe('晴');
      expect(data.humidity).toBe(55);
      expect(data.windSpeed).toBe(4);
      expect(data.uvIndex).toBe(5);
      expect(data.iconCode).toBe(0);
      expect(data.forecast).toHaveLength(2);
    });

    it('throws when all providers fail with HTTP error (uapi primary)', async () => {
      mockLoadWeatherProviderConfig.mockReturnValue({ primaryProvider: 'uapi' });
      mockNetFetch.mockResolvedValue({
        ok: false,
        status: 500,
        body: 'Internal Server Error',
      });

      const { fetchWeather } = await import('../weatherApi');
      await expect(fetchWeather({ latitude: 39.9, longitude: 116.4 }))
        .rejects.toThrow('HTTP 500');
    });

    it('throws when uapi response body is HTML', async () => {
      mockLoadWeatherProviderConfig.mockReturnValue({ primaryProvider: 'uapi' });
      mockNetFetch.mockResolvedValue({
        ok: true,
        status: 200,
        body: '<html>error</html>',
      });

      const { fetchWeather } = await import('../weatherApi');
      await expect(fetchWeather({ latitude: 39.9, longitude: 116.4 }))
        .rejects.toThrow('非 JSON');
    });

    it('parses uapi response when data is at top level (no data wrapper)', async () => {
      mockLoadWeatherProviderConfig.mockReturnValue({ primaryProvider: 'uapi' });
      mockNetFetch.mockResolvedValue({
        ok: true,
        status: 200,
        body: JSON.stringify({
          weather: '阴',
          weather_icon: '104',
          temperature: 20,
          humidity: 70,
          uv: 2,
          wind_power: '2级',
          temp_max: 22,
          temp_min: 16,
        }),
      });

      const { fetchWeather } = await import('../weatherApi');
      const data = await fetchWeather({ latitude: 39.9, longitude: 116.4 });

      expect(data.temperature).toBe(20);
      expect(data.description).toBe('阴');
    });
  });

  /* ============================================================= */
  /*  fetchWeather — qweather-pro provider                          */
  /* ============================================================= */

  describe('fetchWeather with qweather-pro provider', () => {
    it('falls back to open-meteo when not logged in', async () => {
      mockLoadWeatherProviderConfig.mockReturnValue({ primaryProvider: 'qweather-pro' });
      mockReadLocalToken.mockReturnValue(null);

      mockNetFetch.mockResolvedValue({
        ok: true,
        status: 200,
        body: makeOpenMeteoBody(),
      });

      const { fetchWeather } = await import('../weatherApi');
      const data = await fetchWeather({ latitude: 39.9, longitude: 116.4 });

      expect(data.temperature).toBe(25);
      expect(data.description).toBe('晴');
    });

    it('fetches weather via qweather-pro when token exists', async () => {
      mockLoadWeatherProviderConfig.mockReturnValue({ primaryProvider: 'qweather-pro' });
      mockReadLocalToken.mockReturnValue('test-token');

      mockRequestUserAccountApi.mockResolvedValue({
        ok: true,
        code: 200,
        message: 'ok',
        data: {
          code: '200',
          daily: [
            { tempMax: '30', tempMin: '20', textDay: '晴', textNight: '多云', iconDay: '100', iconNight: '101', windSpeedDay: '10', humidity: '55', uvIndex: '6', precip: '5' },
            { tempMax: '28', tempMin: '18', textDay: '小雨', textNight: '阴', iconDay: '305', iconNight: '104', windSpeedDay: '12', humidity: '70', uvIndex: '3', precip: '60' },
            { tempMax: '27', tempMin: '17', textDay: '多云', textNight: '晴', iconDay: '101', iconNight: '100', windSpeedDay: '8', humidity: '50', uvIndex: '5', precip: '10' },
          ],
        },
      });

      const { fetchWeather } = await import('../weatherApi');
      const data = await fetchWeather({ latitude: 39.9, longitude: 116.4 });

      expect(data.temperature).toBe(25);
      expect(data.description).toBe('晴');
      expect(data.forecast).toHaveLength(2);
      expect(data.forecast[0].description).toBe('小雨');
    });

    it('falls back to open-meteo when qweather-pro API returns error', async () => {
      mockLoadWeatherProviderConfig.mockReturnValue({ primaryProvider: 'qweather-pro' });
      mockReadLocalToken.mockReturnValue('test-token');

      mockRequestUserAccountApi.mockResolvedValue({
        ok: false,
        code: 403,
        message: 'forbidden',
      });

      mockNetFetch.mockResolvedValue({
        ok: true,
        status: 200,
        body: makeOpenMeteoBody(),
      });

      const { fetchWeather } = await import('../weatherApi');
      const data = await fetchWeather({ latitude: 39.9, longitude: 116.4 });

      expect(data.temperature).toBe(25);
    });
  });

  /* ============================================================= */
  /*  fetchWeather — provider fallback chain                        */
  /* ============================================================= */

  describe('fetchWeather fallback chain', () => {
    it('falls back to uapi when open-meteo fails', async () => {
      mockNetFetch
        .mockRejectedValueOnce(new Error('network timeout'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          body: makeUapiBody(),
        });

      const { fetchWeather } = await import('../weatherApi');
      const data = await fetchWeather({ latitude: 39.9, longitude: 116.4 });

      expect(data.temperature).toBe(26);
      expect(mockNetFetch).toHaveBeenCalledTimes(2);
    });

    it('throws last error when all providers fail', async () => {
      mockNetFetch
        .mockRejectedValueOnce(new Error('open-meteo down'))
        .mockRejectedValueOnce(new Error('uapi down'));

      const { fetchWeather } = await import('../weatherApi');
      await expect(fetchWeather({ latitude: 39.9, longitude: 116.4 }))
        .rejects.toThrow('uapi down');
    });

    it('falls back to open-meteo when qweather-pro has no token', async () => {
      mockLoadWeatherProviderConfig.mockReturnValue({ primaryProvider: 'qweather-pro' });
      mockReadLocalToken.mockReturnValue(null);

      mockNetFetch.mockResolvedValue({
        ok: true,
        status: 200,
        body: makeOpenMeteoBody(),
      });

      const { fetchWeather } = await import('../weatherApi');
      const data = await fetchWeather({ latitude: 39.9, longitude: 116.4 });

      expect(data.temperature).toBe(25);
      expect(data.description).toBe('晴');
    });
  });

  /* ============================================================= */
  /*  fetchWeather — WMO code mapping (via open-meteo response)     */
  /* ============================================================= */

  describe('WMO code mapping (indirect via open-meteo)', () => {
    it.each([
      [0, '晴'],
      [1, '晴'],
      [2, '多云'],
      [3, '阴'],
      [45, '雾'],
      [51, '毛毛雨'],
      [61, '小雨'],
      [63, '中雨'],
      [65, '大雨'],
      [71, '小雪'],
      [73, '中雪'],
      [75, '大雪'],
      [80, '阵雨'],
      [95, '雷雨'],
      [999, '未知'],
    ])('maps WMO code %i to "%s"', async (code, expectedDesc) => {
      mockNetFetch.mockResolvedValue({
        ok: true,
        status: 200,
        body: makeOpenMeteoBody({
          current: { weather_code: code },
          daily: { weather_code: [code, code, code] },
        }),
      });

      const { fetchWeather } = await import('../weatherApi');
      const data = await fetchWeather({ latitude: 39.9, longitude: 116.4 });

      expect(data.description).toBe(expectedDesc);
      expect(data.iconCode).toBe(code);
    });
  });

  /* ============================================================= */
  /*  fetchStartupWeatherAlerts                                      */
  /* ============================================================= */

  describe('fetchStartupWeatherAlerts', () => {
    it('throws when no token is available', async () => {
      mockReadLocalToken.mockReturnValue(null);

      const { fetchStartupWeatherAlerts } = await import('../weatherApi');
      await expect(fetchStartupWeatherAlerts())
        .rejects.toThrow('QWeather alerts require login');
    });

    it('throws when token argument is empty string', async () => {
      mockReadLocalToken.mockReturnValue(null);

      const { fetchStartupWeatherAlerts } = await import('../weatherApi');
      await expect(fetchStartupWeatherAlerts('  '))
        .rejects.toThrow('QWeather alerts require login');
    });

    it('uses provided token over local token', async () => {
      mockReadLocalToken.mockReturnValue('local-token');
      mockLoadWeatherLocationConfig.mockReturnValue({ priority: 'custom', customLocation: { latitude: 39.9, longitude: 116.4, city: 'Beijing' } });

      mockRequestUserAccountApi.mockResolvedValue({
        ok: true,
        code: 200,
        message: 'ok',
        data: { code: '200', warning: [] },
      });

      const { fetchStartupWeatherAlerts } = await import('../weatherApi');
      await fetchStartupWeatherAlerts('custom-token');

      expect(mockRequestUserAccountApi).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ auth: 'custom-token' }),
      );
    });

    it('returns mapped alerts on success', async () => {
      mockLoadWeatherLocationConfig.mockReturnValue({ priority: 'custom', customLocation: { latitude: 39.9, longitude: 116.4, city: 'Beijing' } });

      mockRequestUserAccountApi.mockResolvedValue({
        ok: true,
        code: 200,
        message: 'ok',
        data: JSON.parse(makeQWeatherAlertResponseBody()),
      });

      const { fetchStartupWeatherAlerts } = await import('../weatherApi');
      const result = await fetchStartupWeatherAlerts('test-token');

      expect(result.location.latitude).toBe(39.9);
      expect(result.location.longitude).toBe(116.4);
      expect(result.alerts).toHaveLength(1);
      expect(result.alerts[0].title).toBe('暴雨黄色预警');
      expect(result.alerts[0].severity).toBe('Moderate');
      expect(result.alerts[0].severityColor).toBe('#FFD700');
      expect(result.alerts[0].typeName).toBe('暴雨');
    });

    it('returns empty alerts array when warning is absent', async () => {
      mockLoadWeatherLocationConfig.mockReturnValue({ priority: 'custom', customLocation: { latitude: 39.9, longitude: 116.4, city: 'Beijing' } });

      mockRequestUserAccountApi.mockResolvedValue({
        ok: true,
        code: 200,
        message: 'ok',
        data: { code: '200' },
      });

      const { fetchStartupWeatherAlerts } = await import('../weatherApi');
      const result = await fetchStartupWeatherAlerts('test-token');

      expect(result.alerts).toEqual([]);
    });

    it('throws when API returns error', async () => {
      mockLoadWeatherLocationConfig.mockReturnValue({ priority: 'custom', customLocation: { latitude: 39.9, longitude: 116.4, city: 'Beijing' } });

      mockRequestUserAccountApi.mockResolvedValue({
        ok: false,
        code: 500,
        message: 'Internal Server Error',
      });

      const { fetchStartupWeatherAlerts } = await import('../weatherApi');
      await expect(fetchStartupWeatherAlerts('test-token'))
        .rejects.toThrow('QWeather Alerts 500');
    });

    it('resolves location via IP when priority is ip and no custom location', async () => {
      mockLoadWeatherLocationConfig.mockReturnValue({ priority: 'ip', customLocation: null });

      mockFetchLocation.mockResolvedValue({
        latitude: 31.2,
        longitude: 121.5,
        city: 'Shanghai',
        regionName: 'Shanghai',
        country: 'China',
      });

      mockRequestUserAccountApi.mockResolvedValue({
        ok: true,
        code: 200,
        message: 'ok',
        data: { code: '200', warning: [] },
      });

      const { fetchStartupWeatherAlerts } = await import('../weatherApi');
      const result = await fetchStartupWeatherAlerts('test-token');

      expect(result.location.latitude).toBe(31.2);
      expect(result.location.longitude).toBe(121.5);
      expect(result.location.city).toBe('Shanghai');
      expect(mockSaveLocationToStorage).toHaveBeenCalled();
    });

    it('falls back to cached location when IP fetch fails', async () => {
      mockLoadWeatherLocationConfig.mockReturnValue({ priority: 'ip', customLocation: null });
      mockFetchLocation.mockRejectedValue(new Error('IP API down'));
      mockLoadLocationFromStorage.mockReturnValue({ latitude: 40.0, longitude: 116.0, city: 'Cached', regionName: '', country: '' });

      mockRequestUserAccountApi.mockResolvedValue({
        ok: true,
        code: 200,
        message: 'ok',
        data: { code: '200', warning: [] },
      });

      const { fetchStartupWeatherAlerts } = await import('../weatherApi');
      const result = await fetchStartupWeatherAlerts('test-token');

      expect(result.location.latitude).toBe(40.0);
      expect(result.location.longitude).toBe(116.0);
      expect(result.location.city).toBe('Cached');
    });
  });
});
