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
 * @file toolboxSoftwareApi.ts
 * @description 工具箱常用软件接口
 * @author 鸡哥
 */

const IS_DEV_RENDERER = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const TOOLBOX_API_BASE = IS_DEV_RENDERER
  ? 'https://test.server.pyisland.com/api'
  : 'https://server.pyisland.com/api';

export interface ToolboxSoftwareItem {
  id: number;
  name: string;
  description: string;
  url: string;
  iconUrl: string;
}

export async function fetchToolboxSoftwareList(): Promise<ToolboxSoftwareItem[]> {
  try {
    const response = await window.api.netFetch(`${TOOLBOX_API_BASE}/v1/toolbox/software/list`, {
      method: 'GET',
      timeoutMs: 8000,
    });
    if (!response?.ok) return [];

    const payload = JSON.parse(response.body) as { code?: number; data?: ToolboxSoftwareItem[] };
    if (payload?.code === 200 && Array.isArray(payload.data)) {
      return payload.data;
    }
    return [];
  } catch {
    return [];
  }
}
