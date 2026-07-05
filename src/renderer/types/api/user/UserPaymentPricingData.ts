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
 * @file UserPaymentPricingData.ts
 * @description 用户支付定价数据类型定义
 * @author 鸡哥
 */

/** 用户支付定价数据 */
export interface UserPaymentPricingData {
  /** 产品代码 */
  productCode: string;
  /** 金额（分） */
  amountFen: number;
  /** 金额（元） */
  amountYuan: string;
  /** 货币 */
  currency: string;
  /** 计费周期 */
  billingCycle: string;
  /** 主题 */
  subject: string;
  /** 免费描述 */
  freeDesc?: string;
  /** 免费功能列表 */
  freeFeatures?: string[];
  /** Pro 描述 */
  proDesc?: string;
  /** Pro 功能列表 */
  proFeatures?: string[];
}
