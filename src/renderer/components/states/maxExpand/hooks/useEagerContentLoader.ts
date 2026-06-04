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
 * @file useEagerContentLoader.ts
 * @description Eager 内容模块加载 Hook
 * @author 鸡哥
 */

import { useEffect, useState } from 'react';
import {
  getLoadedMaxExpandContentEager,
  loadMaxExpandContentEager,
} from '../maxExpandContentEagerLoader';

type EagerComponent = React.ComponentType | undefined;

/**
 * 加载 eager 内容模块，性能模式启用时跳过加载。
 * @param performanceModeEnabled - 性能模式是否启用。
 * @returns 已加载的 eager 组件，未加载返回 undefined。
 */
export function useEagerContentLoader(performanceModeEnabled: boolean): EagerComponent {
  const [loaded, setLoaded] = useState<EagerComponent>(getLoadedMaxExpandContentEager);

  /** 首次加载 */
  useEffect(() => {
    if (performanceModeEnabled || loaded) return undefined;
    let cancelled = false;
    loadMaxExpandContentEager().then((module) => {
      if (cancelled) return;
      setLoaded(() => module.default);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [performanceModeEnabled, loaded]);

  /** 性能模式关闭时加载 */
  useEffect(() => {
    if (performanceModeEnabled || loaded) return;
    let cancelled = false;
    loadMaxExpandContentEager().then((module) => {
      if (cancelled) return;
      setLoaded(() => module.default);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [performanceModeEnabled, loaded]);

  return loaded;
}
