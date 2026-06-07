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
 * @file useClaudeCliSessionStatus.ts
 * @description 订阅 Claude Code CLI 状态，提供“是否存在活跃会话”的同步只读引用。
 * @author 鸡哥
 */

import { useEffect, useRef } from 'react';
import { playNotificationSoundOnce } from '../../utils/audio/notificationSound';
import { readEffectiveAudioVolume } from '../../utils/audio/volume';
import useIslandStore from '../../store/isLandStore';
import { AgentIcon } from '../../utils/SvgIcon';

/**
 * @description 以 ref 形式追踪是否存在活跃 Claude 会话（phase 非 completed），不触发组件重渲染。
 * @returns 包含 hasActiveSessionRef 的对象，可在事件回调中同步读取。
 */
export function useClaudeCliSessionStatus(): {
  hasActiveSessionRef: React.MutableRefObject<boolean>;
} {
  const hasActiveSessionRef = useRef(false);
  // 已提示过的待授权事件 id，避免重复播放音效
  const seenPermissionIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);
  // 基线顶部事件 id，用于判断是否出现新的事件
  const baselineTopEventIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const applySnapshot = (snapshot: { sessions: Array<{ phase: string; pendingPermission?: { id: string } | null }>; events?: Array<{ id: string; eventName?: string }> } | null | undefined): void => {
      if (cancelled || !snapshot) return;
      hasActiveSessionRef.current = snapshot.sessions.some((session) => session.phase !== 'completed');

      // 收集当前所有待授权事件 id
      const pendingIds = new Set<string>(
        snapshot.sessions
          .filter((session) => session.phase === 'waiting_permission' && session.pendingPermission?.id)
          .map((session) => session.pendingPermission!.id),
      );

      const topEvent = snapshot.events?.[0];
      const topEventId = topEvent?.id ?? null;
      const topEventName = topEvent?.eventName ?? '';
      const isSessionStartEvent = /^session(start)$/i.test(topEventName) || /^sessionstart$/i.test(topEventName);

      // 首次快照只记录基线，不触发音效；之后出现新的待授权请求才播放
      if (initializedRef.current) {
        [...pendingIds].some((id) => {
          if (seenPermissionIdsRef.current.has(id)) return false;
          playNotificationSoundOnce();
          // 若当前不在 CLI 视图（cli 态 / maxExpand 的 CLI 标签），切换到 cli 态展示授权
          const store = useIslandStore.getState();
          const inCliView = store.state === 'cli' || (store.state === 'maxExpand' && store.maxExpandTab === 'cli');
          if (!inCliView) store.setCli();
          return true;
        });

        // 只要检测到新的 SessionStart 事件，就弹通知 + 音效 + 光效（不再限制每次启动仅一次）
        if (topEventId && topEventId !== baselineTopEventIdRef.current && isSessionStartEvent) {
          const store = useIslandStore.getState();
          const inCliView = store.state === 'cli' || (store.state === 'maxExpand' && store.maxExpandTab === 'cli');
          if (!inCliView) {
            // 与 STT 触发同款音效
            void (async () => {
              const targetVolume = await readEffectiveAudioVolume('effect').catch(() => 1);
              const triggerSound = new Audio('./audio/AGENT.wav');
              triggerSound.volume = targetVolume;
              void triggerSound.play().catch(() => {
                triggerSound.src = './public/audio/AGENT.wav';
                triggerSound.volume = targetVolume;
                void triggerSound.play().catch(() => {});
              });
            })();
            void window.api?.cliGlowShow?.();
            store.setNotification({
              title: 'Claude Code',
              body: '检测到新的 Claude Code 活动，是否切换到 CLI 面板查看？',
              icon: AgentIcon.CLAUDE_KB,
              type: 'cli-session-detected',
            });
          }
        }
      }
      initializedRef.current = true;
      seenPermissionIdsRef.current = pendingIds;
      baselineTopEventIdRef.current = topEventId;
    };

    window.api?.claudeCodeStatusGet?.().then(applySnapshot).catch(() => {});
    const unsubscribe = window.api?.onClaudeCodeStatusUpdated?.(applySnapshot);

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  return { hasActiveSessionRef };
}
