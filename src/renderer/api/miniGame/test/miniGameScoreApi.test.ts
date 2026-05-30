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
 * @file miniGameScoreApi.test.ts
 * @description miniGameScoreApi 单元测试。
 * @author 鸡哥
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requestMock, resolveClientVersionMock, readLocalTokenMock, randomUUIDMock } = vi.hoisted(() => {
  const requestMock = vi.fn();
  const resolveClientVersionMock = vi.fn();
  const readLocalTokenMock = vi.fn();
  const randomUUIDMock = vi.fn();
  return { requestMock, resolveClientVersionMock, readLocalTokenMock, randomUUIDMock };
});

vi.mock('../../user/userAccountApi.client', () => ({
  request: requestMock,
  resolveClientVersion: resolveClientVersionMock,
}));

vi.mock('../../../utils/userAccount', () => ({
  readLocalToken: readLocalTokenMock,
}));

const setTestLocalStorage = (value: Storage): void => {
  Object.defineProperty(globalThis, 'localStorage', {
    value,
    configurable: true,
    writable: true,
  });
};

describe('miniGameScoreApi', () => {
  beforeEach(() => {
    vi.resetModules();
    requestMock.mockReset();
    resolveClientVersionMock.mockReset();
    readLocalTokenMock.mockReset();
    randomUUIDMock.mockReset();
    // Override crypto.randomUUID directly since vi.spyOn doesn't survive module resets
    crypto.randomUUID = randomUUIDMock as unknown as () => string;
    const store = new Map<string, string>();
    setTestLocalStorage({
      getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
      setItem: (key: string, value: string) => { store.set(key, value); },
      removeItem: (key: string) => { store.delete(key); },
      clear: () => { store.clear(); },
      key: () => null,
      length: 0,
    });
  });

  describe('submitScore', () => {
    it('sends POST to correct path with body', async () => {
      requestMock.mockResolvedValue({ ok: true, code: 200, message: '', data: null });
      const { submitScore } = await import('../miniGameScoreApi');

      const payload = {
        score: 999,
        durationMs: 12000,
        moves: 42,
        achievedAt: 1700000000000,
        sessionId: 'sess-1',
        moveTrace: 'trace-data',
      };
      await submitScore('tok-abc', 'tetris', 'sub-1', payload, '1.2.3', 'trace-id-1');

      expect(requestMock).toHaveBeenCalledTimes(1);
      expect(requestMock).toHaveBeenCalledWith(
        '/v1/mini-game/score/tetris/submit',
        {
          method: 'POST',
          auth: 'tok-abc',
          body: {
            submitId: 'sub-1',
            score: 999,
            durationMs: 12000,
            moves: 42,
            achievedAt: 1700000000000,
            sessionId: 'sess-1',
            moveTrace: 'trace-data',
            clientVersion: '1.2.3',
            traceId: 'trace-id-1',
          },
        },
      );
    });

    it('encodes gameId in URL path', async () => {
      requestMock.mockResolvedValue({ ok: true, code: 200, message: '', data: null });
      const { submitScore } = await import('../miniGameScoreApi');

      const payload = { score: 1, durationMs: 0, moves: 0, achievedAt: 0 };
      await submitScore('tok', 'my game/special', 'sub-1', payload, null);

      expect(requestMock).toHaveBeenCalledWith(
        '/v1/mini-game/score/my%20game%2Fspecial/submit',
        expect.any(Object),
      );
    });

    it('sends undefined for null clientVersion and traceId', async () => {
      requestMock.mockResolvedValue({ ok: true, code: 200, message: '', data: null });
      const { submitScore } = await import('../miniGameScoreApi');

      const payload = { score: 1, durationMs: 0, moves: 0, achievedAt: 0 };
      await submitScore('tok', 'game1', 'sub-1', payload, null);

      const body = requestMock.mock.calls[0][1].body;
      expect(body.clientVersion).toBeUndefined();
      expect(body.traceId).toBeUndefined();
    });
  });

  describe('startGameSession', () => {
    it('sends POST to correct session path', async () => {
      const sessionData = { sessionId: 's1', seed: 42, startedAt: 1700000000000 };
      requestMock.mockResolvedValue({ ok: true, code: 200, message: '', data: sessionData });
      const { startGameSession } = await import('../miniGameScoreApi');

      const result = await startGameSession('tok-abc', 'snake');

      expect(requestMock).toHaveBeenCalledWith(
        '/v1/mini-game/score/snake/session/start',
        { method: 'POST', auth: 'tok-abc' },
      );
      expect(result.ok).toBe(true);
      expect(result.data).toEqual(sessionData);
    });
  });

  describe('getMyScore', () => {
    it('sends GET to correct my-score path', async () => {
      requestMock.mockResolvedValue({ ok: true, code: 200, message: '', data: null });
      const { getMyScore } = await import('../miniGameScoreApi');

      await getMyScore('tok-xyz', 'tetris');

      expect(requestMock).toHaveBeenCalledWith(
        '/v1/mini-game/score/tetris/my',
        { method: 'GET', auth: 'tok-xyz' },
      );
    });
  });

  describe('getLeaderboard', () => {
    it('sends GET to correct leaderboard path with default limit', async () => {
      requestMock.mockResolvedValue({ ok: true, code: 200, message: '', data: [] });
      const { getLeaderboard } = await import('../miniGameScoreApi');

      await getLeaderboard('tok', 'tetris');

      expect(requestMock).toHaveBeenCalledWith(
        '/v1/mini-game/score/tetris/leaderboard?limit=50',
        { method: 'GET', auth: 'tok' },
      );
    });

    it('clamps limit to [1, 200]', async () => {
      requestMock.mockResolvedValue({ ok: true, code: 200, message: '', data: [] });
      const { getLeaderboard } = await import('../miniGameScoreApi');

      await getLeaderboard('tok', 'tetris', 0);
      expect(requestMock.mock.calls[0][0]).toContain('limit=1');

      requestMock.mockClear();
      await getLeaderboard('tok', 'tetris', 999);
      expect(requestMock.mock.calls[0][0]).toContain('limit=200');
    });
  });

  describe('checkLeaderboardRefreshCaptcha', () => {
    it('sends POST to correct refresh-check path', async () => {
      requestMock.mockResolvedValue({ ok: true, code: 200, message: '', data: { requireCaptcha: false } });
      const { checkLeaderboardRefreshCaptcha } = await import('../miniGameScoreApi');

      const result = await checkLeaderboardRefreshCaptcha('tok', 'tetris');

      expect(requestMock).toHaveBeenCalledWith(
        '/v1/mini-game/score/tetris/leaderboard/refresh-check',
        { method: 'POST', auth: 'tok' },
      );
      expect(result.data?.requireCaptcha).toBe(false);
    });
  });

  describe('reportNewBest', () => {
    const payload = { score: 500, durationMs: 5000, moves: 20, achievedAt: 1700000000000 };

    it('returns true on successful submission', async () => {
      readLocalTokenMock.mockReturnValue('tok');
      randomUUIDMock.mockReturnValue('uuid-1');
      resolveClientVersionMock.mockResolvedValue('2.0.0');
      requestMock.mockResolvedValue({ ok: true, code: 200, message: '', data: null });

      const { reportNewBest } = await import('../miniGameScoreApi');
      const result = await reportNewBest('tetris', payload);

      expect(result).toBe(true);
      expect(requestMock).toHaveBeenCalledWith(
        '/v1/mini-game/score/tetris/submit',
        expect.objectContaining({
          method: 'POST',
          auth: 'tok',
          body: expect.objectContaining({ submitId: 'uuid-1', clientVersion: '2.0.0' }),
        }),
      );
      expect(localStorage.getItem('island_mini_game_pending_submissions')).toBeNull();
    });

    it('returns false and does NOT enqueue on code 400', async () => {
      readLocalTokenMock.mockReturnValue('tok');
      randomUUIDMock.mockReturnValue('uuid-2');
      resolveClientVersionMock.mockResolvedValue('2.0.0');
      requestMock.mockResolvedValue({ ok: false, code: 400, message: 'bad request' });

      const { reportNewBest } = await import('../miniGameScoreApi');
      const result = await reportNewBest('tetris', payload);

      expect(result).toBe(false);
      expect(localStorage.getItem('island_mini_game_pending_submissions')).toBeNull();
    });

    it('enqueues to pending queue when no token is available', async () => {
      readLocalTokenMock.mockReturnValue(null);
      resolveClientVersionMock.mockResolvedValue('2.0.0');
      randomUUIDMock.mockReturnValue('uuid-queued');

      const { reportNewBest } = await import('../miniGameScoreApi');
      const result = await reportNewBest('tetris', payload);

      expect(result).toBe(false);
      expect(requestMock).not.toHaveBeenCalled();

      const queue = JSON.parse(localStorage.getItem('island_mini_game_pending_submissions')!);
      expect(queue).toHaveLength(1);
      expect(queue[0].gameId).toBe('tetris');
      expect(queue[0].submitId).toBe('uuid-queued');
      expect(queue[0].payload).toEqual(payload);
    });

    it('enqueues to pending queue when server error (non-400)', async () => {
      readLocalTokenMock.mockReturnValue('tok');
      randomUUIDMock.mockReturnValueOnce('uuid-fail').mockReturnValueOnce('uuid-queued');
      resolveClientVersionMock.mockResolvedValue('2.0.0');
      requestMock.mockResolvedValue({ ok: false, code: 500, message: 'server error' });

      const { reportNewBest } = await import('../miniGameScoreApi');
      const result = await reportNewBest('tetris', payload);

      expect(result).toBe(false);

      const queue = JSON.parse(localStorage.getItem('island_mini_game_pending_submissions')!);
      expect(queue).toHaveLength(1);
      expect(queue[0].gameId).toBe('tetris');
    });
  });

  describe('flushPendingSubmissions', () => {
    it('handles empty queue gracefully', async () => {
      readLocalTokenMock.mockReturnValue('tok');

      const { flushPendingSubmissions } = await import('../miniGameScoreApi');
      await flushPendingSubmissions();

      expect(requestMock).not.toHaveBeenCalled();
    });

    it('does nothing when token is missing', async () => {
      readLocalTokenMock.mockReturnValue(null);
      localStorage.setItem('island_mini_game_pending_submissions', JSON.stringify([
        { submitId: 's1', gameId: 'tetris', payload: { score: 1, durationMs: 0, moves: 0, achievedAt: 0 }, clientVersion: null, createdAt: Date.now() },
      ]));

      const { flushPendingSubmissions } = await import('../miniGameScoreApi');
      await flushPendingSubmissions();

      expect(requestMock).not.toHaveBeenCalled();
      // queue should remain untouched
      const queue = JSON.parse(localStorage.getItem('island_mini_game_pending_submissions')!);
      expect(queue).toHaveLength(1);
    });

    it('drains pending queue on successful submissions', async () => {
      readLocalTokenMock.mockReturnValue('tok');
      requestMock.mockResolvedValue({ ok: true, code: 200, message: '', data: null });

      localStorage.setItem('island_mini_game_pending_submissions', JSON.stringify([
        { submitId: 's1', gameId: 'tetris', payload: { score: 100, durationMs: 1000, moves: 5, achievedAt: 0 }, clientVersion: '1.0', createdAt: Date.now() },
        { submitId: 's2', gameId: 'snake', payload: { score: 200, durationMs: 2000, moves: 10, achievedAt: 0 }, clientVersion: '1.0', createdAt: Date.now() },
      ]));

      const { flushPendingSubmissions } = await import('../miniGameScoreApi');
      await flushPendingSubmissions();

      expect(requestMock).toHaveBeenCalledTimes(2);
      expect(requestMock).toHaveBeenCalledWith(
        '/v1/mini-game/score/tetris/submit',
        expect.objectContaining({ body: expect.objectContaining({ submitId: 's1' }) }),
      );
      expect(requestMock).toHaveBeenCalledWith(
        '/v1/mini-game/score/snake/submit',
        expect.objectContaining({ body: expect.objectContaining({ submitId: 's2' }) }),
      );
      expect(localStorage.getItem('island_mini_game_pending_submissions')).toBe('[]');
    });

    it('keeps entries that fail with non-400 errors', async () => {
      readLocalTokenMock.mockReturnValue('tok');
      requestMock.mockResolvedValue({ ok: false, code: 500, message: 'server error' });

      localStorage.setItem('island_mini_game_pending_submissions', JSON.stringify([
        { submitId: 's1', gameId: 'tetris', payload: { score: 100, durationMs: 1000, moves: 5, achievedAt: 0 }, clientVersion: '1.0', createdAt: Date.now() },
      ]));

      const { flushPendingSubmissions } = await import('../miniGameScoreApi');
      await flushPendingSubmissions();

      const queue = JSON.parse(localStorage.getItem('island_mini_game_pending_submissions')!);
      expect(queue).toHaveLength(1);
      expect(queue[0].submitId).toBe('s1');
    });

    it('drops entries that fail with code 400', async () => {
      readLocalTokenMock.mockReturnValue('tok');
      requestMock.mockResolvedValue({ ok: false, code: 400, message: 'bad request' });

      localStorage.setItem('island_mini_game_pending_submissions', JSON.stringify([
        { submitId: 's1', gameId: 'tetris', payload: { score: 100, durationMs: 1000, moves: 5, achievedAt: 0 }, clientVersion: '1.0', createdAt: Date.now() },
      ]));

      const { flushPendingSubmissions } = await import('../miniGameScoreApi');
      await flushPendingSubmissions();

      expect(localStorage.getItem('island_mini_game_pending_submissions')).toBe('[]');
    });

    it('skips items older than 7 days', async () => {
      readLocalTokenMock.mockReturnValue('tok');
      requestMock.mockResolvedValue({ ok: true, code: 200, message: '', data: null });

      const sevenDaysAndOneMs = 7 * 24 * 60 * 60 * 1000 + 1;
      localStorage.setItem('island_mini_game_pending_submissions', JSON.stringify([
        { submitId: 'old', gameId: 'tetris', payload: { score: 100, durationMs: 1000, moves: 5, achievedAt: 0 }, clientVersion: '1.0', createdAt: Date.now() - sevenDaysAndOneMs },
        { submitId: 'fresh', gameId: 'tetris', payload: { score: 200, durationMs: 2000, moves: 10, achievedAt: 0 }, clientVersion: '1.0', createdAt: Date.now() },
      ]));

      const { flushPendingSubmissions } = await import('../miniGameScoreApi');
      await flushPendingSubmissions();

      expect(requestMock).toHaveBeenCalledTimes(1);
      expect(requestMock).toHaveBeenCalledWith(
        '/v1/mini-game/score/tetris/submit',
        expect.objectContaining({ body: expect.objectContaining({ submitId: 'fresh' }) }),
      );
      expect(localStorage.getItem('island_mini_game_pending_submissions')).toBe('[]');
    });
  });
});
