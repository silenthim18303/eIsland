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
 * @file LanguageStep.tsx
 * @description 引导配置 — 语言选择步骤组件
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGE_OPTIONS } from '../config/languageOptions';
import { useLanguageSelect } from '../hooks/useLanguageSelect';
import type { LanguageStepProps } from '../types';
import type { AppLanguage } from '../../../../../i18n';
import { ProcessIndicator } from '../../../DynamicIslandProcessIndicator';

/**
 * 语言选择步骤组件
 * @description 展示可选语言列表，用户选择后切换语言并进入下一步
 */
export function LanguageStep({ onNext, currentStep, totalSteps }: LanguageStepProps): ReactElement {
  const { t } = useTranslation();
  const { selected, handleSelect } = useLanguageSelect();

  return (
    <div className="guide-step">
      <div className="guide-step-header">
        <h2>{t('guide.language.title', { defaultValue: '选择语言' })}</h2>
        <p>{t('guide.language.subtitle', { defaultValue: '选择你偏好的语言以继续' })}</p>
        <ProcessIndicator total={totalSteps} current={currentStep} />
      </div>
      <div className="guide-language-list">
        {LANGUAGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`guide-language-option${selected === opt.value ? ' selected' : ''}${!opt.available ? ' disabled' : ''}`}
            disabled={!opt.available}
            onClick={(): void => { if (opt.available) handleSelect(opt.value as AppLanguage); }}
          >
            <img className="guide-language-icon" src={opt.icon} alt="" />
            <span>{t(opt.labelKey)}</span>
          </button>
        ))}
      </div>
      <div className="guide-step-footer">
        <button className="guide-next-btn" onClick={onNext}>
          {t('guide.actions.next', { defaultValue: '下一步' })}
        </button>
      </div>
    </div>
  );
}
