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
 * @file bluetooth-monitor.js
 * @description 蓝牙设备实时监控器，通过 DLL FFI 监听 DeviceWatcher 事件
 */

const { EventEmitter } = require('node:events');
const { bt, callJson } = require('./ffi-loader');

class BluetoothMonitor extends EventEmitter {
  constructor() {
    super();
    this._running = false;
    this._cache = new Map();
  }

  /**
   * 启动监控（幂等）
   */
  start() {
    if (this._running) return;
    const result = bt.bt_start_monitoring();
    if (result !== 0) {
      throw new Error('Failed to start Bluetooth monitoring (DLL returned ' + result + ')');
    }
    this._running = true;
    this._pollLoop();
  }

  /**
   * 停止监控（幂等）
   */
  stop() {
    if (!this._running) return;
    this._running = false;
    bt.bt_stop_monitoring();
    this._cache.clear();
    this.removeAllListeners();
  }

  /**
   * 获取当前所有设备快照（同步）
   * @returns {Array<import('.').BluetoothDeviceInfo>}
   */
  getDevices() {
    const devices = callJson('bt_get_monitored_devices');
    if (!Array.isArray(devices)) return [];
    return devices.map((d) => this._normalizeDevice(d));
  }

  /**
   * 轮询循环：等待 DLL 变更信号，diff 后触发事件
   * @private
   */
  _pollLoop() {
    if (!this._running) return;

    bt.bt_wait_for_changes(1000);

    if (!this._running) return;

    try {
      this._drainChanges();
    } catch (err) {
      this.emit('error', err);
    }

    setImmediate(() => this._pollLoop());
  }

  /**
   * 拉取最新设备列表，与缓存 diff 后触发事件
   * @private
   */
  _drainChanges() {
    const devices = callJson('bt_get_monitored_devices');
    if (!Array.isArray(devices)) return;

    const currentIds = new Set();

    for (const raw of devices) {
      const id = raw.deviceId;
      if (!id) continue;
      currentIds.add(id);

      const normalized = this._normalizeDevice(raw);
      const prev = this._cache.get(id);

      if (!prev) {
        this._cache.set(id, normalized);
        this.emit('device-added', normalized);
      } else {
        this._emitIfChanged(id, prev, normalized);
        this._cache.set(id, normalized);
      }
    }

    for (const [id] of this._cache) {
      if (!currentIds.has(id)) {
        this._cache.delete(id);
        this.emit('device-removed', id);
      }
    }
  }

  /**
   * 比较并触发变更事件
   * @private
   */
  _emitIfChanged(id, prev, curr) {
    // 连接状态变化
    if (prev.isConnected !== curr.isConnected) {
      if (curr.isConnected) {
        this.emit('device-connected', curr);
      } else {
        this.emit('device-disconnected', id);
      }
    }

    // 其他属性变化（名称、信号强度等）
    if (
      prev.name !== curr.name ||
      prev.signalStrength !== curr.signalStrength ||
      prev.isPaired !== curr.isPaired ||
      prev.bluetoothAddress !== curr.bluetoothAddress
    ) {
      this.emit('device-updated', curr);
    }
  }

  /**
   * 标准化设备数据
   * @private
   */
  _normalizeDevice(raw) {
    return {
      deviceId: raw.deviceId || '',
      name: raw.name || null,
      bluetoothAddress: raw.bluetoothAddress || null,
      isConnected: !!raw.isConnected,
      isPaired: !!raw.isPaired,
      signalStrength: raw.signalStrength ?? null,
      deviceClass: raw.deviceClass ?? null,
      appearance: raw.appearance ?? null,
      serviceUuids: raw.serviceUuids || [],
    };
  }
}

module.exports = { BluetoothMonitor };
