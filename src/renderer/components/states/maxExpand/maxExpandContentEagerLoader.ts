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
 * @file maxExpandContentEagerLoader.ts
 * @description MaxExpand 旧版一次性加载组件的懒加载与预加载工具。
 * @author 鸡哥
 */

type MaxExpandContentEagerModule = {
  default: typeof import('./MaxExpandContentEager').MaxExpandContentEager;
};
type MaxExpandContentEagerComponent = MaxExpandContentEagerModule['default'];

let maxExpandContentEagerPromise: Promise<MaxExpandContentEagerModule> | null = null;
let maxExpandContentEagerComponent: MaxExpandContentEagerComponent | null = null;

/**
 * 懒加载 MaxExpand 旧版内容组件，并缓存 Promise 结果。
 */
export function loadMaxExpandContentEager(): Promise<MaxExpandContentEagerModule> {
  if (!maxExpandContentEagerPromise) {
    maxExpandContentEagerPromise = import('./MaxExpandContentEager').then((module) => {
      maxExpandContentEagerComponent = module.MaxExpandContentEager;
      return { default: module.MaxExpandContentEager };
    });
  }
  return maxExpandContentEagerPromise;
}

/**
 * 获取已经加载完成的 MaxExpand 旧版内容组件。
 */
export function getLoadedMaxExpandContentEager(): MaxExpandContentEagerComponent | null {
  return maxExpandContentEagerComponent;
}

/**
 * 预加载 MaxExpand 旧版内容组件。
 */
export function preloadMaxExpandContentEager(): void {
  void loadMaxExpandContentEager();
}
