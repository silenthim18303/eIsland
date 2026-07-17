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
 * @file CountdownForm.tsx
 * @description 倒数日新建/编辑表单组件。
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { COLOR_PRESETS, EVENT_TYPES } from '../config/countdownConfig';
import { normalizeImageSource, toLocalDateStr } from '../utils/countdownUtils';
import type { CountdownFormProps } from '../types/countdownTypes';

/** 新建/编辑事件表单 */
export function CountdownForm({
  editing, selectedDate, editItem, resolvedCoverImage,
  form, onAdd, onSaveEdit, onCancelEdit,
  getEventTypeLabel,
}: CountdownFormProps): ReactElement {
  const { t } = useTranslation();

  /* ── 编辑模式 ── */
  if (editing && editItem) {
    return (
      <div className="cd-editor-form">
        <div className="cd-editor-title">{t('countdown.editTitle', { defaultValue: '编辑事件' })}</div>
        <input
          className="cd-input"
          value={form.editData.name || ''}
          onChange={(e) => form.setEditData(prev => ({ ...prev, name: e.target.value }))}
          placeholder={t('countdown.namePlaceholder', { defaultValue: '事件名称' })}
        />
        <textarea
          className="cd-textarea"
          value={form.editData.description || ''}
          onChange={(e) => form.setEditData(prev => ({ ...prev, description: e.target.value }))}
          placeholder={t('countdown.descPlaceholder', { defaultValue: '描述（可选）' })}
          rows={2}
        />
        <div className="cd-form-row">
          <span className="cd-form-label">{t('countdown.form.type', { defaultValue: '类型' })}</span>
          <div className="cd-type-selector">
            {EVENT_TYPES.map(type => (
              <button
                key={type}
                className={`cd-type-btn ${form.editData.type === type ? 'active' : ''}`}
                onClick={() => form.setEditData(prev => ({ ...prev, type }))}
                type="button"
                title={getEventTypeLabel(type)}
              >
                <span className="cd-type-label">{getEventTypeLabel(type)}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="cd-form-row">
          <span className="cd-form-label">{t('countdown.form.color', { defaultValue: '颜色' })}</span>
          <div className="cd-color-row">
            {COLOR_PRESETS.map(c => (
              <button
                key={c}
                className={`cd-color-dot ${(form.editData.color || '#69c0ff') === c ? 'active' : ''}`}
                style={{ background: c }}
                onClick={() => form.setEditData(prev => ({ ...prev, color: c }))}
                type="button"
              />
            ))}
            <button
              className="cd-color-dot cd-color-custom-trigger"
              style={{ background: COLOR_PRESETS.includes(form.editData.color || '') ? undefined : form.editData.color }}
              onClick={() => form.editCustomColorRef.current?.click()}
              type="button"
              title={t('countdown.form.customColor', { defaultValue: '自定义颜色' })}
            >
              <span className="cd-color-custom-icon">+</span>
            </button>
            <input
              ref={form.editCustomColorRef}
              type="color"
              className="cd-color-native-hidden"
              value={form.editData.color || '#69c0ff'}
              onChange={form.handleEditColorInput}
            />
          </div>
        </div>
        <div className="cd-form-row">
          <span className="cd-form-label">{t('countdown.form.background', { defaultValue: '背景' })}</span>
          <div className="cd-bg-row">
            <button
              className={`cd-bg-btn ${form.editBgImage && resolvedCoverImage && form.editBgImage === resolvedCoverImage ? 'active' : ''}`}
              type="button"
              title={resolvedCoverImage
                ? t('countdown.form.useAlbumCover', { defaultValue: '使用当前专辑封面' })
                : t('countdown.form.noPlayingSong', { defaultValue: '暂无正在播放的歌曲' })}
              disabled={!resolvedCoverImage}
              onClick={() => { if (resolvedCoverImage) form.setEditBgImage(resolvedCoverImage); }}
            >
              {resolvedCoverImage ? (
                <img src={resolvedCoverImage} className="cd-bg-btn-thumb" alt="" />
              ) : (
                <span className="cd-bg-btn-icon">♪</span>
              )}
            </button>
            <span className="cd-bg-label">{t('countdown.form.albumBackground', { defaultValue: '专辑背景' })}</span>
            <button
              className="cd-bg-btn"
              type="button"
              title={t('countdown.form.selectImageFile', { defaultValue: '从文件选择图片' })}
              onClick={async () => {
                const path = await window.api.openImageDialog();
                if (path) {
                  const normalized = await normalizeImageSource(path);
                  if (normalized) form.setEditBgImage(normalized);
                }
              }}
            >
              <span className="cd-bg-btn-icon">…</span>
            </button>
            <span className="cd-bg-label">{t('countdown.form.customBackground', { defaultValue: '自定义背景' })}</span>
            {form.editBgImage && (
              <button
                className="cd-bg-btn cd-bg-btn-clear"
                type="button"
                title={t('countdown.form.clearBackground', { defaultValue: '清除背景' })}
                onClick={() => form.setEditBgImage(undefined)}
              >
                <span className="cd-bg-btn-icon">x</span>
              </button>
            )}
          </div>
        </div>
        {form.editBgImage && (
          <div className="cd-form-row">
            <span className="cd-form-label">{t('countdown.form.opacity', { defaultValue: '透明度' })}</span>
            <input
              type="range"
              className="cd-opacity-slider"
              min={0} max={1} step={0.05}
              value={form.editBgOpacity}
              onChange={(e) => form.setEditBgOpacity(parseFloat(e.target.value))}
            />
            <span className="cd-opacity-value">{Math.round(form.editBgOpacity * 100)}%</span>
          </div>
        )}
        <div className="cd-form-actions">
          <button className="cd-btn save" onClick={onSaveEdit} type="button">{t('countdown.actions.save', { defaultValue: '保存' })}</button>
          <button className="cd-btn cancel" onClick={onCancelEdit} type="button">{t('countdown.actions.cancel', { defaultValue: '取消' })}</button>
        </div>
      </div>
    );
  }

  /* ── 新建模式 ── */
  return (
    <div className="cd-editor-form">
      <div className="cd-editor-title">
        {selectedDate
          ? t('countdown.newTitleWithDate', { defaultValue: '新建事件 - {{date}}', date: toLocalDateStr(selectedDate) })
          : t('countdown.newTitlePlaceholder', { defaultValue: '< 选择日期以添加事件' })}
      </div>
      <input
        className="cd-input"
        placeholder={t('countdown.namePlaceholder', { defaultValue: '事件名称' })}
        value={form.newName}
        onChange={(e) => form.setNewName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onAdd(); }}
      />
      <textarea
        className="cd-textarea"
        placeholder={t('countdown.descPlaceholder', { defaultValue: '描述（可选）' })}
        value={form.newDesc}
        onChange={(e) => form.setNewDesc(e.target.value)}
        rows={2}
      />
      <div className="cd-form-row">
        <span className="cd-form-label">{t('countdown.form.type', { defaultValue: '类型' })}</span>
        <div className="cd-type-selector">
          {EVENT_TYPES.map(type => (
            <button
              key={type}
              className={`cd-type-btn ${form.newType === type ? 'active' : ''}`}
              onClick={() => form.setNewType(type)}
              type="button"
              title={getEventTypeLabel(type)}
            >
              <span className="cd-type-label">{getEventTypeLabel(type)}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="cd-form-row">
        <span className="cd-form-label">{t('countdown.form.color', { defaultValue: '颜色' })}</span>
        <div className="cd-color-row">
          {COLOR_PRESETS.map(c => (
            <button
              key={c}
              className={`cd-color-dot ${form.newColor === c ? 'active' : ''}`}
              style={{ background: c }}
              onClick={() => form.setNewColor(c)}
              type="button"
            />
          ))}
          <button
            className="cd-color-dot cd-color-custom-trigger"
            style={{ background: COLOR_PRESETS.includes(form.newColor) ? undefined : form.newColor }}
            onClick={() => form.addCustomColorRef.current?.click()}
            type="button"
            title={t('countdown.form.customColor', { defaultValue: '自定义颜色' })}
          >
            <span className="cd-color-custom-icon">+</span>
          </button>
          <input
            ref={form.addCustomColorRef}
            type="color"
            className="cd-color-native-hidden"
            value={form.newColor}
            onChange={form.handleAddColorInput}
          />
        </div>
      </div>
      <div className="cd-form-row">
        <span className="cd-form-label">{t('countdown.form.background', { defaultValue: '背景' })}</span>
        <div className="cd-bg-row">
          <button
            className={`cd-bg-btn ${form.newBgImage && resolvedCoverImage && form.newBgImage === resolvedCoverImage ? 'active' : ''}`}
            type="button"
            title={resolvedCoverImage
              ? t('countdown.form.useAlbumCover', { defaultValue: '使用当前专辑封面' })
              : t('countdown.form.noPlayingSong', { defaultValue: '暂无正在播放的歌曲' })}
            disabled={!resolvedCoverImage}
            onClick={() => { if (resolvedCoverImage) form.setNewBgImage(resolvedCoverImage); }}
          >
            {resolvedCoverImage ? (
              <img src={resolvedCoverImage} className="cd-bg-btn-thumb" alt="" />
            ) : (
              <span className="cd-bg-btn-icon">♪</span>
            )}
          </button>
          <span className="cd-bg-label">{t('countdown.form.albumBackground', { defaultValue: '专辑背景' })}</span>
          <button
            className="cd-bg-btn"
            type="button"
            title={t('countdown.form.selectImageFile', { defaultValue: '从文件选择图片' })}
            onClick={async () => {
              const path = await window.api.openImageDialog();
              if (path) {
                const normalized = await normalizeImageSource(path);
                if (normalized) form.setNewBgImage(normalized);
              }
            }}
          >
            <span className="cd-bg-btn-icon">…</span>
          </button>
          <span className="cd-bg-label">{t('countdown.form.customBackground', { defaultValue: '自定义背景' })}</span>
          {form.newBgImage && (
            <button
              className="cd-bg-btn cd-bg-btn-clear"
              type="button"
              title={t('countdown.form.clearBackground', { defaultValue: '清除背景' })}
              onClick={() => form.setNewBgImage(undefined)}
            >
              <span className="cd-bg-btn-icon">x</span>
            </button>
          )}
        </div>
      </div>
      {form.newBgImage && (
        <div className="cd-form-row">
          <span className="cd-form-label">{t('countdown.form.opacity', { defaultValue: '透明度' })}</span>
          <input
            type="range"
            className="cd-opacity-slider"
            min={0} max={1} step={0.05}
            value={form.newBgOpacity}
            onChange={(e) => form.setNewBgOpacity(parseFloat(e.target.value))}
          />
          <span className="cd-opacity-value">{Math.round(form.newBgOpacity * 100)}%</span>
        </div>
      )}
      <div className="cd-form-actions">
        <button
          className="cd-btn save"
          onClick={onAdd}
          disabled={!selectedDate || !form.newName.trim()}
          type="button"
        >
          {t('countdown.actions.add', { defaultValue: '添加' })}
        </button>
      </div>
    </div>
  );
}
