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
 * @file ClipboardHistoryTab.tsx
 * @description 最大展开模式剪贴板历史 Tab
 * @author 鸡哥
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SvgIcon } from '../../../../utils/SvgIcon';
import useIslandStore from '../../../../store/slices';

interface ClipboardHistoryItem {
  id: number;
  text: string;
  createdAt: number;
}

const STORE_KEY = 'clipboard-history-recent';
const LOCAL_STORAGE_KEY = 'eIsland_clipboard_history_recent';
const HISTORY_ENABLED_STORE_KEY = 'clipboard-history-enabled';
const HISTORY_LIMIT_STORE_KEY = 'clipboard-history-limit';
const EXIT_MAX_EXPAND_ON_COPY_STORE_KEY = 'clipboard-history-exit-max-expand-on-copy';
const DEFAULT_HISTORY_LIMIT = 10;
const POLL_INTERVAL_MS = 1000;
const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

type ClipboardCleanupRange = 'lastHour' | 'today' | 'last7Days' | 'last30Days' | 'olderThan30Days';

function normalizeClipboardText(text: string): string {
  return text.replace(/\r\n/g, '\n').trim();
}

function sanitizeHistory(data: unknown, historyLimit: number): ClipboardHistoryItem[] {
  if (!Array.isArray(data)) return [];
  return data
    .map((item) => {
      const row = item as Partial<ClipboardHistoryItem>;
      const text = typeof row.text === 'string' ? normalizeClipboardText(row.text) : '';
      if (!text) return null;
      const createdAt = typeof row.createdAt === 'number' && Number.isFinite(row.createdAt) ? row.createdAt : Date.now();
      const id = typeof row.id === 'number' && Number.isFinite(row.id) ? row.id : createdAt;
      return { id, text, createdAt };
    })
    .filter((item): item is ClipboardHistoryItem => Boolean(item))
    .slice(0, historyLimit);
}

function persistHistory(items: ClipboardHistoryItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // noop
  }
  window.api.storeWrite(STORE_KEY, items).catch(() => {});
}

function getPreviewText(text: string): string {
  const oneLine = text.replace(/\s+/g, ' ').trim();
  if (oneLine.length <= 72) return oneLine;
  return `${oneLine.slice(0, 72)}…`;
}

function isSameLocalDay(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function isItemInCleanupRange(item: ClipboardHistoryItem, range: ClipboardCleanupRange, now: number): boolean {
  if (range === 'lastHour') return now - item.createdAt <= MS_PER_HOUR;
  if (range === 'today') return isSameLocalDay(new Date(item.createdAt), new Date(now));
  if (range === 'last7Days') return now - item.createdAt <= 7 * MS_PER_DAY;
  if (range === 'last30Days') return now - item.createdAt <= 30 * MS_PER_DAY;
  return now - item.createdAt > 30 * MS_PER_DAY;
}

/**
 * 渲染最大展开态的剪贴板历史标签页
 * @returns 剪贴板历史标签页
 */
export function ClipboardHistoryTab(): React.ReactElement {
  const { t } = useTranslation();
  const { setIdle, setLyrics } = useIslandStore();
  const [items, setItems] = useState<ClipboardHistoryItem[]>([]);
  const [historyEnabled, setHistoryEnabled] = useState<boolean>(true);
  const [historyLimit, setHistoryLimit] = useState<number>(DEFAULT_HISTORY_LIMIT);
  const [exitMaxExpandOnCopy, setExitMaxExpandOnCopy] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [cleanupRange, setCleanupRange] = useState<ClipboardCleanupRange>('today');
  const editTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const copyFeedbackTimerRef = useRef<number | null>(null);

  const adjustTextareaHeight = useCallback((el: HTMLTextAreaElement | null): void => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      window.api.storeRead(HISTORY_ENABLED_STORE_KEY),
      window.api.storeRead(HISTORY_LIMIT_STORE_KEY),
      window.api.storeRead(EXIT_MAX_EXPAND_ON_COPY_STORE_KEY),
    ]).then(([enabledRaw, limitRaw, exitRaw]) => {
      if (cancelled) return;
      const nextEnabled = typeof enabledRaw === 'boolean' ? enabledRaw : true;
      const nextLimit = typeof limitRaw === 'number' && Number.isFinite(limitRaw)
        ? Math.max(1, Math.min(50, Math.round(limitRaw)))
        : DEFAULT_HISTORY_LIMIT;
      const nextExitOnCopy = typeof exitRaw === 'boolean' ? exitRaw : false;
      setHistoryEnabled(nextEnabled);
      setHistoryLimit(nextLimit);
      setExitMaxExpandOnCopy(nextExitOnCopy);
    }).catch(() => {
      if (cancelled) return;
      setHistoryEnabled(true);
      setHistoryLimit(DEFAULT_HISTORY_LIMIT);
      setExitMaxExpandOnCopy(false);
    });

    window.api.storeRead(STORE_KEY).then((data) => {
      if (cancelled) return;
      if (Array.isArray(data) && data.length > 0) {
        setItems(sanitizeHistory(data, DEFAULT_HISTORY_LIMIT));
      } else {
        try {
          const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (raw) {
            const parsed = sanitizeHistory(JSON.parse(raw) as unknown[], DEFAULT_HISTORY_LIMIT);
            setItems(parsed);
            window.api.storeWrite(STORE_KEY, parsed).catch(() => {});
          }
        } catch {
          // noop
        }
      }
      setLoaded(true);
    }).catch(() => {
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (raw) setItems(sanitizeHistory(JSON.parse(raw) as unknown[], DEFAULT_HISTORY_LIMIT));
      } catch {
        // noop
      }
      if (!cancelled) setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setItems((prev) => prev.slice(0, historyLimit));
  }, [historyLimit]);

  useEffect(() => {
    const itemIds = new Set(items.map((item) => item.id));
    setSelectedIds((prev) => prev.filter((id) => itemIds.has(id)));
  }, [items]);

  useEffect(() => {
    if (!loaded) return;
    persistHistory(items);
  }, [items, loaded]);

  useEffect(() => {
    if (!historyEnabled) return;
    let timerId: number | null = null;
    let disposed = false;
    let lastText = '';

    const poll = async (): Promise<void> => {
      try {
        const rawText = await window.api.clipboardReadText();
        if (disposed) return;
        const normalized = normalizeClipboardText(rawText);
        if (!normalized || normalized === lastText) return;
        lastText = normalized;
        setItems((prev) => {
          if (prev[0]?.text === normalized) return prev;
          const now = Date.now();
          const next: ClipboardHistoryItem = {
            id: now,
            text: normalized,
            createdAt: now,
          };
          return [next, ...prev.filter((row) => row.text !== normalized)].slice(0, historyLimit);
        });
      } catch {
        // noop
      }
    };

    void poll();
    timerId = window.setInterval(() => {
      void poll();
    }, POLL_INTERVAL_MS);

    return () => {
      disposed = true;
      if (timerId !== null) {
        window.clearInterval(timerId);
      }
    };
  }, [historyEnabled, historyLimit]);

  const totalCount = items.length;
  const selectedCount = selectedIds.length;
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allSelected = totalCount > 0 && selectedCount === totalCount;
  const cleanupMatchedCount = useMemo(() => {
    const now = Date.now();
    return items.filter((item) => isItemInCleanupRange(item, cleanupRange, now)).length;
  }, [items, cleanupRange]);
  const countLabel = useMemo(
    () => t('clipboardHistoryTab.count', { defaultValue: '{{count}} 条', count: totalCount }),
    [t, totalCount],
  );

  const handleClear = (): void => {
    setItems([]);
    setSelectedIds([]);
    setExpandedId(null);
    setEditText('');
  };

  const handleRemove = (id: number): void => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
    if (expandedId === id) {
      setExpandedId(null);
      setEditText('');
    }
  };

  const handleToggleSelect = (id: number): void => {
    setSelectedIds((prev) => (
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    ));
  };

  const handleToggleSelectAll = (): void => {
    setSelectedIds(allSelected ? [] : items.map((item) => item.id));
  };

  const handleRemoveSelected = (): void => {
    if (selectedIds.length === 0) return;
    const nextSelectedIds = new Set(selectedIds);
    setItems((prev) => prev.filter((item) => !nextSelectedIds.has(item.id)));
    setSelectedIds([]);
    if (expandedId !== null && nextSelectedIds.has(expandedId)) {
      setExpandedId(null);
      setEditText('');
    }
  };

  const handleClearByRange = (): void => {
    const now = Date.now();
    const removedIds = new Set(items.filter((item) => isItemInCleanupRange(item, cleanupRange, now)).map((item) => item.id));
    if (removedIds.size === 0) return;
    setItems((prev) => prev.filter((item) => !removedIds.has(item.id)));
    setSelectedIds((prev) => prev.filter((id) => !removedIds.has(id)));
    if (expandedId !== null && removedIds.has(expandedId)) {
      setExpandedId(null);
      setEditText('');
    }
  };

  const handleToggleExpand = (item: ClipboardHistoryItem): void => {
    if (expandedId === item.id) {
      setExpandedId(null);
      setEditText('');
      return;
    }
    setExpandedId(item.id);
    setEditText(item.text);
  };

  const handleSaveEdit = (id: number): void => {
    const nextText = editText.replace(/\r\n/g, '\n').trim();
    if (!nextText) return;
    setItems((prev) => prev.map((item) => (
      item.id === id
        ? { ...item, text: nextText }
        : item
    )));
  };

  const handleCopy = (item: ClipboardHistoryItem): void => {
    const text = expandedId === item.id ? editText : item.text;
    window.api.clipboardWriteText(text)
      .then(() => {
        showCopyFeedback('success', t('clipboardHistoryTab.messages.copySuccess', { defaultValue: '已复制到剪贴板' }));
        if (exitMaxExpandOnCopy) {
          const store = useIslandStore.getState();
          if (store.isMusicPlaying) {
            setLyrics();
          } else {
            setIdle(true);
          }
        }
      })
      .catch(() => {
        showCopyFeedback('error', t('clipboardHistoryTab.messages.copyFailed', { defaultValue: '复制失败，请稍后重试' }));
      });
  };

  useEffect(() => {
    if (expandedId === null) return;
    adjustTextareaHeight(editTextareaRef.current);
  }, [editText, expandedId, adjustTextareaHeight]);

  useEffect(() => () => {
    if (copyFeedbackTimerRef.current !== null) {
      window.clearTimeout(copyFeedbackTimerRef.current);
    }
  }, []);

  const showCopyFeedback = (type: 'success' | 'error', text: string): void => {
    setCopyFeedback({ type, text });
    if (copyFeedbackTimerRef.current !== null) {
      window.clearTimeout(copyFeedbackTimerRef.current);
    }
    copyFeedbackTimerRef.current = window.setTimeout(() => {
      setCopyFeedback(null);
      copyFeedbackTimerRef.current = null;
    }, 1800);
  };

  return (
    <div className="clipboard-history">
      <div className="clipboard-history-header">
        <span className="clipboard-history-title">{t('clipboardHistoryTab.title', { defaultValue: '剪贴板历史' })}</span>
        <div className="clipboard-history-header-right">
          <span className="clipboard-history-count">{countLabel}</span>
          <button
            className="clipboard-history-clear"
            type="button"
            onClick={handleClear}
            disabled={totalCount === 0}
          >
            {t('clipboardHistoryTab.actions.clear', { defaultValue: '清空' })}
          </button>
        </div>
      </div>

      <div className="clipboard-history-bulk-bar">
        <label className="clipboard-history-select-all">
          <input
            type="checkbox"
            checked={allSelected}
            disabled={totalCount === 0}
            onChange={handleToggleSelectAll}
          />
          <span>{t('clipboardHistoryTab.actions.selectAll', { defaultValue: '全选' })}</span>
        </label>
        <button
          className="clipboard-history-bulk-delete"
          type="button"
          onClick={handleRemoveSelected}
          disabled={selectedCount === 0}
        >
          {t('clipboardHistoryTab.actions.deleteSelected', { defaultValue: '删除已选' })}
          {selectedCount > 0 ? ` (${selectedCount})` : ''}
        </button>
        <select
          className="clipboard-history-range-select"
          value={cleanupRange}
          onChange={(e) => setCleanupRange(e.target.value as ClipboardCleanupRange)}
          aria-label={t('clipboardHistoryTab.actions.rangeAria', { defaultValue: '选择清理时间范围' })}
        >
          <option value="lastHour">{t('clipboardHistoryTab.ranges.lastHour', { defaultValue: '最近 1 小时' })}</option>
          <option value="today">{t('clipboardHistoryTab.ranges.today', { defaultValue: '今天' })}</option>
          <option value="last7Days">{t('clipboardHistoryTab.ranges.last7Days', { defaultValue: '最近 7 天' })}</option>
          <option value="last30Days">{t('clipboardHistoryTab.ranges.last30Days', { defaultValue: '最近 30 天' })}</option>
          <option value="olderThan30Days">{t('clipboardHistoryTab.ranges.olderThan30Days', { defaultValue: '30 天前' })}</option>
        </select>
        <button
          className="clipboard-history-range-clear"
          type="button"
          onClick={handleClearByRange}
          disabled={cleanupMatchedCount === 0}
        >
          {t('clipboardHistoryTab.actions.clearRange', { defaultValue: '清理范围' })}
          {cleanupMatchedCount > 0 ? ` (${cleanupMatchedCount})` : ''}
        </button>
      </div>

      {copyFeedback ? (
        <div className={`clipboard-history-feedback clipboard-history-feedback--${copyFeedback.type}`} role="status" aria-live="polite">
          {copyFeedback.text}
        </div>
      ) : null}

      <div
        className="clipboard-history-list"
        onWheelCapture={(e) => {
          e.stopPropagation();
        }}
      >
        {items.length === 0 ? (
          <div className="clipboard-history-empty">
            {t('clipboardHistoryTab.empty', { defaultValue: '暂时没有记录，复制一些文本后会显示在这里。' })}
          </div>
        ) : items.map((item) => {
          const expanded = expandedId === item.id;
          const selected = selectedIdSet.has(item.id);
          return (
            <div key={item.id} className={`clipboard-history-item${selected ? ' clipboard-history-item--selected' : ''}`}>
              <div className="clipboard-history-summary-row">
                <label className="clipboard-history-item-check">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => handleToggleSelect(item.id)}
                    aria-label={t('clipboardHistoryTab.actions.selectItemAria', { defaultValue: '选择该剪贴板记录' })}
                  />
                </label>
                <button
                  className="clipboard-history-copy"
                  type="button"
                  onClick={() => handleCopy(item)}
                  aria-label={t('clipboardHistoryTab.actions.copyAria', { defaultValue: '复制该记录到剪贴板' })}
                  title={t('clipboardHistoryTab.actions.copyTitle', { defaultValue: '复制到剪贴板' })}
                >
                  <img src={SvgIcon.COPY} alt="" aria-hidden="true" />
                </button>
                <button
                  className="clipboard-history-summary"
                  type="button"
                  onClick={() => handleToggleExpand(item)}
                  title={item.text}
                >
                  <span className="clipboard-history-preview">{getPreviewText(item.text)}</span>
                  <span className="clipboard-history-time">{new Date(item.createdAt).toLocaleString()}</span>
                  <span className="clipboard-history-expand-indicator">
                    {expanded
                      ? t('clipboardHistoryTab.actions.collapse', { defaultValue: '收起' })
                      : t('clipboardHistoryTab.actions.expand', { defaultValue: '展开' })}
                  </span>
                </button>
              </div>

              {expanded ? (
                <div className="clipboard-history-detail">
                  <textarea
                    className="clipboard-history-content"
                    value={editText}
                    ref={editTextareaRef}
                    onChange={(e) => {
                      setEditText(e.target.value);
                      adjustTextareaHeight(e.currentTarget);
                    }}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveEdit(item.id);
                      }
                    }}
                  />
                  <div className="clipboard-history-actions">
                    <button
                      className="clipboard-history-save"
                      type="button"
                      onClick={() => handleSaveEdit(item.id)}
                      disabled={!editText.trim()}
                    >
                      {t('clipboardHistoryTab.actions.save', { defaultValue: '保存' })}
                    </button>
                    <button
                      className="clipboard-history-remove"
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      aria-label={t('clipboardHistoryTab.actions.removeAria', { defaultValue: '删除该剪贴板记录' })}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
