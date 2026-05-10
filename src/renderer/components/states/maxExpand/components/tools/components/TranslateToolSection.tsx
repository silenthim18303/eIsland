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
 * @file TranslateToolSection.tsx
 * @description 工具箱翻译模块
 * @author 鸡哥
 */

import { useCallback, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchTranslate } from '../../../../../../api/tools/toolboxTranslateApi';
import { readLocalToken } from '../../../../../../utils/userAccount';
import { SvgIcon } from '../../../../../../utils/SvgIcon';
import { TRANSLATE_LANGUAGES, TRANSLATE_TARGET_LANGUAGES } from '../config/toolboxConfig';

export function TranslateToolSection(): ReactElement {
  const { t } = useTranslation();
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
    const token = readLocalToken();
    if (!token) {
      setResultText(t('maxExpand.toolbox.translate.loginRequired', { defaultValue: '请先登录后再使用翻译服务' }));
      return;
    }
    setTranslating(true);
    fetchTranslate(token, sourceText, sourceLang, targetLang)
      .then((result) => {
        if (result.success && result.data) {
          setResultText(result.data.targetText);
        } else {
          setResultText(result.message ?? t('maxExpand.toolbox.translate.error'));
        }
      })
      .finally(() => setTranslating(false));
  }, [sourceText, sourceLang, targetLang, translating, t]);

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
