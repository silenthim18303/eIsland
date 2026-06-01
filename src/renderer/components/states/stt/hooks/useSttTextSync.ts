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
 * @file useSttTextSync.ts
 * @description STT 识别文本同步到可编辑区域 Hook
 * @author 鸡哥
 */

import { useEffect, type RefObject } from 'react';

/**
 * 将 STT 文本同步到 contentEditable 元素（非编辑状态下）。
 * @param editRef - 可编辑区域 ref。
 * @param sttText - STT 识别文本。
 * @param editing - 是否处于编辑状态。
 */
export function useSttTextSync(
  editRef: RefObject<HTMLDivElement | null>,
  sttText: string,
  editing: boolean,
): void {
  useEffect(() => {
    if (editRef.current && !editing) {
      editRef.current.textContent = sttText || '...';
    }
  }, [sttText, editing, editRef]);
}
