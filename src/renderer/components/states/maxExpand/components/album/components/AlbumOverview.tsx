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
 * @file AlbumOverview.tsx
 * @description 相册总览网格：空态提示 + 分组网格列表。
 * @author 鸡哥
 */

import type { ReactElement, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import type { AlbumGroupMode, AlbumItem, AlbumMeta } from '../types/albumTypes';
import { AlbumGridItem } from './AlbumGridItem';

/** 分组数据结构 */
interface AlbumGroup {
  key: string;
  title: string;
  subtitle?: string;
  items: AlbumItem[];
}

/** AlbumOverview 组件入参 */
interface AlbumOverviewProps {
  /** 条目总数 */
  totalCount: number;
  /** 筛选后条目数 */
  filteredCount: number;
  /** 列数 */
  columns: number;
  /** 分组模式 */
  groupMode: AlbumGroupMode;
  /** 分组后数据 */
  groupedItems: AlbumGroup[];
  /** 元数据缓存 */
  metaCache: Record<number, AlbumMeta>;
  /** 已选中 ID 集合 */
  selectedIds: Set<number>;
  /** 是否处于多选模式 */
  selectMode: boolean;
  /** 切换选中态 */
  onToggleSelection: (id: number) => void;
  /** 打开查看 */
  onOpen: (item: AlbumItem) => void;
  /** 删除单条 */
  onRemove: (id: number) => void;
  /** 缩略图鼠标移入 */
  onMouseEnter: (item: AlbumItem) => void;
  /** 缩略图鼠标移出 */
  onMouseLeave: (item: AlbumItem) => void;
  /** 网格视频元素引用集合 */
  gridVideoRefs: RefObject<Record<number, HTMLVideoElement | null>>;
  /** 打开文件选择器（空态按钮） */
  onPickFiles: () => void;
}

/**
 * 相册总览网格。
 */
export function AlbumOverview({
  totalCount, filteredCount, columns, groupMode, groupedItems,
  metaCache, selectedIds, selectMode,
  onToggleSelection, onOpen, onRemove, onMouseEnter, onMouseLeave,
  gridVideoRefs, onPickFiles,
}: AlbumOverviewProps): ReactElement {
  const { t } = useTranslation();

  return (
    <div
      className="album-overview"
      style={{ ['--album-columns' as string]: String(columns) } as React.CSSProperties}
    >
      {totalCount === 0 ? (
        <div className="album-empty">
          <div className="album-empty-title">{t('albumTab.empty.title')}</div>
          <div className="album-empty-desc">{t('albumTab.empty.desc')}</div>
          <button className="album-primary-btn" type="button" onClick={onPickFiles}>
            {t('albumTab.actions.add')}
          </button>
        </div>
      ) : filteredCount === 0 ? (
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
                    onToggleSelection={onToggleSelection}
                    onOpen={onOpen}
                    onRemove={onRemove}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    gridVideoRefs={gridVideoRefs}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
