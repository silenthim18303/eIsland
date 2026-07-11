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
 * @file SponsorStep.tsx
 * @description 引导配置 — 赞助商展示步骤组件
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { SPONSOR_IMG_SRC } from '../config/sponsorConfig';
import type { SponsorStepProps } from '../types';

/**
 * 赞助商展示步骤组件
 * @description 展示赞助商 Logo 信息
 */
export function SponsorStep({ onNext, onPrev }: SponsorStepProps): ReactElement {
  const { t } = useTranslation();

  return (
    <div className="guide-step">
      <div className="guide-step-header">
        <h2>{t('guide.sponsors.title', { defaultValue: '赞助商' })}</h2>
        <p>{t('guide.sponsors.subtitle', { defaultValue: '感谢赞助商的支持' })}</p>
      </div>
      <div className="guide-sponsors-content">
        <img
          className="guide-sponsors-img"
          src={SPONSOR_IMG_SRC}
          alt="Sponsor"
        />
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
