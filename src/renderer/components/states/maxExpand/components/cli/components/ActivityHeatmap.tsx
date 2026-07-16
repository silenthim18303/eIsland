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
 * @file ActivityHeatmap.tsx
 * @description Claude Code 活动热力图（独立组件，CLI 面板与用户中心共享）
 * @author 鸡哥
 */

import { useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import type { ActivityHeatmapProps, HeatmapMetric } from '../types/types';
import { HEATMAP_MONTH_KEYS } from '../utils/heatmapGrid';
import { useHeatmapGrid } from '../hooks/useHeatmapGrid';
import { useHeatmapScroll } from '../hooks/useHeatmapScroll';

/**
 * Claude Code 活动热力图组件
 * @param props - 组件属性
 * @returns 热力图 React 元素
 */
export function ActivityHeatmap({ heatmap, compact = false, visible = true }: ActivityHeatmapProps): ReactElement {
  const { t } = useTranslation();
  const [metric, setMetric] = useState<HeatmapMetric>('session');
  const grid = useHeatmapGrid(heatmap, metric);
  const { scrollRef, todayRef } = useHeatmapScroll(visible, metric);

  const variantClass = compact ? ' cli-tab-heatmap--compact' : '';

  return (
    <>
      <div className={`cli-tab-heatmap-metrics${variantClass}`}>
        <button
          type="button"
          className={`cli-tab-heatmap-metric ${metric === 'session' ? 'active' : ''}`}
          onClick={() => setMetric('session')}
        >
          {t('maxExpand.cli.heatmap.session', { defaultValue: '会话开始' })} {grid.totals.session}
        </button>
        <button
          type="button"
          className={`cli-tab-heatmap-metric ${metric === 'tool' ? 'active' : ''}`}
          onClick={() => setMetric('tool')}
        >
          {t('maxExpand.cli.heatmap.tool', { defaultValue: '工具调用' })} {grid.totals.tool}
        </button>
        <button
          type="button"
          className={`cli-tab-heatmap-metric ${metric === 'prompt' ? 'active' : ''}`}
          onClick={() => setMetric('prompt')}
        >
          {t('maxExpand.cli.heatmap.prompt', { defaultValue: '提示词输入' })} {grid.totals.prompt}
        </button>
      </div>
      <div className={`cli-tab-heatmap-grid${variantClass}`}>
        <div className="cli-tab-heatmap-scroll" ref={scrollRef}>
          <div className="cli-tab-heatmap-cells">
            {grid.months.map((month) => (
              <div key={month.key} className="cli-tab-heatmap-month-block">
                <span className="cli-tab-heatmap-month-label">
                  {t(`maxExpand.cli.heatmap.month.${HEATMAP_MONTH_KEYS[month.month]}`, { defaultValue: HEATMAP_MONTH_KEYS[month.month] })}
                </span>
                <div className="cli-tab-heatmap-month">
                  {month.cells.map((cell, idx) => {
                    const pos = month.offset + idx;
                    return (
                      <span
                        key={cell.key}
                        ref={cell.isToday ? todayRef : undefined}
                        className={`cli-tab-heatmap-cell${cell.future ? ' cli-tab-heatmap-cell--future' : ` level-${grid.levelOf(cell.count)}`}${cell.isToday ? ' cli-tab-heatmap-cell--today' : ''}`}
                        style={{ gridColumnStart: Math.floor(pos / 7) + 1, gridRowStart: (pos % 7) + 1 }}
                        title={cell.future ? '' : `${cell.label}: ${cell.count}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
