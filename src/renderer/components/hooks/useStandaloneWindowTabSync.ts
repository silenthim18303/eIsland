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

import { useEffect } from 'react';
import {
  ACTIVE_TAB_STORE_KEY,
  LEGACY_ACTIVE_TAB_STORE_KEY,
  AUTH_INTENT_STORE_KEY,
  VALID_TABS,
  applyAuthIntent,
  type WindowTab,
} from '../config/standaloneWindowConfig';

interface UseStandaloneWindowTabSyncOptions {
  setActiveTab: React.Dispatch<React.SetStateAction<WindowTab>>;
}

export function useStandaloneWindowTabSync(options: UseStandaloneWindowTabSyncOptions): void {
  const { setActiveTab } = options;

  useEffect(() => {
    let cancelled = false;

    window.api.storeRead(ACTIVE_TAB_STORE_KEY).then((tab) => {
      if (cancelled) return;
      if (VALID_TABS.has(tab as WindowTab)) {
        setActiveTab(tab as WindowTab);
        return;
      }
      window.api.storeRead(LEGACY_ACTIVE_TAB_STORE_KEY).then((legacyTab) => {
        if (cancelled) return;
        if (VALID_TABS.has(legacyTab as WindowTab)) {
          setActiveTab(legacyTab as WindowTab);
        }
      }).catch(() => {});
    }).catch(() => {});

    window.api.storeRead(AUTH_INTENT_STORE_KEY).then((intent) => {
      if (cancelled) return;
      if (intent === 'login' || intent === 'register') {
        setActiveTab('settings');
        applyAuthIntent(intent);
        window.api.storeWrite(AUTH_INTENT_STORE_KEY, null).catch(() => {});
      }
    }).catch(() => {});

    const unsub = window.api.onSettingsChanged((channel: string, value: unknown) => {
      if (cancelled) return;
      if (channel === `store:${ACTIVE_TAB_STORE_KEY}` && VALID_TABS.has(value as WindowTab)) {
        setActiveTab(value as WindowTab);
      }
      if (channel === `store:${AUTH_INTENT_STORE_KEY}` && (value === 'login' || value === 'register')) {
        setActiveTab('settings');
        applyAuthIntent(value);
        window.api.storeWrite(AUTH_INTENT_STORE_KEY, null).catch(() => {});
      }
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [setActiveTab]);
}
