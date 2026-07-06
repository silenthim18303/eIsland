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
 * @description 引导配置 — SMTC 检查步骤组件
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useSmtcCheck } from '../hooks/useSmtcCheck';
import type { SmtcStepProps } from '../types';

/**
 * SMTC 检查步骤组件
 * @description 检测系统媒体会话（SMTC）是否可用，引导用户确认
 */
export function SmtcStep({ onNext, onPrev }: SmtcStepProps): ReactElement {
  const { t } = useTranslation();
  const { status, check } = useSmtcCheck();

  return (
    <div className="guide-step">
      <div className="guide-step-header">
        <h2>{t('guide.smtc.title', { defaultValue: '媒体检测' })}</h2>
        <p>{t('guide.smtc.subtitle', { defaultValue: '检测系统媒体会话是否可用' })}</p>
      </div>
      <div className="guide-smtc-content">
        {status === 'idle' && (
          <button className="guide-smtc-check-btn" onClick={check}>
            {t('guide.smtc.check', { defaultValue: '开始检测' })}
          </button>
        )}
        {status === 'checking' && (
          <p className="guide-smtc-status">{t('guide.smtc.checking', { defaultValue: '检测中…' })}</p>
        )}
        {status === 'found' && (
          <p className="guide-smtc-status guide-smtc-found">{t('guide.smtc.found', { defaultValue: '检测成功' })}</p>
        )}
        {status === 'not-found' && (
          <p className="guide-smtc-status guide-smtc-not-found">{t('guide.smtc.notFound', { defaultValue: '未检测到媒体会话' })}</p>
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
