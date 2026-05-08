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

import type { IslandState } from '../hooks/useDynamicIslandShell';

export const CLIPBOARD_URL_SUPPRESS_IN_FAVORITES_KEY = 'clipboard-url-suppress-in-url-favorites';
export const AI_CHAT_CLIPBOARD_URL_EVENT = 'eisland:ai-chat-clipboard-urls-detected';
export const ISLAND_BG_MEDIA_STORE_KEY = 'island-bg-media';
export const ISLAND_BG_IMAGE_STORE_KEY = 'island-bg-image';
export const ISLAND_BG_VIDEO_FIT_STORE_KEY = 'island-bg-video-fit';
export const ISLAND_BG_VIDEO_MUTED_STORE_KEY = 'island-bg-video-muted';
export const ISLAND_BG_VIDEO_LOOP_STORE_KEY = 'island-bg-video-loop';
export const ISLAND_BG_VIDEO_VOLUME_STORE_KEY = 'island-bg-video-volume';
export const ISLAND_BG_VIDEO_RATE_STORE_KEY = 'island-bg-video-rate';
export const ISLAND_BG_VIDEO_HW_DECODE_STORE_KEY = 'island-bg-video-hw-decode';
export const LOCAL_ISLAND_BG_SYNC_EVENT = 'island-bg-local-sync';
export const UPDATE_SOURCE_STORE_KEY = 'update-source';
export const UPDATE_AUTO_PROMPT_STORE_KEY = 'update-auto-prompt-enabled';
export const WEATHER_ALERT_ENABLED_STORE_KEY = 'weather-alert-enabled';

export type UpdateSourceKey = 'cloudflare-r2' | 'tencent-cos' | 'aliyun-oss' | 'github';

const PRO_UPDATE_SOURCE_SET: ReadonlySet<UpdateSourceKey> = new Set<UpdateSourceKey>(['tencent-cos', 'aliyun-oss']);

export function normalizeUpdateSource(value: unknown): UpdateSourceKey {
  if (value === 'github') return 'github';
  if (value === 'tencent-cos') return 'tencent-cos';
  if (value === 'aliyun-oss') return 'aliyun-oss';
  return 'cloudflare-r2';
}

export function isProOnlyUpdateSource(source: UpdateSourceKey): boolean {
  return PRO_UPDATE_SOURCE_SET.has(source);
}

const normalizeRoleValue = (value: string): string => {
  return value.trim().toLowerCase().replace(/^role_/, '');
};

export const getRoleFromToken = (token: string | null | undefined): string | null => {
  if (!token) return null;
  const rawToken = token.trim().replace(/^bearer\s+/i, '');
  const parts = rawToken.split('.');
  if (parts.length < 2) return null;
  try {
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const normalizedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decoded = JSON.parse(atob(normalizedPayload)) as { role?: unknown };
    return typeof decoded.role === 'string' ? normalizeRoleValue(decoded.role) : null;
  } catch {
    return null;
  }
};

export function getUpdateSourceLabel(value: unknown): string {
  if (value === 'github') return 'GitHub Releases';
  if (value === 'tencent-cos') return 'Tencent COS';
  if (value === 'aliyun-oss') return 'Aliyun OSS';
  return 'Cloudflare R2';
}

export type IslandBgMediaType = 'image' | 'video';

export interface IslandBgMediaConfig {
  type: IslandBgMediaType;
  source: string;
}

function isDirectBgMediaUrl(source: string): boolean {
  return source.startsWith('data:')
    || source.startsWith('http://')
    || source.startsWith('https://')
    || source.startsWith('blob:')
    || source.startsWith('file:')
    || source.startsWith('/')
    || source.startsWith('./')
    || source.startsWith('../')
    || source.startsWith('assets/');
}

function toMediaUrl(path: string): string {
  const normalized = path.replace(/\\/g, '/');
  return `eisland-media://local/${encodeURIComponent(normalized)}`;
}

export function normalizeBgMediaConfig(value: unknown): IslandBgMediaConfig | null {
  if (typeof value === 'string') {
    const source = value.trim();
    return source ? { type: 'image', source } : null;
  }
  if (!value || typeof value !== 'object') return null;

  const candidate = value as { type?: unknown; source?: unknown; image?: unknown; url?: unknown };
  const sourceRaw = typeof candidate.source === 'string'
    ? candidate.source
    : typeof candidate.image === 'string'
      ? candidate.image
      : typeof candidate.url === 'string'
        ? candidate.url
        : null;
  if (!sourceRaw) return null;

  const source = sourceRaw.trim();
  if (!source) return null;

  if (candidate.type === 'video') {
    return { type: 'video', source };
  }
  return { type: 'image', source };
}

export async function resolveBgMediaPreviewUrl(media: IslandBgMediaConfig): Promise<string | null> {
  if (media.type === 'image') {
    if (isDirectBgMediaUrl(media.source)) return media.source;
    return window.api?.loadWallpaperFile?.(media.source) ?? null;
  }
  if (isDirectBgMediaUrl(media.source)) return media.source;
  return toMediaUrl(media.source);
}

export const STATE_AREA: Record<string, number> = {
  idle: 260 * 42,
  minimal: 260 * 42,
  lyrics: 500 * 42,
  hover: 500 * 60,
  notification: 500 * 88,
  expanded: 860 * 150,
  maxExpand: 860 * 400,
  guide: 860 * 400,
  login: 860 * 400,
  register: 860 * 400,
  payment: 860 * 400,
  announcement: 860 * 400,
  agentVoiceInput: 500 * 42,
  agent: 500 * 88,
  stt: 500 * 88,
};

interface StateConfig {
  name: IslandState;
  mousePassthrough: boolean;
  expanded: boolean;
  enterDelay: number;
  leaveDelay: number;
}

export const STATE_CONFIGS: Record<IslandState, StateConfig> = {
  idle: {
    name: 'idle',
    mousePassthrough: true,
    expanded: false,
    enterDelay: 0,
    leaveDelay: 0,
  },
  hover: {
    name: 'hover',
    mousePassthrough: false,
    expanded: true,
    enterDelay: 60,
    leaveDelay: 80,
  },
  expanded: {
    name: 'expanded',
    mousePassthrough: false,
    expanded: true,
    enterDelay: 0,
    leaveDelay: 0,
  },
  notification: {
    name: 'notification',
    mousePassthrough: false,
    expanded: true,
    enterDelay: 0,
    leaveDelay: 0,
  },
  maxExpand: {
    name: 'maxExpand',
    mousePassthrough: false,
    expanded: true,
    enterDelay: 0,
    leaveDelay: 0,
  },
  minimal: {
    name: 'minimal',
    mousePassthrough: true,
    expanded: false,
    enterDelay: 0,
    leaveDelay: 0,
  },
  lyrics: {
    name: 'lyrics',
    mousePassthrough: true,
    expanded: true,
    enterDelay: 50,
    leaveDelay: 0,
  },
  guide: {
    name: 'guide',
    mousePassthrough: false,
    expanded: true,
    enterDelay: 0,
    leaveDelay: 0,
  },
  login: {
    name: 'login',
    mousePassthrough: false,
    expanded: true,
    enterDelay: 0,
    leaveDelay: 0,
  },
  register: {
    name: 'register',
    mousePassthrough: false,
    expanded: true,
    enterDelay: 0,
    leaveDelay: 0,
  },
  payment: {
    name: 'payment',
    mousePassthrough: false,
    expanded: true,
    enterDelay: 0,
    leaveDelay: 0,
  },
  announcement: {
    name: 'announcement',
    mousePassthrough: false,
    expanded: true,
    enterDelay: 0,
    leaveDelay: 0,
  },
  agentVoiceInput: {
    name: 'agentVoiceInput',
    mousePassthrough: true,
    expanded: true,
    enterDelay: 50,
    leaveDelay: 0,
  },
  agent: {
    name: 'agent',
    mousePassthrough: false,
    expanded: true,
    enterDelay: 0,
    leaveDelay: 0,
  },
  stt: {
    name: 'stt',
    mousePassthrough: false,
    expanded: true,
    enterDelay: 0,
    leaveDelay: 0,
  },
};

export async function isMouseInWindow(): Promise<boolean> {
  try {
    const mousePos = await window.api?.getMousePosition();
    const bounds = await window.api?.getWindowBounds();

    if (!mousePos || !bounds) return false;

    return (
      mousePos.x >= bounds.x
      && mousePos.x <= bounds.x + bounds.width
      && mousePos.y >= bounds.y
      && mousePos.y <= bounds.y + bounds.height
    );
  } catch {
    return false;
  }
}

export function getStateClassName(state: IslandState): string {
  return state === 'idle' ? '' : state;
}
