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
 * @file WhitelistStep.tsx
 * @description 引导配置 — SMTC 白名单选择步骤组件
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { WHITELIST_OPTIONS } from '../config/whitelistOptions';
import { useWhitelistSelect } from '../hooks/useWhitelistSelect';
import type { WhitelistStepProps } from '../types';

/**
 * SMTC 白名单选择步骤组件
 * @description 展示可选播放器列表，用户多选后实时同步到配置
 */
export function WhitelistStep({ onNext, onPrev }: WhitelistStepProps): ReactElement {
  const { t } = useTranslation();
  const { selected, toggle } = useWhitelistSelect();

  return (
    <div className="guide-step">
      <div className="guide-step-header">
        <h2>{t('guide.whitelist.title', { defaultValue: '选择播放器' })}</h2>
        <p>{t('guide.whitelist.subtitle', { defaultValue: '选择需要监听的播放器' })}</p>
      </div>
      <div className="guide-whitelist-list">
        {WHITELIST_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`guide-whitelist-option${selected.includes(opt.value) ? ' selected' : ''}`}
            onClick={(): void => { toggle(opt.value); }}
          >
            <img className="guide-whitelist-icon" src={opt.icon} alt="" />
            <span>{t(opt.labelKey, { defaultValue: opt.value })}</span>
          </button>
        ))}
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
