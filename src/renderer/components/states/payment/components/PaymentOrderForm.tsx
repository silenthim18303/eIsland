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
 * @file PaymentOrderForm.tsx
 * @description 支付订单创建表单组件
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

interface PaymentOrderFormProps {
  isRechargeMode: boolean;
  receiptEmail: string;
  onReceiptEmailChange: (v: string) => void;
  onFillAccountEmail: () => void;
  priceLabel: string;
  subscriptionPeriod: string;
  feedback: string;
  isCreatingOrder: boolean;
  creatingOrRefreshing: boolean;
  onConfirmPay: () => void;
}

/**
 * 渲染支付订单创建表单（邮箱输入、价格确认、创建订单按钮）。
 * @param props - 表单状态与回调。
 * @returns 订单表单视图。
 */
export function PaymentOrderForm({
  isRechargeMode,
  receiptEmail,
  onReceiptEmailChange,
  onFillAccountEmail,
  priceLabel,
  subscriptionPeriod,
  feedback,
  isCreatingOrder,
  creatingOrRefreshing,
  onConfirmPay,
}: PaymentOrderFormProps): ReactElement {
  const { t } = useTranslation();

  return (
    <div className="payment-order-card">
      <div className="payment-order-title">
        {t('settings.user.payment.orderTitle', { defaultValue: '确认订单' })}
      </div>
      <label className="payment-order-email-field">
        <div className="payment-order-email-row">
          <input
            className="settings-field-input"
            value={receiptEmail}
            onChange={(e) => onReceiptEmailChange(e.target.value)}
            placeholder={t('settings.user.payment.receiptEmailPlaceholder', { defaultValue: '请输入接收收据的邮箱地址' })}
          />
          <button
            type="button"
            className="settings-user-secondary-btn payment-fill-email-btn"
            onClick={onFillAccountEmail}
          >
            {t('settings.user.payment.fillAccountEmail', { defaultValue: '填充本账号邮箱' })}
          </button>
        </div>
      </label>
      <div className="payment-order-row payment-order-row-split">
        <div className="payment-order-item">
          <span className="payment-order-label">
            {isRechargeMode
              ? t('settings.user.recharge.rechargeAmountLabel', { defaultValue: '充值金额' })
              : t('settings.user.payment.priceLabel', { defaultValue: '价格' })}
          </span>
          <span className="payment-order-value">{priceLabel || t('settings.user.pro.pro.priceUnavailable', { defaultValue: '价格待定' })}</span>
        </div>
        {!isRechargeMode ? (
          <div className="payment-order-item">
            <span className="payment-order-label">{t('settings.user.payment.subscriptionPeriodLabel', { defaultValue: '订阅时间' })}</span>
            <span className="payment-order-value">{subscriptionPeriod || '--'}</span>
          </div>
        ) : null}
      </div>
      {feedback ? <div className="payment-order-feedback">{feedback}</div> : null}
      <button
        type="button"
        className="settings-user-primary-btn payment-confirm-btn"
        onClick={onConfirmPay}
        disabled={creatingOrRefreshing}
      >
        {isCreatingOrder ? (
          <>
            <span className="payment-btn-spinner" aria-hidden="true" />
            {t('settings.user.payment.creatingOrder', { defaultValue: '创建订单中...' })}
          </>
        ) : t('settings.user.payment.confirmPay', { defaultValue: '创建订单' })}
      </button>
    </div>
  );
}
