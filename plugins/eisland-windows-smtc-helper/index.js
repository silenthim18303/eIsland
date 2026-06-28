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

const path = require('node:path');
const { spawnSync } = require('node:child_process');

if (process.platform !== 'win32') {
  throw new Error('@eisland/windows-smtc-helper only supports Windows.');
}

const TFM = 'net10.0-windows10.0.19041.0';

const helperCandidates = [
  path.join(__dirname, 'src', 'bin', 'Release', TFM, 'eIslandSmtcHelper.exe'),
  path.join(__dirname, 'src', 'bin', 'Debug', TFM, 'eIslandSmtcHelper.exe'),
];

let helperPath;

for (const candidate of helperCandidates) {
  try {
    require('node:fs').accessSync(candidate);
    helperPath = candidate;
    break;
  } catch {
    // try next
  }
}

if (!helperPath) {
  throw new Error(
    'Unable to find eIslandSmtcHelper executable. Run "npm run build" first.'
  );
}

const emptyMediaStatus = Object.freeze({
  isAvailable: false,
  title: null,
  artist: null,
  album: null,
  playbackStatus: 'unknown',
  isShuffleActive: null,
  repeatMode: null,
});

const emptyCommandResult = Object.freeze({
  success: false,
  error: 'Unknown error.',
});

function runCommand(args) {
  const result = spawnSync(helperPath, args, {
    encoding: 'utf8',
    windowsHide: true,
    timeout: 5000,
  });

  if (result.error) {
    return { success: false, error: result.error.message };
  }

  if (!result.stdout || result.stdout.trim() === '') {
    return { success: false, error: 'No output from helper process.' };
  }

  try {
    return JSON.parse(result.stdout.trim());
  } catch {
    return { success: false, error: 'Failed to parse helper output.' };
  }
}

function runStatusCommand(args) {
  const result = spawnSync(helperPath, args, {
    encoding: 'utf8',
    windowsHide: true,
    timeout: 5000,
  });

  if (result.error) {
    return emptyMediaStatus;
  }

  if (!result.stdout || result.stdout.trim() === '') {
    return emptyMediaStatus;
  }

  try {
    const parsed = JSON.parse(result.stdout.trim());
    if (typeof parsed.isAvailable !== 'boolean') {
      return emptyMediaStatus;
    }
    return parsed;
  } catch {
    return emptyMediaStatus;
  }
}

function play() {
  return runCommand(['play']);
}

function pause() {
  return runCommand(['pause']);
}

function next() {
  return runCommand(['next']);
}

function previous() {
  return runCommand(['previous']);
}

function getStatus() {
  return runStatusCommand(['status']);
}

module.exports = { play, pause, next, previous, getStatus };
