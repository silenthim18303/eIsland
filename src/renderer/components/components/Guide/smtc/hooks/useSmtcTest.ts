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
 * @file useSmtcTest.ts
 * @description 引导 SMTC 媒体测试 Hook — 订阅单例状态
 * @author 鸡哥
 */

import { useState, useEffect, useCallback } from 'react';
import type { UseSmtcTestReturn } from '../types';
import { runtime } from '../utils/smtcStore';
import { ensureInitialized, retry as retryAction } from '../utils/smtcActions';

/**
 * SMTC 媒体测试 Hook
 * @description 订阅模块级单例状态，跨挂载持久化
 */
export function useSmtcTest(): UseSmtcTestReturn {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const listener = (): void => forceUpdate((n) => n + 1);
    runtime.listeners.add(listener);
    ensureInitialized();
    return () => { runtime.listeners.delete(listener); };
  }, []);

  const retry = useCallback(() => { retryAction(); }, []);

  return { status: runtime.status, meta: runtime.meta, retry };
}
