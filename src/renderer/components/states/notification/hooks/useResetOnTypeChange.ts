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
 * @file useResetOnTypeChange.ts
 * @description 通知类型变更时重置剪贴板相关状态
 * @author 鸡哥
 */

import { useEffect, type Dispatch, type SetStateAction } from 'react';

/**
 * 当通知类型或剪贴板 URL 变化时，重置剪贴板相关 UI 状态。
 * @param type - 通知类型。
 * @param urls - 剪贴板 URL 列表。
 * @param currentClipboardUrl - 当前剪贴板 URL。
 * @param icon - 通知图标。
 * @param setCurrentUrlIndex - 设置当前 URL 索引。
 * @param setClipboardFaviconIndex - 设置 favicon 候选索引。
 * @param setUseClipboardVectorFallbackIcon - 设置是否使用矢量 fallback 图标。
 */
export function useResetOnTypeChange(
  type: string | undefined,
  urls: string[] | undefined,
  currentClipboardUrl: string,
  icon: string | undefined,
  setCurrentUrlIndex: Dispatch<SetStateAction<number>>,
  setClipboardFaviconIndex: Dispatch<SetStateAction<number>>,
  setUseClipboardVectorFallbackIcon: Dispatch<SetStateAction<boolean>>,
): void {
  useEffect(() => {
    setCurrentUrlIndex(0);
  }, [type, urls, setCurrentUrlIndex]);

  useEffect(() => {
    setClipboardFaviconIndex(0);
  }, [type, currentClipboardUrl, setClipboardFaviconIndex]);

  useEffect(() => {
    setUseClipboardVectorFallbackIcon(false);
  }, [type, currentClipboardUrl, icon, setUseClipboardVectorFallbackIcon]);
}
