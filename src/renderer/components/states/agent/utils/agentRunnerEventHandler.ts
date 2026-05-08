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
 * @file agentRunnerEventHandler.ts
 * @description Agent 流式事件处理器构建工具。
 * @author 鸡哥
 */

import type React from 'react';
import { resolveMihtnelisLocalToolResult } from '../../../../api/ai/mihtnelisAgentStream';
import type { MihtnelisAgentStreamEvent } from '../../../../api/ai/mihtnelisAgentStream';
import type { AuthPending, AgentPhase } from '../config/agentContentConfig';
import { isClientLocalToolName, isHighRiskLocalToolName } from './agentToolPolicy';

interface CreateAgentStreamEventHandlerOptions {
  isActive: () => boolean;
  isOllama: boolean;
  token: string;
  workspaces: string[];
  setPhase: React.Dispatch<React.SetStateAction<AgentPhase>>;
  setThinkText: React.Dispatch<React.SetStateAction<string>>;
  setAnswerText: React.Dispatch<React.SetStateAction<string>>;
  setErrorMsg: React.Dispatch<React.SetStateAction<string>>;
  setAuthPending: React.Dispatch<React.SetStateAction<AuthPending | null>>;
  setToolCallInfo: React.Dispatch<React.SetStateAction<{ tool: string; purpose: string } | null>>;
  answerAccRef: React.MutableRefObject<string>;
  thinkAccRef: React.MutableRefObject<string>;
  traceIdRef: React.MutableRefObject<string>;
}

/**
 * @description 创建 Agent 流式事件处理函数。
 * @param options - 流式事件处理器配置。
 * @returns 处理单个流事件的回调函数。
 */
export function createAgentStreamEventHandler(options: CreateAgentStreamEventHandlerOptions): (event: MihtnelisAgentStreamEvent) => void {
  const {
    isActive,
    isOllama,
    token,
    workspaces,
    setPhase,
    setThinkText,
    setAnswerText,
    setErrorMsg,
    setAuthPending,
    setToolCallInfo,
    answerAccRef,
    thinkAccRef,
    traceIdRef,
  } = options;

  return (event: MihtnelisAgentStreamEvent): void => {
    if (!isActive()) return;

    if (event.type === 'think') {
      setPhase('thinking');
      const payload = event.payload as { text?: unknown };
      const text = typeof payload?.text === 'string' ? payload.text : '';
      if (text) {
        thinkAccRef.current += text;
        setThinkText((prev) => prev + text);
      }
      return;
    }

    if (event.type === 'chunk') {
      setPhase('answering');
      setToolCallInfo(null);
      const payload = event.payload as { text?: unknown };
      const text = typeof payload?.text === 'string' ? payload.text : '';
      if (text) {
        answerAccRef.current += text;
        setAnswerText((prev) => prev + text);
      }
      return;
    }

    if (event.type === 'chunk_reset' || (event.type as string) === 'stream_rollback') {
      answerAccRef.current = '';
      setAnswerText('');
      return;
    }

    if (event.type === 'tool') {
      setPhase('toolCalling');
      const payload = event.payload as { success?: unknown };
      const hasResult = payload?.success !== undefined;
      if (hasResult) setToolCallInfo(null);
      return;
    }

    if (event.type === 'tool_call_request') {
      const payload = event.payload as {
        requestId?: unknown; tool?: unknown; purpose?: unknown;
        authorizationRequired?: unknown; message?: unknown;
        arguments?: unknown;
      };
      const requestId = typeof payload?.requestId === 'string' ? payload.requestId.trim() : '';
      const tool = typeof payload?.tool === 'string' ? payload.tool.trim() : '';
      const purpose = typeof payload?.purpose === 'string' ? payload.purpose.trim() : '';
      const authorizationRequired = Boolean(payload?.authorizationRequired);
      const authMessage = typeof payload?.message === 'string' ? payload.message : '';
      const argumentsPayload = typeof payload?.arguments === 'object' && payload?.arguments !== null
        ? payload.arguments as Record<string, unknown> : {};
      if (!tool) return;

      setPhase('toolCalling');
      setToolCallInfo({ tool, purpose: purpose || `调用 ${tool}` });

      if (isOllama) return;

      const isLocal = isClientLocalToolName(tool);
      if (!isLocal || !requestId) return;

      const needsAuth = authorizationRequired || isHighRiskLocalToolName(tool);
      if (needsAuth) {
        const desc = authMessage || purpose || `工具 ${tool} 请求授权`;
        setAuthPending({ type: 'tool', requestId, description: desc, tool, argumentsPayload });
        return;
      }

      void (async () => {
        try {
          const executor = window.api?.executeAgentLocalTool;
          if (typeof executor !== 'function') {
            await resolveMihtnelisLocalToolResult({ token, requestId, success: false, result: {}, error: 'LOCAL_RUNTIME_UNAVAILABLE', durationMs: 0 });
            return;
          }
          const execution = await executor({ tool, arguments: argumentsPayload, workspaces });
          await resolveMihtnelisLocalToolResult({
            token,
            requestId,
            success: Boolean(execution?.success),
            result: execution?.result,
            error: typeof execution?.error === 'string' ? execution.error : '',
            durationMs: typeof execution?.durationMs === 'number' ? execution.durationMs : 0,
          });
        } catch {
          // ignore
        }
      })();
      return;
    }

    if (event.type === 'tool_call_result') {
      setToolCallInfo(null);
      return;
    }

    if (event.type === 'web_access_request') {
      const payload = event.payload as { requestId?: unknown; url?: unknown; message?: unknown };
      const requestId = typeof payload?.requestId === 'string' ? payload.requestId.trim() : '';
      const url = typeof payload?.url === 'string' ? payload.url.trim() : '';
      if (!requestId || !url) return;
      const desc = typeof payload?.message === 'string' && payload.message ? payload.message : `请求访问: ${url}`;
      setAuthPending({ type: 'web', requestId, description: desc });
      return;
    }

    if (event.type === 'web_access_resolved') {
      setAuthPending((prev) => (prev?.type === 'web' ? null : prev));
      return;
    }

    if (event.type === 'error') {
      const payload = event.payload as { message?: unknown };
      const msg = typeof payload?.message === 'string' ? payload.message : '未知错误';
      setPhase('error');
      setErrorMsg(msg);
      return;
    }

    if (event.type === 'final') {
      const payload = event.payload as { traceId?: unknown; traceid?: unknown; trace_id?: unknown };
      const rawTraceId = payload?.traceId ?? payload?.traceid ?? payload?.trace_id;
      if (typeof rawTraceId === 'string' && rawTraceId.trim()) {
        traceIdRef.current = rawTraceId.trim();
      }
      setPhase('done');
    }
  };
}
