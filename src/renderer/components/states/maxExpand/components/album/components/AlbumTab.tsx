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
 * @file AlbumTab.tsx
 * @description 最大展开模式相册页：支持本地图片导入、总览（每行列数可调）、
 *   单图放大查看、元数据侧栏与基础 EXIF 解析、清空与排序，预留资源管理器
 *   定位与另存为入口。
 * @author 鸡哥
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, ReactElement, WheelEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { SvgIcon } from '../../../../../../utils/SvgIcon';
import { resolveBgMediaPreviewUrl } from '../../../../../config/dynamicIslandBackgroundMedia';
import type { AlbumFilterMode, AlbumGroupMode, AlbumItem, AlbumMeta, AlbumSortMode, IslandBgMediaConfig } from '../types/albumTypes';
import {
  COLUMNS_STORE_KEY,
  DEFAULT_COLUMNS,
  GROUP_MODE_STORE_KEY,
  ISLAND_BG_IMAGE_STORE_KEY,
  ISLAND_BG_MEDIA_STORE_KEY,
  LOCAL_ISLAND_BG_SYNC_EVENT,
  LOCAL_STORAGE_KEY,
  MEDIA_LOAD_DELAY_MS,
  MAX_COLUMNS,
  MIN_COLUMNS,
  SORT_STORE_KEY,
  STORE_KEY,
  SUPPORTED_EXTS,
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOM_STEP,
} from '../types/albumTypes';
import {
  clampColumns,
  estimateBytesFromDataUrl,
  formatBytes,
  formatDateGroup,
  formatDuration,
  formatTimestamp,
  getFolderName,
  getMediaTypeByExt,
  getParentFolder,
  getVideoMimeByExt,
  guessVideoCodecByExt,
  parseJpegExif,
  persistAlbumItems,
  revokeBlobUrl,
  sanitizeAlbumItems,
  sortAlbumItems,
} from '../utils/albumUtils';

function AlbumControlIcon({ src }: { src: string }): ReactElement {
  return <img className="album-svg-icon-img" src={src} alt="" aria-hidden="true" draggable={false} />;
}

/**
 * 相册页主组件。
 * @description 提供总览、单图放大、元数据侧栏与基础 EXIF 解析等能力。
 */
export function AlbumTab(): ReactElement {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<AlbumItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [mediaLoadReady, setMediaLoadReady] = useState(false);
  const [columns, setColumns] = useState<number>(DEFAULT_COLUMNS);
  const [sortMode, setSortMode] = useState<AlbumSortMode>('addedDesc');
  const [filterMode, setFilterMode] = useState<AlbumFilterMode>('all');
  const [groupMode, setGroupMode] = useState<AlbumGroupMode>('none');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragOverPage, setDragOverPage] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [videoPlaying, setVideoPlaying] = useState<boolean>(true);
  const [videoMuted, setVideoMuted] = useState<boolean>(true);
  const [videoVolume, setVideoVolume] = useState<number>(0.6);
  const [videoCurrentTime, setVideoCurrentTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoControlsCollapsed, setVideoControlsCollapsed] = useState<boolean>(false);
  const [viewerSlideDir, setViewerSlideDir] = useState<'prev' | 'next'>('next');
  const [metaCache, setMetaCache] = useState<Record<number, AlbumMeta>>({});
  const metaCacheRef = useRef<Record<number, AlbumMeta>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const gridVideoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  const viewerVideoRef = useRef<HTMLVideoElement | null>(null);
  const metaLoadingRef = useRef<Set<number>>(new Set());
  const exifLoadingRef = useRef<Set<number>>(new Set());
  const panStartRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  /** 初次加载持久化数据 */
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      window.api.storeRead(STORE_KEY).catch(() => null),
      window.api.storeRead(COLUMNS_STORE_KEY).catch(() => null),
      window.api.storeRead(SORT_STORE_KEY).catch(() => null),
      window.api.storeRead(GROUP_MODE_STORE_KEY).catch(() => null),
    ]).then(([rawItems, rawColumns, rawSort, rawGroupMode]) => {
      if (cancelled) return;
      let parsed: AlbumItem[] = [];
      if (Array.isArray(rawItems) && rawItems.length > 0) {
        parsed = sanitizeAlbumItems(rawItems);
      } else {
        try {
          const local = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (local) parsed = sanitizeAlbumItems(JSON.parse(local) as unknown);
        } catch { /* noop */ }
      }
      setItems(parsed);
      setColumns(clampColumns(rawColumns));
      if (rawSort === 'addedDesc' || rawSort === 'addedAsc' || rawSort === 'nameAsc' || rawSort === 'nameDesc' || rawSort === 'durationDesc' || rawSort === 'durationAsc') {
        setSortMode(rawSort);
      }
      if (rawGroupMode === 'none' || rawGroupMode === 'folder' || rawGroupMode === 'date') {
        setGroupMode(rawGroupMode);
      }
      setLoaded(true);
    }).catch(() => {
      if (cancelled) return;
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, []);

  /** 延迟触发媒体加载，避免从 Expand 切到 MaxExpand 时动画被 IO/解码阻塞 */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMediaLoadReady(true);
    }, MEDIA_LOAD_DELAY_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  /** 持久化条目变更 */
  useEffect(() => {
    if (!loaded) return;
    persistAlbumItems(items);
  }, [items, loaded]);

  /** 持久化列数 */
  useEffect(() => {
    if (!loaded) return;
    window.api.storeWrite(COLUMNS_STORE_KEY, columns).catch(() => { });
  }, [columns, loaded]);

  /** 持久化排序模式 */
  useEffect(() => {
    if (!loaded) return;
    window.api.storeWrite(SORT_STORE_KEY, sortMode).catch(() => { });
  }, [sortMode, loaded]);

  /** 持久化浏览模式 */
  useEffect(() => {
    if (!loaded) return;
    window.api.storeWrite(GROUP_MODE_STORE_KEY, groupMode).catch(() => { });
  }, [groupMode, loaded]);

  useEffect(() => {
    setSelectedIds((prev) => {
      if (prev.size === 0) return prev;
      const existing = new Set(items.map((item) => item.id));
      const next = new Set<number>();
      prev.forEach((id) => {
        if (existing.has(id)) next.add(id);
      });
      return next.size === prev.size ? prev : next;
    });
  }, [items]);

  /** 状态信息自动消失 */
  useEffect(() => {
    if (!statusMessage) return;
    const timer = window.setTimeout(() => setStatusMessage(''), 2400);
    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  useEffect(() => {
    metaCacheRef.current = metaCache;
  }, [metaCache]);

  useEffect(() => {
    return () => {
      Object.values(metaCacheRef.current).forEach((meta) => revokeBlobUrl(meta.videoUrl));
    };
  }, []);

  useEffect(() => {
    if (activeId === null) return;
    const target = items.find((it) => it.id === activeId);
    if (!target || target.mediaType !== 'video') return;
    setVideoPlaying(true);
    setVideoMuted(true);
    setVideoVolume(0.6);
    setVideoCurrentTime(0);
    setVideoDuration(0);
    setVideoControlsCollapsed(false);
  }, [activeId, items]);

  useEffect(() => {
    const el = viewerVideoRef.current;
    if (!el) return;
    el.muted = videoMuted;
  }, [videoMuted]);

  useEffect(() => {
    const el = viewerVideoRef.current;
    if (!el) return;
    el.volume = Math.max(0, Math.min(1, videoVolume));
  }, [videoVolume]);

  /** 主动加载媒体元数据（图像/视频） */
  const loadItemMeta = useCallback((item: AlbumItem): void => {
    if (metaLoadingRef.current.has(item.id)) return;
    metaLoadingRef.current.add(item.id);
    setMetaCache((prev) => ({ ...prev, [item.id]: { ...prev[item.id], loading: true } }));
    if (item.mediaType === 'video') {
      window.api.readLocalFileAsBuffer(item.path).then((buf) => {
        if (!buf) throw new Error('video buffer read failed');
        const mime = getVideoMimeByExt(item.ext);
        const arrayBuffer = new ArrayBuffer(buf.byteLength);
        new Uint8Array(arrayBuffer).set(buf);
        const blobUrl = URL.createObjectURL(new Blob([arrayBuffer], { type: mime }));
        const probe = document.createElement('video');
        probe.preload = 'metadata';
        probe.muted = true;
        probe.playsInline = true;
        probe.onloadedmetadata = () => {
          setMetaCache((prev) => {
            const previousVideoUrl = prev[item.id]?.videoUrl;
            if (previousVideoUrl && previousVideoUrl !== blobUrl) {
              revokeBlobUrl(previousVideoUrl);
            }
            return {
              ...prev,
              [item.id]: {
                ...prev[item.id],
                videoUrl: blobUrl,
                width: probe.videoWidth,
                height: probe.videoHeight,
                durationSec: Number.isFinite(probe.duration) ? probe.duration : 0,
                sizeBytes: buf.byteLength,
                videoCodec: guessVideoCodecByExt(item.ext),
                loading: false,
                loadFailed: false,
              },
            };
          });
        };
        probe.onerror = () => {
          revokeBlobUrl(blobUrl);
          setMetaCache((prev) => ({
            ...prev,
            [item.id]: {
              ...prev[item.id],
              loading: false,
              loadFailed: true,
            },
          }));
        };
        probe.src = blobUrl;
      }).catch(() => {
        setMetaCache((prev) => ({
          ...prev,
          [item.id]: {
            ...prev[item.id],
            loading: false,
            loadFailed: true,
          },
        }));
      }).finally(() => {
        metaLoadingRef.current.delete(item.id);
      });
      return;
    }
    window.api.loadWallpaperFile(item.path).then((dataUrl) => {
      if (!dataUrl) {
        setMetaCache((prev) => ({ ...prev, [item.id]: { ...prev[item.id], loading: false, loadFailed: true } }));
        return;
      }
      const sizeBytes = estimateBytesFromDataUrl(dataUrl);
      const probe = new Image();
      probe.onload = () => {
        setMetaCache((prev) => ({
          ...prev,
          [item.id]: {
            ...prev[item.id],
            dataUrl,
            sizeBytes,
            width: probe.naturalWidth,
            height: probe.naturalHeight,
            loading: false,
            loadFailed: false,
          },
        }));
      };
      probe.onerror = () => {
        setMetaCache((prev) => ({
          ...prev,
          [item.id]: {
            ...prev[item.id],
            dataUrl,
            sizeBytes,
            loading: false,
            loadFailed: false,
          },
        }));
      };
      probe.src = dataUrl;
    }).catch(() => {
      setMetaCache((prev) => ({ ...prev, [item.id]: { ...prev[item.id], loading: false, loadFailed: true } }));
    }).finally(() => {
      metaLoadingRef.current.delete(item.id);
    });
  }, []);

  /** 异步加载 JPEG 的 EXIF 信息（仅在单图视图时触发） */
  const loadExifIfNeeded = useCallback((item: AlbumItem): void => {
    if (item.mediaType !== 'image') return;
    if (item.ext !== 'jpg' && item.ext !== 'jpeg') return;
    if (exifLoadingRef.current.has(item.id)) return;
    if (metaCache[item.id]?.exif) return;
    exifLoadingRef.current.add(item.id);
    window.api.readLocalFileAsBuffer(item.path).then((buf) => {
      if (!buf) return;
      const exif = parseJpegExif(buf);
      if (exif) {
        setMetaCache((prev) => ({
          ...prev,
          [item.id]: { ...prev[item.id], exif },
        }));
      }
    }).catch(() => { }).finally(() => {
      exifLoadingRef.current.delete(item.id);
    });
  }, [metaCache]);

  /** 已排序的条目列表 */
  const sortedItems = useMemo(() => sortAlbumItems(items, sortMode, metaCache), [items, sortMode, metaCache]);
  const filteredItems = useMemo(() => {
    if (filterMode === 'image') return sortedItems.filter((item) => item.mediaType === 'image');
    if (filterMode === 'video') return sortedItems.filter((item) => item.mediaType === 'video');
    return sortedItems;
  }, [sortedItems, filterMode]);
  const groupedItems = useMemo(() => {
    if (groupMode === 'none') {
      return [{ key: 'all', title: t('albumTab.group.all'), subtitle: '', items: filteredItems }];
    }
    const groups = new Map<string, { key: string; title: string; subtitle: string; items: AlbumItem[] }>();
    filteredItems.forEach((item) => {
      const key = groupMode === 'folder'
        ? getParentFolder(item.path)
        : formatDateGroup(item.addedAt, i18n.language || navigator.language || 'zh-CN');
      const fallbackTitle = groupMode === 'folder' ? t('albumTab.group.unknownFolder') : t('albumTab.group.unknownDate');
      const title = key === '-' ? fallbackTitle : (groupMode === 'folder' ? getFolderName(key) : key);
      const subtitle = groupMode === 'folder' && key !== '-' ? key : '';
      const existing = groups.get(key);
      if (existing) {
        existing.items.push(item);
      } else {
        groups.set(key, { key, title, subtitle, items: [item] });
      }
    });
    return Array.from(groups.values());
  }, [filteredItems, groupMode, i18n.language, t]);

  /** 缩略图为可见时按需加载 dataUrl */
  useEffect(() => {
    if (!loaded || !mediaLoadReady || items.length === 0) return;
    items.forEach((item) => {
      const meta = metaCache[item.id];
      const hasPreview = item.mediaType === 'video' ? Boolean(meta?.videoUrl) : Boolean(meta?.dataUrl);
      if (!meta || (!hasPreview && !meta.loading && !meta.loadFailed)) {
        loadItemMeta(item);
      }
    });
  }, [items, metaCache, loaded, mediaLoadReady, loadItemMeta]);

  /** 进入单图视图时加载对应 EXIF */
  useEffect(() => {
    if (activeId === null) return;
    const target = items.find((it) => it.id === activeId);
    if (target) loadExifIfNeeded(target);
  }, [activeId, items, loadExifIfNeeded]);

  /** 单图视图的快捷键：ESC 退出，方向键切换 */
  useEffect(() => {
    if (activeId === null) return;
    const handler = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setActiveId(null);
        return;
      }
      if (event.key === 'ArrowLeft') {
        navigateInViewer(-1);
      } else if (event.key === 'ArrowRight') {
        navigateInViewer(1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // navigateInViewer 不是依赖（在闭包中读取最新值通过 ref 不必要）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, filteredItems]);

  /**
   * 在单图视图按方向切换图片
   * @param delta - 步进方向（-1 上一张，1 下一张）
   */
  function navigateInViewer(delta: number): void {
    if (activeId === null || filteredItems.length === 0) return;
    const idx = filteredItems.findIndex((it) => it.id === activeId);
    if (idx < 0) return;
    const nextIdx = (idx + delta + filteredItems.length) % filteredItems.length;
    setViewerSlideDir(delta < 0 ? 'prev' : 'next');
    setActiveId(filteredItems[nextIdx].id);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  /** 处理选择 / 拖拽进入的 File 列表 */
  const handleAddFiles = useCallback((files: FileList | File[] | null): void => {
    if (!files) return;
    const list = Array.from(files);
    if (list.length === 0) return;
    const additions: AlbumItem[] = [];
    list.forEach((file) => {
      const path = window.api?.getPathForFile?.(file) || '';
      if (!path) return;
      const dotIdx = path.lastIndexOf('.');
      const ext = (dotIdx >= 0 ? path.slice(dotIdx + 1) : '').toLowerCase();
      if (!ext || !SUPPORTED_EXTS.includes(ext)) return;
      const mediaType = getMediaTypeByExt(ext);
      if (!mediaType) return;
      const sepIdx = Math.max(path.lastIndexOf('\\'), path.lastIndexOf('/'));
      const name = sepIdx >= 0 ? path.slice(sepIdx + 1) : path;
      const addedAt = Date.now() + additions.length;
      additions.push({ id: addedAt, path, name, ext, mediaType, addedAt });
    });
    if (additions.length === 0) {
      setStatusMessage(t('albumTab.status.unsupportedOnly'));
      return;
    }
    setItems((prev) => {
      const existing = new Set(prev.map((it) => it.path.toLowerCase()));
      const filtered = additions.filter((it) => !existing.has(it.path.toLowerCase()));
      if (filtered.length === 0) {
        setStatusMessage(t('albumTab.status.allDuplicated'));
        return prev;
      }
      setStatusMessage(t('albumTab.status.added', { count: filtered.length }));
      return [...filtered, ...prev];
    });
  }, [t]);

  /** 选择按钮触发的 input change 处理 */
  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    handleAddFiles(event.target.files);
    event.target.value = '';
  };

  /** 触发隐藏的 file input */
  const handlePickFiles = (): void => {
    fileInputRef.current?.click();
  };

  /** 拖拽进入提示 */
  const handleDragOver = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    if (!dragOverPage) setDragOverPage(true);
  };

  /** 拖拽离开 */
  const handleDragLeave = (event: DragEvent<HTMLDivElement>): void => {
    if (event.currentTarget === event.target) {
      setDragOverPage(false);
    }
  };

  /** 拖拽放下，导入图片 */
  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setDragOverPage(false);
    const files = event.dataTransfer?.files;
    if (files) handleAddFiles(files);
  };

  /** 调整每行列数（限制范围） */
  const handleColumnsChange = (delta: number): void => {
    setColumns((prev) => clampColumns(prev + delta));
  };

  /** 切换排序模式 */
  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const value = event.target.value;
    if (value === 'addedDesc' || value === 'addedAsc' || value === 'nameAsc' || value === 'nameDesc' || value === 'durationDesc' || value === 'durationAsc') {
      setSortMode(value);
    }
  };

  const handleFilterModeChange = (mode: AlbumFilterMode): void => {
    setFilterMode(mode);
  };

  const handleGroupModeChange = (mode: AlbumGroupMode): void => {
    setGroupMode(mode);
  };

  const selectedCount = selectedIds.size;
  const visibleSelectedCount = filteredItems.filter((item) => selectedIds.has(item.id)).length;
  const allVisibleSelected = filteredItems.length > 0 && visibleSelectedCount === filteredItems.length;

  const handleToggleItemSelection = (id: number): void => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllVisible = (): void => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        filteredItems.forEach((item) => next.delete(item.id));
      } else {
        filteredItems.forEach((item) => next.add(item.id));
      }
      return next;
    });
  };

  const handleClearSelection = (): void => {
    setSelectedIds(new Set());
  };

  const handleToggleSelectMode = (): void => {
    setSelectMode((prev) => {
      if (prev) setSelectedIds(new Set());
      return !prev;
    });
  };

  const handleRemoveSelected = (): void => {
    if (selectedIds.size === 0) return;
    const idsToRemove = new Set(selectedIds);
    setItems((prev) => prev.filter((item) => !idsToRemove.has(item.id)));
    setMetaCache((prev) => {
      const next = { ...prev };
      idsToRemove.forEach((id) => {
        revokeBlobUrl(next[id]?.videoUrl);
        delete next[id];
      });
      return next;
    });
    if (activeId !== null && idsToRemove.has(activeId)) setActiveId(null);
    setSelectedIds(new Set());
    setStatusMessage(t('albumTab.status.removedSelected', { count: idsToRemove.size }));
  };

  /** 删除单个条目 */
  const handleRemove = (id: number): void => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    setMetaCache((prev) => {
      const next = { ...prev };
      revokeBlobUrl(next[id]?.videoUrl);
      delete next[id];
      return next;
    });
    setSelectedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (activeId === id) setActiveId(null);
  };

  /** 单图视图：滚轮缩放 */
  const handleViewerWheel = (event: WheelEvent<HTMLDivElement>): void => {
    if (!activeItem || activeItem.mediaType !== 'image') return;
    event.stopPropagation();
    event.preventDefault();
    setZoom((prev) => {
      const next = event.deltaY > 0 ? prev - ZOOM_STEP : prev + ZOOM_STEP;
      return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Number(next.toFixed(3))));
    });
  };

  /** 单图视图：开始拖动 */
  const handleViewerMouseDown = (event: React.MouseEvent<HTMLDivElement>): void => {
    if (!activeItem || activeItem.mediaType !== 'image') return;
    if (zoom <= 1) return;
    setIsPanning(true);
    panStartRef.current = {x: event.clientX, y: event.clientY, px: pan.x, py: pan.y};
  };

  /** 单图视图：拖动中 */
  const handleViewerMouseMove = (event: React.MouseEvent<HTMLDivElement>): void => {
    if (!isPanning || !panStartRef.current) return;
    const dx = event.clientX - panStartRef.current.x;
    const dy = event.clientY - panStartRef.current.y;
    setPan({ x: panStartRef.current.px + dx, y: panStartRef.current.py + dy });
  };

  /** 单图视图：拖动结束 */
  const handleViewerMouseUp = (): void => {
    setIsPanning(false);
    panStartRef.current = null;
  };

  const handleVideoLoadedMetadata = (): void => {
    const el = viewerVideoRef.current;
    if (!el) return;
    setVideoDuration(Number.isFinite(el.duration) ? el.duration : 0);
    setVideoCurrentTime(Number.isFinite(el.currentTime) ? el.currentTime : 0);
    el.muted = videoMuted;
    el.volume = Math.max(0, Math.min(1, videoVolume));
    el.play().then(() => {
      setVideoPlaying(true);
    }).catch(() => {
      setVideoPlaying(false);
    });
  };

  const handleVideoTimeUpdate = (): void => {
    const el = viewerVideoRef.current;
    if (!el) return;
    setVideoCurrentTime(Number.isFinite(el.currentTime) ? el.currentTime : 0);
  };

  const handleToggleVideoPlay = (): void => {
    const el = viewerVideoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().then(() => {
        setVideoPlaying(true);
      }).catch(() => {
        setVideoPlaying(false);
      });
      return;
    }
    el.pause();
    setVideoPlaying(false);
  };

  const handleVideoSeek = (event: ChangeEvent<HTMLInputElement>): void => {
    const el = viewerVideoRef.current;
    if (!el) return;
    const next = Number(event.target.value);
    if (!Number.isFinite(next)) return;
    el.currentTime = next;
    setVideoCurrentTime(next);
  };

  const handleToggleVideoMute = (): void => {
    setVideoMuted((prev) => !prev);
  };

  const handleVideoVolumeChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const next = Number(event.target.value);
    if (!Number.isFinite(next)) return;
    const safe = Math.max(0, Math.min(1, next));
    setVideoVolume(safe);
    if (safe > 0 && videoMuted) {
      setVideoMuted(false);
    }
  };

  const handleToggleVideoControls = (): void => {
    setVideoControlsCollapsed((prev) => !prev);
  };

  /** 单图视图：缩放按钮 */
  const handleZoom = (delta: number): void => {
    setZoom((prev) => {
      const next = prev + delta;
      return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Number(next.toFixed(3))));
    });
  };

  /** 单图视图：重置缩放与位置 */
  const handleResetZoom = (): void => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  /** 单图视图：1:1 显示 */
  const handleOriginalZoom = (): void => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setStatusMessage(t('albumTab.status.zoomReset'));
  };

  /** 在系统资源管理器中定位当前图片 */
  const handleOpenInExplorer = (item: AlbumItem): void => {
    window.api.openInExplorer(item.path).then((ok) => {
      if (!ok) {
        setStatusMessage(t('albumTab.status.openInExplorerFailed', { name: item.name }));
      }
    }).catch(() => {
      setStatusMessage(t('albumTab.status.openInExplorerFailed', { name: item.name }));
    });
  };

  /** 将当前图片另存到用户指定位置 */
  const handleSaveAs = (item: AlbumItem): void => {
    window.api.saveImageAs(item.path).then((result) => {
      if (result.ok && result.filePath) {
        setStatusMessage(t('albumTab.status.saveAsSuccess', { name: item.name }));
        return;
      }
      if (result.canceled) {
        setStatusMessage(t('albumTab.status.saveAsCanceled'));
        return;
      }
      setStatusMessage(t('albumTab.status.saveAsFailed', { name: item.name }));
    }).catch(() => {
      setStatusMessage(t('albumTab.status.saveAsFailed', { name: item.name }));
    });
  };

  /** 将当前图片设为灵动岛背景图（复用设置页同一存储与同步机制） */
  const handleSetAsIslandBackground = (item: AlbumItem): void => {
    const media: IslandBgMediaConfig = {
      type: item.mediaType,
      source: item.path,
    };
    const previewPromise = item.mediaType === 'video'
      ? resolveBgMediaPreviewUrl(media)
      : (activeMeta?.dataUrl ? Promise.resolve(activeMeta.dataUrl) : window.api.loadWallpaperFile(item.path));

    previewPromise.then((previewUrl) => {
      if (!previewUrl) {
        setStatusMessage(t('albumTab.status.setIslandBackgroundFailed'));
        return;
      }

      window.dispatchEvent(new CustomEvent(LOCAL_ISLAND_BG_SYNC_EVENT, {
        detail: {
          media,
          previewUrl,
          image: previewUrl,
        },
      }));

      Promise.all([
        window.api.storeWrite(ISLAND_BG_MEDIA_STORE_KEY, media),
        window.api.storeWrite(ISLAND_BG_IMAGE_STORE_KEY, item.mediaType === 'image' ? item.path : null),
        window.api.settingsPreview('store:island-bg-media', media),
        window.api.settingsPreview('store:island-bg-image', item.mediaType === 'image' ? item.path : null),
      ]).then(() => {
        setStatusMessage(t('albumTab.status.setIslandBackgroundSuccess', { name: item.name }));
      }).catch(() => {
        setStatusMessage(t('albumTab.status.setIslandBackgroundFailed'));
      });
    }).catch(() => {
      setStatusMessage(t('albumTab.status.setIslandBackgroundFailed'));
    });
  };

  /** 进入单图视图 */
  const handleOpenItem = (item: AlbumItem): void => {
    setViewerSlideDir('next');
    setActiveId(item.id);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleThumbMouseEnter = (item: AlbumItem): void => {
    if (item.mediaType !== 'video') return;
    const el = gridVideoRefs.current[item.id];
    if (!el) return;
    el.play().catch(() => {});
  };

  const handleThumbMouseLeave = (item: AlbumItem): void => {
    if (item.mediaType !== 'video') return;
    const el = gridVideoRefs.current[item.id];
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  };

  const totalCount = items.length;
  const activeItem = useMemo(
    () => (activeId === null ? null : items.find((it) => it.id === activeId) ?? null),
    [activeId, items],
  );
  const activeMeta = activeItem ? metaCache[activeItem.id] : undefined;
  const activeIsVideo = activeItem?.mediaType === 'video';
  const activeVideoUrl = activeItem && activeIsVideo
    ? (activeMeta?.videoUrl || null)
    : null;

  const sortOptions = useMemo<Array<{ value: AlbumSortMode; label: string }>>(() => ([
    { value: 'addedDesc', label: t('albumTab.sort.addedDesc') },
    { value: 'addedAsc', label: t('albumTab.sort.addedAsc') },
    { value: 'nameAsc', label: t('albumTab.sort.nameAsc') },
    { value: 'nameDesc', label: t('albumTab.sort.nameDesc') },
    { value: 'durationDesc', label: t('albumTab.sort.durationDesc') },
    { value: 'durationAsc', label: t('albumTab.sort.durationAsc') },
  ]), [t]);

  const renderAlbumGridItem = (item: AlbumItem): ReactElement => {
    const meta = metaCache[item.id];
    const selected = selectedIds.has(item.id);
    return (
      <div key={item.id} className={`album-grid-item${selected ? ' album-grid-item--selected' : ''}${selectMode ? ' album-grid-item--selectable' : ''}`}>
        <label className="album-selection-check" title={t('albumTab.selection.toggle', { name: item.name })}>
          <input
            className="album-selection-input"
            type="checkbox"
            checked={selected}
            onChange={() => handleToggleItemSelection(item.id)}
            aria-label={t('albumTab.selection.toggle', { name: item.name })}
          />
        </label>
        <button
          className="album-thumb"
          type="button"
          onClick={() => (selectMode ? handleToggleItemSelection(item.id) : handleOpenItem(item))}
          onMouseEnter={() => handleThumbMouseEnter(item)}
          onMouseLeave={() => handleThumbMouseLeave(item)}
          title={item.name}
        >
          {item.mediaType === 'video' ? (
            meta?.videoUrl ? (
            <>
              <video
                className="album-thumb-video"
                src={meta.videoUrl}
                muted
                loop
                playsInline
                preload="metadata"
                ref={(el) => { gridVideoRefs.current[item.id] = el; }}
              />
              <span className="album-thumb-badge">{formatDuration(meta?.durationSec)}</span>
            </>
            ) : meta?.loadFailed ? (
              <span className="album-thumb-fallback">{t('albumTab.thumb.failed')}</span>
            ) : (
              <span className="album-thumb-fallback">{t('albumTab.thumb.loading')}</span>
            )
          ) : meta?.dataUrl ? (
            <img className="album-thumb-img" src={meta.dataUrl} alt={item.name} loading="lazy" />
          ) : meta?.loadFailed ? (
            <span className="album-thumb-fallback">{t('albumTab.thumb.failed')}</span>
          ) : (
            <span className="album-thumb-fallback">{t('albumTab.thumb.loading')}</span>
          )}
        </button>
        <div className="album-grid-meta">
          <span className="album-grid-name" title={item.name}>{item.name}</span>
          <button
            className="album-grid-remove"
            type="button"
            onClick={() => handleRemove(item.id)}
            title={t('albumTab.actions.remove')}
            aria-label={t('albumTab.actions.removeAria', { name: item.name })}
          >
            <AlbumControlIcon src={SvgIcon.DELETE} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`album-tab${dragOverPage ? ' album-tab--drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 头部：标题 / 计数 / 操作 */}
      <div className="album-header">
        <div className="album-header-main">
          <span className="album-title">{t('albumTab.title')}</span>
          <span className="album-count">
            {t('albumTab.count', { count: totalCount })}
          </span>
        </div>
        <div className="album-header-actions">
          <label className="album-sort">
            <span className="album-sort-label">{t('albumTab.sort.label')}</span>
            <select
              className="album-sort-select"
              value={sortMode}
              onChange={handleSortChange}
              aria-label={t('albumTab.sort.label')}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <div className="album-filter-group" role="group" aria-label={t('albumTab.filter.label')}>
            <button
              className={`album-filter-btn${filterMode === 'all' ? ' album-filter-btn--active' : ''}`}
              type="button"
              onClick={() => handleFilterModeChange('all')}
            >
              {t('albumTab.filter.all')}
            </button>
            <button
              className={`album-filter-btn${filterMode === 'image' ? ' album-filter-btn--active' : ''}`}
              type="button"
              onClick={() => handleFilterModeChange('image')}
            >
              {t('albumTab.filter.image')}
            </button>
            <button
              className={`album-filter-btn${filterMode === 'video' ? ' album-filter-btn--active' : ''}`}
              type="button"
              onClick={() => handleFilterModeChange('video')}
            >
              {t('albumTab.filter.video')}
            </button>
          </div>
          <div className="album-filter-group" role="group" aria-label={t('albumTab.group.label')}>
            <button
              className={`album-filter-btn${groupMode === 'none' ? ' album-filter-btn--active' : ''}`}
              type="button"
              onClick={() => handleGroupModeChange('none')}
            >
              {t('albumTab.group.none')}
            </button>
            <button
              className={`album-filter-btn${groupMode === 'folder' ? ' album-filter-btn--active' : ''}`}
              type="button"
              onClick={() => handleGroupModeChange('folder')}
            >
              {t('albumTab.group.folder')}
            </button>
            <button
              className={`album-filter-btn${groupMode === 'date' ? ' album-filter-btn--active' : ''}`}
              type="button"
              onClick={() => handleGroupModeChange('date')}
            >
              {t('albumTab.group.date')}
            </button>
          </div>
          <div className="album-columns" aria-label={t('albumTab.columns.aria')}>
            <button
              className="album-icon-btn"
              type="button"
              onClick={() => handleColumnsChange(-1)}
              disabled={columns <= MIN_COLUMNS}
              title={t('albumTab.columns.smaller')}
              aria-label={t('albumTab.columns.smaller')}
            >
              −
            </button>
            <span className="album-columns-value">{columns}</span>
            <button
              className="album-icon-btn"
              type="button"
              onClick={() => handleColumnsChange(1)}
              disabled={columns >= MAX_COLUMNS}
              title={t('albumTab.columns.larger')}
              aria-label={t('albumTab.columns.larger')}
            >
              +
            </button>
          </div>
          <button
            className="album-primary-btn"
            type="button"
            onClick={handlePickFiles}
            title={t('albumTab.actions.add')}
          >
            {t('albumTab.actions.add')}
          </button>
          <button
            className={`album-text-btn${selectMode ? ' album-text-btn--active' : ''}`}
            type="button"
            onClick={handleToggleSelectMode}
            disabled={filteredItems.length === 0}
            title={t('albumTab.actions.select')}
          >
            {t('albumTab.actions.select')}
          </button>
        </div>
      </div>

      {/* 状态消息 */}
      {statusMessage ? <div className="album-status">{statusMessage}</div> : null}

      {/* 隐藏的文件选择 input */}
      <input
        ref={fileInputRef}
        className="album-file-input"
        type="file"
        accept={SUPPORTED_EXTS.map((e) => `.${e}`).join(',')}
        multiple
        onChange={handleFileInputChange}
      />

      {/* 主内容区域：总览 or 单图 */}
      {activeId === null ? (
        <div
          className="album-overview"
          style={{ ['--album-columns' as string]: String(columns) } as React.CSSProperties}
        >
          {totalCount === 0 ? (
            <div className="album-empty">
              <div className="album-empty-title">{t('albumTab.empty.title')}</div>
              <div className="album-empty-desc">{t('albumTab.empty.desc')}</div>
              <button className="album-primary-btn" type="button" onClick={handlePickFiles}>
                {t('albumTab.actions.add')}
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="album-empty">
              <div className="album-empty-title">{t('albumTab.empty.filteredTitle')}</div>
              <div className="album-empty-desc">{t('albumTab.empty.filteredDesc')}</div>
            </div>
          ) : (
            <div className="album-group-list" onWheelCapture={(event) => event.stopPropagation()}>
              {groupedItems.map((group) => (
                <section key={group.key} className="album-group-section">
                  {groupMode !== 'none' ? (
                    <div className="album-group-header">
                      <div className="album-group-title-wrap">
                        <span className="album-group-title" title={group.subtitle || group.title}>{group.title}</span>
                        {group.subtitle ? <span className="album-group-subtitle" title={group.subtitle}>{group.subtitle}</span> : null}
                      </div>
                      <span className="album-group-count">
                        {t('albumTab.group.count', { count: group.items.length })}
                      </span>
                    </div>
                  ) : null}
                  <div className="album-grid">
                    {group.items.map((item) => renderAlbumGridItem(item))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      ) : (
        activeItem ? (
          <div className="album-viewer">
            {/* 顶部工具栏 */}
            <div className="album-viewer-toolbar">
              <button
                className="album-icon-btn"
                type="button"
                onClick={() => setActiveId(null)}
                title={t('albumTab.viewer.back')}
              >
                <AlbumControlIcon src={SvgIcon.RETURN} />
              </button>
              <button
                className="album-icon-btn"
                type="button"
                onClick={() => navigateInViewer(-1)}
                disabled={filteredItems.length <= 1}
                title={t('albumTab.viewer.prev')}
              >
                <AlbumControlIcon src={SvgIcon.PREVIOUS} />
              </button>
              <button
                className="album-icon-btn"
                type="button"
                onClick={() => navigateInViewer(1)}
                disabled={filteredItems.length <= 1}
                title={t('albumTab.viewer.next')}
              >
                <AlbumControlIcon src={SvgIcon.NEXT} />
              </button>
              <span className="album-viewer-name" title={activeItem.path}>{activeItem.name}</span>
              {!activeIsVideo ? (
                <div className="album-viewer-zoom-group">
                <button
                  className="album-icon-btn"
                  type="button"
                  onClick={() => handleZoom(-ZOOM_STEP)}
                  disabled={zoom <= ZOOM_MIN + 0.001}
                  title={t('albumTab.viewer.zoomOut')}
                >
                  -
                </button>
                <span className="album-viewer-zoom-value">{Math.round(zoom * 100)}%</span>
                <button
                  className="album-icon-btn"
                  type="button"
                  onClick={() => handleZoom(ZOOM_STEP)}
                  disabled={zoom >= ZOOM_MAX - 0.001}
                  title={t('albumTab.viewer.zoomIn')}
                >
                  +
                </button>
                <button
                  className="album-text-btn"
                  type="button"
                  onClick={handleOriginalZoom}
                  title={t('albumTab.viewer.zoomOne')}
                >
                  1:1
                </button>
                <button
                  className="album-text-btn"
                  type="button"
                  onClick={handleResetZoom}
                  title={t('albumTab.viewer.zoomFit')}
                >
                  {t('albumTab.viewer.fit')}
                </button>
                </div>
              ) : null}
              <div className="album-viewer-actions">
                <button
                  className="album-text-btn"
                  type="button"
                  onClick={() => handleOpenInExplorer(activeItem)}
                  title={t('albumTab.viewer.openInExplorer')}
                >
                  {t('albumTab.viewer.openInExplorer')}
                </button>
                <button
                  className="album-text-btn"
                  type="button"
                  onClick={() => handleSaveAs(activeItem)}
                  title={t('albumTab.viewer.saveAs')}
                >
                  {t('albumTab.viewer.saveAs')}
                </button>
              </div>
            </div>

            {/* 主图 + 元数据侧栏 */}
            <div className="album-viewer-body">
              <div
                className={`album-viewer-canvas${!activeIsVideo && zoom > 1 ? ' album-viewer-canvas--pannable' : ''}${!activeIsVideo && isPanning ? ' album-viewer-canvas--panning' : ''}${activeIsVideo ? ' album-viewer-canvas--video' : ''}`}
                onWheel={activeIsVideo ? undefined : handleViewerWheel}
                onMouseDown={activeIsVideo ? undefined : handleViewerMouseDown}
                onMouseMove={activeIsVideo ? undefined : handleViewerMouseMove}
                onMouseUp={activeIsVideo ? undefined : handleViewerMouseUp}
                onMouseLeave={activeIsVideo ? undefined : handleViewerMouseUp}
                onDoubleClick={activeIsVideo ? undefined : handleResetZoom}
              >
                <div className={`album-viewer-media-layer album-viewer-media-layer--${viewerSlideDir}`} key={activeItem.id}>
                  {activeIsVideo && activeVideoUrl ? (
                    <div className="album-viewer-video-wrap">
                      <video
                        ref={viewerVideoRef}
                        className="album-viewer-video"
                        src={activeVideoUrl}
                        autoPlay
                        playsInline
                        preload="metadata"
                        onLoadedMetadata={handleVideoLoadedMetadata}
                        onTimeUpdate={handleVideoTimeUpdate}
                        onEnded={() => setVideoPlaying(false)}
                      />
                      <div className={`album-video-controls${videoControlsCollapsed ? ' album-video-controls--collapsed' : ''}`}>
                        <button
                          className="album-text-btn album-video-control-btn album-video-control-btn--icon album-video-control-btn--toggle"
                          type="button"
                          onClick={handleToggleVideoControls}
                          aria-label={videoControlsCollapsed ? t('albumTab.viewer.showControls') : t('albumTab.viewer.hideControls')}
                          title={videoControlsCollapsed ? t('albumTab.viewer.showControls') : t('albumTab.viewer.hideControls')}
                        >
                          <AlbumControlIcon src={videoControlsCollapsed ? SvgIcon.VISIBLE : SvgIcon.INVISIBLE} />
                        </button>
                        {!videoControlsCollapsed ? (
                          <>
                        <button
                          className="album-text-btn album-video-control-btn album-video-control-btn--icon"
                          type="button"
                          onClick={handleToggleVideoPlay}
                          aria-label={videoPlaying ? t('albumTab.viewer.pause') : t('albumTab.viewer.play')}
                          title={videoPlaying ? t('albumTab.viewer.pause') : t('albumTab.viewer.play')}
                        >
                          <AlbumControlIcon src={videoPlaying ? SvgIcon.PAUSE : SvgIcon.CONTINUE} />
                        </button>
                        <span className="album-video-time">
                          {formatDuration(videoCurrentTime)} / {formatDuration(videoDuration)}
                        </span>
                        <input
                          className="album-video-seek"
                          type="range"
                          min={0}
                          max={videoDuration > 0 ? videoDuration : 0}
                          step={0.1}
                          value={Math.min(videoCurrentTime, videoDuration || 0)}
                          onChange={handleVideoSeek}
                          aria-label={t('albumTab.viewer.seek')}
                          disabled={videoDuration <= 0}
                        />
                        <button
                          className="album-text-btn album-video-control-btn album-video-control-btn--icon"
                          type="button"
                          onClick={handleToggleVideoMute}
                          aria-label={videoMuted ? t('albumTab.viewer.unmute') : t('albumTab.viewer.mute')}
                          title={videoMuted ? t('albumTab.viewer.unmute') : t('albumTab.viewer.mute')}
                        >
                          <AlbumControlIcon src={videoMuted ? SvgIcon.MUTE : SvgIcon.UNMUTE} />
                        </button>
                        <input
                          className="album-video-volume"
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={videoMuted ? 0 : videoVolume}
                          onChange={handleVideoVolumeChange}
                          aria-label={t('albumTab.viewer.volume')}
                        />
                          </>
                        ) : null}
                      </div>
                    </div>
                  ) : activeMeta?.dataUrl ? (
                    <img
                      className="album-viewer-image"
                      src={activeMeta.dataUrl}
                      alt={activeItem.name}
                      draggable={false}
                      style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                      }}
                    />
                  ) : activeMeta?.loadFailed ? (
                    <span className="album-viewer-fallback">{t('albumTab.viewer.failed')}</span>
                  ) : (
                    <span className="album-viewer-fallback">{t('albumTab.viewer.loading')}</span>
                  )}
                </div>
              </div>
              <aside className="album-meta-panel">
                <div className="album-meta-title">{t('albumTab.meta.title')}</div>
                <ul className="album-meta-list">
                  <li className="album-meta-row">
                    <span className="album-meta-label">{t('albumTab.meta.name')}</span>
                    <span className="album-meta-value" title={activeItem.name}>{activeItem.name}</span>
                  </li>
                  <li className="album-meta-row">
                    <span className="album-meta-label">{t('albumTab.meta.format')}</span>
                    <span className="album-meta-value">{activeItem.ext.toUpperCase() || '-'}</span>
                  </li>
                  <li className="album-meta-row">
                    <span className="album-meta-label">{t('albumTab.meta.mediaType')}</span>
                    <span className="album-meta-value">{activeItem.mediaType === 'video' ? t('albumTab.meta.mediaTypeVideo') : t('albumTab.meta.mediaTypeImage')}</span>
                  </li>
                  <li className="album-meta-row">
                    <span className="album-meta-label">{t('albumTab.meta.resolution')}</span>
                    <span className="album-meta-value">
                      {activeMeta?.width && activeMeta?.height
                        ? `${activeMeta.width} × ${activeMeta.height}`
                        : '-'}
                    </span>
                  </li>
                  <li className="album-meta-row">
                    <span className="album-meta-label">{t('albumTab.meta.duration')}</span>
                    <span className="album-meta-value">{formatDuration(activeMeta?.durationSec)}</span>
                  </li>
                  {activeItem.mediaType === 'video' ? (
                    <>
                      <li className="album-meta-row">
                        <span className="album-meta-label">{t('albumTab.meta.codec')}</span>
                        <span className="album-meta-value">{activeMeta?.videoCodec || '-'}</span>
                      </li>
                      <li className="album-meta-row">
                        <span className="album-meta-label">{t('albumTab.meta.fps')}</span>
                        <span className="album-meta-value">{typeof activeMeta?.fps === 'number' ? `${activeMeta.fps.toFixed(2)} FPS` : '-'}</span>
                      </li>
                    </>
                  ) : null}
                  <li className="album-meta-row">
                    <span className="album-meta-label">{t('albumTab.meta.size')}</span>
                    <span className="album-meta-value">{formatBytes(activeMeta?.sizeBytes)}</span>
                  </li>
                  <li className="album-meta-row">
                    <span className="album-meta-label">{t('albumTab.meta.addedAt')}</span>
                    <span className="album-meta-value">{formatTimestamp(activeItem.addedAt)}</span>
                  </li>
                  <li className="album-meta-row album-meta-row--path">
                    <span className="album-meta-label">{t('albumTab.meta.path')}</span>
                    <span className="album-meta-value album-meta-path" title={activeItem.path}>{activeItem.path}</span>
                  </li>
                </ul>

                {activeItem.mediaType === 'image' && activeMeta?.exif ? (
                  <>
                    <div className="album-meta-title album-meta-title--sub">{t('albumTab.meta.exifTitle')}</div>
                    <ul className="album-meta-list">
                      {activeMeta.exif.make ? (
                        <li className="album-meta-row">
                          <span className="album-meta-label">{t('albumTab.meta.make')}</span>
                          <span className="album-meta-value">{activeMeta.exif.make}</span>
                        </li>
                      ) : null}
                      {activeMeta.exif.model ? (
                        <li className="album-meta-row">
                          <span className="album-meta-label">{t('albumTab.meta.model')}</span>
                          <span className="album-meta-value">{activeMeta.exif.model}</span>
                        </li>
                      ) : null}
                      {activeMeta.exif.dateTimeOriginal ? (
                        <li className="album-meta-row">
                          <span className="album-meta-label">{t('albumTab.meta.dateTimeOriginal')}</span>
                          <span className="album-meta-value">{activeMeta.exif.dateTimeOriginal}</span>
                        </li>
                      ) : null}
                      {activeMeta.exif.exposureTime ? (
                        <li className="album-meta-row">
                          <span className="album-meta-label">{t('albumTab.meta.exposure')}</span>
                          <span className="album-meta-value">{activeMeta.exif.exposureTime}</span>
                        </li>
                      ) : null}
                      {activeMeta.exif.fNumber ? (
                        <li className="album-meta-row">
                          <span className="album-meta-label">{t('albumTab.meta.fNumber')}</span>
                          <span className="album-meta-value">f/{activeMeta.exif.fNumber}</span>
                        </li>
                      ) : null}
                      {activeMeta.exif.iso ? (
                        <li className="album-meta-row">
                          <span className="album-meta-label">{t('albumTab.meta.iso')}</span>
                          <span className="album-meta-value">ISO {activeMeta.exif.iso}</span>
                        </li>
                      ) : null}
                      {activeMeta.exif.focalLength ? (
                        <li className="album-meta-row">
                          <span className="album-meta-label">{t('albumTab.meta.focalLength')}</span>
                          <span className="album-meta-value">{activeMeta.exif.focalLength} mm</span>
                        </li>
                      ) : null}
                    </ul>
                  </>
                ) : (activeItem.mediaType === 'image' && (activeItem.ext === 'jpg' || activeItem.ext === 'jpeg')) ? (
                  <div className="album-meta-empty">{t('albumTab.meta.exifEmpty')}</div>
                ) : null}

                <div className="album-meta-actions">
                  <button
                    className="album-primary-btn album-meta-apply-btn"
                    type="button"
                    onClick={() => handleSetAsIslandBackground(activeItem)}
                    title={t('albumTab.meta.setAsIslandBackground')}
                  >
                    {t('albumTab.meta.setAsIslandBackground')}
                  </button>
                </div>
              </aside>
            </div>
          </div>
        ) : null
      )}

      {/* 底部选择工具条 */}
      <div className={`album-selection-bar${selectMode ? ' album-selection-bar--open' : ''}`} aria-hidden={!selectMode}>
        <span className="album-selection-bar-count">
          {selectedCount > 0
            ? t('albumTab.selection.selectedCount', { count: selectedCount })
            : t('albumTab.selection.hint')}
        </span>
        <button
          className="album-selection-bar-btn"
          type="button"
          onClick={handleSelectAllVisible}
          disabled={filteredItems.length === 0}
          tabIndex={selectMode ? 0 : -1}
        >
          {allVisibleSelected ? t('albumTab.actions.unselectAllVisible') : t('albumTab.actions.selectAllVisible')}
        </button>
        <button
          className="album-selection-bar-btn"
          type="button"
          onClick={handleClearSelection}
          disabled={selectedCount === 0}
          tabIndex={selectMode ? 0 : -1}
        >
          {t('albumTab.actions.clearSelection')}
        </button>
        <button
          className="album-selection-bar-btn album-selection-bar-btn--danger"
          type="button"
          onClick={handleRemoveSelected}
          disabled={selectedCount === 0}
          tabIndex={selectMode ? 0 : -1}
        >
          {t('albumTab.actions.removeSelected')}
        </button>
        <button
          className="album-selection-bar-btn"
          type="button"
          onClick={handleToggleSelectMode}
          tabIndex={selectMode ? 0 : -1}
        >
          {t('albumTab.actions.cancelSelect')}
        </button>
      </div>

      {/* 拖拽蒙层提示 */}
      {dragOverPage ? (
        <div className="album-drop-mask" aria-hidden="true">
          <span className="album-drop-mask-text">{t('albumTab.dropHint')}</span>
        </div>
      ) : null}
    </div>
  );
}
