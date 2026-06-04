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
 * @file KaraokeSyllableLine.tsx
 * @description 逐字扫光行渲染组件
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import type { SyncedLyricSyllable } from '../../../../store/types';

interface KaraokeSyllableLineProps {
  syllables: SyncedLyricSyllable[];
  lineStartMs: number;
  posMs: number;
}

/**
 * 逐字扫光行渲染: 按音节真实 start/duration 计算每个音节的独立进度。
 * @param props - 音节数据与时间参数。
 * @returns 渲染的音节节点列表。
 */
export function KaraokeSyllableLine({
  syllables,
  lineStartMs,
  posMs,
}: KaraokeSyllableLineProps): ReactElement {
  return (
    <>
      {syllables.map((syl, i) => {
        const sylStart = lineStartMs + syl.start_offset_ms;
        const sylEnd = sylStart + syl.duration_ms;
        let prog = 0;
        if (posMs >= sylEnd) prog = 1;
        else if (posMs > sylStart && syl.duration_ms > 0) {
          prog = (posMs - sylStart) / syl.duration_ms;
        }
        return (
          <span
            key={i}
            className="lyrics-syllable"
            style={{ '--syl-prog': `${(prog * 100).toFixed(2)}%` } as React.CSSProperties}
          >
            {syl.text}
          </span>
        );
      })}
    </>
  );
}
