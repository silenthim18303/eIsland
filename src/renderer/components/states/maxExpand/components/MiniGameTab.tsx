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
 * @file MiniGameTab.tsx
 * @description MaxExpand 迷你游戏入口 Tab：游戏选择 + 个人最高分 + 排行榜
 * @author 鸡哥
 */

import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { readLocalToken, subscribeUserAccountSessionChanged } from '../../../../utils/userAccount';
import {
  getMyScore,
  getLeaderboard,
  flushPendingSubmissions,
  type MiniGameScoreData,
  type MiniGameLeaderboardEntry,
} from '../../../../api/miniGame/miniGameScoreApi';

interface GameEntry {
  id: string;
  labelKey: string;
  available: boolean;
}

const GAME_LIST: GameEntry[] = [
  { id: '2048', labelKey: 'miniGameTab.games.2048', available: false },
];

/**
 * 迷你游戏 Tab 内容
 * @returns React 元素
 */
export function MiniGameTab(): ReactElement {
  const { t } = useTranslation();
  const [selectedGame, setSelectedGame] = useState<string>(GAME_LIST[0]?.id ?? '');
  const [loggedIn, setLoggedIn] = useState<boolean>(() => Boolean(readLocalToken()));
  const [myScore, setMyScore] = useState<MiniGameScoreData | null>(null);
  const [leaderboard, setLeaderboard] = useState<MiniGameLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (gameId: string) => {
    const token = readLocalToken();
    if (!token) {
      setMyScore(null);
      setLeaderboard([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [scoreRes, lbRes] = await Promise.all([
        getMyScore(token, gameId),
        getLeaderboard(token, gameId, 20),
      ]);
      setMyScore(scoreRes.ok ? (scoreRes.data ?? null) : null);
      setLeaderboard(lbRes.ok && lbRes.data ? lbRes.data : []);
    } catch {
      setError(t('miniGameTab.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const syncLogin = (): void => {
      const hasToken = Boolean(readLocalToken());
      setLoggedIn(hasToken);
      if (hasToken && selectedGame) {
        flushPendingSubmissions().catch(() => {});
        loadData(selectedGame);
      } else {
        setMyScore(null);
        setLeaderboard([]);
      }
    };
    syncLogin();
    return subscribeUserAccountSessionChanged(syncLogin);
  }, [selectedGame, loadData]);

  const handleRefresh = (): void => {
    if (selectedGame) {
      loadData(selectedGame);
    }
  };

  const selectedEntry = GAME_LIST.find((g) => g.id === selectedGame);

  return (
    <div className="max-expand-settings toolbox-tab-container">
      <div className="max-expand-settings-layout">
        {/* 侧栏：游戏列表 */}
        <div className="max-expand-settings-sidebar">
          {GAME_LIST.map((game) => (
            <button
              key={game.id}
              className={`max-expand-settings-sidebar-item ${selectedGame === game.id ? 'active' : ''}`}
              onClick={() => setSelectedGame(game.id)}
              type="button"
            >
              <span className="sidebar-dot" />
              {t(game.labelKey, { defaultValue: game.id })}
            </button>
          ))}
        </div>

        {/* 主面板 */}
        <div className="max-expand-settings-panel">
          <div className="max-expand-settings-title settings-app-title-line">
            <span>{selectedEntry ? t(selectedEntry.labelKey, { defaultValue: selectedEntry.id }) : ''}</span>
            {selectedEntry && !selectedEntry.available && (
              <span className="mg-badge-coming-soon">{t('miniGameTab.comingSoon')}</span>
            )}
          </div>

          <div className="mg-panel-body">
            {/* 未登录提示 */}
            {!loggedIn && (
              <div className="mg-notice">
                <span className="mg-notice-text">{t('miniGameTab.loginRequired')}</span>
              </div>
            )}

            {/* 加载态 */}
            {loggedIn && loading && (
              <div className="mg-notice">
                <span className="mg-notice-text">{t('miniGameTab.loading')}</span>
              </div>
            )}

            {/* 错误态 */}
            {loggedIn && !loading && error && (
              <div className="mg-notice">
                <span className="mg-notice-text">{error}</span>
                <button className="settings-lyrics-source-btn" type="button" onClick={handleRefresh}>
                  {t('miniGameTab.retry')}
                </button>
              </div>
            )}

            {/* 个人最高分卡片 */}
            {loggedIn && !loading && !error && (
              <div className="mg-section">
                <div className="mg-section-header">
                  <span className="mg-section-title">{t('miniGameTab.myBest')}</span>
                  <button className="mg-refresh-btn" type="button" onClick={handleRefresh} title={t('miniGameTab.refresh')}>
                    ↻
                  </button>
                </div>
                {myScore ? (
                  <div className="mg-score-card">
                    <div className="mg-score-main">
                      <span className="mg-score-value">{myScore.highScore.toLocaleString()}</span>
                      <span className="mg-score-label">{t('miniGameTab.highScore')}</span>
                    </div>
                    <div className="mg-score-details">
                      {myScore.bestDurationMs != null && (
                        <span className="mg-score-detail">{t('miniGameTab.duration')}: {formatDuration(myScore.bestDurationMs)}</span>
                      )}
                      {myScore.bestMoves != null && (
                        <span className="mg-score-detail">{t('miniGameTab.moves')}: {myScore.bestMoves}</span>
                      )}
                      {myScore.playsCount != null && (
                        <span className="mg-score-detail">{t('miniGameTab.plays')}: {myScore.playsCount}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mg-empty-hint">{t('miniGameTab.noRecord')}</div>
                )}
              </div>
            )}

            {/* 排行榜 */}
            {loggedIn && !loading && !error && (
              <div className="mg-section">
                <div className="mg-section-header">
                  <span className="mg-section-title">{t('miniGameTab.leaderboard')}</span>
                </div>
                {leaderboard.length > 0 ? (
                  <div className="mg-leaderboard">
                    <div className="mg-lb-header-row">
                      <span className="mg-lb-rank">#</span>
                      <span className="mg-lb-user">{t('miniGameTab.lbUser')}</span>
                      <span className="mg-lb-score">{t('miniGameTab.lbScore')}</span>
                    </div>
                    {leaderboard.map((entry) => (
                      <div key={entry.rank} className={`mg-lb-row ${entry.rank <= 3 ? 'mg-lb-top' : ''}`}>
                        <span className={`mg-lb-rank ${entry.rank <= 3 ? `mg-lb-rank-${entry.rank}` : ''}`}>{entry.rank}</span>
                        <span className="mg-lb-user">{entry.userId}</span>
                        <span className="mg-lb-score">{entry.highScore.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mg-empty-hint">{t('miniGameTab.lbEmpty')}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
