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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 */

import { describe, it, expect } from 'vitest';
import type { MediaStatus, CommandResult } from '../index';

const smtc = require('../') as {
  play(): CommandResult;
  pause(): CommandResult;
  next(): CommandResult;
  previous(): CommandResult;
  getStatus(): MediaStatus;
};

describe('@eisland/windows-smtc-helper', () => {
  it('exports all expected functions', () => {
    expect(typeof smtc.play).toBe('function');
    expect(typeof smtc.pause).toBe('function');
    expect(typeof smtc.next).toBe('function');
    expect(typeof smtc.previous).toBe('function');
    expect(typeof smtc.getStatus).toBe('function');
  });

  describe('getStatus', () => {
    it('returns a well-shaped MediaStatus object', () => {
      const status = smtc.getStatus();

      expect(typeof status).toBe('object');
      expect(typeof status.isAvailable).toBe('boolean');

      if (status.isAvailable) {
        expect(typeof status.playbackStatus).toBe('string');
        expect(['playing', 'paused', 'stopped', 'closed', 'opened', 'changing', 'unknown']).toContain(status.playbackStatus);

        // title, artist, album are string or null
        if (status.title !== null) expect(typeof status.title).toBe('string');
        if (status.artist !== null) expect(typeof status.artist).toBe('string');
        if (status.album !== null) expect(typeof status.album).toBe('string');

        // isShuffleActive is boolean or null
        if (status.isShuffleActive !== null) expect(typeof status.isShuffleActive).toBe('boolean');

        // repeatMode is number or null
        if (status.repeatMode !== null) expect(typeof status.repeatMode).toBe('number');
      }
    });

    it('never throws', () => {
      expect(() => smtc.getStatus()).not.toThrow();
    });
  });

  describe('command functions', () => {
    const commands = ['play', 'pause', 'next', 'previous'] as const;

    for (const cmd of commands) {
      describe(cmd, () => {
        it('returns a CommandResult object', () => {
          const result = smtc[cmd]();

          expect(typeof result).toBe('object');
          expect(typeof result.success).toBe('boolean');

          if (!result.success) {
            expect(typeof result.error).toBe('string');
          } else {
            expect(result.error).toBeNull();
          }
        });

        it('never throws', () => {
          expect(() => smtc[cmd]()).not.toThrow();
        });
      });
    }
  });
});
