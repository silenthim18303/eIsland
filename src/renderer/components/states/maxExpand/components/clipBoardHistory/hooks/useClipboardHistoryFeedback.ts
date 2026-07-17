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
 * @file useClipboardHistoryFeedback.ts
 * @description 剪贴板历史反馈提示 hook。
 * @author 鸡哥
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { FEEDBACK_DURATION_MS } from '../config/clipboardHistoryConfig';
import type { UseClipboardHistoryFeedbackReturn } from '../types/clipboardHistoryTypes';

/**
 * 管理复制/导出等操作的反馈提示状态
 */
export function useClipboardHistoryFeedback(): UseClipboardHistoryFeedbackReturn {
  const [copyFeedback, setCopyFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const copyFeedbackTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (copyFeedbackTimerRef.current !== null) {
      window.clearTimeout(copyFeedbackTimerRef.current);
    }
  }, []);

  const showCopyFeedback = useCallback((type: 'success' | 'error', text: string): void => {
    setCopyFeedback({ type, text });
    if (copyFeedbackTimerRef.current !== null) {
      window.clearTimeout(copyFeedbackTimerRef.current);
    }
    copyFeedbackTimerRef.current = window.setTimeout(() => {
      setCopyFeedback(null);
      copyFeedbackTimerRef.current = null;
    }, FEEDBACK_DURATION_MS);
  }, []);

  return { copyFeedback, showCopyFeedback };
}
