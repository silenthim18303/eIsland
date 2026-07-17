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
 * @file CountdownTab.tsx
 * @description 最大展开模式 — 倒数日 Tab — 主组件：hook 调用与组件组合。
 * @author 鸡哥
 */

import React, { useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import useIslandStore from '../../../../../../store/slices';
import { useCountdownItems } from '../hooks/useCountdownItems';
import { useCountdownForm } from '../hooks/useCountdownForm';
import { normalizeImageSource, diffDays } from '../utils/countdownUtils';
import { CountdownCalendar } from './CountdownCalendar';
import { CountdownForm } from './CountdownForm';
import { CountdownPreview } from './CountdownPreview';
import { CountdownCardList } from './CountdownCardList';
import type { EventType } from '../types/countdownTypes';

/**
 * 倒数日 Tab 主组件：hook 调用 → 组件组合。
 */
export function CountdownTab(): React.ReactElement {
  const { t } = useTranslation();
  const cardsRef = useRef<HTMLDivElement>(null);
  const coverImage = useIslandStore((s) => s.coverImage);
  const [resolvedCoverImage, setResolvedCoverImage] = React.useState<string | null>(null);

  /* ── Hook: 条目管理 ── */
  const { items, setItems, removeItem } = useCountdownItems();

  /* ── Hook: 表单状态 ── */
  const form = useCountdownForm(setItems);

  /** 删除联动清除编辑状态 */
  const handleRemove = useCallback((id: number) => {
    removeItem(id);
    if (form.editingId === id) form.setEditingId(null);
  }, [removeItem, form.editingId, form.setEditingId]);

  /** 解析封面图片 */
  useEffect(() => {
    let cancelled = false;
    normalizeImageSource(coverImage ?? undefined).then((resolved) => {
      if (cancelled) return;
      setResolvedCoverImage(resolved ?? null);
    }).catch(() => {
      if (cancelled) return;
      setResolvedCoverImage(null);
    });
    return () => { cancelled = true; };
  }, [coverImage]);

  /** 日历高亮日期 */
  const highlightDates = items.map(i => new Date(i.date + 'T00:00:00'));

  /** 排序：按距今天数绝对值升序 */
  const sorted = [...items].sort((a, b) => {
    const da = Math.abs(diffDays(a.date));
    const db = Math.abs(diffDays(b.date));
    return da - db;
  });

  /** 卡片列表水平滚轮 */
  const handleCardsWheel = useCallback((e: React.WheelEvent) => {
    e.stopPropagation();
    if (cardsRef.current) {
      cardsRef.current.scrollLeft += e.deltaY;
    }
  }, []);

  /** 事件类型标签 */
  const getEventTypeLabel = (type: EventType): string => {
    return t(`countdown.types.${type}`, {
      defaultValue: type === 'countdown'
        ? '倒数日'
        : type === 'anniversary'
          ? '纪念日'
          : type === 'birthday'
            ? '生日'
            : type === 'holiday'
              ? '节日'
              : '考试',
    });
  };

  /** 天数文本 */
  const formatDayText = (days: number): string => {
    if (days > 0) return t('countdown.days.after', { defaultValue: '{{days}} 天后', days });
    if (days === 0) return t('countdown.days.today', { defaultValue: '就是今天' });
    return t('countdown.days.before', { defaultValue: '{{days}} 天前', days: Math.abs(days) });
  };

  const editItem = form.editingId !== null ? items.find(i => i.id === form.editingId) ?? null : null;

  return (
    <div className="max-expand-tab-panel countdown-panel-v2">
      {/* ===== 上部区域 ===== */}
      <div className="cd-top">
        {/* 左上：日历 */}
        <CountdownCalendar
          selectedDate={form.selectedDate}
          onSelectDate={form.setSelectedDate}
          highlightDates={highlightDates}
        />

        {/* 中：表单 */}
        <CountdownForm
          editing={form.editingId !== null}
          selectedDate={form.selectedDate}
          editItem={editItem}
          resolvedCoverImage={resolvedCoverImage}
          form={form}
          onAdd={form.addItem}
          onSaveEdit={form.saveEdit}
          onCancelEdit={() => form.setEditingId(null)}
          getEventTypeLabel={getEventTypeLabel}
        />

        {/* 右：卡片预览 */}
        <CountdownPreview
          editItem={editItem}
          editData={form.editData}
          editBgImage={form.editBgImage}
          editBgOpacity={form.editBgOpacity}
          newType={form.newType}
          newColor={form.newColor}
          newName={form.newName}
          newDesc={form.newDesc}
          newBgImage={form.newBgImage}
          newBgOpacity={form.newBgOpacity}
          selectedDate={form.selectedDate}
          getEventTypeLabel={getEventTypeLabel}
          formatDayText={formatDayText}
        />
      </div>

      {/* ===== 下部：卡片水平列表 ===== */}
      <CountdownCardList
        items={sorted}
        onStartEdit={form.startEdit}
        onRemove={handleRemove}
        getEventTypeLabel={getEventTypeLabel}
        formatDayText={formatDayText}
        cardsRef={cardsRef}
        onWheel={handleCardsWheel}
      />
    </div>
  );
}
