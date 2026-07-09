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
 * @file purge-esa-cache.ts
 * @description 清除 ESA CDN 缓存
 * @author 鸡哥
 */

import * as ESA20240910 from '@alicloud/esa20240910';
import * as OpenApi from '@alicloud/openapi-client';
import * as Util from '@alicloud/tea-util';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function stripWrappedQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function loadEnvFile(envFilePath = '.env'): void {
  const absolutePath = resolve(process.cwd(), envFilePath);
  if (!existsSync(absolutePath)) return;

  const content = readFileSync(absolutePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index <= 0) continue;
    const key = line.slice(0, index).trim();
    const rawValue = line.slice(index + 1).trim();
    if (key && process.env[key] === undefined) {
      process.env[key] = stripWrappedQuotes(rawValue);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createClient(accessKeyId: string, accessKeySecret: string): any {
  const config = new OpenApi.Config({
    accessKeyId,
    accessKeySecret,
    endpoint: 'esa.cn-hangzhou.aliyuncs.com',
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (ESA20240910.default as any).default(config);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function purgeCaches(client: any, siteId: number, objectUrl: string): Promise<void> {
  const content = new ESA20240910.PurgeCachesRequestContent({
    files: [objectUrl],
    purgeAll: false,
  });
  const request = new ESA20240910.PurgeCachesRequest({
    content,
    type: 'file',
    siteId,
    force: true,
    edgeComputePurge: true,
  });
  const runtime = new Util.RuntimeOptions({});
  await client.purgeCachesWithOptions(request, runtime);
  console.log(`[ESA] Cache purge succeeded for ${objectUrl}`);
}

async function main(): Promise<void> {
  loadEnvFile();

  const accessKeyId = process.env.ESA_ACCESS_KEY_ID?.trim();
  const accessKeySecret = process.env.ESA_ACCESS_KEY_SECRET?.trim();
  const siteIdRaw = process.env.ESA_ZONE_ID?.trim();
  const objectUrl = process.env.ESA_PURGE_URL?.trim();

  if (!accessKeyId || !accessKeySecret || !siteIdRaw || !objectUrl) {
    console.error('[ESA] Missing required env vars: ESA_ACCESS_KEY_ID, ESA_ACCESS_KEY_SECRET, ESA_ZONE_ID, ESA_PURGE_URL');
    process.exit(1);
  }

  const siteId = Number(siteIdRaw);
  if (!Number.isFinite(siteId)) {
    console.error(`[ESA] ESA_ZONE_ID must be a number, got: ${siteIdRaw}`);
    process.exit(1);
  }

  const client = createClient(accessKeyId, accessKeySecret);

  console.log(`[ESA] Purging cache for ${objectUrl}...`);
  await purgeCaches(client, siteId, objectUrl);
}

main().catch(err => {
  const message = err?.message ?? String(err);
  const recommend = err?.data?.Recommend;
  console.error('[ESA] Purge failed:', message);
  if (recommend) console.error('[ESA] Diagnose:', recommend);
  process.exit(1);
});
