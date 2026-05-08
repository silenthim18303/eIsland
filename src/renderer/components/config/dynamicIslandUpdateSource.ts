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
