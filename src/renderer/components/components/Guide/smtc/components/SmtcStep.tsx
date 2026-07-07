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
import { useSmtcTest } from '../hooks/useSmtcTest';
import { extractPlayerName, getPlayerIcon } from '../utils/smtcUtils';
import { SvgIcon } from '../../../../../utils/SvgIcon';
import { MarqueeText } from './MarqueeText';
import type { SmtcStepProps } from '../types';

/**
 * SMTC 媒体测试步骤组件
 */
export function SmtcStep({ onNext, onPrev }: SmtcStepProps): ReactElement {
  const { t } = useTranslation();
  const { status, meta } = useSmtcTest();
  const [r, g, b] = meta?.dominantColor ?? [0, 0, 0];

  return (
    <div className="guide-step">
      <div className="guide-step-header">
        <h2>{t('guide.smtc.title', { defaultValue: 'SMTC 媒体测试' })}</h2>
        <p>{t('guide.smtc.subtitle', { defaultValue: '检测系统媒体会话是否可用' })}</p>
      </div>

      <div className="guide-smtc-content">
        {(status === 'loading' || status === 'no-media') && (
          <div className="guide-smtc-empty">
            <div className="guide-smtc-spinner" />
            <p className="guide-smtc-hint">
              {t('guide.smtc.hint', { defaultValue: '请使用播放器播放一首歌' })}
            </p>
          </div>
        )}

        {status === 'success' && meta && (
          <div className="guide-smtc-result">
            <div className="guide-smtc-media-row">
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
                <MarqueeText className="guide-smtc-title">{meta.title}</MarqueeText>
                <MarqueeText className="guide-smtc-artist">{meta.artist}</MarqueeText>
                {meta.album && <MarqueeText className="guide-smtc-album">{meta.album}</MarqueeText>}
                <div className="guide-smtc-info">
                  <span className="guide-smtc-info-label">
                    {t('guide.smtc.player', { defaultValue: '播放器' })}
                  </span>
                  <span className="guide-smtc-info-value">
                    {getPlayerIcon(meta.sourceAppId) && (
                      <img
                        src={SvgIcon[getPlayerIcon(meta.sourceAppId)!]}
                        alt=""
                        className="guide-smtc-player-icon"
                      />
                    )}
                    {extractPlayerName(meta.sourceAppId)}
                  </span>
                </div>
              </div>
            </div>

            <div className="guide-smtc-controls">
              <button
                className="guide-smtc-ctrl-btn"
                onClick={(): void => { window.api?.mediaPrev(); }}
                title={t('guide.smtc.prev', { defaultValue: '上一曲' })}
              >
                <img src={SvgIcon.PREVIOUS_SONG} alt="" className="guide-smtc-ctrl-icon guide-smtc-ctrl-icon--sm" />
              </button>
              <button
                className="guide-smtc-ctrl-btn guide-smtc-ctrl-btn--play"
                onClick={(): void => { window.api?.mediaPlayPause(); }}
                title={meta.isPlaying
                  ? t('guide.smtc.pause', { defaultValue: '暂停' })
                  : t('guide.smtc.play', { defaultValue: '播放' })}
              >
                {meta.isPlaying ? (
                  <img src={SvgIcon.PAUSE} alt="" className="guide-smtc-ctrl-icon" />
                ) : (
                  <img src={SvgIcon.CONTINUE} alt="" className="guide-smtc-ctrl-icon" />
                )}
              </button>
              <button
                className="guide-smtc-ctrl-btn"
                onClick={(): void => { window.api?.mediaNext(); }}
                title={t('guide.smtc.next', { defaultValue: '下一曲' })}
              >
                <img src={SvgIcon.NEXT_SONG} alt="" className="guide-smtc-ctrl-icon guide-smtc-ctrl-icon--sm" />
              </button>
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
