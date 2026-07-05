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

import { useRef, useState } from 'react';
import type { ReactElement } from 'react';
import useIslandStore from '../../../store/isLandStore';
import type { AgentPhase } from './config/agentContentConfig';
import type { AuthPending } from './types/AuthPending';
import { useAgentAutoScroll } from './hooks/useAgentAutoScroll';
import { useAgentDisplayState } from './hooks/useAgentDisplayState';
import { useAgentRunner } from './hooks/useAgentRunner';
import { useAgentAuthDecision } from './hooks/useAgentAuthDecision';
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
  const answerAccRef = useRef('');
  const thinkAccRef = useRef('');
  const traceIdRef = useRef('');
  const tokenRef = useRef('');

  useAgentAutoScroll({
    textRef,
    thinkText,
    answerText,
  });

  useAgentRunner({
    agentPrompt,
    aiConfig,
    setPhase,
    setThinkText,
    setAnswerText,
    setErrorMsg,
    setAuthPending,
    setToolCallInfo,
    answerAccRef,
    thinkAccRef,
    traceIdRef,
    tokenRef,
  });

  const handleAuthDecision = useAgentAuthDecision({
    authPending,
    setAuthPending,
    tokenRef,
    workspaces: aiConfig.workspaces,
  });

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
