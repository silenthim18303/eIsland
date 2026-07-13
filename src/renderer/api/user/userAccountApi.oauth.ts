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
 * @file userAccountApi.oauth.ts
 * @description OAuth 认证相关接口。
 * @author 鸡哥
 */

import { request } from './userAccountApi.client';
import type { UserAccountLoginData, UserAccountResult } from './userAccountApi.types';

/** OAuth 回调状态 */
export type OAuthCallbackStatus = 'LOGIN' | 'SET_PASSWORD' | 'BIND_OAUTH' | 'ERROR';

/** OAuth 回调数据 */
export interface OAuthCallbackData {
  status: OAuthCallbackStatus;
  message: string;
  token?: string;
  tempToken?: string;
  username?: string;
  email?: string;
  role?: string;
}

/**
 * 获取 GitHub 授权 URL。
 * @returns 授权 URL。
 */
export function getGitHubAuthorizeUrl(): Promise<UserAccountResult<{ authorizeUrl: string }>> {
  return request<{ authorizeUrl: string }>('/auth/oauth/github/authorize', {
    method: 'GET',
  });
}

/**
 * 处理 GitHub OAuth 回调。
 * @param code - 授权码。
 * @returns 回调结果。
 */
export function handleGitHubCallback(code: string): Promise<UserAccountResult<OAuthCallbackData>> {
  return request<OAuthCallbackData>(`/auth/oauth/github/callback?code=${encodeURIComponent(code)}`, {
    method: 'GET',
    timeoutMs: 15000,
  });
}

/**
 * 轮询 OAuth 结果是否就绪。
 * @param sessionId - 轮询会话 ID。
 * @returns 是否就绪。
 */
export function pollOAuthResult(sessionId: string): Promise<UserAccountResult<{ ready: boolean }>> {
  return request<{ ready: boolean }>(`/auth/oauth/poll?sessionId=${encodeURIComponent(sessionId)}`, {
    method: 'GET',
    timeoutMs: 5000,
  });
}

/**
 * 获取并消费 OAuth 结果（读后删除）。
 * @param sessionId - 轮询会话 ID。
 * @returns OAuth 回调结果。
 */
export function consumeOAuthResult(sessionId: string): Promise<UserAccountResult<OAuthCallbackData>> {
  return request<OAuthCallbackData>(`/auth/oauth/consume?sessionId=${encodeURIComponent(sessionId)}`, {
    method: 'GET',
    timeoutMs: 5000,
  });
}

/**
 * OAuth 用户设置密码并完成注册。
 * @param tempToken - 临时 token。
 * @param username - 用户名。
 * @param password - 密码。
 * @param email - 邮箱（可选）。
 * @returns 注册结果。
 */
export function oauthSetPassword(
  tempToken: string,
  username: string,
  password: string,
  email?: string,
): Promise<UserAccountResult<UserAccountLoginData>> {
  return request<UserAccountLoginData>('/auth/oauth/set-password', {
    method: 'POST',
    body: { tempToken, username, password, email: email || undefined },
    timeoutMs: 15000,
  });
}

/**
 * 绑定 OAuth 到已有账号。
 * @param tempToken - 临时 token。
 * @param password - 账号密码。
 * @returns 绑定结果。
 */
export function oauthBindAccount(
  tempToken: string,
  password: string,
): Promise<UserAccountResult<UserAccountLoginData>> {
  return request<UserAccountLoginData>('/auth/oauth/bind', {
    method: 'POST',
    body: { tempToken, password },
    timeoutMs: 15000,
  });
}
