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
 * @file usePaymentChannels.ts
 * @description 支付渠道可用性与定价加载 Hook
 * @author 鸡哥
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  fetchPaymentChannels,
  fetchProMonthPricing,
} from '../../../../api/user/userAccountApi';
import { readLocalToken } from '../../../../utils/userAccount';

interface UsePaymentChannelsResult {
  wechatEnabled: boolean;
  alipayEnabled: boolean;
  priceLabel: string;
}

/**
 * 加载支付渠道可用性与价格信息。
 * @param isRechargeMode - 是否为充值模式。
 * @param rechargeAmountFen - 充值金额（分）。
 * @returns 微信/支付宝可用状态与价格标签。
 */
export function usePaymentChannels(
  isRechargeMode: boolean,
  rechargeAmountFen: number,
): UsePaymentChannelsResult {
  const { t } = useTranslation();
  const [wechatEnabled, setWechatEnabled] = useState(true);
  const [alipayEnabled, setAlipayEnabled] = useState(true);
  const [priceLabel, setPriceLabel] = useState('');

  useEffect(() => {
    const token = readLocalToken();
    if (!token) {
      setWechatEnabled(false);
      setAlipayEnabled(false);
      setPriceLabel('');
      return;
    }
    let cancelled = false;
    fetchPaymentChannels(token).then((result) => {
      if (cancelled || !result.ok || !result.data) return;
      setWechatEnabled(Boolean(result.data.wechatEnabled));
      setAlipayEnabled(Boolean(result.data.alipayEnabled));
    }).catch(() => {});
    if (isRechargeMode) {
      setPriceLabel(`¥${(rechargeAmountFen / 100).toFixed(2)}`);
    } else {
      fetchProMonthPricing(token).then((result) => {
        if (cancelled || !result.ok || !result.data) return;
        const amountYuanRaw = typeof result.data.amountYuan === 'string' ? result.data.amountYuan.trim() : '';
        const amountYuan = amountYuanRaw || (typeof result.data.amountFen === 'number' ? (result.data.amountFen / 100).toFixed(2) : '');
        const cycle = String(result.data.billingCycle || '').toUpperCase() === 'MONTH'
          ? t('settings.user.pro.billingCycle.month', { defaultValue: '月' })
          : String(result.data.billingCycle || '').trim();
        if (!amountYuan) {
          setPriceLabel('');
          return;
        }
        setPriceLabel(cycle ? `¥${amountYuan} / ${cycle}` : `¥${amountYuan}`);
      }).catch(() => {}).finally(() => {
        if (cancelled) return;
      });
    }
    return () => {
      cancelled = true;
    };
  }, [t, isRechargeMode, rechargeAmountFen]);

  return { wechatEnabled, alipayEnabled, priceLabel };
}
