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
 * @file GuideStaticPage.tsx
 * @description 引导页普通展示子组件
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import type { TFunction } from 'i18next';
import { SvgIcon } from '../../../../utils/SvgIcon';

interface GuideTip {
  text: string;
}

interface GuideStaticPageData {
  icon?: string;
  imageSrc?: string;
  actionPrompt?: 'auth';
  title: string;
  desc: string;
  tips?: GuideTip[];
}

interface GuideStaticPageProps {
  page: number;
  current: GuideStaticPageData;
  t: TFunction;
  onAuthLogin: () => void;
  onAuthRegister: () => void;
}

export function GuideStaticPage({
  page,
  current,
  t,
  onAuthLogin,
  onAuthRegister,
}: GuideStaticPageProps): ReactElement {
  return (
    <div className={`guide-page${page === 0 ? ' guide-page-welcome' : ''}${current.actionPrompt === 'auth' ? ' guide-page-auth' : ''}`} key={page}>
      <div className="guide-hero">
        {current.imageSrc
          ? <img className="guide-page-logo" src={current.imageSrc} alt="" aria-hidden="true" />
          : current.actionPrompt === 'auth'
            ? <img className="guide-page-auth-icon" src={SvgIcon.USER} alt="" aria-hidden="true" />
            : <div className="guide-page-icon" aria-hidden="true">{current.icon}</div>
        }
        <div className="guide-title">{current.title}</div>
      </div>
      <div className="guide-desc">{current.desc}</div>

      {current.tips && (
        <div className="guide-tips" aria-label={t('guide.tipsAria', { defaultValue: '要点' })}>
          {current.tips.map((tip, i) => (
            <div className="guide-tip" key={i}>
              <span className="guide-tip-text">{tip.text}</span>
            </div>
          ))}
        </div>
      )}

      {current.actionPrompt === 'auth' && (
        <div className="guide-auth-actions">
          <button
            type="button"
            className="guide-btn guide-btn-primary"
            onClick={onAuthLogin}
          >
            {t('guide.actions.loginNow', { defaultValue: '立即登录' })}
          </button>
          <button
            type="button"
            className="guide-btn guide-btn-secondary"
            onClick={onAuthRegister}
          >
            {t('guide.actions.registerNow', { defaultValue: '立即注册' })}
          </button>
        </div>
      )}
    </div>
  );
}
