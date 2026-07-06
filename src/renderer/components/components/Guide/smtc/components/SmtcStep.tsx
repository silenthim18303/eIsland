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
 * @file SmtcStep.tsx
 * @description 引导配置 — SMTC 媒体测试步骤组件
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useSmtcTest } from '../hooks/useSmtcPreview';
import { formatTime, extractPlayerName } from '../utils/smtcUtils';
import type { SmtcStepProps } from '../types';

/**
 * SMTC 媒体测试步骤组件
 */
export function SmtcStep({ onNext, onPrev }: SmtcStepProps): ReactElement {
  const { t } = useTranslation();
  const { status, meta, retry } = useSmtcTest();
  const [r, g, b] = meta?.dominantColor ?? [0, 0, 0];

  return (
    <div className="guide-step">
      <div className="guide-step-header">
        <h2>{t('guide.smtc.title', { defaultValue: 'SMTC 媒体测试' })}</h2>
        <p>{t('guide.smtc.subtitle', { defaultValue: '检测系统媒体会话是否可用' })}</p>
      </div>

      <div className="guide-smtc-content">
        {status === 'loading' && (
          <div className="guide-smtc-loading">
            <div className="guide-smtc-spinner" />
          </div>
        )}

        {status === 'no-media' && (
          <div className="guide-smtc-empty">
            <p className="guide-smtc-hint">
              {t('guide.smtc.hint', { defaultValue: '请使用播放器播放一首歌' })}
            </p>
            <button className="guide-smtc-retry-btn" onClick={retry}>
              {t('guide.smtc.retry', { defaultValue: '重新检测' })}
            </button>
          </div>
        )}

        {status === 'success' && meta && (
          <div className="guide-smtc-result">
            <div className="guide-smtc-left">
              <div
                className="guide-smtc-glow"
                style={{
                  background: `radial-gradient(ellipse at center, rgba(${r}, ${g}, ${b}, 0.4) 0%, transparent 70%)`,
                }}
              />
              <div
                className={`guide-smtc-cover${!meta.isPlaying ? ' paused' : ''}`}
                style={{
                  backgroundImage: meta.coverImage ? `url(${meta.coverImage})` : undefined,
                  boxShadow: `0 0 20px 6px rgba(${r}, ${g}, ${b}, 0.35)`,
                }}
              />
            </div>
            <div className="guide-smtc-right">
              <p className="guide-smtc-title">{meta.title}</p>
              <p className="guide-smtc-artist">{meta.artist}</p>
              {meta.album && <p className="guide-smtc-album">{meta.album}</p>}
              <div className="guide-smtc-info">
                <span className="guide-smtc-info-label">
                  {t('guide.smtc.player', { defaultValue: '播放器' })}
                </span>
                <span className="guide-smtc-info-value">
                  {extractPlayerName(meta.sourceAppId)}
                </span>
              </div>
              <div className="guide-smtc-info">
                <span className="guide-smtc-info-label">
                  {t('guide.smtc.state', { defaultValue: '状态' })}
                </span>
                <span className="guide-smtc-info-value">
                  {meta.isPlaying
                    ? t('guide.smtc.playing', { defaultValue: '播放中' })
                    : t('guide.smtc.paused', { defaultValue: '已暂停' })}
                </span>
              </div>
              <div className="guide-smtc-info">
                <span className="guide-smtc-info-label">
                  {t('guide.smtc.time', { defaultValue: '时长' })}
                </span>
                <span className="guide-smtc-info-value">
                  {formatTime(meta.positionMs)} / {formatTime(meta.durationMs)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="guide-step-footer">
        <button className="guide-prev-btn" onClick={onPrev}>
          {t('guide.actions.prev', { defaultValue: '上一步' })}
        </button>
        <button className="guide-next-btn" onClick={onNext}>
          {t('guide.actions.next', { defaultValue: '下一步' })}
        </button>
      </div>
    </div>
  );
}
