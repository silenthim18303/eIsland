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
 * @file splashWindow.ts
 * @description 启动画面窗口服务模块
 * @description 管理应用启动画面的创建、显示和关闭，在主窗口加载期间提供视觉反馈
 * @author 鸡哥
 */

import { BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';

let splashWindow: BrowserWindow | null = null;

/** 视频播放完成回调（跨 closeSplashWindow 调用生命周期存储） */
let videoEndedResolve: (() => void) | null = null;

/** 启动画面淡出动画时长（毫秒），需与 CSS transition 保持一致 */
const SPLASH_FADE_DURATION_MS = 300;

/** 视频播完后额外停留时间（毫秒） */
const SPLASH_POST_VIDEO_DELAY_MS = 3000;

/**
 * 创建并显示启动画面窗口
 * @description 创建一个无边框、居中的启动画面窗口，播放开场视频
 */
function showSplashWindow(): void {
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.showInactive();
    return;
  }

  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    resizable: false,
    movable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,
    title: '',
    hasShadow: true,
    icon: is.dev
      ? join(__dirname, '../../resources/icon/eisland_256x256.ico')
      : join(process.resourcesPath, 'icon/eisland_256x256.ico'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  splashWindow.setAlwaysOnTop(true, 'screen-saver');
  splashWindow.center();
  splashWindow.removeMenu();

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    splashWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/splash.html');
  } else {
    splashWindow.loadFile(join(__dirname, '../renderer/splash.html'));
  }

  /** 注册一次性 IPC：renderer 视频播完后通知 */
  ipcMain.once('splash:video-ended', () => {
    if (videoEndedResolve) {
      videoEndedResolve();
      videoEndedResolve = null;
    }
  });

  splashWindow.once('ready-to-show', () => {
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.showInactive();
    }
  });

  splashWindow.on('closed', () => {
    splashWindow = null;
    videoEndedResolve = null;
  });
}

/**
 * 关闭启动画面窗口
 * @description 触发开场视频播放，等待视频播完 + 3 秒停留，然后淡出并关闭窗口。
 *   返回 Promise，在窗口完全关闭后 resolve，供主窗口等待后再显示。
 */
function closeSplashWindow(): Promise<void> {
  return new Promise<void>((resolve) => {
    if (!splashWindow || splashWindow.isDestroyed()) {
      resolve();
      return;
    }

    const win = splashWindow;
    splashWindow = null;

    /**
     * 视频播完后的收尾流程：等待 3s → 淡出 → 关窗口
     * 可由 IPC 回调触发，也可在 IPC 已错过时立即执行
     */
    const finishAndClose = (): void => {
      setTimeout(() => {
        if (!win.isDestroyed()) {
          win.webContents.send('splash:fade-out');
        }
        setTimeout(() => {
          if (!win.isDestroyed()) {
            win.close();
          }
          resolve();
        }, SPLASH_FADE_DURATION_MS);
      }, SPLASH_POST_VIDEO_DELAY_MS);
    };

    videoEndedResolve = finishAndClose;

    /** 通知 renderer 开始播放视频 */
    win.webContents.send('splash:play-video');
  });
}

/**
 * 获取启动画面窗口实例
 */
function getSplashWindow(): BrowserWindow | null {
  return splashWindow;
}

export { showSplashWindow, closeSplashWindow, getSplashWindow };
