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

import type { WindowTab } from './standaloneWindowTypes';

export const VALID_TABS = new Set<WindowTab>(['todo', 'countdown', 'urlFavorites', 'album', 'mail', 'localFileSearch', 'clipboardHistory', 'memo', 'settings']);

export const TAB_LIST: { key: WindowTab; labelKey: string }[] = [
  { key: 'todo', labelKey: 'standalone.tabs.todo' },
  { key: 'countdown', labelKey: 'standalone.tabs.countdown' },
  { key: 'urlFavorites', labelKey: 'standalone.tabs.urlFavorites' },
  { key: 'album', labelKey: 'standalone.tabs.album' },
  { key: 'mail', labelKey: 'standalone.tabs.mail' },
  { key: 'localFileSearch', labelKey: 'standalone.tabs.localFileSearch' },
  { key: 'clipboardHistory', labelKey: 'standalone.tabs.clipboardHistory' },
  { key: 'memo', labelKey: 'standalone.tabs.memo' },
  { key: 'settings', labelKey: 'standalone.tabs.settings' },
];
