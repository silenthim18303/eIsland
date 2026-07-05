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
 * @file useAgentDisplayState.ts
 * @description Agent 展示态计算 Hook。
 * @author 鸡哥
 */

import { useMemo } from 'react';
import type { ReactNode } from 'react';
import type { AgentPhase } from '../config/agentContentConfig';
import type { AuthPending } from '../types/AuthPending';
import { renderInlineMarkdown } from '../utils/renderInlineMarkdown';
import { PHASE_LABEL } from '../config/agentContentConfig';

interface UseAgentDisplayStateOptions {
  phase: AgentPhase;
  answerText: string;
  thinkText: string;
  errorMsg: string;
  authPending: AuthPending | null;
  toolCallInfo: { tool: string; purpose: string } | null;
}

interface AgentDisplayState {
  overlayText: string | null;
  overlayLabel: string | null;
  isThinkOnly: boolean;
  renderedDisplay: ReactNode;
}

/**
 * @description 计算 Agent UI 展示文本与状态。
 * @param options - 展示态计算参数。
 * @returns Agent 展示态数据。
 */
export function useAgentDisplayState(options: UseAgentDisplayStateOptions): AgentDisplayState {
  const {
    phase,
    answerText,
    thinkText,
    errorMsg,
    authPending,
    toolCallInfo,
  } = options;

  const overlayText = authPending ? authPending.description : toolCallInfo ? toolCallInfo.purpose : null;
  const overlayLabel = authPending ? '需要授权' : toolCallInfo ? `正在调用: ${toolCallInfo.tool}` : null;
  const displayText = (answerText || thinkText || errorMsg || PHASE_LABEL[phase]).replace(/\n{2,}/g, '\n');
  const isThinkOnly = !answerText && !!thinkText;

  const renderedDisplay = useMemo(() => {
    if (overlayText) return overlayText;
    return renderInlineMarkdown(displayText);
  }, [overlayText, displayText]);

  return {
    overlayText,
    overlayLabel,
    isThinkOnly,
    renderedDisplay,
  };
}
