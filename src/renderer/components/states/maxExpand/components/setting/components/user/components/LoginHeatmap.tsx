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
 * @file LoginHeatmap.tsx
 * @description 登录天数热力图：只要当天登录即着色，所有登录日使用相同颜色（不分强度）。
 * @author 鸡哥
 */

import { useEffect, useMemo, useRef, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { buildHeatmapMonths, HEATMAP_MONTH_KEYS } from '../../../../cli/utils/heatmapGrid';

interface LoginHeatmapProps {
  /** 登录日期键集合（`年-月-日`） */
  loginDays: Set<string>;
  /** 紧凑模式：在用户中心等空间受限处显示更小的格子 */
  compact?: boolean;
  /** 可见性：从隐藏切换为显示时，重新把今日滚动到水平居中 */
  visible?: boolean;
}

export function LoginHeatmap({ loginDays, compact = false, visible = true }: LoginHeatmapProps): ReactElement {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLSpanElement>(null);

  // 登录日 count 记为 1，未登录记为 0；着色与否取决于是否登录，颜色统一
  const months = useMemo(
    () => buildHeatmapMonths((key) => (loginDays.has(key) ? 1 : 0)).months,
    [loginDays],
  );

  useEffect(() => {
    if (!visible) return;
    const id = requestAnimationFrame(() => {
      const scroller = scrollRef.current;
      const today = todayRef.current;
      if (!scroller || !today) return;
      scroller.scrollLeft = today.offsetLeft - scroller.clientWidth / 2 + today.offsetWidth / 2;
    });
    return () => cancelAnimationFrame(id);
  }, [visible, loginDays]);

  const variantClass = compact ? ' cli-tab-heatmap--compact' : '';

  return (
    <div className={`cli-tab-heatmap-grid${variantClass}`}>
      <div className="cli-tab-heatmap-scroll" ref={scrollRef}>
        <div className="cli-tab-heatmap-cells">
          {months.map((month) => (
            <div key={month.key} className="cli-tab-heatmap-month-block">
              <span className="cli-tab-heatmap-month-label">
                {t(`maxExpand.cli.heatmap.month.${HEATMAP_MONTH_KEYS[month.month]}`, { defaultValue: HEATMAP_MONTH_KEYS[month.month] })}
              </span>
              <div className="cli-tab-heatmap-month">
                {month.cells.map((cell, idx) => {
                  const pos = month.offset + idx;
                  const loggedIn = !cell.future && cell.count > 0;
                  return (
                    <span
                      key={cell.key}
                      ref={cell.isToday ? todayRef : undefined}
                      className={`cli-tab-heatmap-cell${cell.future ? ' cli-tab-heatmap-cell--future' : (loggedIn ? ' cli-tab-heatmap-cell--login' : '')}${cell.isToday ? ' cli-tab-heatmap-cell--today' : ''}`}
                      style={{ gridColumnStart: Math.floor(pos / 7) + 1, gridRowStart: (pos % 7) + 1 }}
                      title={loggedIn ? `${cell.label}: ${t('maxExpand.cli.heatmap.loggedIn', { defaultValue: '已登录' })}` : ''}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
