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
const fs = require('node:fs');
const koffi = require('koffi');

const TFM = 'net10.0-windows10.0.19041.0';

/** DLL 搜索路径（优先 native 自包含版本） */
const dllCandidates = [
  path.join(__dirname, 'src', 'bin', 'Release', TFM, 'win-x64', 'native', 'eIslandAppIconHelper.dll'),
  path.join(__dirname, 'src', 'bin', 'Release', TFM, 'win-x64', 'eIslandAppIconHelper.dll'),
];

function toUnpackedDllPath(candidate) {
  return candidate.replace(`${path.sep}app.asar${path.sep}`, `${path.sep}app.asar.unpacked${path.sep}`);
}

let dllPath;
for (const candidate of dllCandidates) {
  const loadableCandidate = toUnpackedDllPath(candidate);
  try {
    fs.accessSync(loadableCandidate);
    dllPath = loadableCandidate;
    break;
  } catch { /* try next */ }
}

if (!dllPath) {
  throw new Error(
    'Unable to find eIslandAppIconHelper.dll. Run "npm run build" first.'
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
const icon = {
  // ── 字符串释放 ──
  icon_free_string:        lib.func('void icon_free_string(void*)'),

  // ── 图标获取（返回 base64 PNG 字符串） ──
  icon_get_by_process_name: lib.func('str icon_get_by_process_name(str)'),
  icon_get_by_pid:         lib.func('str icon_get_by_pid(uint)'),
  icon_get_by_path:        lib.func('str icon_get_by_path(str)'),
  icon_get_by_shortcut:    lib.func('str icon_get_by_shortcut(str)'),
};

/**
 * 调用 DLL 函数获取图标，解码 base64 为 Buffer
 * @param {string} fnName - icon 函数名
 * @param {any[]} args - 参数
 * @returns {Buffer|null}
 */
function callIcon(fnName, ...args) {
  const b64 = icon[fnName](...args);
  if (!b64) return null;
  return Buffer.from(b64, 'base64');
}

module.exports = { icon, callIcon, dllPath };
