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
 * @file GithubStep.tsx
 * @description 引导配置 — 开源信息展示步骤组件
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { PROJECT_LINKS } from '../config/projectLinks';
import type { GithubStepProps } from '../types';

/**
 * 开源信息展示步骤组件
 * @description 展示项目 GitHub 信息、开源协议与相关链接
 */
export function GithubStep({ onNext, onPrev }: GithubStepProps): ReactElement {
  const { t } = useTranslation();

  /** 在默认浏览器中打开链接 */
  const handleOpenLink = (url: string): void => {
    window.api.clipboardOpenUrl(url).catch(() => {});
  };

  return (
    <div className="guide-step">
      <div className="guide-step-header">
        <h2>{t('guide.github.title', { defaultValue: '开源信息' })}</h2>
        <p>{t('guide.github.subtitle', { defaultValue: 'eIsland 是一个开源项目' })}</p>
      </div>
      <div className="guide-github-content">
        <div className="guide-github-links">
          {PROJECT_LINKS.map((link) => (
            <button
              key={link.key}
              className="guide-github-link-btn"
              onClick={(): void => { handleOpenLink(link.url); }}
            >
              <img className="guide-github-link-icon" src={link.icon} alt="" />
              <span>{t(`guide.github.links.${link.key}`, { defaultValue: link.key })}</span>
            </button>
          ))}
        </div>
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
