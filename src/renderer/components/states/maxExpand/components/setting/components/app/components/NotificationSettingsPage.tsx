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
 * @file NotificationSettingsPage.tsx
 * @description 设置页面 - 软件设置通知子界面（占位页）
 * @author 鸡哥
 */

import { useEffect, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { NOTIFICATION_SOUND_ENABLED_STORE_KEY } from '../../../../../../../../utils/audio/notificationSound';

/** Agent 启动通知开关存储键名 */
const AGENT_NOTIFICATION_ENABLED_STORE_KEY = 'agent-notification-enabled';

/**
 * 渲染通知设置页面
 * @returns 通知设置页面
 */
export function NotificationSettingsPage(): ReactElement {
  const { t } = useTranslation();
  const [notificationSoundEnabled, setNotificationSoundEnabled] = useState<boolean>(true);
  const [agentNotificationEnabled, setAgentNotificationEnabled] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    window.api.storeRead(NOTIFICATION_SOUND_ENABLED_STORE_KEY).then((value) => {
      if (cancelled) return;
      if (typeof value === 'boolean') setNotificationSoundEnabled(value);
    }).catch(() => {});
    window.api.storeRead(AGENT_NOTIFICATION_ENABLED_STORE_KEY).then((value) => {
      if (cancelled) return;
      if (typeof value === 'boolean') setAgentNotificationEnabled(value);
    }).catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChangeNotificationSoundEnabled = (next: boolean): void => {
    const prev = notificationSoundEnabled;
    setNotificationSoundEnabled(next);
    window.api.storeWrite(NOTIFICATION_SOUND_ENABLED_STORE_KEY, next).catch(() => {
      setNotificationSoundEnabled(prev);
    });
  };

  const handleChangeAgentNotificationEnabled = (next: boolean): void => {
    const prev = agentNotificationEnabled;
    setAgentNotificationEnabled(next);
    window.api.storeWrite(AGENT_NOTIFICATION_ENABLED_STORE_KEY, next).catch(() => {
      setAgentNotificationEnabled(prev);
    });
  };

  return (
    <div className="max-expand-settings-section">
      <div className="settings-cards settings-notification-page-panel">
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-title">{t('settings.notification.sound.title', { defaultValue: '通知音效' })}</div>
            <div className="settings-card-subtitle">{t('settings.notification.sound.hint', { defaultValue: '通知触发时播放一次提示音。' })}</div>
          </div>
          <div className="settings-card-inline-row">
            <label className="settings-card-check">
              <input
                type="checkbox"
                checked={notificationSoundEnabled}
                onChange={(e) => handleChangeNotificationSoundEnabled(e.target.checked)}
              />
              {t('settings.notification.sound.toggle', { defaultValue: '启用通知音效' })}
            </label>
          </div>
        </div>
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-title">{t('settings.notification.agentNotification.title', { defaultValue: 'Agent 启动通知' })}</div>
            <div className="settings-card-subtitle">{t('settings.notification.agentNotification.hint', { defaultValue: '检测到桌面 Agent 启动或关闭时弹出灵动岛通知。' })}</div>
          </div>
          <div className="settings-card-inline-row">
            <label className="settings-card-check">
              <input
                type="checkbox"
                checked={agentNotificationEnabled}
                onChange={(e) => handleChangeAgentNotificationEnabled(e.target.checked)}
              />
              {t('settings.notification.agentNotification.toggle', { defaultValue: '启用 Agent 启动通知' })}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
