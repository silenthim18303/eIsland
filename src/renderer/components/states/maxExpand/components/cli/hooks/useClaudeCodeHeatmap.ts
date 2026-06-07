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
 * @file useClaudeCodeHeatmap.ts
 * @description 仅订阅 Claude Code 状态中的热力图字段，供任意位置嵌入热力图组件使用。
 * @author 鸡哥
 */

import { useEffect, useState } from 'react';
import type { CliHeatmapDaily } from '../config/types';

/** 仅返回热力图按天累计数据，避免不必要的字段订阅 */
export function useClaudeCodeHeatmap(): CliHeatmapDaily {
  const [heatmap, setHeatmap] = useState<CliHeatmapDaily>({});

  useEffect(() => {
    let cancelled = false;
    window.api.claudeCodeStatusGet().then((next) => {
      if (cancelled) return;
      setHeatmap(next.heatmap ?? {});
    }).catch(() => { /* 读取失败时保持空对象 */ });

    const unsubscribe = window.api.onClaudeCodeStatusUpdated((next) => {
      setHeatmap(next.heatmap ?? {});
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return heatmap;
}
