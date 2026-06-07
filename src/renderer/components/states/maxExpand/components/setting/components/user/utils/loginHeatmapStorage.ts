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
 * @file index.ts
 * @description 登录天数热力图本地存储：按用户记录每个自然日是否登录，独立于其它本地存储。
 * @author 鸡哥
 */

/** 登录天数存储键，结构为 `{ [username]: string[] }`，值为 `年-月-日` */
export const LOGIN_HEATMAP_STORAGE_KEY = 'island_login_days';

type LoginDaysStore = Record<string, string[]>;

/** 生成今日的 `年-月-日` 键，月、日均不补零，与热力图网格保持一致 */
function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function readStore(): LoginDaysStore {
  try {
    const raw = localStorage.getItem(LOGIN_HEATMAP_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return parsed as LoginDaysStore;
  } catch {
    return {};
  }
}

function writeStore(store: LoginDaysStore): void {
  try {
    localStorage.setItem(LOGIN_HEATMAP_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // 忽略存储异常
  }
}

/**
 * 读取指定用户的登录天数集合。
 * @param username 当前登录用户名。
 * @returns 登录日期键集合（`年-月-日`）。
 */
export function readLoginDays(username: string | null | undefined): Set<string> {
  if (!username) return new Set();
  const days = readStore()[username];
  return new Set(Array.isArray(days) ? days : []);
}

/**
 * 记录指定用户今日已登录。若今日已记录则不做改动。
 * @param username 当前登录用户名。
 * @returns 是否新增了今日记录。
 */
export function recordLoginDay(username: string | null | undefined): boolean {
  if (!username) return false;
  const store = readStore();
  const days = Array.isArray(store[username]) ? store[username] : [];
  const key = todayKey();
  if (days.includes(key)) return false;
  store[username] = [...days, key];
  writeStore(store);
  return true;
}
