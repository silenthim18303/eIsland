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
 * @file CliTab.tsx
 * @description Claude Code CLI 状态控制面板。
 * @author 鸡哥
 */

import { useMemo, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useClaudeCodeStatus } from '../hooks/useClaudeCodeStatus';
import type { CliHookEvent, CliSessionSnapshot } from '../config/types';
import '../../../../../../styles/settings/modules/cli.css';

function formatTime(timestamp: number): string {
  if (!timestamp) return '--';
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function phaseClass(phase: CliSessionSnapshot['phase']): string {
  if (phase === 'waiting_permission') return 'waiting';
  if (phase === 'running') return 'running';
  if (phase === 'completed') return 'completed';
  return 'idle';
}

function EventRow({ event }: { event: CliHookEvent }): ReactElement {
  const { t } = useTranslation();
  const visibleDetails = (event.detailItems ?? []).filter((item) => item.value);
  return (
    <details className={`cli-event-row cli-event-${event.kind}`}>
      <summary className="cli-event-summary-toggle">
        <span className="cli-event-name">{event.eventName}</span>
        <span className="cli-event-time">{formatTime(event.createdAt)}</span>
      </summary>
      <div className="cli-event-summary">{event.summary}</div>
      {(event.toolName || event.toolInputPreview) && (
        <div className="cli-event-detail">
          {event.toolName && <span>{event.toolName}</span>}
          {event.toolInputPreview && <code>{event.toolInputPreview}</code>}
        </div>
      )}
      {visibleDetails.length > 0 && (
        <div className="cli-event-detail-list">
          {visibleDetails.map((item) => (
            <div className="cli-event-detail-block" key={item.label}>
              <span>{t(`maxExpand.cli.detail.${item.label}`)}</span>
              <pre>{item.value}</pre>
            </div>
          ))}
        </div>
      )}
    </details>
  );
}

function SessionCard({ session }: { session: CliSessionSnapshot }): ReactElement {
  const latestEvents = session.events.slice(0, 4);
  return (
    <section className="cli-session-card">
      <div className="cli-session-header">
        <div>
          <div className="cli-session-title">{session.title}</div>
          <div className="cli-session-path">{session.cwd ?? session.transcriptPath ?? session.id}</div>
        </div>
        <span className={`cli-phase-pill ${phaseClass(session.phase)}`}>{session.phase}</span>
      </div>
      {session.pendingPermission && (
        <div className="cli-permission-card">
          <div className="cli-permission-title">{session.pendingPermission.summary}</div>
          {session.pendingPermission.toolInputPreview && <code>{session.pendingPermission.toolInputPreview}</code>}
        </div>
      )}
      <div className="cli-session-events">
        {latestEvents.map((event) => <EventRow key={event.id} event={event} />)}
      </div>
    </section>
  );
}

export function CliTab(): ReactElement {
  const { t } = useTranslation();
  const { snapshot, loading, actionMessage, enableHook, disableHook, clearEvents } = useClaudeCodeStatus();
  const activeSessions = useMemo(() => snapshot.sessions.filter((session) => session.phase !== 'completed'), [snapshot.sessions]);
  const pendingCount = snapshot.sessions.filter((session) => session.phase === 'waiting_permission').length;

  return (
    <div className="cli-tab-container" onClick={(event) => event.stopPropagation()}>
      <section className="cli-hero-card">
        <div>
          <div className="cli-eyebrow">{t('maxExpand.cli.eyebrow')}</div>
          <h2>{t('maxExpand.cli.title')}</h2>
          <p>{t('maxExpand.cli.subtitle')}</p>
        </div>
        <div className="cli-hero-actions">
          <button className="cli-primary-button" type="button" onClick={snapshot.enabled ? disableHook : enableHook}>
            {snapshot.enabled ? t('maxExpand.cli.disableHook') : t('maxExpand.cli.enableHook')}
          </button>
          <button className="cli-secondary-button" type="button" onClick={clearEvents} disabled={snapshot.events.length === 0}>
            {t('maxExpand.cli.clear')}
          </button>
        </div>
      </section>

      <div className="cli-status-grid">
        <div className="cli-status-card">
          <span>{t('maxExpand.cli.hookStatus')}</span>
          <strong>{snapshot.enabled ? t('maxExpand.cli.enabled') : t('maxExpand.cli.disabled')}</strong>
        </div>
        <div className="cli-status-card">
          <span>{t('maxExpand.cli.receiverStatus')}</span>
          <strong>{snapshot.receiverRunning ? t('maxExpand.cli.running') : t('maxExpand.cli.stopped')}</strong>
        </div>
        <div className="cli-status-card warning">
          <span>{t('maxExpand.cli.pendingAuth')}</span>
          <strong>{pendingCount}</strong>
        </div>
        <div className="cli-status-card">
          <span>{t('maxExpand.cli.activeSessions')}</span>
          <strong>{activeSessions.length}</strong>
        </div>
      </div>

      {actionMessage && <div className="cli-action-message">{actionMessage}</div>}

      <div className="cli-path-card">
        <div><span>{t('maxExpand.cli.receiverUrl')}</span><code>{snapshot.receiverUrl ?? '--'}</code></div>
        <div><span>{t('maxExpand.cli.settingsPath')}</span><code>{snapshot.settingsPath || '--'}</code></div>
      </div>

      <div className="cli-main-grid">
        <section className="cli-panel-card">
          <div className="cli-section-heading">
            <h3>{t('maxExpand.cli.sessions')}</h3>
            <span>{loading ? t('maxExpand.cli.loading') : t('maxExpand.cli.updatedAt', { time: formatTime(snapshot.updatedAt) })}</span>
          </div>
          <div className="cli-session-list">
            {snapshot.sessions.length === 0 && <div className="cli-empty-state">{t('maxExpand.cli.emptySessions')}</div>}
            {snapshot.sessions.map((session) => <SessionCard key={session.id} session={session} />)}
          </div>
        </section>

        <section className="cli-panel-card">
          <div className="cli-section-heading">
            <h3>{t('maxExpand.cli.events')}</h3>
            <span>{snapshot.events.length}</span>
          </div>
          <div className="cli-event-list">
            {snapshot.events.length === 0 && <div className="cli-empty-state">{t('maxExpand.cli.emptyEvents')}</div>}
            {snapshot.events.map((event) => <EventRow key={event.id} event={event} />)}
          </div>
        </section>
      </div>
    </div>
  );
}