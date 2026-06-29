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
 * @file ffi-loader.js
 * @description 通过 koffi 加载 Native AOT DLL，定义所有 C 函数签名
 */

const path = require('node:path');
const koffi = require('koffi');

const TFM = 'net10.0-windows10.0.19041.0';

/** DLL 搜索路径（优先 native 自包含版本） */
const dllCandidates = [
  path.join(__dirname, 'bt-ctypes', 'bin', 'Release', TFM, 'win-x64', 'native', 'eIslandBluetoothCtypes.dll'),
  path.join(__dirname, 'bt-ctypes', 'bin', 'Release', TFM, 'win-x64', 'eIslandBluetoothCtypes.dll'),
];

let dllPath;
for (const candidate of dllCandidates) {
  try {
    require('node:fs').accessSync(candidate);
    dllPath = candidate;
    break;
  } catch { /* try next */ }
}

if (!dllPath) {
  throw new Error(
    'Unable to find eIslandBluetoothCtypes.dll. Run "npm run build:ctypes" first.'
  );
}

/** 加载 DLL */
const lib = koffi.load(dllPath);

/**
 * koffi 的 'str' 返回类型会自动：
 * 1. 读取 CoTaskMem 分配的 UTF-8 字符串
 * 2. 复制为 JS 字符串
 * 3. 调用 CoTaskMemFree 释放原始指针
 */
const bt = {
  // ── 字符串释放 ──
  bt_free_string:          lib.func('void bt_free_string(void*)'),
  bt_get_last_error:       lib.func('str bt_get_last_error()'),

  // ── 设备查询 ──
  bt_get_paired_devices:   lib.func('str bt_get_paired_devices()'),
  bt_get_connected_devices: lib.func('str bt_get_connected_devices()'),
  bt_get_all_devices:      lib.func('str bt_get_all_devices()'),
  bt_get_device:           lib.func('str bt_get_device(str)'),

  // ── 设备监控 ──
  bt_start_monitoring:     lib.func('int bt_start_monitoring()'),
  bt_stop_monitoring:      lib.func('int bt_stop_monitoring()'),
  bt_wait_for_changes:     lib.func('int bt_wait_for_changes(int)'),
  bt_get_changes_count:    lib.func('int bt_get_changes_count()'),
  bt_get_monitored_devices: lib.func('str bt_get_monitored_devices()'),
  bt_get_monitored_device: lib.func('str bt_get_monitored_device(str)'),
};

/**
 * 调用返回 JSON 字符串的 DLL 函数，解析并返回对象
 * @param {string} fnName - bt 函数名
 * @param {any[]} args - 参数
 * @returns {any|null}
 */
function callJson(fnName, ...args) {
  const str = bt[fnName](...args);
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

/**
 * 获取最后一次 DLL 错误信息
 * @returns {string}
 */
function getLastError() {
  return bt.bt_get_last_error() || '';
}

module.exports = { bt, callJson, getLastError, dllPath };
