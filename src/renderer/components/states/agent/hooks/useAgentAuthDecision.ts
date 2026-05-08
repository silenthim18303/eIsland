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
 * @file useAgentAuthDecision.ts
 * @description Agent 授权决策处理 Hook。
 * @author 鸡哥
 */

import { useCallback } from 'react';
import {
  resolveMihtnelisWebAccess,
  resolveMihtnelisLocalToolAccess,
  resolveMihtnelisLocalToolResult,
} from '../../../../api/ai/mihtnelisAgentStream';
import type { AuthPending } from '../config/agentContentConfig';

interface UseAgentAuthDecisionOptions {
  authPending: AuthPending | null;
  setAuthPending: React.Dispatch<React.SetStateAction<AuthPending | null>>;
  tokenRef: React.MutableRefObject<string>;
  workspaces: string[];
}

/**
 * @description 返回处理 Agent 授权通过/拒绝的回调。
 * @param options - Agent 授权决策配置。
 * @returns 授权决策执行函数。
 */
export function useAgentAuthDecision(options: UseAgentAuthDecisionOptions): (allow: boolean) => Promise<void> {
  const {
    authPending,
    setAuthPending,
    tokenRef,
    workspaces,
  } = options;

  return useCallback(async (allow: boolean) => {
    const auth = authPending;
    if (!auth) return;
    const token = tokenRef.current;
    if (!token) return;

    setAuthPending(null);

    try {
      if (auth.type === 'web') {
        await resolveMihtnelisWebAccess({ token, requestId: auth.requestId, allow });
      } else if (auth.type === 'tool') {
        await resolveMihtnelisLocalToolAccess({ token, requestId: auth.requestId, allow });
        if (allow) {
          const executor = window.api?.executeAgentLocalTool;
          if (typeof executor !== 'function') {
            await resolveMihtnelisLocalToolResult({ token, requestId: auth.requestId, success: false, result: {}, error: 'LOCAL_RUNTIME_UNAVAILABLE', durationMs: 0 });
          } else {
            let execution: { success?: boolean; result?: unknown; error?: string; durationMs?: number } = {};
            try {
              execution = await executor({ tool: auth.tool!, arguments: auth.argumentsPayload ?? {}, workspaces });
            } catch (e: unknown) {
              execution = { success: false, result: {}, error: e instanceof Error ? e.message : '本地工具执行失败', durationMs: 0 };
            }
            await resolveMihtnelisLocalToolResult({
              token,
              requestId: auth.requestId,
              success: Boolean(execution?.success),
              result: execution?.result,
              error: typeof execution?.error === 'string' ? execution.error : '',
              durationMs: typeof execution?.durationMs === 'number' ? execution.durationMs : 0,
            });
          }
        }
      }
    } catch {
      // ignore resolve errors
    }
  }, [authPending, setAuthPending, tokenRef, workspaces]);
}
