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
 * @file check-i18n-completeness.ts
 * @description 检查 i18n 翻译文件的完整性，确保 zh-CN 和 en-US 的翻译键完全一致
 * @author 鸡哥
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const ZH_PATH = join(ROOT, 'i18n', 'zh-CN.json');
const EN_PATH = join(ROOT, 'i18n', 'en-US.json');

/**
 * 递归展开嵌套对象为点分隔的键路径
 * @param obj - JSON 对象
 * @param prefix - 当前前缀
 * @returns 扁平化的键数组
 */
function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      keys.push(...flattenKeys(v as Record<string, unknown>, path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

/**
 * 读取并解析 JSON 文件
 * @param filePath - 文件路径
 * @param label - 用于错误提示的标签
 */
function loadJson(filePath: string, label: string): Record<string, unknown> {
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    console.error(`❌ 无法读取 ${label}: ${filePath}`);
    process.exit(1);
  }
}

const zh = loadJson(ZH_PATH, 'zh-CN');
const en = loadJson(EN_PATH, 'en-US');

const zhKeys = new Set(flattenKeys(zh));
const enKeys = new Set(flattenKeys(en));

const missingInEn = [...zhKeys].filter((k) => !enKeys.has(k)).sort();
const missingInZh = [...enKeys].filter((k) => !zhKeys.has(k)).sort();

console.log(`📊 zh-CN: ${zhKeys.size} keys | en-US: ${enKeys.size} keys`);

if (missingInEn.length === 0 && missingInZh.length === 0) {
  console.log('✅ 所有翻译键完全一致，无缺失。');
  process.exit(0);
}

if (missingInEn.length > 0) {
  console.log(`\n❌ en-US 缺少 ${missingInEn.length} 个翻译键（zh-CN 中存在）:`);
  for (const key of missingInEn) {
    console.log(`   - ${key}`);
  }
}

if (missingInZh.length > 0) {
  console.log(`\n❌ zh-CN 缺少 ${missingInZh.length} 个翻译键（en-US 中存在）:`);
  for (const key of missingInZh) {
    console.log(`   - ${key}`);
  }
}

console.log(`\n总计缺失: ${missingInEn.length + missingInZh.length} 个`);
process.exit(1);
