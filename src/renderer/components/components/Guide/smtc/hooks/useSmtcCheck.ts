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
 * @file useSmtcCheck.ts
 * @description 引导 SMTC 检查步骤 — SMTC 检测逻辑 Hook
 * @author 鸡哥
 */

import { useState, useCallback } from 'react';

/** 检测状态 */
export type SmtcCheckStatus = 'idle' | 'checking' | 'found' | 'not-found';

interface UseSmtcCheckReturn {
  /** 当前检测状态 */
  status: SmtcCheckStatus;
  /** 触发检测 */
  check: () => void;
}

/**
 * SMTC 检测逻辑 Hook
 * @description 管理检测状态，触发 SMTC 媒体会话检测
 */
export function useSmtcCheck(): UseSmtcCheckReturn {
  const [status, setStatus] = useState<SmtcCheckStatus>('idle');

  const check = useCallback((): void => {
    setStatus('checking');
    // TODO: 接入实际 SMTC 检测 IPC
    setTimeout(() => {
      setStatus('not-found');
    }, 1500);
  }, []);

  return { status, check };
}
