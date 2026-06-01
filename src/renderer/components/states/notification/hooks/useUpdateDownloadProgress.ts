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
 * @file useUpdateDownloadProgress.ts
 * @description 更新下载进度监听 Hook
 * @author 鸡哥
 */

import { useEffect, useState } from 'react';
import type { DownloadProgressData } from '../config/notificationTypes';

/**
 * 监听更新下载进度（仅在 update-downloading 类型时激活）。
 * @param type - 通知类型。
 * @returns 当前下载进度数据，非下载状态返回 null。
 */
export function useUpdateDownloadProgress(
  type: string | undefined,
): DownloadProgressData | null {
  const [progress, setProgress] = useState<DownloadProgressData | null>(null);

  useEffect(() => {
    if (type !== 'update-downloading') {
      setProgress(null);
      return;
    }
    const unsub = window.api?.onUpdaterProgress?.((data) => {
      setProgress(data);
    });
    return () => {
      unsub?.();
    };
  }, [type]);

  return progress;
}
