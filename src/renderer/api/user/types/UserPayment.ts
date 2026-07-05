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
 * @file UserPayment.ts
 * @description 用户支付相关数据结构定义
 * @author 鸡哥
 */

/** 支付渠道 */
export type UserPaymentCreateChannel = 'WECHAT' | 'ALIPAY';

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
  /** 免费版描述 */
  freeDesc?: string;
  /** 免费版功能列表 */
  freeFeatures?: string[];
  /** Pro版描述 */
  proDesc?: string;
  /** Pro版功能列表 */
  proFeatures?: string[];
}

/** 用户支付通道数据 */
export interface UserPaymentChannelsData {
  /** 微信支付是否启用 */
  wechatEnabled: boolean;
  /** 支付宝是否启用 */
  alipayEnabled: boolean;
}

/** 用户支付订单数据 */
export interface UserPaymentOrderData {
  /** 商户订单号 */
  outTradeNo: string;
  /** 产品代码 */
  productCode: string;
  /** 金额（分） */
  amountFen: number;
  /** 货币 */
  currency: string;
  /** 订单状态 */
  status: string;
  /** 支付渠道 */
  channel: 'WECHAT' | 'ALIPAY';
  /** 二维码URL */
  qrCodeUrl?: string;
  /** 支付链接 */
  payUrl?: string;
  /** 过期时间 */
  expireAt?: string;
  /** 支付时间 */
  paidAt?: string;
  /** 创建时间 */
  createdAt?: string;
  /** Pro到期时间 */
  proExpireAt?: string;
}

/** Agent余额数据 */
export interface AgentBalanceData {
  /** 余额（元） */
  balanceYuan: string;
}
