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
 * @file ClipboardHistoryItemRow.tsx
 * @description 剪贴板历史单条记录行：摘要行 + 展开编辑区。
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { SvgIcon } from '../../../../../../utils/SvgIcon';
import type { ClipboardHistoryItemRowProps } from '../types/clipboardHistoryTypes';
import { getPreviewText } from '../utils/clipboardHistoryUtils';

/**
 * 剪贴板历史单条记录行
 */
export function ClipboardHistoryItemRow({
  item,
  expanded,
  selected,
  selectionMode,
  selectionCollapsing,
  editText,
  editTextareaRef,
  onToggleSelect,
  onCopy,
  onToggleExpand,
  onEditTextChange,
  onEditTextareaRef,
  onSaveEdit,
  onRemove,
}: ClipboardHistoryItemRowProps): ReactElement {
  const { t } = useTranslation();

  return (
    <div className={`clipboard-history-item${selectionMode && !selectionCollapsing && selected ? ' clipboard-history-item--selected' : ''}`}>
      <div className={`clipboard-history-summary-row${selectionMode ? ' clipboard-history-summary-row--selecting' : ''}${selectionCollapsing ? ' clipboard-history-summary-row--collapsing' : ''}`}>
        {selectionMode ? (
          <label className="clipboard-history-item-check">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(item.id)}
              aria-label={t('clipboardHistoryTab.actions.selectItemAria', { defaultValue: '选择该剪贴板记录' })}
            />
          </label>
        ) : null}
        <button
          className="clipboard-history-copy"
          type="button"
          onClick={() => onCopy(item)}
          aria-label={t('clipboardHistoryTab.actions.copyAria', { defaultValue: '复制该记录到剪贴板' })}
          title={t('clipboardHistoryTab.actions.copyTitle', { defaultValue: '复制到剪贴板' })}
        >
          <img src={SvgIcon.COPY} alt="" aria-hidden="true" />
        </button>
        <button
          className="clipboard-history-summary"
          type="button"
          onClick={() => onToggleExpand(item)}
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

      <div className={`clipboard-history-detail-wrapper${expanded ? ' clipboard-history-detail-wrapper--expanded' : ''}`}>
        <div className="clipboard-history-detail-inner">
          <div className="clipboard-history-detail">
            <textarea
              className="clipboard-history-content"
              value={editText}
              ref={editTextareaRef}
              onChange={(e) => {
                onEditTextChange(e.target.value);
                onEditTextareaRef(e.currentTarget);
              }}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  onSaveEdit(item.id);
                }
              }}
            />
            <div className="clipboard-history-actions">
              <button
                className="clipboard-history-save"
                type="button"
                onClick={() => onSaveEdit(item.id)}
                disabled={!editText.trim()}
              >
                {t('clipboardHistoryTab.actions.save', { defaultValue: '保存' })}
              </button>
              <button
                className="clipboard-history-remove"
                type="button"
                onClick={() => onRemove(item.id)}
                aria-label={t('clipboardHistoryTab.actions.removeAria', { defaultValue: '删除该剪贴板记录' })}
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
