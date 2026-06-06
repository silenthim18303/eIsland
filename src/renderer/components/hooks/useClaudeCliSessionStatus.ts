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
 * @file useClaudeCliSessionStatus.ts
 * @description 订阅 Claude Code CLI 状态，提供“是否存在活跃会话”的同步只读引用。
 * @author 鸡哥
 */

import { useEffect, useRef } from 'react';

/**
 * @description 以 ref 形式追踪是否存在活跃 Claude 会话（phase 非 completed），不触发组件重渲染。
 * @returns 包含 hasActiveSessionRef 的对象，可在事件回调中同步读取。
 */
export function useClaudeCliSessionStatus(): {
  hasActiveSessionRef: React.MutableRefObject<boolean>;
} {
  const hasActiveSessionRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const applySnapshot = (snapshot: { sessions: Array<{ phase: string }> } | null | undefined): void => {
      if (cancelled || !snapshot) return;
      hasActiveSessionRef.current = snapshot.sessions.some((session) => session.phase !== 'completed');
    };

    window.api?.claudeCodeStatusGet?.().then(applySnapshot).catch(() => {});
    const unsubscribe = window.api?.onClaudeCodeStatusUpdated?.(applySnapshot);

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  return { hasActiveSessionRef };
}
