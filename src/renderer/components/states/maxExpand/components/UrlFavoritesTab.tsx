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
 * @file UrlFavoritesTab.tsx
 * @description 最大展开模式 URL 收藏 Tab
 * @author 鸡哥
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SvgIcon } from '../../../../utils/SvgIcon';
import { fetchWebsiteTitle, getWebsiteFaviconUrl } from '../../../../api/site/siteMetaApi';

interface UrlFavoriteItem {
  id: number;
  url: string;
  title: string;
  note: string;
  folder: string;
  createdAt: number;
}

type UrlFavoritesImportFormat = 'json' | 'html';
type UrlFavoritesExportFormat = 'json' | 'html';

const STORE_KEY = 'url-favorites';
const FOCUS_KEY = 'url-favorites-focus-url';

function normalizeFolder(raw: unknown): string {
  return typeof raw === 'string' ? raw.trim() : '';
}

function normalizeUrl(raw: string): string {
  const text = raw.trim();
  if (!text) return '';
  if (/^https?:\/\//i.test(text)) return text;
  return `https://${text}`;
}

function sanitizeFavorites(data: unknown): UrlFavoriteItem[] {
  if (!Array.isArray(data)) return [];
  return data
    .map((item) => {
      const row = item as Partial<UrlFavoriteItem>;
      const url = typeof row.url === 'string' ? normalizeUrl(row.url) : '';
      if (!url) return null;
      const title = typeof row.title === 'string' ? row.title.trim() : '';
      const noteValue = typeof row.note === 'string' ? row.note.trim() : '';
      const folder = normalizeFolder(row.folder);
      const createdAt = typeof row.createdAt === 'number' && Number.isFinite(row.createdAt) ? row.createdAt : Date.now();
      const id = typeof row.id === 'number' && Number.isFinite(row.id) ? row.id : createdAt;
      return {
        id,
        url,
        title: title || url,
        note: noteValue || (title && title !== url ? title : ''),
        folder,
        createdAt,
      };
    })
    .filter((item): item is UrlFavoriteItem => Boolean(item));
}

function escapeHtmlText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function parseJsonFavorites(content: string): UrlFavoriteItem[] {
  const parsed = JSON.parse(content) as unknown;
  if (Array.isArray(parsed)) return sanitizeFavorites(parsed);
  if (parsed && typeof parsed === 'object' && Array.isArray((parsed as { items?: unknown }).items)) {
    return sanitizeFavorites((parsed as { items: unknown[] }).items);
  }
  return [];
}

function parseHtmlBookmarks(content: string): UrlFavoriteItem[] {
  const doc = new DOMParser().parseFromString(content, 'text/html');
  const anchors = Array.from(doc.querySelectorAll('a[href]'));
  return sanitizeFavorites(anchors.map((anchor, index) => {
    const url = anchor.getAttribute('href') ?? '';
    const title = anchor.textContent?.trim() ?? '';
    const addDateRaw = anchor.getAttribute('add_date') ?? anchor.getAttribute('ADD_DATE') ?? '';
    const createdAt = /^\d+$/.test(addDateRaw) ? Number(addDateRaw) * 1000 : Date.now() + index;
    const folder = normalizeFolder(anchor.closest('dl')?.previousElementSibling?.textContent ?? '');
    return { id: createdAt, url, title, note: '', folder, createdAt };
  }));
}

function parseImportedFavorites(content: string, format: UrlFavoritesImportFormat): UrlFavoriteItem[] {
  return format === 'json' ? parseJsonFavorites(content) : parseHtmlBookmarks(content);
}

function mergeFavorites(current: UrlFavoriteItem[], incoming: UrlFavoriteItem[]): UrlFavoriteItem[] {
  const existingUrls = new Set(current.map((item) => item.url.toLowerCase()));
  const now = Date.now();
  const accepted = incoming
    .filter((item) => {
      const key = item.url.toLowerCase();
      if (existingUrls.has(key)) return false;
      existingUrls.add(key);
      return true;
    })
    .map((item, index) => ({ ...item, folder: normalizeFolder(item.folder), id: now + index, createdAt: item.createdAt || now + index }));
  return [...accepted, ...current];
}

function serializeFavoritesToJson(items: UrlFavoriteItem[]): string {
  return JSON.stringify({
    source: 'eIsland',
    exportedAt: new Date().toISOString(),
    items,
  }, null, 2);
}

function serializeFavoritesToHtml(items: UrlFavoriteItem[], defaultFolderName: string): string {
  const folders = new Map<string, UrlFavoriteItem[]>();
  items.forEach((item) => {
    const folderName = normalizeFolder(item.folder) || defaultFolderName;
    folders.set(folderName, [...(folders.get(folderName) ?? []), item]);
  });

  const rows = Array.from(folders.entries()).map(([folderName, folderItems]) => {
    const links = folderItems.map((item) => {
      const addDate = Math.floor(item.createdAt / 1000);
      const title = escapeHtmlText(item.title && item.title !== item.url ? item.title : item.url);
      const note = item.note ? ` ${escapeHtmlText(item.note)}` : '';
      return `        <DT><A HREF="${escapeHtmlText(item.url)}" ADD_DATE="${addDate}">${title}</A>${note}`;
    }).join('\n');

    return [
      `    <DT><H3 ADD_DATE="0">${escapeHtmlText(folderName)}</H3>`,
      '    <DL><p>',
      links,
      '    </DL><p>',
    ].join('\n');
  }).join('\n');

  return [
    '<!DOCTYPE NETSCAPE-Bookmark-file-1>',
    '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
    '<TITLE>Bookmarks</TITLE>',
    '<H1>Bookmarks</H1>',
    '<DL><p>',
    rows,
    '</DL><p>',
  ].filter(Boolean).join('\n');
}

function persistFavorites(items: UrlFavoriteItem[]): void {
  try { localStorage.setItem('eIsland_url_favorites', JSON.stringify(items)); } catch { /* noop */ }
  window.api.storeWrite(STORE_KEY, items).catch(() => {});
}

/**
 * URL 收藏页
 * @description 最大展开状态下的 URL 收藏管理与编辑面板
 */
export function UrlFavoritesTab(): React.ReactElement {
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState<UrlFavoriteItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [focusedId, setFocusedId] = useState<number | null>(null);
  const [importFormat, setImportFormat] = useState<UrlFavoritesImportFormat>('json');
  const [exportFormat, setExportFormat] = useState<UrlFavoritesExportFormat>('json');
  const [folderToolsOpen, setFolderToolsOpen] = useState(false);
  const [importExportOpen, setImportExportOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const [activeFolder, setActiveFolder] = useState('');
  const [newFolderInput, setNewFolderInput] = useState('');
  const [editUrlInput, setEditUrlInput] = useState('');
  const [editNoteInput, setEditNoteInput] = useState('');
  const [editFolderInput, setEditFolderInput] = useState('');
  const titleResolvingIdsRef = useRef<Set<number>>(new Set());
  const dragFromIdRef = useRef<number | null>(null);
  const dragMovedRef = useRef(false);
  const skipPersistOnceRef = useRef(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const showStatusMessage = (message: string): void => {
    setStatusMessage(message);
    window.setTimeout(() => {
      setStatusMessage((current) => (current === message ? '' : current));
    }, 2400);
  };

  useEffect(() => {
    let cancelled = false;
    const applyFavorites = (data: unknown): void => {
      if (!Array.isArray(data)) return;
      skipPersistOnceRef.current = true;
      setFavorites(sanitizeFavorites(data));
    };

    window.api.storeRead(STORE_KEY).then((data) => {
      if (cancelled) return;
      if (Array.isArray(data) && data.length > 0) {
        setFavorites(sanitizeFavorites(data));
      } else {
        try {
          const raw = localStorage.getItem('eIsland_url_favorites');
          if (raw) {
            const items = sanitizeFavorites(JSON.parse(raw) as unknown[]);
            setFavorites(items);
            window.api.storeWrite(STORE_KEY, items).catch(() => {});
          }
        } catch { /* noop */ }
      }
      setLoaded(true);
    }).catch(() => {
      try {
        const raw = localStorage.getItem('eIsland_url_favorites');
        if (raw) setFavorites(sanitizeFavorites(JSON.parse(raw) as unknown[]));
      } catch { /* noop */ }
      if (!cancelled) setLoaded(true);
    });

    const unsub = window.api.onSettingsChanged((channel: string, value: unknown) => {
      if (cancelled) return;
      if (channel === `store:${STORE_KEY}`) {
        applyFavorites(value);
      }
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (skipPersistOnceRef.current) {
      skipPersistOnceRef.current = false;
      return;
    }
    persistFavorites(favorites);
  }, [favorites, loaded]);

  useEffect(() => {
    if (!loaded || favorites.length === 0) return;
    let targetUrl = '';
    try {
      const raw = localStorage.getItem(FOCUS_KEY) ?? '';
      targetUrl = normalizeUrl(raw);
    } catch {
      targetUrl = '';
    }
    if (!targetUrl) return;

    const matched = favorites.find((item) => item.url.toLowerCase() === targetUrl.toLowerCase());
    if (!matched) return;

    setExpandedId(matched.id);
    setEditUrlInput(matched.url);
    setEditNoteInput(matched.note);
    setEditFolderInput(matched.folder);
    setFocusedId(matched.id);
    window.setTimeout(() => {
      setFocusedId((prev) => (prev === matched.id ? null : prev));
    }, 1800);

    try {
      localStorage.removeItem(FOCUS_KEY);
    } catch { /* noop */ }

    window.requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(`[data-url-favorite-id="${matched.id}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }, [loaded, favorites]);

  useEffect(() => {
    if (!loaded || favorites.length === 0) return;

    const pendingItems = favorites.filter((item) => {
      const hasResolvedTitle = item.title.trim() && item.title.trim() !== item.url;
      return !hasResolvedTitle && !titleResolvingIdsRef.current.has(item.id);
    });

    if (pendingItems.length === 0) return;

    pendingItems.forEach((item) => {
      titleResolvingIdsRef.current.add(item.id);
      fetchWebsiteTitle(item.url)
        .then((title) => {
          const nextTitle = title.trim();
          if (!nextTitle) return;
          setFavorites((prev) => prev.map((row) => (
            row.id === item.id
              ? { ...row, title: nextTitle }
              : row
          )));
        })
        .finally(() => {
          titleResolvingIdsRef.current.delete(item.id);
        });
    });
  }, [favorites, loaded]);

  const handleAdd = (): void => {
    const normalizedUrl = normalizeUrl(urlInput);
    if (!normalizedUrl) return;

    try {
      const parsed = new URL(normalizedUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return;
    } catch {
      return;
    }

    setFavorites((prev) => {
      const exists = prev.some((item) => item.url.toLowerCase() === normalizedUrl.toLowerCase());
      if (exists) return prev;
      const now = Date.now();
      return [{ id: now, url: normalizedUrl, title: normalizedUrl, note: '', folder: activeFolder, createdAt: now }, ...prev];
    });
    setUrlInput('');
  };

  const handleOpen = (url: string): void => {
    window.api.clipboardOpenUrl(url).catch(() => {});
  };

  const handleToggleExpand = (item: UrlFavoriteItem): void => {
    if (expandedId === item.id) {
      setExpandedId(null);
      setEditUrlInput('');
      setEditNoteInput('');
      setEditFolderInput('');
      return;
    }
    setExpandedId(item.id);
    setEditUrlInput(item.url);
    setEditNoteInput(item.note);
    setEditFolderInput(item.folder);
  };

  const handleSaveEdit = (id: number): void => {
    const normalizedUrl = normalizeUrl(editUrlInput);
    if (!normalizedUrl) return;

    try {
      const parsed = new URL(normalizedUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return;
    } catch {
      return;
    }

    setFavorites((prev) => {
      const duplicated = prev.some((item) => item.id !== id && item.url.toLowerCase() === normalizedUrl.toLowerCase());
      if (duplicated) return prev;
      const nextNote = editNoteInput.trim();
      const nextFolder = normalizeFolder(editFolderInput);
      return prev.map((item) => (
        item.id === id
          ? { ...item, url: normalizedUrl, title: normalizedUrl, note: nextNote, folder: nextFolder }
          : item
      ));
    });
    setExpandedId(null);
    setEditUrlInput('');
    setEditNoteInput('');
    setEditFolderInput('');
  };

  const handleRemove = (id: number): void => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
    if (expandedId === id) {
      setExpandedId(null);
      setEditUrlInput('');
      setEditNoteInput('');
      setEditFolderInput('');
    }
  };

  const handleImportClick = (): void => {
    importInputRef.current?.click();
  };

  const handleCreateFolder = (): void => {
    const folder = normalizeFolder(newFolderInput);
    if (!folder) return;
    setActiveFolder(folder);
    setNewFolderInput('');
  };

  const handleClearFolder = (folder: string): void => {
    setFavorites((prev) => prev.map((item) => (
      item.folder === folder ? { ...item, folder: '' } : item
    )));
    if (activeFolder === folder) setActiveFolder('');
  };

  const handleImportFile = (file: File | null): void => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const content = typeof reader.result === 'string' ? reader.result : '';
        const imported = parseImportedFavorites(content, importFormat);
        if (imported.length === 0) {
          showStatusMessage(t('urlFavoritesTab.messages.importEmpty', { defaultValue: '未识别到可导入的收藏' }));
          return;
        }
        const next = mergeFavorites(favorites, imported);
        const addedCount = next.length - favorites.length;
        if (addedCount === 0) {
          showStatusMessage(t('urlFavoritesTab.messages.importEmpty', { defaultValue: '未识别到可导入的收藏' }));
          return;
        }
        setFavorites(next);
        showStatusMessage(t('urlFavoritesTab.messages.importSuccess', { defaultValue: '已导入 {{count}} 条收藏', count: addedCount }));
      } catch {
        showStatusMessage(t('urlFavoritesTab.messages.importFailed', { defaultValue: '导入失败，请检查文件格式' }));
      } finally {
        if (importInputRef.current) importInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      showStatusMessage(t('urlFavoritesTab.messages.importFailed', { defaultValue: '导入失败，请检查文件格式' }));
      if (importInputRef.current) importInputRef.current.value = '';
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleExport = (): void => {
    const isJson = exportFormat === 'json';
    const content = isJson
      ? serializeFavoritesToJson(favorites)
      : serializeFavoritesToHtml(favorites, t('urlFavoritesTab.folders.uncategorized', { defaultValue: '未分类' }));
    const date = new Date().toISOString().slice(0, 10);
    window.api.saveTextFile({
      defaultPath: `eIsland-url-favorites-${date}.${isJson ? 'json' : 'html'}`,
      content,
      filters: isJson
        ? [{ name: 'JSON', extensions: ['json'] }]
        : [{ name: 'HTML', extensions: ['html', 'htm'] }],
    }).then((result) => {
      if (result.ok) {
        showStatusMessage(t('urlFavoritesTab.messages.exportSuccess', { defaultValue: '已导出 {{count}} 条收藏', count: favorites.length }));
        return;
      }
      if (!result.canceled) {
        showStatusMessage(t('urlFavoritesTab.messages.exportFailed', { defaultValue: '导出失败，请稍后重试' }));
      }
    }).catch(() => {
      showStatusMessage(t('urlFavoritesTab.messages.exportFailed', { defaultValue: '导出失败，请稍后重试' }));
    });
  };

  const resetDragState = (): void => {
    dragFromIdRef.current = null;
    setDraggingId(null);
    setDragOverId(null);
    window.setTimeout(() => {
      dragMovedRef.current = false;
    }, 0);
  };

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, id: number): void => {
    dragFromIdRef.current = id;
    dragMovedRef.current = false;
    setDraggingId(id);
    setDragOverId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(id));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, id: number): void => {
    if (dragFromIdRef.current === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragFromIdRef.current !== id) dragMovedRef.current = true;
    setDragOverId(id);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, id: number): void => {
    e.preventDefault();
    const fromId = dragFromIdRef.current;
    if (fromId === null || fromId === id) {
      resetDragState();
      return;
    }

    setFavorites((prev) => {
      const fromIndex = prev.findIndex((item) => item.id === fromId);
      const toIndex = prev.findIndex((item) => item.id === id);
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });

    resetDragState();
  };

  const totalCount = favorites.length;
  const folders = useMemo(
    () => Array.from(new Set(favorites.map((item) => item.folder).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [favorites],
  );
  const visibleFavorites = useMemo(
    () => (activeFolder ? favorites.filter((item) => item.folder === activeFolder) : favorites),
    [activeFolder, favorites],
  );
  const visibleCount = visibleFavorites.length;

  const placeholder = useMemo(
    () => (totalCount > 0
      ? t('urlFavoritesTab.input.placeholderWithItems', { defaultValue: '输入并添加新的 URL 收藏' })
      : t('urlFavoritesTab.input.placeholderEmpty', { defaultValue: '输入 URL，例如 github.com' })),
    [totalCount, t],
  );

  return (
    <div className="url-favorites">
      <div className="url-favorites-header">
        <span className="url-favorites-title">{t('urlFavoritesTab.title', { defaultValue: 'URL 收藏' })}</span>
        <span className="url-favorites-count">
          {activeFolder
            ? t('urlFavoritesTab.filteredCount', { defaultValue: '{{count}} / {{total}} 条', count: visibleCount, total: totalCount })
            : t('urlFavoritesTab.count', { defaultValue: '{{count}} 条', count: totalCount })}
        </span>
      </div>

      <div className="url-favorites-input-bar">
        <input
          className="url-favorites-input"
          type="text"
          placeholder={placeholder}
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <button className="url-favorites-add" type="button" onClick={handleAdd}>
          {t('urlFavoritesTab.actions.add', { defaultValue: '添加' })}
        </button>
        <button
          className={`url-favorites-tool-toggle${folderToolsOpen ? ' url-favorites-tool-toggle--active' : ''}`}
          type="button"
          onClick={() => setFolderToolsOpen((open) => !open)}
          aria-expanded={folderToolsOpen}
          aria-controls="url-favorites-folder-panel"
        >
          {t('urlFavoritesTab.actions.manageFolders', { defaultValue: '分组' })}
        </button>
        <button
          className={`url-favorites-manage${importExportOpen ? ' url-favorites-manage--active' : ''}`}
          type="button"
          onClick={() => setImportExportOpen((open) => !open)}
          aria-expanded={importExportOpen}
          aria-controls="url-favorites-import-export-panel"
        >
          {t('urlFavoritesTab.actions.manageImportExport', { defaultValue: '导入导出' })}
        </button>
      </div>

      <div
        id="url-favorites-folder-panel"
        className={`url-favorites-folder-bar${folderToolsOpen ? ' url-favorites-folder-bar--open' : ''}`}
      >
        <datalist id="url-favorites-folder-options">
          {folders.map((folder) => <option key={folder} value={folder} />)}
        </datalist>
        <button
          className={`url-favorites-folder-chip${activeFolder === '' ? ' url-favorites-folder-chip--active' : ''}`}
          type="button"
          onClick={() => setActiveFolder('')}
        >
          {t('urlFavoritesTab.folders.all', { defaultValue: '全部' })}
        </button>
        {folders.map((folder) => (
          <button
            key={folder}
            className={`url-favorites-folder-chip${activeFolder === folder ? ' url-favorites-folder-chip--active' : ''}`}
            type="button"
            onClick={() => setActiveFolder(folder)}
            title={folder}
          >
            {folder}
          </button>
        ))}
        <input
          className="url-favorites-folder-input"
          type="text"
          value={newFolderInput}
          onChange={(e) => setNewFolderInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleCreateFolder();
            }
          }}
          placeholder={t('urlFavoritesTab.folders.newPlaceholder', { defaultValue: '新建文件夹' })}
        />
        <button className="url-favorites-folder-add" type="button" onClick={handleCreateFolder}>
          {t('urlFavoritesTab.folders.create', { defaultValue: '新建' })}
        </button>
        {activeFolder ? (
          <button className="url-favorites-folder-clear" type="button" onClick={() => handleClearFolder(activeFolder)}>
            {t('urlFavoritesTab.folders.clearCurrent', { defaultValue: '清空当前分类' })}
          </button>
        ) : null}
      </div>

      <div
        id="url-favorites-import-export-panel"
        className={`url-favorites-import-export-panel${importExportOpen ? ' url-favorites-import-export-panel--open' : ''}`}
      >
        <input
          ref={importInputRef}
          className="url-favorites-file-input"
          type="file"
          accept={importFormat === 'json' ? '.json,application/json' : '.html,.htm,text/html'}
          onChange={(e) => handleImportFile(e.target.files?.[0] ?? null)}
        />
        <div className="url-favorites-format-group" aria-label={t('urlFavoritesTab.import.formatAria', { defaultValue: '导入格式' })}>
          {(['json', 'html'] as const).map((format) => (
            <button
              key={`import-${format}`}
              className={`url-favorites-format-btn${importFormat === format ? ' url-favorites-format-btn--active' : ''}`}
              type="button"
              onClick={() => setImportFormat(format)}
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>
        <button className="url-favorites-secondary-action" type="button" onClick={handleImportClick}>
          {t('urlFavoritesTab.actions.import', { defaultValue: '导入' })}
        </button>
        <div className="url-favorites-format-group" aria-label={t('urlFavoritesTab.export.formatAria', { defaultValue: '导出格式' })}>
          {(['json', 'html'] as const).map((format) => (
            <button
              key={`export-${format}`}
              className={`url-favorites-format-btn${exportFormat === format ? ' url-favorites-format-btn--active' : ''}`}
              type="button"
              onClick={() => setExportFormat(format)}
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          className="url-favorites-secondary-action"
          type="button"
          onClick={handleExport}
          disabled={favorites.length === 0}
        >
          {t('urlFavoritesTab.actions.export', { defaultValue: '导出' })}
        </button>
      </div>

      {statusMessage ? <div className="url-favorites-status">{statusMessage}</div> : null}

      <div
        className="url-favorites-list"
        onWheelCapture={(e) => {
          e.stopPropagation();
        }}
      >
        {visibleFavorites.length === 0 ? (
          <div className="url-favorites-empty">
            {favorites.length === 0
              ? t('urlFavoritesTab.empty', { defaultValue: '还没有收藏，先添加一个 URL 吧。' })
              : t('urlFavoritesTab.folders.emptyFiltered', { defaultValue: '当前文件夹还没有收藏。' })}
          </div>
        ) : visibleFavorites.map((item) => (
          <div
            key={item.id}
            className={`url-favorites-item${focusedId === item.id ? ' url-favorites-item--focused' : ''}${dragOverId === item.id ? ' url-favorites-item--drag-over' : ''}${draggingId === item.id ? ' url-favorites-item--dragging' : ''}`}
            data-url-favorite-id={item.id}
            onDragOver={(e) => handleDragOver(e, item.id)}
            onDrop={(e) => handleDrop(e, item.id)}
          >
            <button
              className="url-favorites-summary"
              type="button"
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragEnd={resetDragState}
              onClick={() => {
                if (dragMovedRef.current) return;
                handleToggleExpand(item);
              }}
              title={item.url}
            >
              <img className="url-favorites-favicon" src={getWebsiteFaviconUrl(item.url)} alt="" aria-hidden="true" onError={(e) => { (e.target as HTMLImageElement).src = SvgIcon.LINK; }} />
              <span
                className="url-favorites-site-name"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOpen(item.url);
                }}
                title={t('urlFavoritesTab.openWebsiteTitle', { defaultValue: '点击打开网站' })}
              >
                {item.title && item.title !== item.url ? item.title : t('urlFavoritesTab.resolvingTitle', { defaultValue: '读取网页名称中…' })}
              </span>
              <span className="url-favorites-note" title={item.note || t('urlFavoritesTab.noNote', { defaultValue: '未备注' })}>{item.note || t('urlFavoritesTab.noNote', { defaultValue: '未备注' })}</span>
              <span className="url-favorites-folder-label" title={item.folder || t('urlFavoritesTab.folders.uncategorized', { defaultValue: '未分类' })}>
                {item.folder || t('urlFavoritesTab.folders.uncategorized', { defaultValue: '未分类' })}
              </span>
              <span className="url-favorites-expand-indicator">
                {expandedId === item.id
                  ? t('urlFavoritesTab.actions.collapse', { defaultValue: '收起' })
                  : t('urlFavoritesTab.actions.expand', { defaultValue: '展开' })}
              </span>
            </button>

            {expandedId === item.id ? (
              <div className="url-favorites-editor">
                <div className="url-favorites-editor-row">
                  <span className="url-favorites-editor-label">{t('urlFavoritesTab.editor.urlLabel', { defaultValue: 'URL' })}</span>
                  <input
                    className="url-favorites-url-input"
                    type="text"
                    value={editUrlInput}
                    onChange={(e) => setEditUrlInput(e.target.value)}
                    placeholder={t('urlFavoritesTab.editor.urlPlaceholder', { defaultValue: '编辑 URL' })}
                  />
                </div>
                <div className="url-favorites-editor-row">
                  <span className="url-favorites-editor-label">{t('urlFavoritesTab.editor.noteLabel', { defaultValue: '备注' })}</span>
                  <input
                    className="url-favorites-note-input"
                    type="text"
                    value={editNoteInput}
                    onChange={(e) => setEditNoteInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveEdit(item.id);
                      }
                    }}
                    placeholder={t('urlFavoritesTab.editor.notePlaceholder', { defaultValue: '输入备注' })}
                  />
                </div>
                <div className="url-favorites-editor-row">
                  <span className="url-favorites-editor-label">{t('urlFavoritesTab.editor.folderLabel', { defaultValue: '文件夹' })}</span>
                  <input
                    className="url-favorites-folder-edit-input"
                    type="text"
                    value={editFolderInput}
                    onChange={(e) => setEditFolderInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveEdit(item.id);
                      }
                    }}
                    placeholder={t('urlFavoritesTab.editor.folderPlaceholder', { defaultValue: '输入文件夹名称，留空为未分类' })}
                    list="url-favorites-folder-options"
                  />
                </div>
                <div className="url-favorites-editor-actions">
                  <button className="url-favorites-save" type="button" onClick={() => handleSaveEdit(item.id)}>
                    {t('urlFavoritesTab.actions.save', { defaultValue: '保存' })}
                  </button>
                  <button
                    className="url-favorites-remove"
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    aria-label={t('urlFavoritesTab.actions.removeAria', { defaultValue: '删除 URL 收藏' })}
                  >
                    ×
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
