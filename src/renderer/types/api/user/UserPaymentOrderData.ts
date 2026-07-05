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
 * @file UserPaymentOrderData.ts
 * @description 用户支付订单数据类型定义
 * @author 鸡哥
 */

/** 用户支付订单数据 */
export interface UserPaymentOrderData {
  /** 外部交易号 */
  outTradeNo: string;
  /** 产品代码 */
  productCode: string;
  /** 金额（分） */
  amountFen: number;
  /** 货币 */
  currency: string;
  /** 状态 */
  status: string;
  /** 支付通道 */
  channel: 'WECHAT' | 'ALIPAY';
  /** 二维码 URL */
  qrCodeUrl?: string;
  /** 支付 URL */
  payUrl?: string;
  /** 过期时间 */
  expireAt?: string;
  /** 支付时间 */
  paidAt?: string;
  /** 创建时间 */
  createdAt?: string;
  /** Pro 过期时间 */
  proExpireAt?: string;
}
