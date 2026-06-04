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
 * @file PaymentMethodSelector.tsx
 * @description 支付方式选择按钮组件
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { SvgIcon } from '../../../../utils/SvgIcon';
import type { PaymentMethod } from '../config/paymentConstants';

interface PaymentMethodSelectorProps {
  method: PaymentMethod;
  wechatEnabled: boolean;
  alipayEnabled: boolean;
  onSelect: (m: Exclude<PaymentMethod, null>) => void;
}

/**
 * 渲染微信/支付宝支付方式选择按钮。
 * @param props - 当前选中状态与可用性。
 * @returns 支付方式按钮组。
 */
export function PaymentMethodSelector({
  method,
  wechatEnabled,
  alipayEnabled,
  onSelect,
}: PaymentMethodSelectorProps): ReactElement {
  const { t } = useTranslation();

  return (
    <div className="payment-method-row" role="radiogroup" aria-label={t('settings.user.payment.method', { defaultValue: '支付方式' })}>
      <button
        type="button"
        className={`payment-method-btn ${method === 'wechat' ? 'active' : ''}`}
        disabled={!wechatEnabled}
        onClick={() => onSelect('wechat')}
      >
        <img className="payment-method-icon" src={SvgIcon.WECHATPAY} alt="" aria-hidden="true" />
        {t('settings.user.payment.wechat', { defaultValue: '微信支付' })}
      </button>
      <button
        type="button"
        className={`payment-method-btn ${method === 'alipay' ? 'active' : ''}`}
        disabled={!alipayEnabled}
        onClick={() => onSelect('alipay')}
      >
        <img className="payment-method-icon" src={SvgIcon.ALIPAY} alt="" aria-hidden="true" />
        {t('settings.user.payment.alipay', { defaultValue: '支付宝' })}
      </button>
    </div>
  );
}
