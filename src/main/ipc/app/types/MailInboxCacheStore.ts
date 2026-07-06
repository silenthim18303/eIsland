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
 * @file MailInboxCacheStore.ts
 * @description 邮件收件箱缓存存储类型定义
 * @author 鸡哥
 */

import type { MailInboxItem } from './MailInboxItem';

/** 邮件收件箱缓存存储 */
export interface MailInboxCacheStore {
  /** 按账户邮箱地址索引的收件箱邮件 */
  accounts: Record<string, Record<string, MailInboxItem>>;
}
