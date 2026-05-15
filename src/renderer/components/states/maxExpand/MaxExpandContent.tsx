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
 * @file MaxExpandContent.tsx
 * @description 最大展开模式内容组件，独立于 Expanded 的大面板，包含 AI 对话和设置 Tab
 * @author 鸡哥
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useIslandStore from '../../../store/slices';
import type { MaxExpandTab } from '../../../store/types';
import {
  MAXEXPAND_NAV_LAYOUT_STORE_KEY,
  normalizeMaxExpandNavLayoutConfig,
  type MaxExpandNavLayoutConfig,
} from './components/setting/utils/settingsConfig';
import '../../../styles/settings/settings.css';

const AiChatTab = React.lazy(() => import('./components/AiChatTab').then((module) => ({ default: module.AiChatTab })));
const TodoTab = React.lazy(() => import('./components/TodoTab').then((module) => ({ default: module.TodoTab })));
const UrlFavoritesTab = React.lazy(() => import('./components/UrlFavoritesTab').then((module) => ({ default: module.UrlFavoritesTab })));
const LocalFileSearchTab = React.lazy(() => import('./components/LocalFileSearchTab').then((module) => ({ default: module.LocalFileSearchTab })));
const ClipboardHistoryTab = React.lazy(() => import('./components/ClipboardHistoryTab').then((module) => ({ default: module.ClipboardHistoryTab })));
const AlbumTab = React.lazy(() => import('./components/AlbumTab').then((module) => ({ default: module.AlbumTab })));
const MailTab = React.lazy(() => import('./components/MailTab').then((module) => ({ default: module.MailTab })));
const SettingsTab = React.lazy(() => import('./components/SettingsTab').then((module) => ({ default: module.SettingsTab })));
const CountdownTab = React.lazy(() => import('./components/CountdownTab').then((module) => ({ default: module.CountdownTab })));
const MemoTab = React.lazy(() => import('./components/MemoTab').then((module) => ({ default: module.MemoTab })));
const AlarmTab = React.lazy(() => import('./components/AlarmTab').then((module) => ({ default: module.AlarmTab })));
const ToolboxTab = React.lazy(() => import('./components/ToolboxTab').then((module) => ({ default: module.ToolboxTab })));

/** 导航点标识 — 含特殊动作：expanded 返回 */
type NavDotId = MaxExpandTab | 'expanded';

/**
 * 最大展开模式内容组件
 * @description 包含 AI 对话窗口和设置面板，底部导航点切换 Tab 或返回 expanded
 */
/** 独立窗口模式下从灵动岛中移除的 Tab */
const STANDALONE_HIDDEN_TABS: Set<NavDotId> = new Set(['todo', 'countdown', 'urlFavorites', 'album', 'mail', 'localFileSearch', 'clipboardHistory', 'memo', 'alarm', 'toolbox', 'settings']);

/** 启动时读取一次，整个生命周期内不再变化（重启后生效） */
let _startupMode: 'integrated' | 'standalone' = 'integrated';
let _startupModeResolved = false;
const _startupModeReady: Promise<void> = (window.api?.storeRead?.('standalone-window-mode') ?? Promise.resolve(null))
  .then((data: unknown) => {
    if (data === 'standalone') {
      _startupMode = 'standalone';
      return;
    }
    return window.api?.storeRead?.('countdown-window-mode').then((legacyMode: unknown) => {
      if (legacyMode === 'standalone') _startupMode = 'standalone';
    }).catch(() => {});
  })
  .catch(() => {})
  .finally(() => { _startupModeResolved = true; });

/**
 * 最大展开模式内容组件
 * @description 渲染最大展开态的 Tab 内容与底部导航点
 */
export function MaxExpandContent(): React.ReactElement {
  const { t } = useTranslation();
  const { setExpanded, maxExpandTab: activeTab, setMaxExpandTab: setActiveTab } = useIslandStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right');
  const [tabAnimation, setTabAnimation] = useState(true);
  const [contentReady, setContentReady] = useState(false);
  const [navLayoutConfig, setNavLayoutConfig] = useState<MaxExpandNavLayoutConfig>([]);
  const [navLayoutLoaded, setNavLayoutLoaded] = useState(false);

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => setContentReady(true));
    return () => window.cancelAnimationFrame(raf);
  }, []);

  /** 根据用户配置动态生成导航点序列 */
  const NAV_DOTS: NavDotId[] = useMemo(() => {
    const visibleTabs = navLayoutConfig
      .filter((item) => item.visible)
      .map((item) => item.id as NavDotId);
    return ['expanded' as NavDotId, ...visibleTabs, 'settings' as NavDotId];
  }, [navLayoutConfig]);
  const navDotsRef = useRef(NAV_DOTS);
  navDotsRef.current = NAV_DOTS;

  useEffect(() => {
    let cancelled = false;
    window.api.storeRead('maxexpand-tab-animation').then((v: unknown) => {
      if (cancelled) return;
      if (v === false) setTabAnimation(false);
    }).catch(() => {});
    const unsub = window.api.onSettingsChanged((channel: string, value: unknown) => {
      if (cancelled) return;
      if (channel === 'settings:maxexpand-tab-animation') setTabAnimation(value !== false);
    });
    return () => { cancelled = true; unsub(); };
  }, []);

  /** 当前 activeTab 不在可见导航点中时，自动跳转到第一个可见页面 */
  useEffect(() => {
    if (activeTab === 'settings') return;
    const isVisible = NAV_DOTS.includes(activeTab);
    if (!isVisible && NAV_DOTS.length > 2) {
      setActiveTab(NAV_DOTS[1] as MaxExpandTab);
    }
  }, [NAV_DOTS, activeTab, setActiveTab]);

  /** 加载全展开导航布局配置 */
  useEffect(() => {
    let cancelled = false;
    window.api.storeRead(MAXEXPAND_NAV_LAYOUT_STORE_KEY).then((data: unknown) => {
      if (cancelled) return;
      const normalized = normalizeMaxExpandNavLayoutConfig(data);
      setNavLayoutConfig(normalized);
      setNavLayoutLoaded(true);
    }).catch(() => {});
    const unsub = window.api.onSettingsChanged((channel: string, value: unknown) => {
      if (cancelled) return;
      if (channel === `store:${MAXEXPAND_NAV_LAYOUT_STORE_KEY}`) {
        setNavLayoutConfig(normalizeMaxExpandNavLayoutConfig(value));
      }
    });
    const handleLocalChange = (e: Event): void => {
      if (cancelled) return;
      const detail = (e as CustomEvent).detail;
      setNavLayoutConfig(normalizeMaxExpandNavLayoutConfig(detail));
    };
    window.addEventListener('maxexpand-nav-layout-changed', handleLocalChange);
    return () => { cancelled = true; unsub(); window.removeEventListener('maxexpand-nav-layout-changed', handleLocalChange); };
  }, []);

  const [countdownMode, setCountdownMode] = useState<'integrated' | 'standalone'>(
    _startupModeResolved ? _startupMode : 'integrated'
  );

  useEffect(() => {
    let cancelled = false;
    _startupModeReady.then(() => {
      if (cancelled) return;
      setCountdownMode(_startupMode);
      if (_startupMode === 'standalone' && STANDALONE_HIDDEN_TABS.has(activeTabRef.current)) {
        setActiveTab('aiChat');
      }
    });
    return () => { cancelled = true; };
  }, [setActiveTab]);

  /** 独立窗口模式下过滤掉的导航点 */
  const filteredNavDots = useMemo(() => {
    const getNavLabel = (id: NavDotId): string => t(`maxExpand.nav.${id}`, {
      defaultValue: id === 'expanded'
        ? '返回'
        : id === 'todo'
          ? '待办'
            : id === 'urlFavorites'
              ? 'URL 收藏'
              : id === 'album'
                ? '相册'
              : id === 'mail'
                ? '邮箱'
              : id === 'localFileSearch'
                ? '文件查找'
              : id === 'clipboardHistory'
                ? '剪贴板'
            : id === 'aiChat'
              ? 'AI 对话'
              : id === 'memo'
                ? '备忘录'
              : id === 'countdown'
                ? '倒数日'
              : id === 'alarm'
                ? '闹钟'
              : id === 'toolbox'
                ? '工具箱'
                : '设置',
    });
    if (countdownMode === 'standalone') {
      return NAV_DOTS.filter(d => !STANDALONE_HIDDEN_TABS.has(d)).map((id) => ({ id, label: getNavLabel(id) }));
    }
    return NAV_DOTS.map((id) => ({ id, label: getNavLabel(id) }));
  }, [countdownMode, t, NAV_DOTS]);
  const filteredNavDotsRef = useRef(filteredNavDots);
  filteredNavDotsRef.current = filteredNavDots;

  /** 切换 Tab */
  const navigateTab = useCallback((id: NavDotId): void => {
    if (id === 'expanded') { setExpanded(); return; }
    const dots = navDotsRef.current;
    const curIdx = dots.indexOf(activeTabRef.current);
    const nextIdx = dots.indexOf(id as NavDotId);
    setSlideDir(nextIdx >= curIdx ? 'right' : 'left');
    setActiveTab(id);
  }, [setExpanded, setActiveTab]);

  /** 滚轮切换 Tab */
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent): void => {
      const target = e.target as HTMLElement;
      if (target.closest('.expand-todo-list')) return;
      if (target.closest('.url-favorites-list')) return;
      if (target.closest('.url-favorites-input')) return;
      if (target.closest('.album-grid')) return;
      if (target.closest('.album-viewer-canvas')) return;
      if (target.closest('.album-meta-panel')) return;
      if (target.closest('.album-sort-select')) return;
      if (target.closest('.local-file-search-results')) return;
      if (target.closest('.local-file-search-root-input')) return;
      if (target.closest('.local-file-search-query-input')) return;
      if (target.closest('.clipboard-history-list')) return;
      if (target.closest('.max-expand-settings')) return;
      if (target.closest('.countdown-calendar-wrap')) return;
      if (target.closest('.cd-cards-wrap')) return;
      if (target.closest('.cd-editor-form')) return;
      if (target.closest('.cd-color-picker-popup')) return;
      if (target.closest('.max-expand-chat-messages')) return;
      if (target.closest('.max-expand-chat-session-sidebar')) return;
      if (target.closest('.max-expand-chat-session-list')) return;
      if (target.closest('.max-expand-chat-web-access-panel')) return;
      if (target.closest('.max-expand-chat-web-access-card')) return;
      if (target.closest('.max-expand-chat-local-tool-access-card')) return;
      if (target.closest('.max-expand-chat-input')) return;
      if (target.closest('.settings-mail-tab-inbox-list')) return;
      if (target.closest('.settings-mail-tab-reader')) return;
      if (target.closest('.settings-field-input')) return;
      if (target.closest('.settings-field-textarea')) return;
      if (target.closest('.memo-tab-container')) return;
      if (target.closest('.alarm-tab-container')) return;
      e.preventDefault();

      const dots = filteredNavDotsRef.current;
      const cur = activeTabRef.current;
      const currentIndex = dots.findIndex(d => d.id === cur);
      let nextId: NavDotId;
      if (e.deltaY > 0) {
        nextId = dots[(currentIndex + 1) % dots.length].id;
      } else {
        nextId = dots[(currentIndex - 1 + dots.length) % dots.length].id;
      }
      navigateTab(nextId);
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [setExpanded]);

  /** 导航点点击 */
  const handleNavClick = (id: NavDotId): void => {
    navigateTab(id);
  };

  const renderLoadingFallback = (): React.ReactElement => (
    <div className="max-expand-tab-loading">
      <span className="max-expand-tab-loading-spinner" aria-hidden="true" />
      <span className="max-expand-tab-loading-text">
        {t('maxExpand.loading', { defaultValue: '正在加载最大展开界面...' })}
      </span>
    </div>
  );

  const renderActiveTab = (): React.ReactElement | null => {
    if (!contentReady) return renderLoadingFallback();
    if (activeTab === 'aiChat') return <AiChatTab />;
    if (activeTab === 'todo') return <TodoTab />;
    if (activeTab === 'urlFavorites') return <UrlFavoritesTab />;
    if (activeTab === 'localFileSearch') return <LocalFileSearchTab />;
    if (activeTab === 'clipboardHistory') return <ClipboardHistoryTab />;
    if (activeTab === 'album') return <AlbumTab />;
    if (activeTab === 'mail') return <MailTab />;
    if (activeTab === 'memo') return <MemoTab />;
    if (activeTab === 'countdown') return <CountdownTab />;
    if (activeTab === 'alarm') return <AlarmTab />;
    if (activeTab === 'toolbox') return <ToolboxTab />;
    if (activeTab === 'settings') return <SettingsTab />;
    return null;
  };

  return (
    <div className="settings-content" ref={contentRef}>
      {/* Tab 内容区域 */}
      <div className="max-expand-tab-content" onClick={(e) => e.stopPropagation()}>
        <div className={`max-expand-tab-transition${tabAnimation ? ` max-expand-tab-slide-${slideDir}` : ''}`} key={activeTab}>
          <React.Suspense fallback={renderLoadingFallback()}>
            {renderActiveTab()}
          </React.Suspense>
        </div>
      </div>

      {/* 底部导航点 */}
      <div className="settings-nav-dots" onClick={(e) => e.stopPropagation()} style={navLayoutLoaded ? undefined : { visibility: 'hidden' }}>
        {filteredNavDots.map(({ id, label }) => (
          <button
            key={id}
            className={`settings-nav-dot ${activeTab === id ? 'active' : ''}`}
            onClick={() => handleNavClick(id)}
            title={label}
            aria-label={t('maxExpand.nav.switchTo', { defaultValue: '切换到{{label}}', label })}
          />
        ))}
      </div>
    </div>
  );
}
