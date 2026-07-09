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
 * @file esa-env.ts
 * @description ESA CDN 脚本共享工具（环境变量加载、客户端创建）
 * @author 鸡哥
 */

import * as ESA20240910 from '@alicloud/esa20240910';
import * as OpenApi from '@alicloud/openapi-client';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** ESA Client 实例类型 */
export type ESAClient = InstanceType<typeof ESA20240910.default>;

/**
 * 去除字符串两端的引号（单引号或双引号）
 * @param value - 原始字符串
 * @returns 去除引号后的字符串
 */
export function stripWrappedQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

/**
 * 加载 .env 文件到 process.env（不覆盖已有变量）
 * @param envFilePath - .env 文件路径，默认为当前工作目录下的 .env
 */
export function loadEnvFile(envFilePath = '.env'): void {
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

/**
 * 创建 ESA 客户端
 * @param accessKeyId - 阿里云 AccessKey ID
 * @param accessKeySecret - 阿里云 AccessKey Secret
 * @returns ESA 客户端实例
 */
export function createEsaClient(accessKeyId: string, accessKeySecret: string): ESAClient {
  const config = new OpenApi.Config({
    accessKeyId,
    accessKeySecret,
    endpoint: 'esa.cn-hangzhou.aliyuncs.com',
  });
  // CJS/ESM interop: the actual Client constructor is at default.default
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new ((ESA20240910.default as any).default)(config);
}
