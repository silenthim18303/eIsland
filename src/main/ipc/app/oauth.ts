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
 * @file oauth.ts
 * @description OAuth 登录 IPC 处理器：在新窗口中打开授权页面，拦截回调获取授权码。
 * @author 鸡哥
 */

import { BrowserWindow, ipcMain } from 'electron';

/**
 * 注册 OAuth 相关 IPC 处理器。
 */
export function registerOAuthIpcHandlers(): void {
  /**
   * 打开 OAuth 登录窗口。
   * @param authorizeUrl - 后端返回的授权 URL。
   * @param callbackPrefix - 回调 URL 前缀，用于拦截。
   * @returns 授权码；用户取消或超时返回 null。
   */
  ipcMain.handle('oauth:open-login', async (_event, authorizeUrl: string, callbackPrefix: string) => {
    return new Promise<string | null>((resolve) => {
      const authWindow = new BrowserWindow({
        width: 600,
        height: 700,
        center: true,
        resizable: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      let resolved = false;

      const cleanup = (code: string | null): void => {
        if (resolved) return;
        resolved = true;
        if (!authWindow.isDestroyed()) {
          authWindow.close();
        }
        resolve(code);
      };

      const extractCode = (url: string): string | null => {
        if (!url.startsWith(callbackPrefix)) return null;
        try {
          const parsed = new URL(url);
          return parsed.searchParams.get('code');
        } catch {
          return null;
        }
      };

      authWindow.webContents.on('will-redirect', (_evt, url) => {
        const code = extractCode(url);
        if (code !== null) cleanup(code);
      });

      authWindow.webContents.on('will-navigate', (_evt, url) => {
        const code = extractCode(url);
        if (code !== null) cleanup(code);
      });

      authWindow.webContents.on('did-navigate', (_evt, url) => {
        const code = extractCode(url);
        if (code !== null) cleanup(code);
      });

      authWindow.on('closed', () => {
        cleanup(null);
      });

      authWindow.loadURL(authorizeUrl);
    });
  });
}
