/**
 * @file useKlineRange.ts
 * @description K 线图范围持久化 hook，用户调整范围后自动保存到 localStorage
 * @author 鸡哥
 */

import { useCallback, useRef } from 'react';
import type Highcharts from 'highcharts/highstock';

const STORAGE_KEY_PREFIX = 'stock-kline-range:';

function loadSavedRange(code: string): { min: number; max: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + code);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.min === 'number' && typeof parsed.max === 'number') return parsed;
  } catch { /* ignore */ }
  return null;
}

/**
 * 管理 K 线图 xAxis 范围的持久化。
 * @param stockCode - 当前股票代码，切换时自动加载对应范围。
 * @returns rangeRef（当前范围）、handleAfterSetExtremes（Highcharts 事件回调）。
 */
export function useKlineRange(stockCode: string | undefined) {
  const codeRef = useRef<string | null>(stockCode ?? null);
  const rangeRef = useRef<{ min: number; max: number } | null>(
    stockCode ? loadSavedRange(stockCode) : null,
  );

  // 股票切换时重置 ref
  if (stockCode && stockCode !== codeRef.current) {
    codeRef.current = stockCode;
    rangeRef.current = loadSavedRange(stockCode);
  }

  /** 用户手动调整范围后记录到 ref 并持久化 */
  const handleAfterSetExtremes = useCallback((e: Highcharts.AxisSetExtremesEventObject) => {
    if (e.trigger === 'rangeSelectorButton' || e.trigger === 'zoom' || e.trigger === 'navigator' || e.trigger === 'scrollbar') {
      const range = { min: e.min, max: e.max };
      rangeRef.current = range;
      if (codeRef.current) {
        try { localStorage.setItem(STORAGE_KEY_PREFIX + codeRef.current, JSON.stringify(range)); } catch { /* ignore */ }
      }
    }
  }, []);

  return { rangeRef, handleAfterSetExtremes };
}
