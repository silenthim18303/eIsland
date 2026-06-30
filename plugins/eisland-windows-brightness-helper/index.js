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
  throw new Error('@eisland/windows-brightness-helper only supports Windows.');
}

const { callJson } = require('./ffi-loader');
const { bright } = require('./ffi-loader');
const { BrightnessMonitor } = require('./brightness-monitor');

/**
 * 获取当前屏幕亮度
 * @returns {import('.').BrightnessInfo | null}
 */
function getBrightness() {
  return callJson('bright_get_brightness');
}

/**
 * 设置屏幕亮度
 * @param {number} brightness - 目标亮度 (0-100)
 * @returns {boolean} 是否成功
 */
function setBrightness(brightness) {
  const val = Math.max(0, Math.min(100, Math.round(brightness)));
  return bright.bright_set_brightness(val) === 1;
}

module.exports = {
  getBrightness,
  setBrightness,
  BrightnessMonitor,
};
