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

export interface MediaStatus {
  isAvailable: boolean;
  title: string | null;
  artist: string | null;
  album: string | null;
  playbackStatus: 'playing' | 'paused' | 'stopped' | 'closed' | 'opened' | 'changing' | 'unknown';
  isShuffleActive: boolean | null;
  repeatMode: number | null;
}

export interface CommandResult {
  success: boolean;
  error: string | null;
}

export function play(): CommandResult;
export function pause(): CommandResult;
export function next(): CommandResult;
export function previous(): CommandResult;
export function getStatus(): MediaStatus;
