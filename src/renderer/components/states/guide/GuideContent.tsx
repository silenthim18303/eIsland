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
 * @file GuideContent.tsx
 * @description 引导页组件，首次启动或更新后展示，帮助用户了解灵动岛功能
 * @author 鸡哥
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useIslandStore from '../../../store/slices';
import '../../../styles/guide/guide.css';
import { SvgIcon } from '../../../utils/SvgIcon';
import { GuideInteractivePage } from './components/GuideInteractivePage';
import { GuideStaticPage } from './components/GuideStaticPage';
import { GuideFooter } from './components/GuideFooter';
import {
  getGuidePages,
  getInteractionCards,
  getMusicCards,
  getSampleLyrics,
  getSettingCards,
  getToolCards,
  type MiniIslandDemo,
  type MiniMusicDemo,
  type MiniSettingDemo,
  type MiniToolDemo,
} from './config/guideContentConfig';
import {
  extractDominantColor,
  readStandaloneWindowMode,
  STANDALONE_WINDOW_ACTIVE_TAB_STORE_KEY,
  STANDALONE_WINDOW_AUTH_INTENT_STORE_KEY,
} from './utils/guideContentUtils';
import { useGuideNavigation } from './hooks/useGuideNavigation';
import albumArt from '../../../assets/avatar/T.jpg';
import { setThemeMode as applyThemeMode, getThemeMode, type ThemeMode } from '../../../utils/theme';
import i18n from '../../../i18n';
import { readLocalToken } from '../../../utils/userAccount';

/** 迷你设置岛演示组件 — 带实际生效的设置切换按钮 */
function MiniSettingIsland({ demo }: { demo: MiniSettingDemo }): React.ReactElement {
  const tr = (key: string, fallback: string): string => i18n.t(key, { defaultValue: fallback });
  const [themeMode, setThemeMode] = useState<ThemeMode>(getThemeMode);
  const [opacity, setOpacity] = useState(100);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [autostart, setAutostart] = useState<string>('disabled');

  useEffect(() => {
    if (demo === 'opacity') {
      window.api.islandOpacityGet().then((v) => {
        const safe = typeof v === 'number' ? Math.max(10, Math.min(100, Math.round(v))) : 100;
        setOpacity(safe);
      }).catch(() => {});
    }
    if (demo === 'position') {
      window.api.getIslandPositionOffset().then(setOffset).catch(() => {});
    }
    if (demo === 'autostart') {
      window.api.autostartGet().then((v) => setAutostart(v || 'disabled')).catch(() => {});
    }
  }, [demo]);

  const handleTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    applyThemeMode(mode);
  };

  const handleOpacity = (delta: number) => {
    setOpacity((prev) => {
      const next = Math.max(10, Math.min(100, prev + delta));
      document.documentElement.style.setProperty('--island-opacity', String(next));
      window.api.islandOpacitySet(next).catch(() => {});
      return next;
    });
  };

  const handleOffset = (dx: number, dy: number) => {
    setOffset((prev) => {
      const next = { x: prev.x + dx, y: prev.y + dy };
      window.api.setIslandPositionOffset(next).catch(() => {});
      return next;
    });
  };

  const handleAutostart = (mode: string) => {
    setAutostart(mode);
    window.api.autostartSet(mode).catch(() => {});
  };

  const renderDemo = () => {
    switch (demo) {
      case 'theme': {
        const visual = themeMode === 'system' ? 'auto' : themeMode;
        return (
          <div className="ms-theme">
            <div className={`ms-theme-preview ms-theme-${visual}`}>
              <div className="ms-theme-island" />
              <div className="ms-theme-label">{visual === 'dark' ? tr('guide.mini.setting.theme.dark', '深色') : visual === 'light' ? tr('guide.mini.setting.theme.light', '浅色') : tr('guide.mini.setting.theme.auto', '自动')}</div>
            </div>
          </div>
        );
      }
      case 'opacity':
        return (
          <div className="ms-opacity">
            <div className="ms-opacity-preview" style={{ opacity: opacity / 100 }}>
              <div className="ms-opacity-island" />
            </div>
            <span className="ms-opacity-val">{opacity}%</span>
          </div>
        );
      case 'position':
        return (
          <div className="ms-position">
            <div className="ms-position-preview">
              <div
                className="ms-position-island"
                style={{ transform: `translate(${offset.x * 0.3}px, ${offset.y * 0.3}px)` }}
              />
            </div>
            <span className="ms-position-val">x:{offset.x} y:{offset.y}</span>
          </div>
        );
      case 'autostart': {
        const label = autostart === 'enabled'
          ? tr('guide.mini.setting.autostart.on', '已开启')
          : autostart === 'high-priority'
            ? tr('guide.mini.setting.autostart.highPriority', '高优先级')
            : tr('guide.mini.setting.autostart.off', '已关闭');
        const isOn = autostart !== 'disabled';
        return (
          <div className="ms-autostart">
            <div className={`ms-autostart-indicator${isOn ? ' on' : ''}${autostart === 'high-priority' ? ' elevated' : ''}`} />
            <span className="ms-autostart-label">{label}</span>
          </div>
        );
      }
      case 'shortcut':
        return (
          <div className="ms-shortcut">
            <div className="ms-shortcut-list">
              <div className="ms-shortcut-row">
                <span className="ms-shortcut-label">{tr('guide.mini.setting.shortcut.toggleIsland', '隐藏/显示')}</span>
                <span className="ms-shortcut-keys"><kbd>Alt</kbd><span className="ms-shortcut-plus">+</span><kbd>X</kbd></span>
              </div>
              <div className="ms-shortcut-row">
                <span className="ms-shortcut-label">{tr('guide.mini.setting.shortcut.quitIsland', '关闭灵动岛')}</span>
                <span className="ms-shortcut-keys"><kbd>Alt</kbd><span className="ms-shortcut-plus">+</span><kbd>C</kbd></span>
              </div>
              <div className="ms-shortcut-row">
                <span className="ms-shortcut-label">{tr('guide.mini.setting.shortcut.resetPosition', '还原默认位置快捷键')}</span>
                <span className="ms-shortcut-keys"><kbd>Alt</kbd><span className="ms-shortcut-plus">+</span><kbd>B</kbd></span>
              </div>
              <div className="ms-shortcut-row">
                <span className="ms-shortcut-label">{tr('guide.mini.setting.shortcut.screenshot', '选区截图')}</span>
                <span className="ms-shortcut-keys"><kbd>Alt</kbd><span className="ms-shortcut-plus">+</span><kbd>V</kbd></span>
              </div>
              <div className="ms-shortcut-row">
                <span className="ms-shortcut-label">{tr('guide.mini.setting.shortcut.switchSong', '切换歌曲')}</span>
                <span className="ms-shortcut-keys"><kbd>Alt</kbd><span className="ms-shortcut-plus">+</span><kbd>S</kbd></span>
              </div>
            </div>
          </div>
        );
    }
  };

  const renderControls = () => {
    switch (demo) {
      case 'theme':
        return (
          <div className="ms-controls">
            {(['dark', 'light', 'system'] as ThemeMode[]).map((m) => (
              <button
                key={m}
                className={`ms-ctrl-btn${themeMode === m ? ' active' : ''}`}
                onClick={() => handleTheme(m)}
              >
                {m === 'dark' ? tr('guide.mini.setting.theme.dark', '深色') : m === 'light' ? tr('guide.mini.setting.theme.light', '浅色') : tr('guide.mini.setting.theme.system', '系统')}
              </button>
            ))}
          </div>
        );
      case 'opacity':
        return (
          <div className="ms-controls">
            <button className="ms-ctrl-btn" onClick={() => handleOpacity(-10)}>−10</button>
            <button className="ms-ctrl-btn" onClick={() => handleOpacity(-5)}>−5</button>
            <button className="ms-ctrl-btn" onClick={() => handleOpacity(5)}>+5</button>
            <button className="ms-ctrl-btn" onClick={() => handleOpacity(10)}>+10</button>
          </div>
        );
      case 'position':
        return (
          <div className="ms-controls ms-controls-grid">
            <button className="ms-ctrl-btn" onClick={() => handleOffset(0, -10)}>↑</button>
            <button className="ms-ctrl-btn" onClick={() => handleOffset(-10, 0)}>←</button>
            <button className="ms-ctrl-btn ms-ctrl-reset" onClick={() => handleOffset(-offset.x, -offset.y)}>●</button>
            <button className="ms-ctrl-btn" onClick={() => handleOffset(10, 0)}>→</button>
            <button className="ms-ctrl-btn" onClick={() => handleOffset(0, 10)}>↓</button>
          </div>
        );
      case 'autostart':
        return (
          <div className="ms-controls">
            {(['disabled', 'enabled', 'high-priority'] as string[]).map((m) => (
              <button
                key={m}
                className={`ms-ctrl-btn${autostart === m ? ' active' : ''}`}
                onClick={() => handleAutostart(m)}
              >
                {m === 'disabled'
                  ? tr('guide.mini.setting.controls.autostart.disabled', '关闭')
                  : m === 'enabled'
                    ? tr('guide.mini.setting.controls.autostart.enabled', '开启')
                    : tr('guide.mini.setting.controls.autostart.highPriority', '高优先级')}
              </button>
            ))}
          </div>
        );
      case 'shortcut':
        return null;
    }
  };

  return (
    <div className="mini-island-wrapper">
      <div className="mini-marquee-frame marquee-active">
        <div className="mini-island mini-setting-expanded">
          {renderDemo()}
        </div>
      </div>
      {renderControls()}
    </div>
  );
}

/** 迷你工具岛演示组件 — 布局与样式参照各实际功能面板 */
function MiniToolIsland({ demo }: { demo: MiniToolDemo }): React.ReactElement {
  const tr = (key: string, fallback: string, options?: Record<string, unknown>): string => i18n.t(key, { defaultValue: fallback, ...(options ?? {}) });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const renderContent = () => {
    switch (demo) {
      /* ── 待办事项：参照 TodoTab / ov-dash-todo ── */
      case 'todo': {
        const items: { text: string; priority?: string; pColor?: string; done?: boolean }[] = [
          { text: tr('guide.mini.tool.todo.items.design', '完成设计稿'), priority: 'P0', pColor: '#ff5252' },
          { text: tr('guide.mini.tool.todo.items.weeklyReport', '发送周报邮件'), priority: 'P1', pColor: '#ffab40' },
          { text: tr('guide.mini.tool.todo.items.notes', '整理项目笔记'), priority: 'P2', pColor: '#69c0ff' },
        ];
        return (
          <div className="mt-todo">
            <div className="mt-todo-header">
              <span className="mt-todo-title">{tr('guide.mini.tool.todo.title', '待办事项')}</span>
              <span className="mt-todo-stats">
                <span className="mt-todo-stat done">✓ {tick % 4}</span>
                <span className="mt-todo-stat undone">○ {3 - (tick % 4)}</span>
              </span>
            </div>
            <div className="mt-todo-list">
              {items.map((item, i) => {
                const checked = tick % 4 > i;
                return (
                  <div key={i} className={`mt-todo-item${checked ? ' done' : ''}`}>
                    <span className="mt-todo-check">{checked ? '✓' : '○'}</span>
                    <span className="mt-todo-text">{item.text}</span>
                    {item.priority && (
                      <span className="mt-todo-badge" style={{ background: item.pColor }}>{item.priority}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
      /* ── AI 对话：参照 AiChatTab 消息气泡 ── */
      case 'ai':
        return (
          <div className="mt-chat">
            <div className="mt-chat-header">{tr('guide.mini.tool.ai.title', 'AI 对话')}</div>
            <div className="mt-chat-messages">
              <div className="mt-chat-bubble user">{tr('guide.mini.tool.ai.hello', '你好')}</div>
              <div className="mt-chat-bubble ai">
                <span className="mt-chat-dot" />
                <span className="mt-chat-dot" />
                <span className="mt-chat-dot" />
              </div>
            </div>
          </div>
        );
      /* ── 倒数日：参照 CountdownTab 卡片 ── */
      case 'timer': {
        const days = 42 - (tick % 30);
        return (
          <div className="mt-countdown">
            <div className="mt-cd-card">
              <div className="mt-cd-overlay" />
              <div className="mt-cd-content">
                <span className="mt-cd-badge">{tr('guide.mini.tool.timer.badge', '倒数日')}</span>
                <span className="mt-cd-name">{tr('guide.mini.tool.timer.name', '重要截止日')}</span>
                <div className="mt-cd-bottom">
                  <span className="mt-cd-date">2026-05-01</span>
                  <span className="mt-cd-days" style={{ color: '#69c0ff' }}>
                    {days > 0
                      ? tr('guide.mini.tool.timer.days', '{{days}}天', { days })
                      : tr('guide.mini.tool.timer.expired', '已到期')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      }
      /* ── 番茄钟：参照 PomodoroWidget 环形进度 ── */
      case 'pomodoro': {
        const total = 25 * 60;
        const remaining = total - (tick % total);
        const progress = 1 - remaining / total;
        const r = 16;
        const circ = 2 * Math.PI * r;
        const offset = circ * (1 - progress);
        const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
        const ss = String(remaining % 60).padStart(2, '0');
        const phaseColor = '#ff6b6b';
        return (
          <div className="mt-pomo">
            <div className="mt-pomo-ring-wrap">
              <svg className="mt-pomo-ring" viewBox="0 0 36 36">
                <circle className="mt-pomo-ring-bg" cx="18" cy="18" r={r} />
                <circle
                  className="mt-pomo-ring-progress"
                  cx="18" cy="18" r={r}
                  style={{ stroke: phaseColor, strokeDasharray: circ, strokeDashoffset: offset }}
                />
              </svg>
              <div className="mt-pomo-inner">
                <span className="mt-pomo-time">{mm}:{ss}</span>
                <span className="mt-pomo-phase" style={{ color: phaseColor }}>{tr('guide.mini.tool.pomodoro.focusing', '专注中')}</span>
              </div>
            </div>
            <div className="mt-pomo-info">
              <img src={SvgIcon.POMODORO} alt="" className="mt-pomo-icon" />
              <span className="mt-pomo-count">× 0</span>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="mini-island-wrapper">
      <div className="mini-marquee-frame marquee-active">
        <div className="mini-island mini-tool-expanded">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

/** 迷你音乐岛演示组件 — 布局与样式完全参照 LyricsContent */
function MiniMusicIsland({ demo }: { demo: MiniMusicDemo }): React.ReactElement {
  const tr = (key: string, fallback: string): string => i18n.t(key, { defaultValue: fallback });
  const sampleLyrics = getSampleLyrics(i18n.t.bind(i18n));
  const [state, setState] = useState<'idle' | 'hover'>(demo === 'smtc' ? 'idle' : 'hover');
  const [lyricIdx, setLyricIdx] = useState(0);
  const [rgb, setRgb] = useState<[number, number, number]>([100, 100, 100]);
  const [sweepProg, setSweepProg] = useState(0);

  useEffect(() => { extractDominantColor(albumArt).then(setRgb); }, []);

  useEffect(() => {
    if (demo === 'smtc') {
      let expanded = false;
      const id = setInterval(() => {
        expanded = !expanded;
        setState(expanded ? 'hover' : 'idle');
      }, 1500);
      return () => clearInterval(id);
    }
    if (demo === 'lyrics' || demo === 'karaoke') setState('hover');
    return undefined;
  }, [demo]);

  useEffect(() => {
    if (demo !== 'lyrics') return;
    const id = setInterval(() => {
      setLyricIdx((prev) => (prev + 1) % sampleLyrics.length);
    }, 2000);
    return () => clearInterval(id);
  }, [demo, sampleLyrics.length]);

  useEffect(() => {
    if (demo !== 'karaoke') return;
    let raf: number;
    const duration = 3000;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - start) % duration;
      setSweepProg((elapsed / duration) * 100);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [demo]);

  const [r, g, b] = rgb;

  return (
    <div className="mini-island-wrapper">
      <div className={`mini-marquee-frame${state === 'hover' ? ' marquee-active' : ''}`} style={{ '--marquee-rgb': `${r}, ${g}, ${b}` } as React.CSSProperties}>
        <div className={`mini-island mini-music-${state}`}>
          {/* 背景光晕 — 与 idle-glow 一致 */}
          <div
            className={`mini-music-glow${state === 'hover' ? ' active' : ''}`}
            style={{ background: `radial-gradient(ellipse at 10% 50%, rgba(${r}, ${g}, ${b}, 0.35) 0%, transparent 60%)` }}
          />

          {/* 左侧：专辑封面（仅播放状态显示） */}
          {state === 'hover' && (
            <div
              className="mini-music-cover"
              style={{
                backgroundImage: `url(${albumArt})`,
                boxShadow: `0 0 8px 2px rgba(${r}, ${g}, ${b}, 0.5)`,
              }}
            />
          )}

          {/* 右侧：歌词区 */}
          {state === 'hover' && (
            <div className="mini-music-lyrics">
              {demo === 'smtc' && (
                <span className="mini-music-text mini-music-fade">♪ {tr('guide.mini.music.playing', '正在播放')}</span>
              )}
              {demo === 'lyrics' && (
                <span className="mini-music-text mini-music-fade" key={lyricIdx}>
                  {sampleLyrics[lyricIdx]}
                </span>
              )}
              {demo === 'karaoke' && (
                <span
                  className="mini-music-text mini-music-sweep"
                  style={{ '--lrc-prog': `${sweepProg.toFixed(1)}%` } as React.CSSProperties}
                >
                  {tr('guide.mini.music.karaokeSample', '这是一句歌词')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** 迷你灵动岛演示组件 */
function MiniIsland({ demo }: { demo: MiniIslandDemo }): React.ReactElement {
  const initState = demo === 'retract' ? 'expanded' : demo === 'click' ? 'hover' : 'idle';
  const [state, setState] = useState<'idle' | 'hover' | 'expanded'>(initState);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    if (demo !== 'scroll') return;
    const seq: Array<'idle' | 'hover' | 'expanded'> = ['idle', 'hover', 'expanded'];
    let idx = 0;
    const id = setInterval(() => {
      idx = (idx + 1) % seq.length;
      setState(seq[idx]);
    }, 1200);
    return () => clearInterval(id);
  }, [demo]);

  const handleMouseEnter = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (demo === 'hover') setState('hover');
    if (demo === 'retract') setState('expanded');
  };

  const handleMouseLeave = () => {
    if (demo === 'hover') setState('idle');
    if (demo === 'retract') {
      timerRef.current = setTimeout(() => setState('idle'), 600);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (demo === 'click') {
      setState('expanded');
      timerRef.current = setTimeout(() => setState('hover'), 1500);
    }
  };

  return (
    <div className="mini-island-wrapper">
      <div className="mini-marquee-frame marquee-active">
        <div
          className={`mini-island mini-island-${state}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        />
      </div>
    </div>
  );
}

/**
 * 引导页内容组件
 * @description 分页导航点展示，完成后标记当前版本并切回 idle
 */
export function GuideContent(): React.ReactElement {
  const { t } = useTranslation();
  const isLoggedIn = !!readLocalToken();
  const interactionCards = getInteractionCards(t);
  const musicCards = getMusicCards(t);
  const toolCards = getToolCards(t);
  const settingCards = getSettingCards(t);
  const guidePages = getGuidePages(t, !isLoggedIn);
  const { setIdle, setLogin, setRegister } = useIslandStore();
  const {
    page,
    setPage,
    cardIndex,
    animDirRef,
    isLast,
    handleCardWheel,
    handlePrev,
    handleNext,
    resetGuideState,
  } = useGuideNavigation({
    guidePages,
    interactionCardsLength: interactionCards.length,
    musicCardsLength: musicCards.length,
    toolCardsLength: toolCards.length,
    settingCardsLength: settingCards.length,
  });

  const handleFinish = useCallback(() => {
    resetGuideState();
    window.api?.updaterVersion?.().then((v) => {
      if (v) window.api?.storeWrite?.('guide-shown-version', v);
    }).catch(() => {});
    setIdle(true);
  }, [resetGuideState, setIdle]);

  const openAuthFromGuide = useCallback(async (target: 'login' | 'register'): Promise<void> => {
    const mode = await readStandaloneWindowMode();
    if (mode === 'standalone') {
      await window.api.storeWrite(STANDALONE_WINDOW_ACTIVE_TAB_STORE_KEY, 'settings').catch(() => {});
      await window.api.storeWrite(STANDALONE_WINDOW_AUTH_INTENT_STORE_KEY, target).catch(() => {});
      await window.api.openStandaloneWindow().catch(() => {});
      return;
    }
    if (target === 'login') {
      setLogin();
      return;
    }
    setRegister();
  }, [setLogin, setRegister]);

  const current = guidePages[page];
  const isBasic = current.interactive === 'basic';
  const isMusic = current.interactive === 'music';
  const isTools = current.interactive === 'tools';
  const cards: Array<{ iconSrc: string; title: string; desc: string }> =
    isBasic ? interactionCards : isMusic ? musicCards : isTools ? toolCards : settingCards;
  const hint = isBasic
    ? t('guide.hints.basicWheel', { defaultValue: '在此区域附近滚动滚轮可切换灵动岛状态' })
    : isMusic
      ? t('guide.hints.musicWheel', { defaultValue: '滚动查看更多音乐功能' })
      : isTools
        ? t('guide.hints.toolsWheel', { defaultValue: '滚动查看更多实用工具' })
        : t('guide.hints.settingsWheel', { defaultValue: '滚动查看个性化设置' });

  return (
    <div className="guide-content" onClick={(e) => e.stopPropagation()}>
      {current.interactive ? (
        <GuideInteractivePage
          page={page}
          cards={cards}
          cardIndex={cardIndex}
          hint={hint}
          animDir={animDirRef.current}
          onWheel={handleCardWheel}
          renderMini={(safeIdx) => {
            if (isBasic) return <MiniIsland demo={interactionCards[safeIdx].demo} />;
            if (isMusic) return <MiniMusicIsland demo={musicCards[safeIdx].demo} />;
            if (isTools) return <MiniToolIsland demo={toolCards[safeIdx].demo} />;
            return <MiniSettingIsland demo={settingCards[safeIdx].demo} />;
          }}
        />
      ) : (
        <GuideStaticPage
          page={page}
          current={current}
          t={t}
          onAuthLogin={() => void openAuthFromGuide('login')}
          onAuthRegister={() => void openAuthFromGuide('register')}
        />
      )}

      <GuideFooter
        t={t}
        page={page}
        isLast={isLast}
        pageCount={guidePages.length}
        onSelectPage={setPage}
        onFinish={handleFinish}
        onPrev={handlePrev}
        onNext={() => handleNext(handleFinish)}
      />
    </div>
  );
}
