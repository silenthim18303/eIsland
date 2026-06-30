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
 * @file brightness-monitor.js
 * @description 屏幕亮度实时监控器，通过 DLL FFI 监听 WmiMonitorBrightnessEvent
 */

const { EventEmitter } = require('node:events');
const { bright } = require('./ffi-loader');

class BrightnessMonitor extends EventEmitter {
  constructor() {
    super();
    this._running = false;
    this._lastBrightness = -1;
  }

  /**
   * 启动监控（幂等）
   */
  start() {
    if (this._running) return;
    const result = bright.bright_start_monitoring();
    if (result !== 0) {
      throw new Error('Failed to start brightness monitoring (DLL returned ' + result + ')');
    }
    this._running = true;
    this._lastBrightness = -1;
    this._pollLoop();
  }

  /**
   * 停止监控（幂等）
   */
  stop() {
    if (!this._running) return;
    this._running = false;
    bright.bright_stop_monitoring();
    this._lastBrightness = -1;
    this.removeAllListeners();
  }

  /**
   * 获取当前亮度值（来自最后一次 WMI 事件）
   * @returns {number} 亮度百分比 (0-100)，-1 表示尚未收到事件
   */
  getLastBrightness() {
    if (!this._running) return -1;
    return bright.bright_get_last_brightness();
  }

  /**
   * 是否正在监控
   * @returns {boolean}
   */
  isRunning() {
    return this._running;
  }

  /**
   * 轮询循环：等待 DLL 变更信号，触发事件
   * @private
   */
  _pollLoop() {
    if (!this._running) return;

    bright.bright_wait_for_changes(1000);

    if (!this._running) return;

    try {
      this._drainChanges();
    } catch (err) {
      this.emit('error', err);
    }

    setImmediate(() => this._pollLoop());
  }

  /**
   * 读取最新亮度值，与缓存比较后触发事件
   * @private
   */
  _drainChanges() {
    const currentBrightness = bright.bright_get_last_brightness();

    if (currentBrightness !== this._lastBrightness) {
      const prevBrightness = this._lastBrightness;
      this._lastBrightness = currentBrightness;

      if (prevBrightness === -1) {
        // 首次收到事件
        this.emit('brightness-changed', currentBrightness);
      } else {
        this.emit('brightness-changed', currentBrightness, prevBrightness);
      }
    }
  }
}

module.exports = { BrightnessMonitor };
