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
 * @file AgentContent.tsx
 * @description Agent 状态内容组件 — 流式 AI 响应展示
 * @author 鸡哥
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import useIslandStore from '../../../store/isLandStore';
import {
  streamMihtnelisAgent,
  resolveMihtnelisWebAccess,
  resolveMihtnelisLocalToolAccess,
  resolveMihtnelisLocalToolResult,
} from '../../../api/ai/mihtnelisAgentStream';
import type { MihtnelisAgentStreamEvent } from '../../../api/ai/mihtnelisAgentStream';
import { streamOllamaLocalAgent } from '../../../api/ai/ollamaLocalAgent';
import { streamCustomDirectAgent } from '../../../api/ai/customDirectAgent';
import { readLocalToken, getRoleFromToken } from '../../../utils/userAccount';
import { loadLocationFromStorage } from '../../../store/utils/storage';
import { buildMihtnelisContext } from '../../states/maxExpand/components/agent/utils/chatUtils';
import type { AiChatMessage } from '../../../store/types';
import type { AgentPhase, AuthPending } from './config/agentContentConfig';
import { INLINE_PROMPT_HINT } from './config/agentContentConfig';
import { loadAgentMode } from './utils/agentMode';
import { isClientLocalToolName, isHighRiskLocalToolName } from './utils/agentToolPolicy';
import { useAgentAutoScroll } from './hooks/useAgentAutoScroll';
import { useAgentDisplayState } from './hooks/useAgentDisplayState';
import { AgentContentView } from './components/AgentContentView';
import '../../../styles/agent/agent.css';

/**
 * Agent 状态内容组件
 * @description 与 notification 尺寸一致（500×88），左侧状态图 + 右侧流式文本
 */
export function AgentContent(): ReactElement {
  const agentPrompt = useIslandStore((s) => s.agentPrompt);
  const setIdle = useIslandStore((s) => s.setIdle);
  const aiConfig = useIslandStore((s) => s.aiConfig);

  const [phase, setPhase] = useState<AgentPhase>('connecting');
  const [thinkText, setThinkText] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [authPending, setAuthPending] = useState<AuthPending | null>(null);
  const [toolCallInfo, setToolCallInfo] = useState<{ tool: string; purpose: string } | null>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const answerAccRef = useRef('');
  const thinkAccRef = useRef('');
  const traceIdRef = useRef('');
  const tokenRef = useRef('');

  useAgentAutoScroll({
    textRef,
    thinkText,
    answerText,
  });

  useEffect(() => {
    const token = readLocalToken();
    if (!token || !agentPrompt.trim()) {
      setPhase('error');
      setErrorMsg(!token ? '请先登录' : '没有输入内容');
      return;
    }
    tokenRef.current = token;

    const controller = new AbortController();
    abortRef.current = controller;
    let active = true;

    const run = async (): Promise<void> => {
      setPhase('connecting');
      setThinkText('');
      setAnswerText('');
      setErrorMsg('');
      setAuthPending(null);
      setToolCallInfo(null);
      answerAccRef.current = '';
      thinkAccRef.current = '';
      traceIdRef.current = '';

      const isOllama = aiConfig.model === 'ollama';
      const isCustomApi = aiConfig.model === 'custom-api';
      const userRole = getRoleFromToken(token);
      const isProUser = userRole === 'pro' || userRole === 'admin';
      const useCustomApi = isCustomApi && isProUser && Boolean(aiConfig.apiKey?.trim() && aiConfig.endpoint?.trim());
      const availableModels = ['deepseek-v4-flash', 'deepseek-v4-pro', 'mimo-v2.5', 'mimo-v2.5-pro', 'MiniMax-M2.7', 'MiniMax-M2.7-highspeed', 'MiniMax-M2.5', 'MiniMax-M2.5-highspeed'];
      const selectedModelBase = isOllama ? 'ollama'
        : useCustomApi ? (aiConfig.customApiModel?.trim() || 'gpt-4o-mini')
        : (availableModels.includes(aiConfig.model) ? aiConfig.model : 'deepseek-v4-flash');
      const selectedModel = (!isProUser && (selectedModelBase === 'deepseek-v4-pro'
        || selectedModelBase === 'mimo-v2.5-pro'
        || selectedModelBase === 'MiniMax-M2.7-highspeed'
        || selectedModelBase === 'MiniMax-M2.5-highspeed'))
        ? 'deepseek-v4-flash'
        : selectedModelBase;
      const isMinimaxModel = (modelName: string): boolean => {
        const normalized = modelName.toLowerCase();
        return normalized.startsWith('MiniMax-');
      };
      const selectedProvider = isOllama ? 'ollama'
        : useCustomApi ? 'custom'
        : (selectedModel.startsWith('mimo-') ? 'mimo' : (isMinimaxModel(selectedModel) ? 'MiniMax' : 'deepseek'));
      const agentMode = loadAgentMode();

      const state = useIslandStore.getState();
      const activeSessionId = state.activeAiChatSessionId;
      const activeSession = state.aiChatSessions.find((s) => s.id === activeSessionId);
      const sessionMessages = activeSession?.messages ?? [];
      const context = buildMihtnelisContext(sessionMessages);

      const enabledSkills = Array.isArray(aiConfig.skills) ? aiConfig.skills.filter((s) => s.enabled && s.filePath) : [];
      let resolvedSkills: Array<{ name: string; content: string }> | undefined;
      if (enabledSkills.length > 0) {
        const results = await Promise.all(
          enabledSkills.map(async (s) => {
            const content = await window.api.readTextFile(s.filePath);
            return content ? { name: s.name, content } : null;
          }),
        );
        const valid = results.filter((r): r is { name: string; content: string } => r !== null && r.content.trim().length > 0);
        if (valid.length > 0) resolvedSkills = valid;
      }

      const message = `${INLINE_PROMPT_HINT}\n\n${agentPrompt.trim()}`;

      // ── 通用事件处理器（Ollama 和 Mihtnelis 共用） ──
      const handleEvent = (event: MihtnelisAgentStreamEvent): void => {
        if (!active) return;

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
          const payload = event.payload as { tool?: unknown; turn?: unknown; success?: unknown };
          const hasResult = payload?.success !== undefined;
          if (hasResult) setToolCallInfo(null);
          return;
        }

        if (event.type === 'tool_call_request') {
          const payload = event.payload as {
            turn?: unknown; requestId?: unknown; tool?: unknown; purpose?: unknown;
            riskLevel?: unknown; authorizationRequired?: unknown; message?: unknown;
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

          // Ollama 工具调用由编排器自动处理，无需客户端介入
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
              const execution = await executor({ tool, arguments: argumentsPayload, workspaces: aiConfig.workspaces });
              await resolveMihtnelisLocalToolResult({
                token, requestId,
                success: Boolean(execution?.success),
                result: execution?.result,
                error: typeof execution?.error === 'string' ? execution.error : '',
                durationMs: typeof execution?.durationMs === 'number' ? execution.durationMs : 0,
              });
            } catch { /* ignore */ }
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
          return;
        }
      };

      try {
        if (isOllama) {
          // ── Ollama 本地模型分支 ──
          const ollamaModelName = aiConfig.ollamaModel || 'qwen3:8b';
          const ollamaTemperature = aiConfig.deepseekReasoningEffort === 'low' ? 0.3 : aiConfig.deepseekReasoningEffort === 'high' ? 1.0 : 0.6;
          await streamOllamaLocalAgent({
            token: token || '',
            message,
            model: ollamaModelName,
            agentMode,
            context: context || undefined,
            workspaces: aiConfig.workspaces,
            skills: resolvedSkills,
            baseUrl: aiConfig.ollamaBaseUrl || undefined,
            temperature: ollamaTemperature,
            signal: controller.signal,
            onEvent: handleEvent,
          });
        } else if (useCustomApi && aiConfig.customApiMode === 'direct') {
          // ── 自定义 API 直连模式分支 ──
          const directModelName = aiConfig.customApiModel?.trim() || 'gpt-4o-mini';
          const directTemperature = aiConfig.deepseekReasoningEffort === 'low' ? 0.3 : aiConfig.deepseekReasoningEffort === 'high' ? 1.0 : 0.6;
          await streamCustomDirectAgent({
            token: token || '',
            message,
            model: directModelName,
            agentMode,
            context: context || undefined,
            workspaces: aiConfig.workspaces,
            skills: resolvedSkills,
            snapshotMode: true,
            baseUrl: aiConfig.endpoint,
            apiKey: aiConfig.apiKey,
            temperature: directTemperature,
            signal: controller.signal,
            onEvent: handleEvent,
          });
        } else if (useCustomApi) {
          // ── 自定义 API 服务器转发分支（仅 Pro 用户） ──
          const customModelName = aiConfig.customApiModel?.trim() || 'gpt-4o-mini';
          await streamMihtnelisAgent({
            token,
            sessionId: activeSessionId || 'island-agent-inline',
            message,
            provider: 'custom',
            model: customModelName,
            agentMode,
            context: context || undefined,
            workspaces: aiConfig.workspaces,
            skills: resolvedSkills,
            snapshotMode: true,
            thinking: aiConfig.deepseekThinking,
            reasoningEffort: aiConfig.deepseekReasoningEffort,
            timestamp: (() => {
              const d = new Date();
              const off = -d.getTimezoneOffset();
              const sign = off >= 0 ? '+' : '-';
              const pad = (n: number): string => String(Math.abs(n)).padStart(2, '0');
              return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${sign}${pad(Math.floor(Math.abs(off) / 60))}:${pad(Math.abs(off) % 60)}`;
            })(),
            location: (() => {
              const loc = loadLocationFromStorage();
              if (!loc) return undefined;
              const parts = [loc.city, loc.regionName, loc.country].filter(Boolean);
              return parts.length > 0 ? parts.join(', ') : undefined;
            })(),
            customApiKey: aiConfig.apiKey,
            customEndpoint: aiConfig.endpoint,
            signal: controller.signal,
            onEvent: handleEvent,
          });
        } else {
          // ── Mihtnelis 云端模型分支 ──
          await streamMihtnelisAgent({
            token,
            sessionId: activeSessionId || 'island-agent-inline',
            message,
            provider: selectedProvider,
            model: selectedModel,
            agentMode,
            context: context || undefined,
            workspaces: aiConfig.workspaces,
            skills: resolvedSkills,
            snapshotMode: true,
            thinking: aiConfig.deepseekThinking,
            reasoningEffort: aiConfig.deepseekReasoningEffort,
            timestamp: (() => {
              const d = new Date();
              const off = -d.getTimezoneOffset();
              const sign = off >= 0 ? '+' : '-';
              const pad = (n: number): string => String(Math.abs(n)).padStart(2, '0');
              return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${sign}${pad(Math.floor(Math.abs(off) / 60))}:${pad(Math.abs(off) % 60)}`;
            })(),
            location: (() => {
              const loc = loadLocationFromStorage();
              if (!loc) return undefined;
              const parts = [loc.city, loc.regionName, loc.country].filter(Boolean);
              return parts.length > 0 ? parts.join(', ') : undefined;
            })(),
            signal: controller.signal,
            onEvent: handleEvent,
          });
        }

        if (active) {
          setPhase((prev) => (prev === 'error' ? prev : 'done'));
          const finalAnswer = answerAccRef.current.trim();
          if (finalAnswer) {
            const store = useIslandStore.getState();
            const sid = store.activeAiChatSessionId;
            const session = store.aiChatSessions.find((s) => s.id === sid);
            const prev = session?.messages ?? [];
            const userMsg: AiChatMessage = { role: 'user', content: agentPrompt.trim() };
            const assistantMsg: AiChatMessage = {
              role: 'assistant',
              content: finalAnswer,
              model: selectedModel,
              finalized: true,
              traceId: traceIdRef.current || undefined,
              ...(thinkAccRef.current ? { thinkBlocks: [thinkAccRef.current] } : {}),
            };
            store.setAiChatSessionMessages(sid, [...prev, userMsg, assistantMsg]);
          }
        }
      } catch (err: unknown) {
        if (!active) return;
        if (controller.signal.aborted) return;
        const msg = err instanceof Error ? err.message : '请求失败';
        setPhase('error');
        setErrorMsg(msg);
      }
    };

    void run();

    return () => {
      active = false;
      controller.abort();
      abortRef.current = null;
    };
  }, [agentPrompt, aiConfig.apiKey, aiConfig.endpoint, aiConfig.model, aiConfig.customApiModel, aiConfig.deepseekThinking, aiConfig.deepseekReasoningEffort, aiConfig.workspaces, aiConfig.skills]);

  const handleAuthDecision = useCallback(async (allow: boolean) => {
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
              execution = await executor({ tool: auth.tool!, arguments: auth.argumentsPayload ?? {}, workspaces: aiConfig.workspaces });
            } catch (e: unknown) {
              execution = { success: false, result: {}, error: e instanceof Error ? e.message : '本地工具执行失败', durationMs: 0 };
            }
            await resolveMihtnelisLocalToolResult({
              token, requestId: auth.requestId,
              success: Boolean(execution?.success),
              result: execution?.result,
              error: typeof execution?.error === 'string' ? execution.error : '',
              durationMs: typeof execution?.durationMs === 'number' ? execution.durationMs : 0,
            });
          }
        }
    }
    } catch { /* ignore resolve errors */ }
  }, [authPending, aiConfig.workspaces]);

  const {
    overlayText,
    overlayLabel,
    isThinkOnly,
    renderedDisplay,
  } = useAgentDisplayState({
    phase,
    answerText,
    thinkText,
    errorMsg,
    authPending,
    toolCallInfo,
  });

  return (
    <AgentContentView
      phase={phase}
      overlayLabel={overlayLabel}
      renderedDisplay={renderedDisplay}
      textRef={textRef}
      overlayText={overlayText}
      isThinkOnly={isThinkOnly}
      authPending={authPending}
      onClose={() => setIdle(true)}
      onDeny={() => { void handleAuthDecision(false); }}
      onAllow={() => { void handleAuthDecision(true); }}
    />
  );
}
