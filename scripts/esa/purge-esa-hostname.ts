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
 * @file purge-esa-hostname.ts
 * @description 清除 ESA CDN 站点级缓存（阿里云官方 SDK）
 * @author 鸡哥
 */

import * as ESA20240910 from '@alicloud/esa20240910';
import * as Util from '@alicloud/tea-util';
import { createEsaClient, loadEnvFile } from './esa-env';
import type { ESAClient } from './esa-env';

async function purgeHostname(client: ESAClient, siteId: number, hostname: string, purgeAll: boolean): Promise<void> {
  const content = new ESA20240910.PurgeCachesRequestContent({
    hostnames: purgeAll ? undefined : [hostname],
    purgeAll,
  });
  const request = new ESA20240910.PurgeCachesRequest({
    content,
    type: 'hostname',
    siteId,
    force: true,
    edgeComputePurge: true,
  });
  const runtime = new Util.RuntimeOptions({});
  await client.purgeCachesWithOptions(request, runtime);
  console.log(`[ESA] Hostname cache purge succeeded${purgeAll ? ' (all)' : ` for ${hostname}`}`);
}

async function main(): Promise<void> {
  loadEnvFile();

  const purgeAll = process.argv.includes('--purge-all');

  const accessKeyId = process.env.ESA_ACCESS_KEY_ID?.trim();
  const accessKeySecret = process.env.ESA_ACCESS_KEY_SECRET?.trim();
  const siteIdRaw = process.env.ESA_ZONE_ID?.trim();
  const hostname = process.env.ESA_HOSTNAME?.trim();

  if (!accessKeyId || !accessKeySecret || !siteIdRaw) {
    console.error('[ESA] Missing required env vars: ESA_ACCESS_KEY_ID, ESA_ACCESS_KEY_SECRET, ESA_ZONE_ID');
    process.exit(1);
  }
  if (!purgeAll && !hostname) {
    console.error('[ESA] ESA_HOSTNAME is required (or use --purge-all)');
    process.exit(1);
  }

  const siteId = Number(siteIdRaw);
  if (!Number.isFinite(siteId)) {
    console.error(`[ESA] ESA_ZONE_ID must be a number, got: ${siteIdRaw}`);
    process.exit(1);
  }

  const client = createEsaClient(accessKeyId, accessKeySecret);

  console.log(`[ESA] Purging hostname cache${purgeAll ? ' (all)' : ` for ${hostname}`}...`);
  await purgeHostname(client, siteId, hostname ?? '', purgeAll);
}

main().catch(err => {
  const message = err?.message ?? String(err);
  const recommend = err?.data?.Recommend;
  console.error('[ESA] Purge failed:', message);
  if (recommend) console.error('[ESA] Diagnose:', recommend);
  process.exit(1);
});
