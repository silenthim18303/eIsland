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
 * @file toolboxTranslateApi.ts
 * @description 工具箱翻译接口 — 通过服务端转发腾讯云 TMT
 * @author 鸡哥
 */

const IS_DEV_RENDERER = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const TOOLBOX_API_BASE = IS_DEV_RENDERER
  ? 'https://test.server.pyisland.com/api'
  : 'https://server.pyisland.com/api';

export interface TranslateResponse {
  targetText: string;
  source: string;
  target: string;
  requestId: string;
}

export interface TranslateApiResult {
  success: boolean;
  data?: TranslateResponse;
  message?: string;
}

export async function fetchTranslate(
  token: string,
  text: string,
  source: string,
  target: string,
): Promise<TranslateApiResult> {
  try {
    const response = await window.api.netFetch(`${TOOLBOX_API_BASE}/v1/toolbox/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text, source, target }),
      timeoutMs: 15000,
    });
    if (!response?.ok) {
      return { success: false, message: `HTTP ${response?.status ?? 'unknown'}` };
    }

    const payload = JSON.parse(response.body) as {
      code?: number;
      message?: string;
      data?: TranslateResponse;
    };

    if (payload?.code === 200 && payload.data) {
      return { success: true, data: payload.data };
    }
    return { success: false, message: payload?.message ?? '翻译失败' };
  } catch (err) {
    return { success: false, message: '网络请求失败' };
  }
}
