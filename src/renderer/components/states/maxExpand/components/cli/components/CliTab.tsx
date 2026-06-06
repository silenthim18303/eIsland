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

import { useState, useEffect, useRef, useCallback, useMemo, type ReactElement } from 'react';
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

function EventRow({ event, t, showPermission }: { event: CliHookEvent; t: (key: string, opts?: Record<string, unknown>) => string; showPermission: boolean }): ReactElement {
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
      {showPermission && (
        <div className="cli-event-card-permission">
          <button
            type="button"
            className="cli-event-card-permission-btn cli-event-card-permission-deny"
            onClick={() => { void window.api.claudeCodePermissionResolve(event.sessionId, 'deny'); }}
          >
            {t('cli.permission.deny', { defaultValue: '拒绝' })}
          </button>
          <button
            type="button"
            className="cli-event-card-permission-btn cli-event-card-permission-allow"
            onClick={() => { void window.api.claudeCodePermissionResolve(event.sessionId, 'allow'); }}
          >
            {t('cli.permission.allow', { defaultValue: '批准' })}
          </button>
          <button
            type="button"
            className="cli-event-card-permission-btn cli-event-card-permission-always"
            onClick={() => { void window.api.claudeCodePermissionResolve(event.sessionId, 'always'); }}
          >
            {t('cli.permission.always', { defaultValue: '永久批准' })}
          </button>
        </div>
      )}
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
  const [heatmapVisible, setHeatmapVisible] = useState(false);
  const [heatmapMetric, setHeatmapMetric] = useState<'session' | 'tool' | 'prompt'>('session');
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
  // 仍在等待授权的会话，其待授权事件 id —— 仅这些事件卡片显示授权按钮
  const pendingPermissionEventIds = useMemo(() => {
    const ids = new Set<string>();
    for (const session of snapshot.sessions) {
      if (session.phase === 'waiting_permission' && session.pendingPermission) ids.add(session.pendingPermission.id);
    }
    return ids;
  }, [snapshot.sessions]);

  // 热力图：按天统计（完整一年，以今日为中心：今日所在月份前后各约半年），按月分块并对齐星期。
  // 数据来自独立持久化的 snapshot.heatmap，清空会话/事件不影响此处展示
  const heatmap = useMemo(() => {
    const MONTHS_BEFORE = 6;
    const MONTHS_AFTER = 5;
    const totals = { session: 0, tool: 0, prompt: 0 };
    const dayCounts = new Map<string, number>();
    const dayKey = (y: number, mo: number, da: number): string => `${y}-${mo}-${da}`;
    for (const [key, counts] of Object.entries(snapshot.heatmap)) {
      totals.session += counts.session;
      totals.tool += counts.tool;
      totals.prompt += counts.prompt;
      const value = counts[heatmapMetric];
      if (value > 0) dayCounts.set(key, value);
    }
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const todayKey = dayKey(now.getFullYear(), now.getMonth() + 1, now.getDate());

    type Cell = { key: string; label: string; count: number; future: boolean; isToday: boolean };
    const months: Array<{ key: string; month: number; offset: number; cells: Cell[] }> = [];
    let max = 1;
    for (let m = MONTHS_BEFORE; m >= -MONTHS_AFTER; m -= 1) {
      const ref = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const year = ref.getFullYear();
      const month = ref.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // 周一为 0
      const cells: Cell[] = [];
      for (let day = 1; day <= daysInMonth; day += 1) {
        const d = new Date(year, month, day);
        const future = d.getTime() > now.getTime();
        const key = dayKey(year, month + 1, day);
        const count = future ? 0 : (dayCounts.get(key) ?? 0);
        if (!future && count > max) max = count;
        cells.push({ key, label: `${month + 1}/${day}`, count, future, isToday: key === todayKey });
      }
      months.push({ key: `${year}-${month}`, month, offset: firstDow, cells });
    }
    return { months, max, totals };
  }, [snapshot.heatmap, heatmapMetric]);

  /** 一月到十二月的国际化短标签 key */
  const heatmapMonthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  const heatmapLevel = (count: number): number => {
    if (count <= 0) return 0;
    return Math.min(4, Math.ceil((count / heatmap.max) * 4));
  };

  // 热力图打开或切换指标时，把今日滚动到水平居中
  const heatmapScrollRef = useRef<HTMLDivElement>(null);
  const heatmapTodayRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!heatmapVisible) return;
    const id = requestAnimationFrame(() => {
      const scroller = heatmapScrollRef.current;
      const today = heatmapTodayRef.current;
      if (!scroller || !today) return;
      scroller.scrollLeft = today.offsetLeft - scroller.clientWidth / 2 + today.offsetWidth / 2;
    });
    return () => cancelAnimationFrame(id);
  }, [heatmapVisible, heatmapMetric]);

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
                  <img src={SvgIcon.PREVIOUS} alt="" width="12" height="12" draggable={false} />
                </button>
                <button
                  className="cli-tab-page-btn"
                  type="button"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setPage(currentPage + 1)}
                  title={t('maxExpand.cli.nextPage', { defaultValue: '下一页' })}
                >
                  <img src={SvgIcon.NEXT} alt="" width="12" height="12" draggable={false} />
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
              onClick={() => { setFiltersVisible((v) => !v); setHeatmapVisible(false); }}
            >
              <img src={SvgIcon.FILTER} alt="" width="14" height="14" draggable={false} />
            </button>
            <button
              className={`cli-tab-action-btn ${heatmapVisible ? 'cli-tab-action-btn--active' : ''}`}
              type="button"
              title={t('maxExpand.cli.heatmapAria', { defaultValue: '活动热力图' })}
              onClick={() => { setHeatmapVisible((v) => !v); setFiltersVisible(false); }}
            >
              <img src={SvgIcon.NETWORK} alt="" width="14" height="14" draggable={false} />
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

        <div className={`cli-tab-heatmap ${heatmapVisible ? 'open' : ''}`}>
          <div className="cli-tab-heatmap-metrics">
            <button
              type="button"
              className={`cli-tab-heatmap-metric ${heatmapMetric === 'session' ? 'active' : ''}`}
              onClick={() => setHeatmapMetric('session')}
            >
              {t('maxExpand.cli.heatmap.session', { defaultValue: '会话开始' })} {heatmap.totals.session}
            </button>
            <button
              type="button"
              className={`cli-tab-heatmap-metric ${heatmapMetric === 'tool' ? 'active' : ''}`}
              onClick={() => setHeatmapMetric('tool')}
            >
              {t('maxExpand.cli.heatmap.tool', { defaultValue: '工具调用' })} {heatmap.totals.tool}
            </button>
            <button
              type="button"
              className={`cli-tab-heatmap-metric ${heatmapMetric === 'prompt' ? 'active' : ''}`}
              onClick={() => setHeatmapMetric('prompt')}
            >
              {t('maxExpand.cli.heatmap.prompt', { defaultValue: '提示词输入' })} {heatmap.totals.prompt}
            </button>
          </div>
          <div className="cli-tab-heatmap-grid">
            <div className="cli-tab-heatmap-scroll" ref={heatmapScrollRef}>
              <div className="cli-tab-heatmap-cells">
                {heatmap.months.map((month) => (
                  <div key={month.key} className="cli-tab-heatmap-month-block">
                    <span className="cli-tab-heatmap-month-label">
                      {t(`maxExpand.cli.heatmap.month.${heatmapMonthKeys[month.month]}`, { defaultValue: heatmapMonthKeys[month.month] })}
                    </span>
                    <div className="cli-tab-heatmap-month">
                      {month.cells.map((cell, idx) => {
                        const pos = month.offset + idx;
                        return (
                          <span
                            key={cell.key}
                            ref={cell.isToday ? heatmapTodayRef : undefined}
                            className={`cli-tab-heatmap-cell${cell.future ? ' cli-tab-heatmap-cell--future' : ` level-${heatmapLevel(cell.count)}`}${cell.isToday ? ' cli-tab-heatmap-cell--today' : ''}`}
                            style={{ gridColumnStart: Math.floor(pos / 7) + 1, gridRowStart: (pos % 7) + 1 }}
                            title={cell.future ? '' : `${cell.label}: ${cell.count}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="cli-tab-event-list">
          {filteredEvents.length === 0 && (
            <div className="cli-tab-empty">{t('maxExpand.cli.emptyEvents', { defaultValue: '暂无事件' })}</div>
          )}
          {pagedEvents.map((event) => <EventRow key={event.id} event={event} t={t} showPermission={pendingPermissionEventIds.has(event.id)} />)}
        </div>
      </div>
    </div>
  );
}
