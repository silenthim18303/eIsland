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
 * @file StandaloneWindowViewport.tsx
 * @description 独立窗口内容视口组件。
 * @author 鸡哥
 */

import React from 'react';
import { TodoTab } from '../states/maxExpand/components/TodoTab';
import { CountdownTab } from '../states/maxExpand/components/CountdownTab';
import { UrlFavoritesTab } from '../states/maxExpand/components/UrlFavoritesTab';
import { AlbumTab } from '../states/maxExpand/components/AlbumTab';
import { MailTab } from '../states/maxExpand/components/MailTab';
import { LocalFileSearchTab } from '../states/maxExpand/components/LocalFileSearchTab';
import { ClipboardHistoryTab } from '../states/maxExpand/components/ClipboardHistoryTab';
import { SettingsTab } from '../states/maxExpand/components/SettingsTab';
import { MemoTab } from '../states/maxExpand/components/MemoTab';
import { LoginContent } from '../states/login/LoginContent';
import { RegisterContent } from '../states/register/RegisterContent';
import { PaymentContent } from '../states/payment/PaymentContent';
import type { WindowTab } from '../config/standaloneWindowConfig';

interface StandaloneWindowViewportProps {
  activeTab: WindowTab;
  state: string;
}

/**
 * @description 根据标签页渲染独立窗口内容。
 * @param props - 视口渲染参数。
 * @returns 独立窗口内容视口节点。
 */
export function StandaloneWindowViewport({ activeTab, state }: StandaloneWindowViewportProps): React.JSX.Element {
  return (
    <div className="cw-viewport">
      {activeTab === 'todo' && <TodoTab />}
      {activeTab === 'countdown' && <CountdownTab />}
      {activeTab === 'urlFavorites' && <UrlFavoritesTab />}
      {activeTab === 'album' && <AlbumTab />}
      {activeTab === 'mail' && <MailTab />}
      {activeTab === 'localFileSearch' && <LocalFileSearchTab />}
      {activeTab === 'clipboardHistory' && <ClipboardHistoryTab />}
      {activeTab === 'memo' && <MemoTab />}
      {activeTab === 'settings' && state === 'login' && <LoginContent />}
      {activeTab === 'settings' && state === 'register' && <RegisterContent />}
      {activeTab === 'settings' && state === 'payment' && <PaymentContent />}
      {activeTab === 'settings' && state !== 'login' && state !== 'register' && state !== 'payment' && <SettingsTab />}
    </div>
  );
}
