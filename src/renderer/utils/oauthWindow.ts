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
 * @file oauthWindow.ts
 * @description OAuth 登录工具：使用默认浏览器打开授权页面，轮询获取服务端登录状态。
 * @author 鸡哥
 */

import { pollOAuthResult, consumeOAuthResult } from '../api/user/userAccountApi.oauth';
import type { OAuthCallbackData } from '../api/user/userAccountApi.oauth';
import { getGitHubAuthorizeUrl, getMicrosoftAuthorizeUrl, getWechatAuthorizeUrl, getGiteeAuthorizeUrl } from '../api/user/userAccountApi.oauth';

/** 轮询配置 */
const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 150; // 最多 5 分钟

/**
 * 生成随机 sessionId（用于轮询 OAuth 结果）。
 * 注意：此 ID 仅作为客户端轮询关联标识，不作为安全凭据使用。
 */
function generateSessionId(): string {
  return crypto.randomUUID();
}

/**
 * 使用默认浏览器打开 GitHub OAuth 登录，轮询服务端获取结果。
 * @returns OAuth 回调结果；超时或失败返回 null。
 */
export async function openGitHubOAuth(): Promise<OAuthCallbackData | null> {
  // 获取授权 URL
  const urlResult = await getGitHubAuthorizeUrl();
  if (!urlResult.ok || !urlResult.data?.authorizeUrl) {
    return null;
  }

  const sessionId = generateSessionId();
  const authorizeUrl = urlResult.data.authorizeUrl;
  const separator = authorizeUrl.includes('?') ? '&' : '?';
  const urlWithState = `${authorizeUrl}${separator}state=${sessionId}`;

  // 使用主进程 shell.openExternal 打开默认浏览器
  await window.api.clipboardOpenUrl(urlWithState);

  // 轮询服务端等待结果
  for (let i = 0; i < POLL_MAX_ATTEMPTS; i++) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

    try {
      const pollRes = await pollOAuthResult(sessionId);
      if (pollRes.code === 200 && pollRes.data?.ready) {
        // 结果就绪，获取并消费
        const consumeRes = await consumeOAuthResult(sessionId);
        if (consumeRes.code === 200 && consumeRes.data) {
          return consumeRes.data;
        }
        return null;
      }
    } catch {
      // 网络错误，继续重试
    }
  }

  // 超时
  return null;
}

/**
 * 使用默认浏览器打开 Microsoft OAuth 登录，轮询服务端获取结果。
 * @returns OAuth 回调结果；超时或失败返回 null。
 */
export async function openMicrosoftOAuth(): Promise<OAuthCallbackData | null> {
  const urlResult = await getMicrosoftAuthorizeUrl();
  if (!urlResult.ok || !urlResult.data?.authorizeUrl) {
    return null;
  }

  const sessionId = generateSessionId();
  const authorizeUrl = urlResult.data.authorizeUrl;
  const separator = authorizeUrl.includes('?') ? '&' : '?';
  const urlWithState = `${authorizeUrl}${separator}state=${sessionId}`;

  await window.api.clipboardOpenUrl(urlWithState);

  for (let i = 0; i < POLL_MAX_ATTEMPTS; i++) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

    try {
      const pollRes = await pollOAuthResult(sessionId);
      if (pollRes.code === 200 && pollRes.data?.ready) {
        const consumeRes = await consumeOAuthResult(sessionId);
        if (consumeRes.code === 200 && consumeRes.data) {
          return consumeRes.data;
        }
        return null;
      }
    } catch {
      // 网络错误，继续重试
    }
  }

  return null;
}

/**
 * 使用默认浏览器打开微信 OAuth 登录（网站应用扫码），轮询服务端获取结果。
 * @returns OAuth 回调结果；超时或失败返回 null。
 */
export async function openWechatOAuth(): Promise<OAuthCallbackData | null> {
  const urlResult = await getWechatAuthorizeUrl();
  if (!urlResult.ok || !urlResult.data?.authorizeUrl) {
    return null;
  }

  const sessionId = generateSessionId();
  const authorizeUrl = urlResult.data.authorizeUrl;
  const separator = authorizeUrl.includes('?') ? '&' : '?';
  const urlWithState = `${authorizeUrl}${separator}state=${sessionId}`;

  await window.api.clipboardOpenUrl(urlWithState);

  for (let i = 0; i < POLL_MAX_ATTEMPTS; i++) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

    try {
      const pollRes = await pollOAuthResult(sessionId);
      if (pollRes.code === 200 && pollRes.data?.ready) {
        const consumeRes = await consumeOAuthResult(sessionId);
        if (consumeRes.code === 200 && consumeRes.data) {
          return consumeRes.data;
        }
        return null;
      }
    } catch {
      // 网络错误，继续重试
    }
  }

  return null;
}

/**
 * 使用默认浏览器打开 Gitee OAuth 登录，轮询服务端获取结果。
 * @returns OAuth 回调结果；超时或失败返回 null。
 */
export async function openGiteeOAuth(): Promise<OAuthCallbackData | null> {
  const urlResult = await getGiteeAuthorizeUrl();
  if (!urlResult.ok || !urlResult.data?.authorizeUrl) {
    return null;
  }

  const sessionId = generateSessionId();
  const authorizeUrl = urlResult.data.authorizeUrl;
  const separator = authorizeUrl.includes('?') ? '&' : '?';
  const urlWithState = `${authorizeUrl}${separator}state=${sessionId}`;

  await window.api.clipboardOpenUrl(urlWithState);

  for (let i = 0; i < POLL_MAX_ATTEMPTS; i++) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

    try {
      const pollRes = await pollOAuthResult(sessionId);
      if (pollRes.code === 200 && pollRes.data?.ready) {
        const consumeRes = await consumeOAuthResult(sessionId);
        if (consumeRes.code === 200 && consumeRes.data) {
          return consumeRes.data;
        }
        return null;
      }
    } catch {
      // 网络错误，继续重试
    }
  }

  return null;
}
