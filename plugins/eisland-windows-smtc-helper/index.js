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

if (process.platform !== 'win32') {
  throw new Error('@eisland/windows-smtc-helper only supports Windows.');
}

const { smtc, callJson, getLastError } = require('./ffi-loader');
const { SmtcMonitor } = require('./smtc-monitor');

const emptyMediaStatus = Object.freeze({
  isAvailable: false,
  title: null,
  artist: null,
  albumTitle: null,
  albumArtist: null,
  trackNumber: null,
  genres: null,
  playbackStatus: 'unknown',
  isShuffleActive: null,
  repeatMode: null,
  playbackRate: null,
  sourceAppUserModelId: null,
  thumbnail: null,
  timeline: null,
  controls: null,
});

const statusMap = {
  0: 'closed',
  1: 'opened',
  2: 'changing',
  3: 'stopped',
  4: 'playing',
  5: 'paused',
};

/**
 * 将 DLL 返回的 MediaStatus 数值枚举转为字符串
 * @param {object} raw
 * @returns {object}
 */
function normalizeMediaStatus(raw) {
  if (!raw || typeof raw.isAvailable !== 'boolean') return emptyMediaStatus;
  if (!raw.isAvailable) return emptyMediaStatus;
  return {
    ...raw,
    playbackStatus: statusMap[raw.playbackStatus] || 'unknown',
  };
}

// ── 原有命令（通过 FFI 调用，无进程启动开销） ─────────────────

function play() {
  const r = smtc.smtc_play();
  return r === 0 ? { success: true, error: null } : { success: false, error: getLastError() || 'Play failed.' };
}

function pause() {
  const r = smtc.smtc_pause();
  return r === 0 ? { success: true, error: null } : { success: false, error: getLastError() || 'Pause failed.' };
}

function next() {
  const r = smtc.smtc_next();
  return r === 0 ? { success: true, error: null } : { success: false, error: getLastError() || 'Next failed.' };
}

function previous() {
  const r = smtc.smtc_previous();
  return r === 0 ? { success: true, error: null } : { success: false, error: getLastError() || 'Previous failed.' };
}

function getStatus() {
  const raw = callJson('smtc_get_status');
  return normalizeMediaStatus(raw);
}

// ── 新增控制命令 ──────────────────────────────────────────────

function seek(positionSeconds) {
  const r = smtc.smtc_seek(positionSeconds);
  return r === 0 ? { success: true, error: null } : { success: false, error: getLastError() || 'Seek failed.' };
}

function stop() {
  const r = smtc.smtc_stop();
  return r === 0 ? { success: true, error: null } : { success: false, error: getLastError() || 'Stop failed.' };
}

function setShuffle(active) {
  const r = smtc.smtc_set_shuffle(active ? 1 : 0);
  return r === 0 ? { success: true, error: null } : { success: false, error: getLastError() || 'Set shuffle failed.' };
}

function setRepeatMode(mode) {
  // mode: 0=None, 1=Track, 2=List
  const r = smtc.smtc_set_repeat_mode(mode);
  return r === 0 ? { success: true, error: null } : { success: false, error: getLastError() || 'Set repeat mode failed.' };
}

function setPlaybackRate(rate) {
  const r = smtc.smtc_set_playback_rate(rate);
  return r === 0 ? { success: true, error: null } : { success: false, error: getLastError() || 'Set playback rate failed.' };
}

module.exports = {
  // 原有命令
  play,
  pause,
  next,
  previous,
  getStatus,
  // 新增控制
  seek,
  stop,
  setShuffle,
  setRepeatMode,
  setPlaybackRate,
  // 实时监控
  SmtcMonitor,
};
