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

import type { ReactElement, ReactNode } from 'react';
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

export function AgentContentView(props: AgentContentViewProps): ReactElement {
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
            <button className="agent-action-btn agent-action-deny" onClick={onDeny}>不授权</button>
            <button className="agent-action-btn agent-action-allow" onClick={onAllow}>授权</button>
          </>
        ) : (
          <button className="agent-action-btn" onClick={onClose}>关闭</button>
        )}
      </div>
    </div>
  );
}
