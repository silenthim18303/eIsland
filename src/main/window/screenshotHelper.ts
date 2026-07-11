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

import { join } from 'path';

interface ScreenshotResult {
  data: Buffer;
  size: number;
  format: 'png';
}

interface WindowsScreenshotHelper {
  capturePrimaryDisplayPng: () => ScreenshotResult | null;
  getLastError?: () => string;
}

let cachedHelper: WindowsScreenshotHelper | null | undefined;
let hasLoggedLoadFailure = false;

function loadWindowsScreenshotHelper(): WindowsScreenshotHelper | null {
  if (process.platform !== 'win32') return null;
  if (cachedHelper !== undefined) return cachedHelper;

  const candidates = [
    '@eisland/windows-screenshot-helper',
    join(process.cwd(), 'plugins', 'eisland-windows-screenshot-helper'),
  ];

  for (const candidate of candidates) {
    try {
      cachedHelper = require(candidate) as WindowsScreenshotHelper;
      return cachedHelper;
    } catch (err) {
      if (!hasLoggedLoadFailure && candidate === candidates[candidates.length - 1]) {
        hasLoggedLoadFailure = true;
        console.warn('[ScreenshotHelper] native helper unavailable, fallback to desktopCapturer:', err);
      }
    }
  }

  cachedHelper = null;
  return null;
}

export function capturePrimaryDisplayPng(): Buffer | null {
  const helper = loadWindowsScreenshotHelper();
  if (!helper) return null;

  try {
    const result = helper.capturePrimaryDisplayPng();
    if (!result || !Buffer.isBuffer(result.data) || result.data.length === 0 || result.format !== 'png') {
      const lastError = helper.getLastError?.();
      if (lastError) console.warn('[ScreenshotHelper] capture failed:', lastError);
      return null;
    }
    return result.data;
  } catch (err) {
    console.warn('[ScreenshotHelper] capture error, fallback to desktopCapturer:', err);
    return null;
  }
}