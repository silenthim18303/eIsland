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
 * @file miniGameScoreApi.ts
 * @description 小游戏最高分 API 客户端：提交/查询/排行榜 + 失败重试队列。
 * @author 鸡哥
 */

import { request, resolveClientVersion } from '../user/userAccountApi.client';
import { readLocalToken } from '../../utils/userAccount';
import type { UserAccountResult } from '../user/userAccountApi.types';

export interface MiniGameScoreData {
  gameId: string;
  userId: number;
  highScore: number;
  bestDurationMs?: number;
  bestMoves?: number;
  playsCount?: number;
  achievedAt?: string;
}

export interface MiniGameLeaderboardEntry {
  rank: number;
  userId: number;
  highScore: number;
  bestDurationMs?: number;
  bestMoves?: number;
}

export interface MiniGameSubmitPayload {
  score: number;
  durationMs: number;
  moves: number;
  achievedAt: number;
}

interface PendingSubmission {
  submitId: string;
  gameId: string;
  payload: MiniGameSubmitPayload;
  clientVersion: string | null;
  createdAt: number;
}

const PENDING_STORAGE_KEY = 'island_mini_game_pending_submissions';
const MAX_PENDING = 50;
const MAX_PENDING_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * 提交分数（单次尝试）。
 */
export function submitScore(
  token: string,
  gameId: string,
  submitId: string,
  payload: MiniGameSubmitPayload,
  clientVersion: string | null,
  traceId?: string,
): Promise<UserAccountResult<null>> {
  return request<null>(`/v1/mini-game/score/${encodeURIComponent(gameId)}/submit`, {
    method: 'POST',
    auth: token,
    body: {
      submitId,
      score: payload.score,
      durationMs: payload.durationMs,
      moves: payload.moves,
      achievedAt: payload.achievedAt,
      clientVersion: clientVersion ?? undefined,
      traceId: traceId ?? undefined,
    },
  });
}

/**
 * 查询当前用户在指定游戏的最高分。
 */
export function getMyScore(
  token: string,
  gameId: string,
): Promise<UserAccountResult<MiniGameScoreData | null>> {
  return request<MiniGameScoreData | null>(`/v1/mini-game/score/${encodeURIComponent(gameId)}/my`, {
    method: 'GET',
    auth: token,
  });
}

/**
 * 获取指定游戏排行榜。
 */
export function getLeaderboard(
  token: string,
  gameId: string,
  limit = 50,
): Promise<UserAccountResult<MiniGameLeaderboardEntry[]>> {
  const safeLimit = Math.max(1, Math.min(limit, 200));
  return request<MiniGameLeaderboardEntry[]>(
    `/v1/mini-game/score/${encodeURIComponent(gameId)}/leaderboard?limit=${safeLimit}`,
    { method: 'GET', auth: token },
  );
}

/**
 * 游戏结束时调用：尝试提交分数，失败则存入重试队列。
 * @returns 是否提交成功（false 表示已入队等待重试）。
 */
export async function reportNewBest(gameId: string, payload: MiniGameSubmitPayload): Promise<boolean> {
  const token = readLocalToken();
  if (!token) {
    enqueuePending(gameId, payload);
    return false;
  }
  const submitId = crypto.randomUUID();
  const clientVersion = await resolveClientVersion();
  const result = await submitScore(token, gameId, submitId, payload, clientVersion);
  if (result.ok) {
    return true;
  }
  if (result.code === 400) {
    return false;
  }
  enqueuePending(gameId, payload);
  return false;
}

function readPendingQueue(): PendingSubmission[] {
  try {
    const raw = localStorage.getItem(PENDING_STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writePendingQueue(queue: PendingSubmission[]): void {
  try {
    localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(queue));
  } catch {
    // ignore
  }
}

async function enqueuePending(gameId: string, payload: MiniGameSubmitPayload): Promise<void> {
  const clientVersion = await resolveClientVersion();
  const entry: PendingSubmission = {
    submitId: crypto.randomUUID(),
    gameId,
    payload,
    clientVersion,
    createdAt: Date.now(),
  };
  const queue = readPendingQueue();
  queue.push(entry);
  if (queue.length > MAX_PENDING) {
    queue.splice(0, queue.length - MAX_PENDING);
  }
  writePendingQueue(queue);
}

let flushing = false;

/**
 * 排空重试队列。应在登录成功/应用启动时调用。
 */
export async function flushPendingSubmissions(): Promise<void> {
  if (flushing) return;
  flushing = true;
  try {
    const token = readLocalToken();
    if (!token) return;
    const queue = readPendingQueue();
    if (queue.length === 0) return;

    const now = Date.now();
    const remaining: PendingSubmission[] = [];
    for (const entry of queue) {
      if (now - entry.createdAt > MAX_PENDING_AGE_MS) {
        continue;
      }
      const result = await submitScore(
        token,
        entry.gameId,
        entry.submitId,
        entry.payload,
        entry.clientVersion,
      );
      if (!result.ok && result.code !== 400) {
        remaining.push(entry);
      }
    }
    writePendingQueue(remaining);
  } finally {
    flushing = false;
  }
}
