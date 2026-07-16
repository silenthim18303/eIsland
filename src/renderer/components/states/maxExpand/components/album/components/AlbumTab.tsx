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
import { MAX_COLUMNS, MIN_COLUMNS, SUPPORTED_EXTS } from '../types/albumTypes';
import { useAlbumItems } from '../hooks/useAlbumItems';
import { useAlbumViewer } from '../hooks/useAlbumViewer';
import { useAlbumViewerActions } from '../hooks/useAlbumViewerActions';
import { useAlbumSelection } from '../hooks/useAlbumSelection';
import { useAlbumGridConfig } from '../hooks/useAlbumGridConfig';
import { useAlbumDrag } from '../hooks/useAlbumDrag';
import { AlbumGridItem } from './AlbumGridItem';
import { AlbumViewer } from './AlbumViewer';
import { AlbumSelectionBar } from './AlbumSelectionBar';

/**
 * 相册页主组件。
 */
export function AlbumTab(): ReactElement {
  const { t } = useTranslation();

  /* ── Hook: 条目管理 ── */
  const {
    items, loaded, metaCache, statusMessage, setStatusMessage,
    fileInputRef, gridVideoRefs, initColumns, initSortMode, initGroupMode,
    loadExifIfNeeded, handleAddFiles, handleRemove, handleRemoveSelected,
    handleThumbMouseEnter, handleThumbMouseLeave,
  } = useAlbumItems();

  /* ── Hook: 网格配置 ── */
  const {
    columns, sortMode, filterMode, groupMode, filteredItems, groupedItems,
    handleColumnsChange, handleSortChange, handleFilterModeChange, handleGroupModeChange,
  } = useAlbumGridConfig(items, metaCache, loaded, initColumns, initSortMode, initGroupMode);

  /* ── Hook: 查看器 ── */
  const viewer = useAlbumViewer(items, filteredItems, metaCache);
  const { activeId, setActiveId } = viewer;

  /* ── Hook: 查看器工具栏动作 ── */
  const { handleOpenInExplorer, handleSaveAs, handleSetAsIslandBackground } = useAlbumViewerActions(viewer.activeMeta, setStatusMessage);

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

  /* ── 编排：批量删除 ── */
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
    viewer.handleResetZoom();
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

  return (
    <div
      className={`album-tab${dragOverPage ? ' album-tab--drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 头部 */}
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

      {/* 主内容区域 */}
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
                    {group.items.map((item) => (
                      <AlbumGridItem
                        key={item.id}
                        item={item}
                        meta={metaCache[item.id]}
                        selected={selectedIds.has(item.id)}
                        selectMode={selectMode}
                        onToggleSelection={handleToggleItemSelection}
                        onOpen={viewer.handleOpenItem}
                        onRemove={handleRemove}
                        onMouseEnter={handleThumbMouseEnter}
                        onMouseLeave={handleThumbMouseLeave}
                        gridVideoRefs={gridVideoRefs}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      ) : (
        <AlbumViewer
          viewer={viewer}
          filteredCount={filteredItems.length}
          onBack={() => setActiveId(null)}
          onOriginalZoom={handleOriginalZoom}
          onOpenInExplorer={handleOpenInExplorer}
          onSaveAs={handleSaveAs}
          onSetAsIslandBackground={handleSetAsIslandBackground}
        />
      )}

      {/* 底部选择工具条 */}
      <AlbumSelectionBar
        selectMode={selectMode}
        selectedCount={selectedCount}
        filteredCount={filteredItems.length}
        allVisibleSelected={allVisibleSelected}
        onSelectAllVisible={handleSelectAllVisible}
        onClearSelection={handleClearSelection}
        onRemoveSelected={onRemoveSelected}
        onToggleSelectMode={handleToggleSelectMode}
      />

      {/* 拖拽蒙层提示 */}
      {dragOverPage ? (
        <div className="album-drop-mask" aria-hidden="true">
          <span className="album-drop-mask-text">{t('albumTab.dropHint')}</span>
        </div>
      ) : null}
    </div>
  );
}
