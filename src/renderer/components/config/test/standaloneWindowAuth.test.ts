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
 * @file standaloneWindowAuth.test.ts
 * @description 单元测试 - standaloneWindowAuth.ts
 * @author 鸡哥
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const { setStateMock } = vi.hoisted(() => ({
  setStateMock: vi.fn(),
}));

vi.mock('../../../store/slices', () => ({
  default: { setState: setStateMock },
}));

// Dynamic import to avoid side effects at module level
let applyAuthIntent: (intent: unknown) => void;

describe('applyAuthIntent', () => {
  beforeEach(async () => {
    const mod = await import('../standaloneWindowAuth');
    applyAuthIntent = mod.applyAuthIntent;
  });

  describe('login intent', () => {
    it('should set state to "login" when intent is "login"', () => {
      applyAuthIntent('login');
      expect(setStateMock).toHaveBeenCalledWith({ state: 'login' });
      expect(setStateMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('register intent', () => {
    it('should set state to "register" when intent is "register"', () => {
      applyAuthIntent('register');
      expect(setStateMock).toHaveBeenCalledWith({ state: 'register' });
      expect(setStateMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('none / reset intents', () => {
    it('should set state to "maxExpand" when intent is "none"', () => {
      applyAuthIntent('none');
      expect(setStateMock).toHaveBeenCalledWith({ state: 'maxExpand' });
      expect(setStateMock).toHaveBeenCalledTimes(1);
    });

    it('should set state to "maxExpand" when intent is null', () => {
      applyAuthIntent(null);
      expect(setStateMock).toHaveBeenCalledWith({ state: 'maxExpand' });
      expect(setStateMock).toHaveBeenCalledTimes(1);
    });

    it('should set state to "maxExpand" when intent is empty string', () => {
      applyAuthIntent('');
      expect(setStateMock).toHaveBeenCalledWith({ state: 'maxExpand' });
      expect(setStateMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('unrecognized intents', () => {
    it('should not call setState when intent is undefined', () => {
      applyAuthIntent(undefined);
      expect(setStateMock).not.toHaveBeenCalled();
    });

    it('should not call setState when intent is an arbitrary string', () => {
      applyAuthIntent('someOtherValue');
      expect(setStateMock).not.toHaveBeenCalled();
    });

    it('should not call setState when intent is a number', () => {
      applyAuthIntent(42);
      expect(setStateMock).not.toHaveBeenCalled();
    });

    it('should not call setState when intent is an object', () => {
      applyAuthIntent({ action: 'login' });
      expect(setStateMock).not.toHaveBeenCalled();
    });

    it('should not call setState when intent is boolean true', () => {
      applyAuthIntent(true);
      expect(setStateMock).not.toHaveBeenCalled();
    });
  });

  describe('branch isolation', () => {
    it('should only invoke setState once per call for valid intents', () => {
      applyAuthIntent('login');
      expect(setStateMock).toHaveBeenCalledTimes(1);
    });

    it('should handle sequential calls independently', () => {
      applyAuthIntent('login');
      applyAuthIntent('register');
      applyAuthIntent('none');
      expect(setStateMock).toHaveBeenCalledTimes(3);
      expect(setStateMock).toHaveBeenNthCalledWith(1, { state: 'login' });
      expect(setStateMock).toHaveBeenNthCalledWith(2, { state: 'register' });
      expect(setStateMock).toHaveBeenNthCalledWith(3, { state: 'maxExpand' });
    });
  });
});
