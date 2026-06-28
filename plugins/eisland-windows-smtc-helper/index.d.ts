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

export interface TimelineProperties {
  /** Start time of the media in seconds */
  startTime: number;
  /** End time of the media in seconds */
  endTime: number;
  /** Current playback position in seconds */
  position: number;
  /** Minimum seekable time in seconds */
  minSeekTime: number;
  /** Maximum seekable time in seconds */
  maxSeekTime: number;
}

export interface PlaybackControls {
  isPlayEnabled: boolean;
  isPauseEnabled: boolean;
  isNextEnabled: boolean;
  isPreviousEnabled: boolean;
  isStopEnabled: boolean;
  isRecordEnabled: boolean;
  isFastForwardEnabled: boolean;
  isRewindEnabled: boolean;
  isChannelUpEnabled: boolean;
  isChannelDownEnabled: boolean;
}

export interface MediaStatus {
  isAvailable: boolean;
  title: string | null;
  artist: string | null;
  albumTitle: string | null;
  albumArtist: string | null;
  trackNumber: number | null;
  genres: string[] | null;
  playbackStatus: 'playing' | 'paused' | 'stopped' | 'closed' | 'opened' | 'changing' | 'unknown';
  isShuffleActive: boolean | null;
  repeatMode: number | null;
  /** Playback rate (1.0 = normal speed) */
  playbackRate: number | null;
  /** App User Model ID of the media source (e.g. "Microsoft.ZuneMusic_8wekyb3d8bbwe!Microsoft.ZuneMusic") */
  sourceAppUserModelId: string | null;
  /** Album art as a data URI (always image/jpeg, data:image/jpeg;base64,...) */
  thumbnail: string | null;
  timeline: TimelineProperties | null;
  controls: PlaybackControls | null;
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
