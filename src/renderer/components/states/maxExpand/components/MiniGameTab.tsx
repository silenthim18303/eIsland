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
import { readLocalProfile, readLocalToken, subscribeUserAccountSessionChanged } from '../../../../utils/userAccount';
import { SvgIcon } from '../../../../utils/SvgIcon';
import {
  getMyScore,
  getLeaderboard,
  flushPendingSubmissions,
  reportNewBest,
  startGameSession,
  type MiniGameScoreData,
  type MiniGameLeaderboardEntry,
  type MiniGameSessionData,
} from '../../../../api/miniGame/miniGameScoreApi';
import {
  Game2048,
  type Game2048EndPayload,
  type Game2048Handle,
  type Game2048Session,
  type Game2048State,
} from './games/Game2048';

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
  const [activeSession, setActiveSession] = useState<Game2048Session | null>(null);
  const gameRef = useRef<Game2048Handle>(null);

  const fetchSession = useCallback(async (gameId: string): Promise<Game2048Session | null> => {
    if (gameId !== '2048') return null;
    const token = readLocalToken();
    if (!token) return null;
    const result = await startGameSession(token, gameId);
    if (!result.ok || !result.data) return null;
    const data = result.data as MiniGameSessionData;
    const session: Game2048Session = {
      sessionId: data.sessionId,
      seed: data.seed,
      startedAt: data.startedAt,
    };
    setActiveSession(session);
    return session;
  }, []);

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
        setActiveSession(null);
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
    if (!payload.sessionId || !payload.moveTrace) {
      refresh();
      return;
    }
    reportNewBest(selectedGame, {
      score: payload.score,
      durationMs: payload.durationMs,
      moves: payload.moves,
      achievedAt: payload.achievedAt,
      sessionId: payload.sessionId,
      moveTrace: payload.moveTrace,
    }).then(refresh, refresh);
  }, [selectedGame, loadData]);

  const handleStartNewGame = useCallback((): void => {
    fetchSession(selectedGame)
      .then((session) => {
        gameRef.current?.newGame(session);
      })
      .catch(() => {
        gameRef.current?.newGame(null);
      });
  }, [fetchSession, selectedGame]);

  const handleGameState = useCallback((s: Game2048State) => setGameState(s), []);
  const myRank = myScore ? (leaderboard.find((entry) => entry.userId === myScore.userId)?.rank ?? null) : null;
  const localProfile = readLocalProfile();

  const resolveEntryName = useCallback((entry: MiniGameLeaderboardEntry): string => {
    if (entry.username && entry.username.trim()) {
      return entry.username;
    }
    if (myScore && entry.userId === myScore.userId && localProfile?.username) {
      return localProfile.username;
    }
    return t('miniGameTab.unknownUser', { defaultValue: '未知用户' });
  }, [localProfile?.username, myScore, t]);

  const resolveEntryAvatar = useCallback((entry: MiniGameLeaderboardEntry): string | null => {
    if (entry.avatar && entry.avatar.trim()) {
      return entry.avatar;
    }
    if (myScore && entry.userId === myScore.userId) {
      return localProfile?.avatar ?? null;
    }
    return null;
  }, [localProfile?.avatar, myScore]);

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
                <Game2048 ref={gameRef} onGameEnd={handleGameEnd} onStateChange={handleGameState} activeSession={activeSession} />
              </div>
            )}

            {/* 右侧信息面板 */}
            <div className="mg-info-sidebar">
              {/* 游戏说明 + 分数 + 新游戏（同行） */}
              {gameAvailable && (
                <div className="mg-section mg-section-top-score">
                  <span className="g2048-hint">{t('miniGameTab.game2048.hint')}</span>
                  <div className="g2048-score-row g2048-score-cards">
                    <div className="g2048-score-box"><span className="g2048-score-label">{t('miniGameTab.game2048.score')}</span><span className="g2048-score-val">{gameState.score}</span></div>
                    <div className="g2048-score-box"><span className="g2048-score-label">{t('miniGameTab.highScore')}</span><span className="g2048-score-val">{myScore?.highScore?.toLocaleString() ?? '--'}</span></div>
                    <div className="g2048-score-box"><span className="g2048-score-label">{t('miniGameTab.duration')}</span><span className="g2048-score-val">{myScore?.bestDurationMs != null ? formatDuration(myScore.bestDurationMs) : '--'}</span></div>
                    <div className="g2048-score-box"><span className="g2048-score-label">{t('miniGameTab.moves')}</span><span className="g2048-score-val">{myScore?.bestMoves != null ? myScore.bestMoves : '--'}</span></div>
                  </div>
                  <button className="g2048-new-btn g2048-new-btn-block" type="button" onClick={handleStartNewGame}>{t('miniGameTab.game2048.newGame')}</button>
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

              {/* 排行榜（始终显示） */}
              {loggedIn && !loading && !error && (
                <div className="mg-section mg-section-scroll">
                  <div className="mg-section-header">
                    <span className="mg-section-title">{t('miniGameTab.leaderboard')}</span>
                    <div className="mg-section-header-actions">
                      <span className="mg-my-rank">{t('miniGameTab.myRank')}: {myRank ?? t('miniGameTab.rankUnavailable')}</span>
                      <button className="mg-refresh-btn" type="button" onClick={handleRefresh} title={t('miniGameTab.refresh')} aria-label={t('miniGameTab.refresh')}>
                        <img className="mg-refresh-icon" src={SvgIcon.REVERT} alt="" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  {leaderboard.length > 0 ? (
                    <div className="mg-leaderboard">
                      <div className="mg-lb-header-row">
                        <span className="mg-lb-rank">#</span>
                        <span className="mg-lb-user">{t('miniGameTab.lbUser')}</span>
                        <span className="mg-lb-score">{t('miniGameTab.lbScore')}</span>
                      </div>
                      {leaderboard.slice(0, 4).map((entry) => (
                        <div key={entry.rank} className={`mg-lb-row ${entry.rank <= 3 ? 'mg-lb-top' : ''}`}>
                          <span className={`mg-lb-rank ${entry.rank <= 3 ? `mg-lb-rank-${entry.rank}` : ''}`}>{entry.rank}</span>
                          <span className="mg-lb-user">
                            <span className="mg-lb-user-meta">
                              {resolveEntryAvatar(entry)
                                ? <img className="mg-lb-user-avatar" src={resolveEntryAvatar(entry) ?? ''} alt={resolveEntryName(entry)} />
                                : <span className="mg-lb-user-avatar-placeholder">{resolveEntryName(entry).slice(0, 1)}</span>}
                              <span className="mg-lb-user-name">{resolveEntryName(entry)}</span>
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
