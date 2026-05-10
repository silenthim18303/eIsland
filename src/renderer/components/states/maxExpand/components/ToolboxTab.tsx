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

import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchToolboxSoftwareList, type ToolboxSoftwareItem } from '../../../../api/tools/toolboxSoftwareApi';
import useIslandStore from '../../../../store/slices';
import { SvgIcon } from '../../../../utils/SvgIcon';

const SETTINGS_OPEN_TAB_STORE_KEY = 'settings-open-tab';

type ToolboxSidebarKey = 'download' | 'software' | 'translate';

const TRANSLATE_LANGUAGES = [
  { code: 'auto', labelKey: 'maxExpand.toolbox.translate.lang.auto' },
  { code: 'zh', labelKey: 'maxExpand.toolbox.translate.lang.zh' },
  { code: 'en', labelKey: 'maxExpand.toolbox.translate.lang.en' },
  { code: 'ja', labelKey: 'maxExpand.toolbox.translate.lang.ja' },
  { code: 'ko', labelKey: 'maxExpand.toolbox.translate.lang.ko' },
  { code: 'fr', labelKey: 'maxExpand.toolbox.translate.lang.fr' },
  { code: 'de', labelKey: 'maxExpand.toolbox.translate.lang.de' },
  { code: 'es', labelKey: 'maxExpand.toolbox.translate.lang.es' },
  { code: 'ru', labelKey: 'maxExpand.toolbox.translate.lang.ru' },
] as const;

const TRANSLATE_TARGET_LANGUAGES = TRANSLATE_LANGUAGES.filter((l) => l.code !== 'auto');

type DownloadTaskStatus = 'downloading' | 'paused' | 'completed' | 'failed' | 'canceled';

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
  const { setMaxExpandTab } = useIslandStore();
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
  const hasDownloadUrl = url.trim().length > 0;

  const handlePickSavePath = (): void => {
    if (!hasDownloadUrl) return;
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

  const handlePauseTask = (taskId: string): void => {
    window.api.downloadPause(taskId).then((ok) => {
      if (ok) {
        setStatusMessage(t('maxExpand.toolbox.download.messages.pauseSuccess'));
      }
    }).catch(() => {
      setStatusMessage(t('maxExpand.toolbox.download.messages.pauseFailed'));
    });
  };

  const handleResumeTask = (taskId: string): void => {
    window.api.downloadResume(taskId).then((result) => {
      if (!result.ok) {
        setStatusMessage(result.message || t('maxExpand.toolbox.download.messages.resumeFailed'));
        return;
      }
      setStatusMessage(t('maxExpand.toolbox.download.messages.resumeSuccess'));
    }).catch(() => {
      setStatusMessage(t('maxExpand.toolbox.download.messages.resumeFailed'));
    });
  };

  const handleRemoveTask = (taskId: string): void => {
    window.api.downloadRemove(taskId).then((ok) => {
      if (!ok) {
        setStatusMessage(t('maxExpand.toolbox.download.messages.removeFailed'));
        return;
      }
      setTasks((prev) => prev.filter((item) => item.id !== taskId));
      setStatusMessage(t('maxExpand.toolbox.download.messages.removeSuccess'));
    }).catch(() => {
      setStatusMessage(t('maxExpand.toolbox.download.messages.removeFailed'));
    });
  };

  const handleOpenTaskFolder = (savePath: string): void => {
    window.api.openInExplorer(savePath).then((ok) => {
      if (!ok) {
        setStatusMessage(t('maxExpand.toolbox.download.messages.openFolderFailed'));
      }
    }).catch(() => {
      setStatusMessage(t('maxExpand.toolbox.download.messages.openFolderFailed'));
    });
  };

  const getStatusText = (status: DownloadTaskStatus): string => {
    if (status === 'paused') return t('maxExpand.toolbox.download.status.paused');
    if (status === 'completed') return t('maxExpand.toolbox.download.status.completed');
    if (status === 'failed') return t('maxExpand.toolbox.download.status.failed');
    if (status === 'canceled') return t('maxExpand.toolbox.download.status.canceled');
    return t('maxExpand.toolbox.download.status.downloading');
  };

  const [softwareItems, setSoftwareItems] = useState<ToolboxSoftwareItem[]>([]);
  const [softwareLoading, setSoftwareLoading] = useState(true);

  const loadSoftware = () => {
    setSoftwareLoading(true);
    fetchToolboxSoftwareList()
      .then(setSoftwareItems)
      .finally(() => setSoftwareLoading(false));
  };

  useEffect(() => {
    loadSoftware();
  }, []);

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
          <button
            className={`max-expand-settings-sidebar-item ${activeSidebar === 'software' ? 'active' : ''}`}
            onClick={() => setActiveSidebar('software')}
            type="button"
          >
            <span className="sidebar-dot" />
            {t('maxExpand.toolbox.sidebar.software')}
          </button>
          <button
            className={`max-expand-settings-sidebar-item ${activeSidebar === 'translate' ? 'active' : ''}`}
            onClick={() => setActiveSidebar('translate')}
            type="button"
          >
            <span className="sidebar-dot" />
            {t('maxExpand.toolbox.sidebar.translate')}
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
                    <div className="download-field-title-row">
                      <span className="settings-field-label">{t('maxExpand.toolbox.download.form.savePathLabel')}</span>
                      <span className="settings-field-label download-threads-title-inline">{t('maxExpand.toolbox.download.form.threadsLabel')}</span>
                    </div>
                    <div className="settings-hotkey-row download-path-row">
                      <input
                        className="settings-hotkey-input download-save-path-input"
                        type="text"
                        placeholder={defaultDir || t('maxExpand.toolbox.download.form.savePathPlaceholder')}
                        value={savePath}
                        disabled={!hasDownloadUrl}
                        onChange={(event) => setSavePath(event.target.value)}
                      />
                      <button
                        className={`settings-lyrics-source-btn ${!hasDownloadUrl ? 'disabled' : ''}`}
                        type="button"
                        disabled={!hasDownloadUrl}
                        onClick={handlePickSavePath}
                      >
                        {t('maxExpand.toolbox.download.form.pickPath')}
                      </button>
                      <label className="download-threads-inline">
                        <input
                          className="settings-field-input download-threads-inline-input"
                          type="number"
                          min="1"
                          max="16"
                          step="1"
                          value={threads}
                          onChange={(event) => setThreads(event.target.value)}
                        />
                      </label>
                    </div>
                    <span className="settings-field-hint">
                      {t('maxExpand.toolbox.download.form.defaultDirHint', { dir: defaultDir || '-' })}
                    </span>
                  </label>

                  <div className="settings-hotkey-row">
                    <button
                      className={`settings-lyrics-source-btn download-start-btn-full ${loading ? 'disabled' : ''}`}
                      type="button"
                      disabled={loading}
                      onClick={handleStartDownload}
                    >
                      {loading ? t('maxExpand.toolbox.download.form.starting') : t('maxExpand.toolbox.download.form.start')}
                    </button>
                  </div>

                  {activeTask && (
                    <div className="settings-hotkey-row download-cancel-row">
                      <button
                        className="settings-lyrics-source-btn download-start-btn-full"
                        type="button"
                        onClick={() => handleCancelTask(activeTask.id)}
                      >
                        {t('maxExpand.toolbox.download.form.cancelCurrent')}
                      </button>
                    </div>
                  )}

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
                    const progressWidth = `${Math.max(0, Math.min(100, task.progress * 100))}%`;
                    return (
                      <div key={task.id} className="settings-card-subgroup download-task-card">
                        <div className="download-task-card-header">
                          <div className="settings-card-subgroup-title">{task.fileName || task.url}</div>
                          <div className="settings-hotkey-row download-task-actions">
                            {task.status === 'downloading' && (
                              <button
                                className="settings-lyrics-source-btn"
                                type="button"
                                onClick={() => handlePauseTask(task.id)}
                              >
                                {t('maxExpand.toolbox.download.tasks.pause')}
                              </button>
                            )}
                            {task.status === 'paused' && (
                              <button
                                className="settings-lyrics-source-btn"
                                type="button"
                                onClick={() => handleResumeTask(task.id)}
                              >
                                {t('maxExpand.toolbox.download.tasks.resume')}
                              </button>
                            )}
                            {task.status !== 'downloading' && (
                              <button
                                className="settings-lyrics-source-btn"
                                type="button"
                                onClick={() => handleRemoveTask(task.id)}
                              >
                                {t('maxExpand.toolbox.download.tasks.delete')}
                              </button>
                            )}
                            {task.status === 'completed' && (
                              <button
                                className="settings-lyrics-source-btn"
                                type="button"
                                onClick={() => handleOpenTaskFolder(task.savePath)}
                              >
                                {t('maxExpand.toolbox.download.tasks.openFolder')}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="settings-music-hint">
                          {getStatusText(task.status)} · {percentText} · {formatBytes(task.downloadedBytes)} / {task.totalBytes > 0 ? formatBytes(task.totalBytes) : '?'} · {formatBytes(task.speedBytesPerSecond)}/s · {task.threads}T
                        </div>
                        <div className="download-task-progress">
                          <div className="download-task-progress-fill" style={{ width: progressWidth }} />
                        </div>
                        <div className="settings-music-hint">
                          {(task.status === 'completed' || task.status === 'paused' || task.status === 'failed' || task.status === 'canceled')
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
          {activeSidebar === 'translate' && (
            <TranslatePanel t={t} />
          )}
          {activeSidebar === 'software' && (
            <div className="software-list">
              {softwareLoading ? (
                <div className="software-list-empty">
                  <span className="software-list-empty-text">
                    {t('maxExpand.toolbox.software.loading')}
                  </span>
                </div>
              ) : softwareItems.length === 0 ? (
                <div className="software-list-empty">
                  <span className="software-list-empty-text">
                    {t('maxExpand.toolbox.software.empty')}
                  </span>
                  <span className="software-list-empty-subtitle">
                    {t('maxExpand.toolbox.software.subtitle')}
                  </span>
                  <div className="software-list-empty-actions">
                    <button
                      className="settings-lyrics-source-btn"
                      type="button"
                      onClick={loadSoftware}
                    >
                      {t('maxExpand.toolbox.software.refresh')}
                    </button>
                    <button
                      className="settings-lyrics-source-btn"
                      type="button"
                      onClick={() => {
                        window.api.storeWrite(SETTINGS_OPEN_TAB_STORE_KEY, 'about-feedback').catch(() => {});
                        setMaxExpandTab('settings');
                        window.dispatchEvent(new CustomEvent('standalone-tab-switch', { detail: 'settings' }));
                        window.dispatchEvent(new CustomEvent('settings-open-tab-intent', { detail: 'about-feedback' }));
                      }}
                    >
                      {t('maxExpand.toolbox.software.feedback')}
                    </button>
                  </div>
                </div>
              ) : (
                softwareItems.map((item) => (
                  <div key={item.id} className="software-list-card">
                    <img
                      className="software-list-card-icon"
                      src={item.iconUrl}
                      alt={item.name}
                      draggable={false}
                    />
                    <div className="software-list-card-info">
                      <span className="software-list-card-name">{item.name}</span>
                      <span className="software-list-card-desc">{item.description}</span>
                    </div>
                    <button
                      className="settings-lyrics-source-btn"
                      type="button"
                      onClick={() => window.api?.clipboardOpenUrl(item.url)}
                    >
                      {t('maxExpand.toolbox.software.download')}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** 翻译面板子组件 */
function TranslatePanel({ t }: { t: (key: string, opts?: Record<string, unknown>) => string }): ReactElement {
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('en');
  const [sourceText, setSourceText] = useState('');
  const [resultText, setResultText] = useState('');
  const [translating, setTranslating] = useState(false);

  const handleSwapLanguages = useCallback((): void => {
    if (sourceLang === 'auto') return;
    const prevSource = sourceLang;
    const prevTarget = targetLang;
    setSourceLang(prevTarget);
    setTargetLang(prevSource);
    setSourceText(resultText);
    setResultText(sourceText);
  }, [sourceLang, targetLang, sourceText, resultText]);

  const handleTranslate = useCallback((): void => {
    if (!sourceText.trim() || translating) return;
    setTranslating(true);
    // TODO: 接入翻译 API
    setTimeout(() => {
      setResultText('');
      setTranslating(false);
    }, 300);
  }, [sourceText, translating]);

  const handleCopyResult = useCallback((): void => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText).catch(() => {});
  }, [resultText]);

  const handleClearAll = useCallback((): void => {
    setSourceText('');
    setResultText('');
  }, []);

  return (
    <div className="settings-cards translate-panel">
      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-title">{t('maxExpand.toolbox.translate.title')}</div>
          <div className="settings-card-subtitle">{t('maxExpand.toolbox.translate.subtitle')}</div>
        </div>
        <div className="settings-card-body">
          <div className="translate-lang-row">
            <select
              className="translate-lang-select"
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
            >
              {TRANSLATE_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {t(lang.labelKey)}
                </option>
              ))}
            </select>
            <button
              className="translate-swap-btn"
              type="button"
              onClick={handleSwapLanguages}
              disabled={sourceLang === 'auto'}
              title={t('maxExpand.toolbox.translate.swap')}
            >
              <img className="translate-swap-icon" src={SvgIcon.SWITCHING} alt="" draggable={false} />
            </button>
            <select
              className="translate-lang-select"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
            >
              {TRANSLATE_TARGET_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {t(lang.labelKey)}
                </option>
              ))}
            </select>
          </div>

          <div className="translate-text-area-group">
            <div className="translate-text-area-wrapper">
              <textarea
                className="translate-textarea"
                placeholder={t('maxExpand.toolbox.translate.inputPlaceholder')}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                rows={5}
              />
              <div className="translate-textarea-footer">
                <span className="translate-char-count">{sourceText.length}</span>
                {sourceText && (
                  <button className="translate-inline-btn" type="button" onClick={handleClearAll}>
                    {t('maxExpand.toolbox.translate.clear')}
                  </button>
                )}
              </div>
            </div>

            <div className="translate-text-area-wrapper translate-result-wrapper">
              <textarea
                className="translate-textarea translate-textarea-result"
                placeholder={t('maxExpand.toolbox.translate.outputPlaceholder')}
                value={resultText}
                readOnly
                rows={5}
              />
              <div className="translate-textarea-footer">
                {resultText && (
                  <button className="translate-inline-btn" type="button" onClick={handleCopyResult}>
                    {t('maxExpand.toolbox.translate.copy')}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="settings-hotkey-row">
            <button
              className={`settings-lyrics-source-btn download-start-btn-full ${(!sourceText.trim() || translating) ? 'disabled' : ''}`}
              type="button"
              disabled={!sourceText.trim() || translating}
              onClick={handleTranslate}
            >
              {translating
                ? t('maxExpand.toolbox.translate.translating')
                : t('maxExpand.toolbox.translate.translateBtn')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
