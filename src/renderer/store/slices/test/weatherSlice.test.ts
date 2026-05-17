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
 * @file weatherSlice.test.ts
 * @description 单元测试文件
 * @author 鸡哥
 */

import type { StateCreator } from 'zustand';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  fetchWeatherMock,
  fetchLocationMock,
  loadWeatherFromStorageMock,
  saveWeatherToStorageMock,
  loadLocationFromStorageMock,
  saveLocationToStorageMock,
  loadWeatherLocationConfigMock,
} = vi.hoisted(() => ({
  fetchWeatherMock: vi.fn(),
  fetchLocationMock: vi.fn(),
  loadWeatherFromStorageMock: vi.fn(),
  saveWeatherToStorageMock: vi.fn(),
  loadLocationFromStorageMock: vi.fn(),
  saveLocationToStorageMock: vi.fn(),
  loadWeatherLocationConfigMock: vi.fn(),
}));

vi.mock('../../../api/weather/weatherApi', () => ({
  fetchWeather: fetchWeatherMock,
}));

vi.mock('../../../api/weather/locationApi', () => ({
  fetchLocation: fetchLocationMock,
}));

vi.mock('../../utils/storage', () => ({
  loadWeatherFromStorage: loadWeatherFromStorageMock,
  saveWeatherToStorage: saveWeatherToStorageMock,
  loadLocationFromStorage: loadLocationFromStorageMock,
  saveLocationToStorage: saveLocationToStorageMock,
  loadWeatherLocationConfig: loadWeatherLocationConfigMock,
}));

vi.mock('../../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { createWeatherSlice } from '../weatherSlice';

type WeatherState = ReturnType<typeof createWeatherSlice>;

function createSliceState(creator: StateCreator<WeatherState, [], [], WeatherState>): { getState: () => WeatherState } {
  let state = {} as WeatherState;
  const setState = (updater: Partial<WeatherState> | ((prev: WeatherState) => Partial<WeatherState>)) => {
    const patch = typeof updater === 'function' ? updater(state) : updater;
    state = { ...state, ...patch };
  };
  state = creator(setState as never, (() => state) as never, {} as never);
  return { getState: () => state };
}

describe('createWeatherSlice', () => {
  const defaultWeather = { temperature: 22, description: '晴天' };

  beforeEach(() => {
    fetchWeatherMock.mockReset();
    fetchLocationMock.mockReset();
    loadWeatherFromStorageMock.mockReset();
    saveWeatherToStorageMock.mockReset();
    loadLocationFromStorageMock.mockReset();
    saveLocationToStorageMock.mockReset();
    loadWeatherLocationConfigMock.mockReset();

    loadWeatherFromStorageMock.mockReturnValue(defaultWeather);
    loadLocationFromStorageMock.mockReturnValue(null);
    loadWeatherLocationConfigMock.mockReturnValue({ priority: 'ip', customLocation: null });
  });

  it('persists weather when setWeather is called', () => {
    const store = createSliceState(createWeatherSlice);
    const nextWeather = { temperature: 30, description: '多云' };

    store.getState().setWeather(nextWeather as never);

    expect(saveWeatherToStorageMock).toHaveBeenCalledWith(nextWeather);
    expect(store.getState().weather).toEqual(nextWeather);
  });

  it('fetches weather from manual coordinates', async () => {
    fetchWeatherMock.mockResolvedValue({ temperature: 18, description: '雨天' });
    const store = createSliceState(createWeatherSlice);

    await store.getState().fetchWeatherData({ latitude: 31.2, longitude: 121.5 });

    expect(fetchWeatherMock).toHaveBeenCalledWith({ latitude: 31.2, longitude: 121.5 });
    expect(saveWeatherToStorageMock).toHaveBeenCalledWith({ temperature: 18, description: '雨天' });
    expect(store.getState().weather).toEqual({ temperature: 18, description: '雨天' });
  });

  it('skips weather request when force refresh has no location', async () => {
    fetchLocationMock.mockRejectedValue(new Error('network'));
    loadWeatherLocationConfigMock.mockReturnValue({ priority: 'ip', customLocation: null });

    const store = createSliceState(createWeatherSlice);
    await store.getState().fetchWeatherData(undefined, true);

    expect(fetchWeatherMock).not.toHaveBeenCalled();
    expect(saveWeatherToStorageMock).not.toHaveBeenCalled();
  });
});
