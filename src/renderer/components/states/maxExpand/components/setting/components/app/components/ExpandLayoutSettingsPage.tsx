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
 * @file ExpandLayoutSettingsPage.tsx
 * @description 设置页面 - 展开界面布局配置子界面（拖拽排序 + 可见性开关）
 * @author 鸡哥
 */

import { useCallback, useRef, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import type { ExpandNavLayoutConfig } from '../../../utils/settingsConfig';
import { DEFAULT_EXPAND_NAV_LAYOUT, EXPAND_ALWAYS_VISIBLE_TABS, EXPAND_TAB_LABELS } from '../../../utils/settingsConfig';
import { SvgIcon } from '../../../../../../../../utils/SvgIcon';

interface ExpandLayoutSettingsPageProps {
  expandNavLayout: ExpandNavLayoutConfig;
  updateExpandNavLayout: (layout: ExpandNavLayoutConfig) => void;
}

/**
 * 渲染展开布局配置页面
 * @param expandNavLayout - 当前展开导航布局配置
 * @param updateExpandNavLayout - 更新布局配置方法
 * @returns 展开布局设置页面
 */
export function ExpandLayoutSettingsPage({
  expandNavLayout,
  updateExpandNavLayout,
}: ExpandLayoutSettingsPageProps): ReactElement {
  const { t } = useTranslation();
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const dragIdxRef = useRef<number | null>(null);

  const getTabLabel = useCallback((id: string): string => {
    return t(`settings.app.expandLayout.tabLabels.${id}`, { defaultValue: EXPAND_TAB_LABELS[id] || id });
  }, [t]);

  const handleDragStart = (idx: number): void => {
    dragIdxRef.current = idx;
  };

  const handleDragOver = (e: React.DragEvent, idx: number): void => {
    e.preventDefault();
    setDragOverIdx(idx);
  };

  const handleDragLeave = (): void => {
    setDragOverIdx(null);
  };

  const handleDrop = (targetIdx: number): void => {
    const sourceIdx = dragIdxRef.current;
    if (sourceIdx === null || sourceIdx === targetIdx) {
      setDragOverIdx(null);
      dragIdxRef.current = null;
      return;
    }
    const updated = [...expandNavLayout];
    const [moved] = updated.splice(sourceIdx, 1);
    updated.splice(targetIdx, 0, moved);
    updateExpandNavLayout(updated);
    setDragOverIdx(null);
    dragIdxRef.current = null;
  };

  const handleDragEnd = (): void => {
    setDragOverIdx(null);
    dragIdxRef.current = null;
  };

  const toggleVisible = (idx: number): void => {
    const item = expandNavLayout[idx];
    if (!item || EXPAND_ALWAYS_VISIBLE_TABS.has(item.id)) return;
    const updated = [...expandNavLayout];
    updated[idx] = { ...item, visible: !item.visible };
    updateExpandNavLayout(updated);
  };

  const moveItem = (idx: number, direction: 'up' | 'down'): void => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= expandNavLayout.length) return;
    const updated = [...expandNavLayout];
    [updated[idx], updated[targetIdx]] = [updated[targetIdx], updated[idx]];
    updateExpandNavLayout(updated);
  };

  const visibleCount = expandNavLayout.filter((item) => item.visible).length;

  return (
    <div className="max-expand-settings-section">
      <div className="settings-cards">
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-title">{t('settings.app.expandLayout.previewTitle', { defaultValue: '展开导航预览' })}</div>
            <div className="settings-card-subtitle">{t('settings.app.expandLayout.previewHint', { defaultValue: '预览展开态底部导航点顺序，灰色表示已隐藏页面。' })}</div>
          </div>
          <div className="maxexpand-layout-preview-wrap">
            <div className="maxexpand-layout-preview-dots">
              {expandNavLayout.map((item) => (
                <div
                  key={item.id}
                  className={`maxexpand-layout-preview-dot${item.visible ? '' : ' maxexpand-layout-preview-dot--hidden'}`}
                  title={getTabLabel(item.id)}
                >
                  <span className="maxexpand-layout-dot-label">{getTabLabel(item.id)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-title-row">
              <div className="settings-card-title">{t('settings.app.expandLayout.orderTitle', { defaultValue: '页面排序与可见性（展开）' })}</div>
              <button
                className="maxexpand-layout-reset-btn"
                type="button"
                onClick={() => updateExpandNavLayout([...DEFAULT_EXPAND_NAV_LAYOUT])}
                title={t('settings.app.expandLayout.resetDefault', { defaultValue: '恢复默认' })}
              >
                <img src={SvgIcon.REVERT} alt="" className="maxexpand-layout-reset-btn-icon" />
                {t('settings.app.expandLayout.resetDefault', { defaultValue: '恢复默认' })}
              </button>
            </div>
            <div className="settings-card-subtitle">
              {t('settings.app.expandLayout.orderHint', { defaultValue: '拖拽调整展开态页面顺序，点击开关切换是否显示。当前显示 {{count}} / {{total}} 个页面。', count: visibleCount, total: expandNavLayout.length })}
            </div>
          </div>
          <div className="maxexpand-layout-list">
            {expandNavLayout.map((item, idx) => {
              const isAlwaysVisible = EXPAND_ALWAYS_VISIBLE_TABS.has(item.id);
              return (
              <div
                key={item.id}
                className={`maxexpand-layout-item${dragOverIdx === idx ? ' maxexpand-layout-item--drag-over' : ''}${!item.visible ? ' maxexpand-layout-item--disabled' : ''}`}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(idx)}
                onDragEnd={handleDragEnd}
              >
                <img src={SvgIcon.DRAG} alt="" className="maxexpand-layout-item-handle-icon" />
                <span className="maxexpand-layout-item-index">{idx + 1}</span>
                <span className="maxexpand-layout-item-label">{getTabLabel(item.id)}</span>
                <div className="maxexpand-layout-item-actions">
                  <button
                    className="maxexpand-layout-item-move-btn"
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveItem(idx, 'up')}
                    title={t('settings.app.expandLayout.moveUp', { defaultValue: '上移' })}
                  >
                    <img src={SvgIcon.MOVE_UP} alt="" className="maxexpand-layout-item-btn-icon" />
                  </button>
                  <button
                    className="maxexpand-layout-item-move-btn"
                    type="button"
                    disabled={idx === expandNavLayout.length - 1}
                    onClick={() => moveItem(idx, 'down')}
                    title={t('settings.app.expandLayout.moveDown', { defaultValue: '下移' })}
                  >
                    <img src={SvgIcon.MOVE_DOWN} alt="" className="maxexpand-layout-item-btn-icon" />
                  </button>
                  <button
                    className={`maxexpand-layout-item-toggle${item.visible ? ' maxexpand-layout-item-toggle--on' : ''}`}
                    type="button"
                    disabled={isAlwaysVisible}
                    onClick={() => toggleVisible(idx)}
                    title={isAlwaysVisible
                      ? getTabLabel(item.id)
                      : item.visible
                        ? t('settings.app.expandLayout.hideTab', { defaultValue: '隐藏此页面' })
                        : t('settings.app.expandLayout.showTab', { defaultValue: '显示此页面' })
                    }
                  >
                    <img src={item.visible ? SvgIcon.VISIBLE : SvgIcon.INVISIBLE} alt="" className="maxexpand-layout-item-btn-icon" />
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
