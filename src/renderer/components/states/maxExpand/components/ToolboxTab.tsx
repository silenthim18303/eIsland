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
 * @file ToolboxTab.tsx
 * @description 最大展开模式工具箱 Tab
 * @author 鸡哥
 */

import { useEffect, useMemo, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

type ToolboxSidebarKey = 'download';

type DownloadTaskStatus = 'downloading' | 'completed' | 'failed' | 'canceled';

interface DownloadTaskSnapshot {
  id: string;
  url: string;
  savePath: string;
  fileName: string;
  totalBytes: number;
  downloadedBytes: number;
  progress: number;
  speedBytesPerSecond: number;
  estimatedFinishAt: number | null;
  threads: number;
  status: DownloadTaskStatus;
  errorMessage?: string;
  createdAt: number;
  updatedAt: number;
}

function formatBytes(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0 B';
  if (value < 1024) return `${value.toFixed(0)} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function inferSuggestedName(url: string): string {
  const text = url.trim();
  if (!text) return `download-${Date.now()}.bin`;
  try {
    const parsed = new URL(text.startsWith('http://') || text.startsWith('https://') ? text : `https://${text}`);
    const name = decodeURIComponent(parsed.pathname.split('/').filter(Boolean).pop() || '');
    return name || `download-${Date.now()}.bin`;
  } catch {
    return `download-${Date.now()}.bin`;
  }
}

function formatDurationMs(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '-';
  const totalSeconds = Math.max(0, Math.floor(value / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/** 最大展开模式工具箱页面 */
export function ToolboxTab(): ReactElement {
  const { t } = useTranslation();
  const [activeSidebar, setActiveSidebar] = useState<ToolboxSidebarKey>('download');
  const [url, setUrl] = useState('');
  const [savePath, setSavePath] = useState('');
  const [defaultDir, setDefaultDir] = useState('');
  const [threads, setThreads] = useState('8');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [tasks, setTasks] = useState<DownloadTaskSnapshot[]>([]);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    let disposed = false;
    window.api.downloadGetDefaultDir().then((dir) => {
      if (disposed) return;
      setDefaultDir(dir || '');
    }).catch(() => {});
    window.api.downloadList().then((list) => {
      if (disposed) return;
      setTasks((list || []).slice().sort((a, b) => b.createdAt - a.createdAt));
    }).catch(() => {});
    const off = window.api.onDownloadTaskUpdated((task) => {
      setTasks((prev) => {
        const exists = prev.some((item) => item.id === task.id);
        const next = exists
          ? prev.map((item) => (item.id === task.id ? task : item))
          : [task, ...prev];
        return next.slice().sort((a, b) => b.createdAt - a.createdAt);
      });
    });
    return () => {
      disposed = true;
      off();
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const activeTask = useMemo(() => {
    return tasks.find((task) => task.status === 'downloading') || null;
  }, [tasks]);

  const handlePickSavePath = (): void => {
    window.api.downloadPickSavePath(inferSuggestedName(url)).then((picked) => {
      if (!picked) return;
      setSavePath(picked);
    }).catch(() => {
      setStatusMessage(t('maxExpand.toolbox.download.messages.pickPathFailed'));
    });
  };

  const handleStartDownload = (): void => {
    const threadNumber = Number(threads);
    setLoading(true);
    setStatusMessage('');
    window.api.downloadStart({
      url,
      savePath: savePath.trim() || undefined,
      threads: Number.isFinite(threadNumber) ? threadNumber : 8,
    }).then((result) => {
      if (!result.ok) {
        setStatusMessage(result.message || t('maxExpand.toolbox.download.messages.startFailed'));
        return;
      }
      setStatusMessage(t('maxExpand.toolbox.download.messages.started'));
    }).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      setStatusMessage(message || t('maxExpand.toolbox.download.messages.startFailed'));
    }).finally(() => {
      setLoading(false);
    });
  };

  const handleCancelTask = (taskId: string): void => {
    window.api.downloadCancel(taskId).then((ok) => {
      if (ok) {
        setStatusMessage(t('maxExpand.toolbox.download.messages.cancelSuccess'));
      }
    }).catch(() => {
      setStatusMessage(t('maxExpand.toolbox.download.messages.cancelFailed'));
    });
  };

  const getStatusText = (status: DownloadTaskStatus): string => {
    if (status === 'completed') return t('maxExpand.toolbox.download.status.completed');
    if (status === 'failed') return t('maxExpand.toolbox.download.status.failed');
    if (status === 'canceled') return t('maxExpand.toolbox.download.status.canceled');
    return t('maxExpand.toolbox.download.status.downloading');
  };

  return (
    <div className="max-expand-settings toolbox-tab-container">
      <div className="max-expand-settings-layout">
        <div className="max-expand-settings-sidebar">
          <button
            className={`max-expand-settings-sidebar-item ${activeSidebar === 'download' ? 'active' : ''}`}
            onClick={() => setActiveSidebar('download')}
            type="button"
          >
            <span className="sidebar-dot" />
            {t('maxExpand.toolbox.sidebar.download')}
          </button>
        </div>

        <div className="max-expand-settings-panel">
          {activeSidebar === 'download' && (
            <div className="settings-cards">
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-title">{t('maxExpand.toolbox.download.title')}</div>
                  <div className="settings-card-subtitle">{t('maxExpand.toolbox.download.subtitle')}</div>
                </div>
                <div className="settings-card-body">
                  <label className="settings-field">
                    <span className="settings-field-label">{t('maxExpand.toolbox.download.form.urlLabel')}</span>
                    <input
                      className="settings-field-input"
                      type="text"
                      placeholder={t('maxExpand.toolbox.download.form.urlPlaceholder')}
                      value={url}
                      onChange={(event) => setUrl(event.target.value)}
                    />
                  </label>

                  <label className="settings-field">
                    <span className="settings-field-label">{t('maxExpand.toolbox.download.form.savePathLabel')}</span>
                    <div className="settings-hotkey-row">
                      <input
                        className="settings-hotkey-input"
                        type="text"
                        placeholder={defaultDir || t('maxExpand.toolbox.download.form.savePathPlaceholder')}
                        value={savePath}
                        onChange={(event) => setSavePath(event.target.value)}
                      />
                      <button
                        className="settings-lyrics-source-btn"
                        type="button"
                        onClick={handlePickSavePath}
                      >
                        {t('maxExpand.toolbox.download.form.pickPath')}
                      </button>
                    </div>
                    <span className="settings-field-hint">
                      {t('maxExpand.toolbox.download.form.defaultDirHint', { dir: defaultDir || '-' })}
                    </span>
                  </label>

                  <label className="settings-field" style={{ maxWidth: 220 }}>
                    <span className="settings-field-label">{t('maxExpand.toolbox.download.form.threadsLabel')}</span>
                    <input
                      className="settings-field-input"
                      type="number"
                      min="1"
                      max="16"
                      step="1"
                      value={threads}
                      onChange={(event) => setThreads(event.target.value)}
                    />
                  </label>

                  <div className="settings-hotkey-row">
                    <button
                      className={`settings-lyrics-source-btn ${loading ? 'disabled' : ''}`}
                      type="button"
                      disabled={loading}
                      onClick={handleStartDownload}
                    >
                      {loading ? t('maxExpand.toolbox.download.form.starting') : t('maxExpand.toolbox.download.form.start')}
                    </button>
                    {activeTask && (
                      <button
                        className="settings-lyrics-source-btn"
                        type="button"
                        onClick={() => handleCancelTask(activeTask.id)}
                      >
                        {t('maxExpand.toolbox.download.form.cancelCurrent')}
                      </button>
                    )}
                  </div>

                  {!!statusMessage && (
                    <div className="settings-music-hint">{statusMessage}</div>
                  )}
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-title">{t('maxExpand.toolbox.download.tasks.title')}</div>
                  <div className="settings-card-subtitle">{t('maxExpand.toolbox.download.tasks.subtitle')}</div>
                </div>
                <div className="settings-card-body">
                  {tasks.length === 0 && (
                    <div className="settings-music-hint">{t('maxExpand.toolbox.download.tasks.empty')}</div>
                  )}
                  {tasks.map((task) => {
                    const percentText = `${(task.progress * 100).toFixed(1)}%`;
                    return (
                      <div key={task.id} className="settings-card-subgroup">
                        <div className="settings-card-subgroup-title">{task.fileName || task.url}</div>
                        <div className="settings-music-hint">
                          {getStatusText(task.status)} · {percentText} · {formatBytes(task.downloadedBytes)} / {task.totalBytes > 0 ? formatBytes(task.totalBytes) : '?'} · {formatBytes(task.speedBytesPerSecond)}/s · {task.threads}T
                        </div>
                        <div className="settings-music-hint">
                          {task.status === 'completed'
                            ? `${t('maxExpand.toolbox.download.tasks.elapsedLabel')}: ${formatDurationMs(task.updatedAt - task.createdAt)}`
                            : `${t('maxExpand.toolbox.download.tasks.remainingLabel')}: ${formatDurationMs((task.estimatedFinishAt || 0) - nowMs)}`}
                        </div>
                        <div className="settings-music-hint">{task.savePath}</div>
                        {task.errorMessage && (
                          <div className="settings-music-hint">{task.errorMessage}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
