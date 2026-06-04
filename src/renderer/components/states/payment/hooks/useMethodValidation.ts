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
 * @file useMethodValidation.ts
 * @description 支付方式可用性自动校正 Hook
 * @author 鸡哥
 */

import { useEffect } from 'react';
import type { PaymentMethod } from '../config/paymentConstants';

/**
 * 当支付渠道不可用时自动清除已选支付方式。
 * @param method - 当前支付方式。
 * @param wechatEnabled - 微信是否可用。
 * @param alipayEnabled - 支付宝是否可用。
 * @param setMethod - 设置支付方式的回调。
 */
export function useMethodValidation(
  method: PaymentMethod,
  wechatEnabled: boolean,
  alipayEnabled: boolean,
  setMethod: (m: PaymentMethod) => void,
): void {
  useEffect(() => {
    if (method === 'wechat' && !wechatEnabled) {
      setMethod(null);
    }
    if (method === 'alipay' && !alipayEnabled) {
      setMethod(null);
    }
  }, [method, wechatEnabled, alipayEnabled, setMethod]);
}
