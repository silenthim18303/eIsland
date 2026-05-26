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
import {
  DEFAULT_EXPAND_NAV_LAYOUT,
  EXPAND_NAV_LAYOUT_STORE_KEY,
  normalizeExpandNavLayoutConfig,
  type ExpandNavLayoutConfig,
} from '../maxExpand/components/setting/utils/settingsConfig';
import {
  MAXEXPAND_PERFORMANCE_MODE_STORE_KEY,
  cacheMaxExpandPerformanceModeEnabled,
  normalizeMaxExpandPerformanceModeEnabled,
  readCachedMaxExpandPerformanceModeEnabled,
} from '../maxExpand/components/setting/utils/performanceSettings';
import { preloadMaxExpandContentEager } from '../maxExpand/maxExpandContentEagerLoader';
import '../../../styles/expanded/expanded.css';
import { OverviewTab } from './components/OverviewTab';
import { PerformanceMonitorTab } from './components/PerformanceMonitorTab';
import { SongTab } from './components/SongTab';
import { ToolsTab } from './components/ToolsTab';

/** 导航点标识 — 含特殊动作：hover 返回、settings 切换独立状态 */
type NavDotId = ExpandTab | 'maxExpand';

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
  const [tabAnimation, setTabAnimation] = useState(true);
  const [maxExpandPerformanceModeEnabled, setMaxExpandPerformanceModeEnabled] = useState(readCachedMaxExpandPerformanceModeEnabled);
  const [navLayoutConfig, setNavLayoutConfig] = useState<ExpandNavLayoutConfig>(DEFAULT_EXPAND_NAV_LAYOUT);

  const NAV_DOTS: NavDotId[] = useMemo(() => {
    const visibleTabs = navLayoutConfig
      .filter((item) => item.visible)
      .map((item) => item.id as ExpandTab);
    return ['hover' as ExpandTab, ...visibleTabs, 'maxExpand' as NavDotId];
  }, [navLayoutConfig]);

  const navDotsRef = useRef(NAV_DOTS);
  navDotsRef.current = NAV_DOTS;

  const preloadEagerWhenPerformanceModeDisabled = useCallback((): void => {
    if (!maxExpandPerformanceModeEnabled) {
      preloadMaxExpandContentEager();
    }
  }, [maxExpandPerformanceModeEnabled]);

  useEffect(() => {
    let cancelled = false;
    window.api.storeRead(EXPAND_NAV_LAYOUT_STORE_KEY).then((data: unknown) => {
      if (cancelled) return;
      setNavLayoutConfig(normalizeExpandNavLayoutConfig(data));
    }).catch(() => {});
    const unsubExpand = window.api.onSettingsChanged((channel: string, value: unknown) => {
      if (cancelled) return;
      if (channel === `store:${EXPAND_NAV_LAYOUT_STORE_KEY}`) {
        setNavLayoutConfig(normalizeExpandNavLayoutConfig(value));
      }
    });
    const handleLocalExpandLayoutChange = (e: Event): void => {
      if (cancelled) return;
      const detail = (e as CustomEvent).detail;
      setNavLayoutConfig(normalizeExpandNavLayoutConfig(detail));
    };
    window.addEventListener('expand-nav-layout-changed', handleLocalExpandLayoutChange);

    if (!readCachedMaxExpandPerformanceModeEnabled()) {
      preloadMaxExpandContentEager();
    }
    window.api.storeRead(MAXEXPAND_PERFORMANCE_MODE_STORE_KEY).then((value: unknown) => {
      if (cancelled) return;
      const enabled = normalizeMaxExpandPerformanceModeEnabled(value);
      cacheMaxExpandPerformanceModeEnabled(enabled);
      setMaxExpandPerformanceModeEnabled(enabled);
      if (!enabled) preloadMaxExpandContentEager();
    }).catch(() => {});
    const unsubscribe = window.api.onSettingsChanged((channel: string, value: unknown) => {
      if (cancelled) return;
      if (channel === `store:${MAXEXPAND_PERFORMANCE_MODE_STORE_KEY}`) {
        const enabled = normalizeMaxExpandPerformanceModeEnabled(value);
        cacheMaxExpandPerformanceModeEnabled(enabled);
        setMaxExpandPerformanceModeEnabled(enabled);
        if (!enabled) preloadMaxExpandContentEager();
      }
    });
    return () => {
      cancelled = true;
      unsubscribe();
      unsubExpand();
      window.removeEventListener('expand-nav-layout-changed', handleLocalExpandLayoutChange);
    };
  }, []);

  useEffect(() => {
    const isVisible = NAV_DOTS.includes(expandTab);
    if (!isVisible && NAV_DOTS.length > 2) {
      setExpandTab(NAV_DOTS[1] as ExpandTab);
    }
  }, [NAV_DOTS, expandTab, setExpandTab]);

  const handleSetMaxExpand = useCallback((): void => {
    preloadEagerWhenPerformanceModeDisabled();
    setMaxExpand();
  }, [preloadEagerWhenPerformanceModeDisabled, setMaxExpand]);

  useEffect(() => {
    let cancelled = false;
    window.api.storeRead('expand-tab-animation').then((v: unknown) => {
      if (cancelled) return;
      if (v === false) setTabAnimation(false);
    }).catch(() => {});
    const unsub = window.api.onSettingsChanged((channel: string, value: unknown) => {
      if (cancelled) return;
      if (channel === 'settings:expand-tab-animation') setTabAnimation(value !== false);
    });
    return () => { cancelled = true; unsub(); };
  }, []);

  const getNavLabel = (tab: NavDotId): string => t(`expanded.nav.${tab}`, {
    defaultValue: tab === 'hover'
      ? '返回'
      : tab === 'overview'
        ? '总览'
        : tab === 'song'
          ? '歌曲'
          : tab === 'tools'
            ? '工具'
            : tab === 'performanceMonitor'
              ? '性能监控'
              : '最大展开',
  });

  /** 滚轮切换 Tab */
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent): void => {
      const target = e.target as HTMLElement;
      if (target.closest('.ov-dash-todo-list')) return;
      if (target.closest('.ov-dash-apps')) return;
      if (target.closest('.ov-dash-url-favorites-list')) return;
      if (target.closest('.ov-dash-break-reminder-list')) return;
      if (target.closest('.tools-app-list-body')) return;
      e.preventDefault();
      const cur = expandTabRef.current;
      const dots = navDotsRef.current;
      const currentIndex = dots.findIndex((d) => d === cur);
      if (currentIndex < 0) return;
      let nextId: NavDotId;
      if (e.deltaY > 0) {
        nextId = dots[(currentIndex + 1) % dots.length];
      } else {
        nextId = dots[(currentIndex - 1 + dots.length) % dots.length];
      }
      if (nextId === 'hover') { setHover(); return; }
      if (nextId === 'maxExpand') { handleSetMaxExpand(); return; }
      const curIdx = dots.indexOf(expandTabRef.current);
      const nextIdx = dots.indexOf(nextId);
      setSlideDir(nextIdx >= curIdx ? 'right' : 'left');
      setExpandTab(nextId);
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [setExpandTab, setHover, handleSetMaxExpand]);

  return (
    <div className="expanded-content" ref={contentRef}>
      {/* Tab 内容区域 */}
      <div className="expand-tab-content" onClick={(e) => e.stopPropagation()}>
        <div className={`expand-tab-transition${tabAnimation ? ` expand-tab-slide-${slideDir}` : ''}`} key={expandTab}>
          {expandTab === 'overview' && <OverviewTab />}
          {expandTab === 'song' && <SongTab />}
          {expandTab === 'tools' && <ToolsTab />}
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
            title={getNavLabel(tab)}
            aria-label={t('expanded.nav.switchToPage', { defaultValue: '切换到{{label}}页面', label: getNavLabel(tab) })}
          />
        ))}
      </div>
    </div>
  );
}
