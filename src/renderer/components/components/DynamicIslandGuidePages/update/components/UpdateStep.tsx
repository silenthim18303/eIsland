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
 * @file UpdateStep.tsx
 * @description 引导配置 — 更新源选择步骤组件
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { SvgIcon } from '../../../../../utils/SvgIcon';
import { UPDATE_SOURCE_OPTIONS } from '../config/updateSourceOptions';
import { useUpdateSourceSelect } from '../hooks/useUpdateSourceSelect';
import type { UpdateStepProps } from '../types';

/**
 * 更新源选择步骤组件
 * @description 展示可选更新源列表，用户单选后实时同步到配置
 */
export function UpdateStep({ onNext, onPrev }: UpdateStepProps): ReactElement {
  const { t } = useTranslation();
  const { selected, handleSelect } = useUpdateSourceSelect();

  return (
    <div className="guide-step">
      <div className="guide-step-header">
        <h2>{t('guide.update.title', { defaultValue: '选择更新源' })}</h2>
        <p>{t('guide.update.subtitle', { defaultValue: '选择检查更新时使用的下载源' })}</p>
      </div>
      <div className="guide-update-list">
        {UPDATE_SOURCE_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            className={`guide-update-option${selected === opt.key ? ' selected' : ''}`}
            onClick={(): void => { handleSelect(opt.key); }}
          >
            <span>{opt.label}</span>
            {opt.proOnly && (
              <img className="guide-update-pro-icon" src={SvgIcon.PRO} alt="PRO" />
            )}
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
