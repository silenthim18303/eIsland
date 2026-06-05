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
 * @file useTranslateTool.ts
 * @description 翻译工具服务状态复用 Hook。
 * @author 鸡哥
 */

import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchTranslate } from '../../../../../../api/tools/toolboxTranslateApi';
import { readLocalToken } from '../../../../../../utils/userAccount';

export interface UseTranslateToolResult {
  sourceLang: string;
  targetLang: string;
  sourceText: string;
  resultText: string;
  translating: boolean;
  setSourceLang: (lang: string) => void;
  setTargetLang: (lang: string) => void;
  setSourceText: (text: string) => void;
  handleSwapLanguages: () => void;
  handleTranslate: () => void;
  handleCopyResult: () => void;
  handleClearAll: () => void;
}

/** 复用工具箱翻译服务，并暴露 UI 状态与操作。 */
export function useTranslateTool(): UseTranslateToolResult {
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

  return {
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
  };
}