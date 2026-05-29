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

import { useEffect, useState } from 'react';

/**
 * 管理展开 Tab 切换动画设置
 * @returns tabAnimation - 是否启用 Tab 切换动画
 */
export function useExpandTabAnimation(): boolean {
  const [tabAnimation, setTabAnimation] = useState(true);

  useEffect(() => {
    let cancelled = false;
    window.api.storeRead('expand-tab-animation').then((v: unknown) => {
      if (cancelled) return;
      if (v === false) setTabAnimation(false);
    }).catch(() => {});
    const unsub = window.api.onSettingsChanged((channel: string, value: unknown) => {
      if (cancelled) return;
      if (channel === 'settings:expand-tab-animation') setTabAnimation(value !== false);
    });
    return () => { cancelled = true; unsub(); };
  }, []);

  return tabAnimation;
}
