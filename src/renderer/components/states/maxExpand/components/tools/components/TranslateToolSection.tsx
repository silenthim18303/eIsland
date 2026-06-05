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

import { useEffect, useRef, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { SvgIcon } from '../../../../../../utils/SvgIcon';
import { resolveCountryIcon } from '../../../../../../utils/SvgIcon/country-icon';
import { TRANSLATE_LANGUAGES, TRANSLATE_TARGET_LANGUAGES } from '../config/translateToolConfig';
import { useTranslateTool } from '../hooks/useTranslateTool';

interface LangOption {
  code: string;
  labelKey: string;
}

function TranslateLangDropdown({
  options,
  value,
  onChange,
}: {
  options: readonly LangOption[];
  value: string;
  onChange: (code: string) => void;
}): ReactElement {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const selected = options.find((o) => o.code === value);
  const selectedFlag = resolveCountryIcon(value);

  return (
    <div className="translate-lang-dropdown" ref={wrapperRef}>
      <button
        type="button"
        className="translate-lang-dropdown-trigger"
        onClick={() => setOpen((prev) => !prev)}
      >
        {selectedFlag && (
          <img className="translate-lang-flag no-filter" src={selectedFlag} alt="" draggable={false} />
        )}
        <span className="translate-lang-dropdown-label">
          {selected ? t(selected.labelKey) : value}
        </span>
        <span className="translate-lang-dropdown-arrow">▾</span>
      </button>
      {open && (
        <div className="translate-lang-dropdown-menu">
          {options.map((lang) => {
            const flag = resolveCountryIcon(lang.code);
            return (
              <button
                key={lang.code}
                type="button"
                className={`translate-lang-dropdown-item ${lang.code === value ? 'active' : ''}`}
                onClick={() => {
                  onChange(lang.code);
                  setOpen(false);
                }}
              >
                {flag ? (
                  <img className="translate-lang-flag no-filter" src={flag} alt="" draggable={false} />
                ) : (
                  <span className="translate-lang-flag-placeholder" />
                )}
                <span>{t(lang.labelKey)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * 翻译工具模块主视图。
 */
export function TranslateToolSection(): ReactElement {
  const { t } = useTranslation();
  const {
    sourceLang,
    targetLang,
    sourceText,
    resultText,
    translating,
    setSourceLang,
    setTargetLang,
    setSourceText,
    handleSwapLanguages,
    handleTranslate,
    handleCopyResult,
    handleClearAll,
  } = useTranslateTool();

  return (
    <div className="settings-cards translate-panel">
      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-title">{t('maxExpand.toolbox.translate.title')}</div>
          <div className="settings-card-subtitle">{t('maxExpand.toolbox.translate.subtitle')}</div>
        </div>
        <div className="settings-card-body">
          <div className="translate-lang-row">
            <TranslateLangDropdown
              options={TRANSLATE_LANGUAGES}
              value={sourceLang}
              onChange={setSourceLang}
            />
            <button
              className="translate-swap-btn"
              type="button"
              onClick={handleSwapLanguages}
              disabled={sourceLang === 'auto'}
              title={t('maxExpand.toolbox.translate.swap')}
            >
              <img className="translate-swap-icon" src={SvgIcon.SWITCHING} alt="" draggable={false} />
            </button>
            <TranslateLangDropdown
              options={TRANSLATE_TARGET_LANGUAGES}
              value={targetLang}
              onChange={setTargetLang}
            />
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
