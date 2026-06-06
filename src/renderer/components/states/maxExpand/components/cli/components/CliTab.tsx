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

import { useState, useEffect, useRef, useCallback, type ReactElement } from 'react';
import ReactMarkdown from 'react-markdown';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTranslation } from 'react-i18next';
import { useClaudeCodeStatus } from '../hooks/useClaudeCodeStatus';
import { useCliEvents } from '../hooks/useCliEvents';
import { EVENT_FILTERS } from '../config/cliFilters';
import type { CliHookEvent } from '../config/types';
import { formatTime, phaseLabel, detailLabel, filterLabel, permissionProjectLabel } from '../utils/cliFormatters';
import { SvgIcon, AgentIcon } from '../../../../../../utils/SvgIcon';
import useIslandStore from '../../../../../../store/isLandStore';
import '../../../../../../styles/settings/modules/cli.css';

gsap.registerPlugin(useGSAP);

/** 每页显示的流事件数量 */
const EVENTS_PER_PAGE = 3;

/** 流结束事件名 */
const STOP_EVENTS = new Set(['Stop', 'StopFailure', 'SubagentStop', 'SessionEnd']);

/** 等待授权事件名 */
const PERMISSION_EVENTS = new Set(['PermissionRequest', 'PermissionDenied']);

function EventRow({ event, t }: { event: CliHookEvent; t: (key: string, opts?: Record<string, unknown>) => string }): ReactElement {
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const visibleDetails = (event.detailItems ?? []).filter((item) => item.value);
  const hasExtra = visibleDetails.length > 0 || event.toolName || event.toolInputPreview;
  const handleToggle = useCallback(() => {
    setExpanded((v) => !v);
  }, []);

  useGSAP(() => {
    const card = cardRef.current;
    if (!card) return;
    gsap.fromTo(
      card,
      { autoAlpha: 0, y: 10, scale: 0.985 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.28, ease: 'power2.out' },
    );
  }, { scope: cardRef });

  return (
    <div ref={cardRef} className={`cli-event-card${STOP_EVENTS.has(event.eventName) ? ' cli-event-card--stop' : ''}${PERMISSION_EVENTS.has(event.eventName) ? ' cli-event-card--permission' : ''}`}>
      <div className="cli-event-card-header">
        <span className="cli-event-card-name">{event.eventName}</span>
        <div className="cli-event-card-header-right">
          {event.toolName && <span className="cli-event-card-tool-tag">{event.toolName}</span>}
          <span className="cli-event-card-time">{formatTime(event.createdAt)}</span>
        </div>
      </div>
      <div className="cli-event-card-body"><ReactMarkdown>{event.summary}</ReactMarkdown></div>
      {hasExtra && (
        <div className="cli-event-card-details">
          <button type="button" className="cli-event-card-details-toggle" onClick={handleToggle}>
            <span className="cli-event-card-details-label">{expanded ? t('maxExpand.cli.collapse', { defaultValue: '收起' }) : t('maxExpand.cli.expand', { defaultValue: '展开' })}</span>
            {event.toolInputPreview && <code onClick={(e) => e.stopPropagation()}>{event.toolInputPreview}</code>}
          </button>
          <div className={`cli-event-card-details-content${expanded ? ' is-open' : ''}`}>
            <div className="cli-event-card-details-inner">
              {visibleDetails.map((item) => (
                <div className="cli-event-card-detail-item" key={item.label}>
                  <span>{detailLabel(item.label, t)}</span>
                  <pre>{item.value}</pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function CliTab(): ReactElement {
  const { t } = useTranslation();
  const setCli = useIslandStore((s) => s.setCli);
  const { snapshot, enableHook, disableHook, clearEvents, deleteSessions } = useClaudeCodeStatus();
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
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedSessionIds, setSelectedSessionIds] = useState<Set<string>>(() => new Set());

  /* ── 分页 ── */
  const [page, setPage] = useState(0);
  const prevFilterRef = useRef(eventFilter);
  const prevSessionRef = useRef(selectedSessionId);

  // 筛选条件变化时重置页码
  useEffect(() => {
    if (prevFilterRef.current !== eventFilter || prevSessionRef.current !== selectedSessionId) {
      prevFilterRef.current = eventFilter;
      prevSessionRef.current = selectedSessionId;
      setPage(0);
    }
  }, [eventFilter, selectedSessionId]);

  const handleToggleBulkSelect = useCallback((): void => {
    setBulkSelectMode((enabled) => {
      if (enabled) setSelectedSessionIds(new Set());
      return !enabled;
    });
  }, []);

  const handleToggleSessionSelection = useCallback((id: string): void => {
    setSelectedSessionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleDeleteSelectedSessions = useCallback((): void => {
    if (selectedSessionIds.size === 0) return;
    const deletedIds = Array.from(selectedSessionIds);
    deleteSessions(deletedIds).catch(() => {});
    if (selectedSessionId && selectedSessionIds.has(selectedSessionId)) setSelectedSessionId(null);
    setSelectedSessionIds(new Set());
    setBulkSelectMode(false);
  }, [deleteSessions, selectedSessionId, selectedSessionIds, setSelectedSessionId]);

  useEffect(() => {
    const sessionIds = new Set(snapshot.sessions.map((session) => session.id));
    setSelectedSessionIds((prev) => {
      const next = new Set(Array.from(prev).filter((id) => sessionIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
    if (snapshot.sessions.length === 0) setBulkSelectMode(false);
  }, [snapshot.sessions]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / EVENTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);
  const pagedEvents = filteredEvents.slice(currentPage * EVENTS_PER_PAGE, currentPage * EVENTS_PER_PAGE + EVENTS_PER_PAGE);
  const selectedSessionCount = selectedSessionIds.size;

  return (
    <div className="cli-tab" onClick={(e) => e.stopPropagation()}>
      {/* 左侧：会话列表 */}
      <div className="cli-tab-sidebar">
        <div className="cli-tab-sidebar-header">
          <button
            className={`cli-tab-bulk-select-toggle ${bulkSelectMode ? 'cli-tab-bulk-select-toggle--active' : ''}`}
            type="button"
            onClick={handleToggleBulkSelect}
            title={bulkSelectMode ? t('maxExpand.cli.cancelSelection', { defaultValue: '取消选择' }) : t('maxExpand.cli.bulkSelect', { defaultValue: '批量选择' })}
            aria-label={bulkSelectMode ? t('maxExpand.cli.cancelSelection', { defaultValue: '取消选择' }) : t('maxExpand.cli.bulkSelect', { defaultValue: '批量选择' })}
          >
            <img className="cli-tab-checked-icon-img" src={SvgIcon.CHECKED} alt="" width="14" height="14" draggable={false} />
          </button>
          <span className="cli-tab-sidebar-title">{t('maxExpand.cli.sessions', { defaultValue: '会话' })}</span>
          <button
            className={`cli-tab-sidebar-count ${selectedSessionId === null ? 'active' : ''}`}
            type="button"
            title={t('maxExpand.cli.allSessions', { defaultValue: '全部会话' })}
            onClick={() => setSelectedSessionId(null)}
          >
            {t('maxExpand.cli.allLabel', { defaultValue: 'all' })}
          </button>
        </div>
        <div className={`cli-tab-bulk-actions ${bulkSelectMode ? 'cli-tab-bulk-actions--open' : ''}`} aria-hidden={!bulkSelectMode}>
          <span className="cli-tab-bulk-selected-count">
            {t('maxExpand.cli.selectedCount', { defaultValue: '已选 {{count}} 项', count: selectedSessionCount })}
          </span>
          <button
            className="cli-tab-bulk-delete"
            type="button"
            onClick={handleDeleteSelectedSessions}
            disabled={!bulkSelectMode || selectedSessionCount === 0}
            tabIndex={bulkSelectMode ? 0 : -1}
          >
            {t('maxExpand.cli.deleteSelected', { defaultValue: '删除所选' })}
          </button>
          <button className="cli-tab-bulk-cancel" type="button" onClick={handleToggleBulkSelect} tabIndex={bulkSelectMode ? 0 : -1}>
            {t('maxExpand.cli.cancelSelection', { defaultValue: '取消选择' })}
          </button>
        </div>
        <div className="cli-tab-session-list">
          {snapshot.sessions.length === 0 && (
            <div className="cli-tab-empty">{t('maxExpand.cli.emptySessions', { defaultValue: '暂无会话' })}</div>
          )}
          {snapshot.sessions.map((session) => {
            const sessionSelected = selectedSessionIds.has(session.id);
            return (
              <button
                key={session.id}
                className={`cli-tab-session-item ${selectedSessionId === session.id ? 'active' : ''} ${bulkSelectMode ? 'cli-tab-session-item--selectable' : ''} ${sessionSelected ? 'cli-tab-session-item--selected' : ''}`}
                type="button"
                onClick={() => {
                  if (bulkSelectMode) {
                    handleToggleSessionSelection(session.id);
                    return;
                  }
                  setSelectedSessionId(session.id);
                }}
              >
                <span className={`cli-tab-session-item-check ${sessionSelected ? 'cli-tab-session-item-check--checked' : ''}`} aria-hidden="true">
                  {sessionSelected && <img className="cli-tab-checked-icon-img" src={SvgIcon.CHECKED} alt="" width="10" height="10" draggable={false} />}
                </span>
                <div className="cli-tab-session-top">
                  <img className="cli-tab-session-icon" src={AgentIcon.CLAUDE} alt="" width="18" height="18" draggable={false} />
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
            );
          })}
        </div>
      </div>

      {/* 右侧：事件流 + 控制 */}
      <div className="cli-tab-main">
        <div className="cli-tab-main-header">
          <div className="cli-tab-stream-title">
            <span className={`cli-tab-hook-badge ${snapshot.enabled ? 'enabled' : 'disabled'}`}>
              {snapshot.enabled ? t('maxExpand.cli.enabled', { defaultValue: '已启用' }) : t('maxExpand.cli.disabled', { defaultValue: '未启用' })}
            </span>
            {totalPages > 1 && (
              <span className="cli-tab-phase cli-tab-page-indicator">{currentPage + 1}/{totalPages}</span>
            )}
            <span className="cli-tab-stream-session">
              {selectedSession?.title ?? t('maxExpand.cli.allSessions', { defaultValue: '全部会话' })}
            </span>
          </div>
          <div className="cli-tab-actions">
            {totalPages > 1 && (
              <div className="cli-tab-page-switch">
                <button
                  className="cli-tab-page-btn"
                  type="button"
                  disabled={currentPage === 0}
                  onClick={() => setPage(currentPage - 1)}
                  title={t('maxExpand.cli.prevPage', { defaultValue: '上一页' })}
                >
                  ‹
                </button>
                <button
                  className="cli-tab-page-btn"
                  type="button"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setPage(currentPage + 1)}
                  title={t('maxExpand.cli.nextPage', { defaultValue: '下一页' })}
                >
                  ›
                </button>
              </div>
            )}
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
            <button
              className="cli-tab-action-btn"
              type="button"
              title={t('maxExpand.cli.enterCliState', { defaultValue: '进入实时流' })}
              onClick={() => setCli()}
              disabled={activeSessions.length === 0}
            >
              <img src={SvgIcon.AI} alt="" width="14" height="14" draggable={false} />
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
          {pagedEvents.map((event) => <EventRow key={event.id} event={event} t={t} />)}
        </div>
      </div>
    </div>
  );
}
