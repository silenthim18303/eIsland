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
 * @file AgentContentView.tsx
 * @description Agent 状态内容展示组件。
 * @author 鸡哥
 */

import type { ReactElement, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { AgentPhase, AuthPending } from '../config/agentContentConfig';
import { PHASE_IMAGE, PHASE_LABEL } from '../config/agentContentConfig';

interface AgentContentViewProps {
  phase: AgentPhase;
  overlayLabel: string | null;
  renderedDisplay: ReactNode;
  textRef: React.RefObject<HTMLDivElement | null>;
  overlayText: string | null;
  isThinkOnly: boolean;
  authPending: AuthPending | null;
  onClose: () => void;
  onAllow: () => void;
  onDeny: () => void;
}

/**
 * @description 渲染 Agent 文本区与授权操作区。
 * @param props - Agent 内容视图参数。
 * @returns Agent 内容视图节点。
 */
export function AgentContentView(props: AgentContentViewProps): ReactElement {
  const { t } = useTranslation();
  const {
    phase,
    overlayLabel,
    renderedDisplay,
    textRef,
    overlayText,
    isThinkOnly,
    authPending,
    onClose,
    onAllow,
    onDeny,
  } = props;

  return (
    <div className="agent-content">
      <img
        className="agent-icon"
        src={PHASE_IMAGE[phase]}
        alt=""
        draggable={false}
      />
      <div className="agent-text-area">
        <span className="agent-text-label">
          {overlayLabel ?? PHASE_LABEL[phase]}
        </span>
        <div
          ref={textRef}
          className={`agent-text-body${overlayText ? ' agent-text-auth' : isThinkOnly ? ' agent-text-thinking' : ''}${phase === 'error' ? ' agent-text-error' : ''}`}
        >
          {renderedDisplay}
        </div>
      </div>
      <div className="agent-actions">
        {authPending ? (
          <>
            <button className="agent-action-btn agent-action-deny" onClick={onDeny}>{t('agent.actions.denyAuth', { defaultValue: '不授权' })}</button>
            <button className="agent-action-btn agent-action-allow" onClick={onAllow}>{t('agent.actions.allowAuth', { defaultValue: '授权' })}</button>
          </>
        ) : (
          <button className="agent-action-btn" onClick={onClose}>{t('agent.actions.close', { defaultValue: '关闭' })}</button>
        )}
      </div>
    </div>
  );
}
