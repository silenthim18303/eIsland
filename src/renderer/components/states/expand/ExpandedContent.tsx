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
 * @file ExpandedContent.tsx
 * @description Expanded 状态内容组件，单击灵动岛后展开的快捷操作面板
 * @author 鸡哥
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useIslandStore from '../../../store/slices';
import type { ExpandTab } from '../../../store/types';
import '../../../styles/expanded/expanded.css';
import { OverviewTab } from './components/OverviewTab';
import { PerformanceMonitorTab } from './components/PerformanceMonitorTab';
import { SongTab } from './components/SongTab';
import { ToolsTab } from './components/ToolsTab';
import { TranslationTab } from './components/TranslationTab';
import type { NavDotId } from './config/types';
import { useExpandNavLayout } from './hooks/useExpandNavLayout';
import { useExpandTabAnimation } from './hooks/useExpandTabAnimation';
import { useExpandWheelNav } from './hooks/useExpandWheelNav';
import { getNavLabel } from './utils/getNavLabel';

/**
 * Expanded 状态内容组件
 * @description 扩展状态下的完整功能面板，底部正中间导航点切换 Tab
 */
export function ExpandedContent(): React.ReactElement {
  const { t } = useTranslation();
  const { expandTab, setExpandTab, setHover, setMaxExpand } = useIslandStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const expandTabRef = useRef(expandTab);
  expandTabRef.current = expandTab;

  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right');

  const { navLayoutConfig, preloadEagerWhenPerformanceModeDisabled } = useExpandNavLayout();
  const tabAnimation = useExpandTabAnimation();

  const NAV_DOTS: NavDotId[] = useMemo(() => {
    const visibleTabs = navLayoutConfig
      .filter((item) => item.visible)
      .map((item) => item.id as ExpandTab);
    return ['hover' as ExpandTab, ...visibleTabs, 'maxExpand' as NavDotId];
  }, [navLayoutConfig]);

  const navDotsRef = useRef(NAV_DOTS);
  navDotsRef.current = NAV_DOTS;

  const handleSetMaxExpand = useCallback((): void => {
    preloadEagerWhenPerformanceModeDisabled();
    setMaxExpand();
  }, [preloadEagerWhenPerformanceModeDisabled, setMaxExpand]);

  useEffect(() => {
    const isVisible = NAV_DOTS.includes(expandTab);
    if (!isVisible && NAV_DOTS.length > 2) {
      setExpandTab(NAV_DOTS[1] as ExpandTab);
    }
  }, [NAV_DOTS, expandTab, setExpandTab]);

  useExpandWheelNav({
    contentRef,
    expandTabRef,
    navDotsRef,
    setExpandTab,
    setHover,
    handleSetMaxExpand,
    setSlideDir,
  });

  return (
    <div className="expanded-content" ref={contentRef}>
      {/* Tab 内容区域 */}
      <div className="expand-tab-content" onClick={(e) => e.stopPropagation()}>
        <div className={`expand-tab-transition${tabAnimation ? ` expand-tab-slide-${slideDir}` : ''}`} key={expandTab}>
          {expandTab === 'overview' && <OverviewTab />}
          {expandTab === 'song' && <SongTab />}
          {expandTab === 'tools' && <ToolsTab />}
          {expandTab === 'translation' && <TranslationTab />}
          {expandTab === 'performanceMonitor' && <PerformanceMonitorTab />}
        </div>
      </div>

      {/* 底部导航点 */}
      <div className="expand-nav-dots" onClick={(e) => e.stopPropagation()}>
        {NAV_DOTS.map((tab) => (
          <button
            key={tab}
            className={`expand-nav-dot ${expandTab === tab ? 'active' : ''}`}
            onClick={() => {
              if (tab === 'hover') { setHover(); }
              else if (tab === 'maxExpand') { handleSetMaxExpand(); }
              else {
                const curIdx = navDotsRef.current.indexOf(expandTabRef.current);
                const nextIdx = navDotsRef.current.indexOf(tab);
                setSlideDir(nextIdx >= curIdx ? 'right' : 'left');
                setExpandTab(tab);
              }
            }}
            title={getNavLabel(tab, t)}
            aria-label={t('expanded.nav.switchToPage', { defaultValue: '切换到{{label}}页面', label: getNavLabel(tab, t) })}
          />
        ))}
      </div>
    </div>
  );
}
