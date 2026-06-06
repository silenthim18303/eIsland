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
 * @description Claude Code CLI 状态控制面板 — 简洁左右分栏布局
 * @author 鸡哥
 */

import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useClaudeCodeStatus } from '../hooks/useClaudeCodeStatus';
import { useCliEvents } from '../hooks/useCliEvents';
import { EVENT_FILTERS } from '../config/cliFilters';
import type { CliHookEvent } from '../config/types';
import { formatTime, phaseLabel, detailLabel, filterLabel, permissionProjectLabel } from '../utils/cliFormatters';
import { SvgIcon } from '../../../../../../utils/SvgIcon';
import '../../../../../../styles/settings/modules/cli.css';

function EventRow({ event, t }: { event: CliHookEvent; t: (key: string, opts?: Record<string, unknown>) => string }): ReactElement {
  const visibleDetails = (event.detailItems ?? []).filter((item) => item.value);
  const hasExtra = visibleDetails.length > 0 || event.toolName || event.toolInputPreview;
  return (
    <div className="cli-event-card">
      <div className="cli-event-card-header">
        <span className="cli-event-card-name">{event.eventName}</span>
        <span className="cli-event-card-time">{formatTime(event.createdAt)}</span>
      </div>
      <div className="cli-event-card-body">{event.summary}</div>
      {event.toolName && (
        <div className="cli-event-card-tool">{event.toolName}</div>
      )}
      {hasExtra && (
        <details className="cli-event-card-details">
          <summary className="cli-event-card-details-toggle">
            {event.toolInputPreview && <code>{event.toolInputPreview}</code>}
          </summary>
          {visibleDetails.map((item) => (
            <div className="cli-event-card-detail-item" key={item.label}>
              <span>{detailLabel(item.label, t)}</span>
              <pre>{item.value}</pre>
            </div>
          ))}
        </details>
      )}
    </div>
  );
}

export function CliTab(): ReactElement {
  const { t } = useTranslation();
  const { snapshot, enableHook, disableHook, clearEvents } = useClaudeCodeStatus();
  const {
    eventFilter,
    setEventFilter,
    selectedSession,
    selectedSessionId,
    setSelectedSessionId,
    activeSessions,
    filteredEvents,
  } = useCliEvents(snapshot);
  const [filtersVisible, setFiltersVisible] = useState(false);

  return (
    <div className="cli-tab" onClick={(e) => e.stopPropagation()}>
      {/* 左侧：会话列表 */}
      <div className="cli-tab-sidebar">
        <div className="cli-tab-sidebar-header">
          <span className="cli-tab-sidebar-title">{t('maxExpand.cli.sessions', { defaultValue: '会话' })}</span>
          <button
            className={`cli-tab-sidebar-count ${selectedSessionId === null ? 'active' : ''}`}
            type="button"
            title={t('maxExpand.cli.allSessions', { defaultValue: '全部会话' })}
            onClick={() => setSelectedSessionId(null)}
          >
            {activeSessions.length}
          </button>
        </div>
        <div className="cli-tab-session-list">
          {snapshot.sessions.length === 0 && (
            <div className="cli-tab-empty">{t('maxExpand.cli.emptySessions', { defaultValue: '暂无会话' })}</div>
          )}
          {snapshot.sessions.map((session) => (
            <button
              key={session.id}
              className={`cli-tab-session-item ${selectedSessionId === session.id ? 'active' : ''}`}
              type="button"
              onClick={() => setSelectedSessionId(session.id)}
            >
              <div className="cli-tab-session-top">
                <span className="cli-tab-session-title">{session.title}</span>
                <span className={`cli-tab-phase ${session.phase}`}>{phaseLabel(session.phase, t)}</span>
              </div>
              <div className="cli-tab-session-path">{session.cwd ?? session.transcriptPath ?? session.id}</div>
              {session.pendingPermission && (
                <div className="cli-tab-permission" title={session.pendingPermission.summary}>
                  <span className="cli-tab-permission-text">{permissionProjectLabel(session.pendingPermission, t)}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 右侧：事件流 + 控制 */}
      <div className="cli-tab-main">
        <div className="cli-tab-main-header">
          <div className="cli-tab-stream-title">
            <span className={`cli-tab-hook-badge ${snapshot.enabled ? 'enabled' : 'disabled'}`}>
              {snapshot.enabled ? t('maxExpand.cli.enabled', { defaultValue: '已启用' }) : t('maxExpand.cli.disabled', { defaultValue: '未启用' })}
            </span>
            <span className="cli-tab-stream-session">
              {selectedSession?.title ?? t('maxExpand.cli.allSessions', { defaultValue: '全部会话' })}
            </span>
          </div>
          <div className="cli-tab-actions">
            <button
              className="cli-tab-action-btn"
              type="button"
              title={snapshot.enabled ? t('maxExpand.cli.disableHook', { defaultValue: '关闭 Hook' }) : t('maxExpand.cli.enableHook', { defaultValue: '启用 Hook' })}
              onClick={snapshot.enabled ? disableHook : enableHook}
            >
              <img src={snapshot.enabled ? SvgIcon.PAUSE : SvgIcon.CONTINUE} alt="" width="14" height="14" draggable={false} />
            </button>
            <button
              className="cli-tab-action-btn cli-tab-action-btn--secondary"
              type="button"
              title={t('maxExpand.cli.clear', { defaultValue: '清空' })}
              onClick={clearEvents}
              disabled={snapshot.events.length === 0}
            >
              <img src={SvgIcon.DELETE} alt="" width="14" height="14" draggable={false} />
            </button>
            <button
              className={`cli-tab-action-btn ${filtersVisible ? 'cli-tab-action-btn--active' : ''}`}
              type="button"
              title={t('maxExpand.cli.filterAria', { defaultValue: '事件筛选' })}
              onClick={() => setFiltersVisible((v) => !v)}
            >
              <img src={SvgIcon.FILTER} alt="" width="14" height="14" draggable={false} />
            </button>
          </div>
        </div>

        <div className={`cli-tab-event-filters ${filtersVisible ? 'open' : ''}`} role="tablist" aria-label={t('maxExpand.cli.filterAria', { defaultValue: '事件筛选' })}>
          {EVENT_FILTERS.map((filter) => (
            <button
              className={`cli-tab-filter-btn ${eventFilter === filter ? 'active' : ''}`}
              type="button"
              role="tab"
              aria-selected={eventFilter === filter}
              key={filter}
              onClick={() => setEventFilter(filter)}
            >
              {filterLabel(filter, t)}
            </button>
          ))}
        </div>

        <div className="cli-tab-event-list">
          {filteredEvents.length === 0 && (
            <div className="cli-tab-empty">{t('maxExpand.cli.emptyEvents', { defaultValue: '暂无事件' })}</div>
          )}
          {filteredEvents.map((event) => <EventRow key={event.id} event={event} t={t} />)}
        </div>
      </div>
    </div>
  );
}
