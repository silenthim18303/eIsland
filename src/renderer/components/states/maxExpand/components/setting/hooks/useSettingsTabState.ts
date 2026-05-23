import { useEffect, useState } from 'react';
import { readLocalToken, subscribeUserAccountSessionChanged } from '../../../../../../utils/userAccount';
import { SETTINGS_SIDEBAR_DEFAULT_TAB } from '../config/settingsTabConfig';
import type { SettingsSidebarTabKey } from '../utils/settingsConfig';

let lastSettingsSidebarTab: SettingsSidebarTabKey = SETTINGS_SIDEBAR_DEFAULT_TAB;

export function useSettingsSidebarTabState() {
  const [activeTab, setActiveTab] = useState<SettingsSidebarTabKey>(() => lastSettingsSidebarTab);

  useEffect(() => {
    lastSettingsSidebarTab = activeTab;
  }, [activeTab]);

  return [activeTab, setActiveTab] as const;
}

export function useUserSessionState() {
  const [sessionToken, setSessionToken] = useState<string | null>(() => readLocalToken());
  const [hasLoginSession, setHasLoginSession] = useState<boolean>(() => Boolean(readLocalToken()));

  useEffect(() => {
    const applySession = (): void => {
      const token = readLocalToken();
      setSessionToken(token);
      setHasLoginSession(Boolean(token));
    };

    applySession();
    return subscribeUserAccountSessionChanged(applySession);
  }, []);

  return { sessionToken, hasLoginSession };
}
