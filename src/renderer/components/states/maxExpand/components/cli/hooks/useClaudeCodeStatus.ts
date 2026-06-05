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
 * @file useClaudeCodeStatus.ts
 * @description Claude Code CLI 面板状态订阅。
 * @author 鸡哥
 */

import { useCallback, useEffect, useState } from 'react';
import { EMPTY_CLI_STATUS, type CliStatusSnapshot } from '../config/types';

export function useClaudeCodeStatus(): {
  snapshot: CliStatusSnapshot;
  loading: boolean;
  actionMessage: string;
  enableHook: () => Promise<void>;
  disableHook: () => Promise<void>;
  clearEvents: () => Promise<void>;
} {
  const [snapshot, setSnapshot] = useState<CliStatusSnapshot>(EMPTY_CLI_STATUS);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    window.api.claudeCodeStatusGet().then((next) => {
      if (cancelled) return;
      setSnapshot(next);
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });

    const unsubscribe = window.api.onClaudeCodeStatusUpdated((next) => {
      setSnapshot(next);
      setLoading(false);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const enableHook = useCallback(async (): Promise<void> => {
    setActionMessage('');
    const result = await window.api.claudeCodeHookInstall();
    setSnapshot(result.snapshot);
    setActionMessage(result.message);
  }, []);

  const disableHook = useCallback(async (): Promise<void> => {
    setActionMessage('');
    const result = await window.api.claudeCodeHookUninstall();
    setSnapshot(result.snapshot);
    setActionMessage(result.message);
  }, []);

  const clearEvents = useCallback(async (): Promise<void> => {
    const next = await window.api.claudeCodeEventsClear();
    setSnapshot(next);
  }, []);

  return { snapshot, loading, actionMessage, enableHook, disableHook, clearEvents };
}