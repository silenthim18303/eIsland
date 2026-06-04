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
 * @file usePaymentStatus.ts
 * @description 支付状态派生数据 Hook
 * @author 鸡哥
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { UserPaymentOrderData } from '../../../../api/user/userAccountApi';

interface UsePaymentStatusResult {
  pendingOrderAmountLabel: string;
  paymentStatusLabel: string;
  paymentStatusClassName: string;
  isPendingOrderPaying: boolean;
  isPendingOrderSuccess: boolean;
}

/**
 * 从待支付订单数据派生展示标签与状态。
 * @param pendingOrder - 待支付订单数据。
 * @returns 金额标签、状态标签、CSS 类名、是否支付中/成功。
 */
export function usePaymentStatus(
  pendingOrder: UserPaymentOrderData | null,
): UsePaymentStatusResult {
  const { t } = useTranslation();

  const pendingOrderAmountLabel = useMemo(() => {
    if (!pendingOrder || typeof pendingOrder.amountFen !== 'number') return '--';
    return `¥${(pendingOrder.amountFen / 100).toFixed(2)}`;
  }, [pendingOrder]);

  const paymentStatusLabel = useMemo(() => {
    const status = String(pendingOrder?.status || '').toUpperCase();
    if (status === 'PAYING') return t('settings.user.payment.status.paying', { defaultValue: '待支付' });
    if (status === 'SUCCESS') return t('settings.user.payment.status.success', { defaultValue: '已支付' });
    if (status === 'CLOSED') return t('settings.user.payment.status.closed', { defaultValue: '已关闭' });
    if (status === 'FAILED') return t('settings.user.payment.status.failed', { defaultValue: '支付失败' });
    return t('settings.user.payment.status.unknown', { defaultValue: '未知' });
  }, [pendingOrder, t]);

  const paymentStatusClassName = useMemo(() => {
    const status = String(pendingOrder?.status || '').toUpperCase();
    if (status === 'SUCCESS') return 'is-success';
    if (status === 'FAILED') return 'is-failed';
    if (status === 'CLOSED') return 'is-closed';
    if (status === 'PAYING') return 'is-paying';
    return 'is-unknown';
  }, [pendingOrder]);

  const isPendingOrderPaying = String(pendingOrder?.status || '').toUpperCase() === 'PAYING';
  const isPendingOrderSuccess = String(pendingOrder?.status || '').toUpperCase() === 'SUCCESS';

  return {
    pendingOrderAmountLabel,
    paymentStatusLabel,
    paymentStatusClassName,
    isPendingOrderPaying,
    isPendingOrderSuccess,
  };
}
