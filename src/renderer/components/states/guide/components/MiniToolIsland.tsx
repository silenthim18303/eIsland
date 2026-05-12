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
 * @file MiniToolIsland.tsx
 * @description 迷你工具岛演示组件 — 布局与样式参照各实际功能面板
 * @author 鸡哥
 */

import React, { useEffect, useState } from 'react';
import { SvgIcon } from '../../../../utils/SvgIcon';
import i18n from '../../../../i18n';
import type { MiniToolDemo } from '../config/guideContentConfig';

/** 迷你工具岛演示组件 — 布局与样式参照各实际功能面板 */
export function MiniToolIsland({ demo }: { demo: MiniToolDemo }): React.ReactElement {
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
