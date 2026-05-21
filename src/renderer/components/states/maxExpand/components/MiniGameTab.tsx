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

import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useIslandStore } from '../../../../store/index';
import { readLocalToken, subscribeUserAccountSessionChanged } from '../../../../utils/userAccount';
import {
  getMyScore,
  getLeaderboard,
  flushPendingSubmissions,
  reportNewBest,
  type MiniGameScoreData,
  type MiniGameLeaderboardEntry,
} from '../../../../api/miniGame/miniGameScoreApi';
import { Game2048, type Game2048EndPayload, type Game2048Handle, type Game2048State } from './games/Game2048';

interface GameEntry {
  id: string;
  labelKey: string;
  available: boolean;
}

const GAME_LIST: GameEntry[] = [
  { id: '2048', labelKey: 'miniGameTab.games.2048', available: true },
];

/**
 * 迷你游戏 Tab 内容
 * @returns React 元素
 */
export function MiniGameTab(): ReactElement {
  const { t } = useTranslation();
  const { setLogin, setRegister } = useIslandStore();
  const [selectedGame, setSelectedGame] = useState<string>(GAME_LIST[0]?.id ?? '');
  const [loggedIn, setLoggedIn] = useState<boolean>(() => Boolean(readLocalToken()));
  const [myScore, setMyScore] = useState<MiniGameScoreData | null>(null);
  const [leaderboard, setLeaderboard] = useState<MiniGameLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<Game2048State>({ score: 0, best: 0, over: false, moveCount: 0 });
  const gameRef = useRef<Game2048Handle>(null);

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
      flushPendingSubmissions().catch(() => {}).finally(() => {
        loadData(selectedGame);
      });
    }
  };

  const handleGameEnd = useCallback((payload: Game2048EndPayload) => {
    const refresh = (): void => { setTimeout(() => loadData(selectedGame), 1500); };
    reportNewBest(selectedGame, {
      score: payload.score,
      durationMs: payload.durationMs,
      moves: payload.moves,
      achievedAt: payload.achievedAt,
    }).then(refresh, refresh);
  }, [selectedGame, loadData]);

  const handleGameState = useCallback((s: Game2048State) => setGameState(s), []);

  const selectedEntry = GAME_LIST.find((g) => g.id === selectedGame);
  const gameAvailable = selectedEntry?.available && selectedGame === '2048';

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

          <div className="mg-panel-body mg-panel-game-layout">
            {/* 游戏棋盘（纯净，无上下控件） */}
            {gameAvailable && (
              <div className="mg-game-area">
                <Game2048 ref={gameRef} onGameEnd={handleGameEnd} onStateChange={handleGameState} />
              </div>
            )}

            {/* 右侧信息面板 */}
            <div className="mg-info-sidebar">
              {/* 游戏说明 + 分数 + 新游戏（同行） */}
              {gameAvailable && (
                <div className="mg-section">
                  <span className="g2048-hint">{t('miniGameTab.game2048.hint')}</span>
                  <div className="g2048-score-row">
                    <div className="g2048-score-box"><span className="g2048-score-label">{t('miniGameTab.game2048.score')}</span><span className="g2048-score-val">{gameState.score}</span></div>
                    <div className="g2048-score-box"><span className="g2048-score-label">{t('miniGameTab.game2048.best')}</span><span className="g2048-score-val">{gameState.best}</span></div>
                    <button className="g2048-new-btn" type="button" onClick={() => gameRef.current?.newGame()}>{t('miniGameTab.game2048.newGame')}</button>
                  </div>
                </div>
              )}

              {/* 未登录提示 */}
              {!loggedIn && (
                <div className="settings-user-auth">
                  <div className="settings-user-auth-entry-title">
                    {t('miniGameTab.auth.entryTitle')}
                  </div>
                  <div className="settings-user-auth-entry-actions">
                    <button type="button" className="settings-user-primary-btn" onClick={() => setLogin()}>
                      {t('miniGameTab.auth.gotoLogin')}
                    </button>
                    <button type="button" className="settings-user-secondary-btn" onClick={() => setRegister()}>
                      {t('miniGameTab.auth.gotoRegister')}
                    </button>
                  </div>
                  <div className="settings-user-auth-hint">
                    {t('miniGameTab.auth.hint')}
                  </div>
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
                          <span className="mg-score-detail-item">
                            <span className="mg-score-detail-value">{formatDuration(myScore.bestDurationMs)}</span>
                            <span className="mg-score-detail-label">{t('miniGameTab.duration')}</span>
                          </span>
                        )}
                        {myScore.bestMoves != null && (
                          <span className="mg-score-detail-item">
                            <span className="mg-score-detail-value">{myScore.bestMoves}</span>
                            <span className="mg-score-detail-label">{t('miniGameTab.moves')}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mg-empty-hint">{t('miniGameTab.noRecord')}</div>
                  )}
                </div>
              )}

              {/* 排行榜（始终显示） */}
              {loggedIn && !loading && !error && (
                <div className="mg-section mg-section-scroll">
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
                          <span className="mg-lb-user">
                            <span className="mg-lb-user-meta">
                              {entry.avatar
                                ? <img className="mg-lb-user-avatar" src={entry.avatar} alt={entry.username ?? String(entry.userId)} />
                                : <span className="mg-lb-user-avatar-placeholder">{(entry.username || String(entry.userId)).slice(0, 1)}</span>}
                              <span className="mg-lb-user-name">{entry.username ?? entry.userId}</span>
                            </span>
                          </span>
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
    </div>
  );
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
