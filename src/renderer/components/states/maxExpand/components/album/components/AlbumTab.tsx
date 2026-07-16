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

import { useEffect, useMemo } from 'react';
import type { ChangeEvent, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { SvgIcon } from '../../../../../../utils/SvgIcon';
import { MAX_COLUMNS, MIN_COLUMNS, SUPPORTED_EXTS, ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from '../types/albumTypes';
import type { AlbumItem } from '../types/albumTypes';
import { formatBytes, formatDuration, formatTimestamp } from '../utils/albumUtils';
import { useAlbumItems } from '../hooks/useAlbumItems';
import { useAlbumViewer } from '../hooks/useAlbumViewer';
import { useAlbumViewerActions } from '../hooks/useAlbumViewerActions';
import { useAlbumSelection } from '../hooks/useAlbumSelection';
import { useAlbumGridConfig } from '../hooks/useAlbumGridConfig';
import { useAlbumDrag } from '../hooks/useAlbumDrag';

function AlbumControlIcon({ src }: { src: string }): ReactElement {
  return <img className="album-svg-icon-img" src={src} alt="" aria-hidden="true" draggable={false} />;
}

/**
 * 相册页主组件。
 * @description 提供总览、单图放大、元数据侧栏与基础 EXIF 解析等能力。
 */
export function AlbumTab(): ReactElement {
  const { t } = useTranslation();

  /* ── Hook: 条目管理（初始化加载 + CRUD + 元数据） ── */
  const {
    items, loaded, metaCache, statusMessage, setStatusMessage,
    fileInputRef, gridVideoRefs, initColumns, initSortMode, initGroupMode,
    loadExifIfNeeded, handleAddFiles, handleRemove, handleRemoveSelected,
    handleThumbMouseEnter, handleThumbMouseLeave,
  } = useAlbumItems();

  /* ── Hook: 网格配置（列数、排序、筛选、分组 + 持久化） ── */
  const {
    columns, sortMode, filterMode, groupMode, filteredItems, groupedItems,
    handleColumnsChange, handleSortChange, handleFilterModeChange, handleGroupModeChange,
  } = useAlbumGridConfig(items, metaCache, loaded, initColumns, initSortMode, initGroupMode);

  /* ── Hook: 查看器（缩放、平移、视频播放、键盘导航） ── */
  const viewer = useAlbumViewer(items, filteredItems, metaCache);
  const {
    activeId, setActiveId, zoom, pan, isPanning, viewerSlideDir,
    videoPlaying, videoMuted, videoVolume, videoCurrentTime, videoDuration, videoControlsCollapsed,
    viewerVideoRef, activeItem, activeMeta, activeIsVideo, activeVideoUrl,
    navigateInViewer, handleOpenItem, handleViewerWheel, handleViewerMouseDown, handleViewerMouseMove, handleViewerMouseUp,
    handleVideoLoadedMetadata, handleVideoTimeUpdate, handleToggleVideoPlay, handleVideoSeek,
    handleToggleVideoMute, handleVideoVolumeChange, handleToggleVideoControls, handleZoom, handleResetZoom, handleVideoEnded,
  } = viewer;

  /* ── Hook: 查看器工具栏动作 ── */
  const { handleOpenInExplorer, handleSaveAs, handleSetAsIslandBackground } = useAlbumViewerActions(activeMeta, setStatusMessage);

  /* ── Hook: 多选 ── */
  const {
    selectedIds, selectMode, selectedCount, allVisibleSelected,
    handleToggleItemSelection, handleSelectAllVisible, handleClearSelection, handleToggleSelectMode,
  } = useAlbumSelection(items, filteredItems);

  /* ── Hook: 拖拽导入 ── */
  const { dragOverPage, handleDragOver, handleDragLeave, handleDrop } = useAlbumDrag(handleAddFiles);

  /* ── 进入单图视图时加载对应 EXIF ── */
  useEffect(() => {
    if (activeId === null) return;
    const target = items.find((it) => it.id === activeId);
    if (target) loadExifIfNeeded(target);
  }, [activeId, items, loadExifIfNeeded]);

  /* ── 编排：批量删除（联动 activeId 清理） ── */
  const onRemoveSelected = (): void => {
    if (selectedIds.size === 0) return;
    if (activeId !== null && selectedIds.has(activeId)) setActiveId(null);
    handleRemoveSelected(selectedIds);
    handleClearSelection();
  };

  /* ── 简单 handler ── */
  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    handleAddFiles(event.target.files);
    event.target.value = '';
  };
  const handlePickFiles = (): void => { fileInputRef.current?.click(); };
  const handleOriginalZoom = (): void => {
    handleResetZoom();
    setStatusMessage(t('albumTab.status.zoomReset'));
  };

  const totalCount = items.length;

  const sortOptions = useMemo<Array<{ value: string; label: string }>>(() => ([
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
              onChange={(e) => handleSortChange(e.target.value)}
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
                        onEnded={handleVideoEnded}
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
          onClick={onRemoveSelected}
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
