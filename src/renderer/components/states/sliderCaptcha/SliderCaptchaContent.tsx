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
 * @file SliderCaptchaContent.tsx
 * @description 滑块验证码状态界面组件。
 * @description 负责展示挑战信息、滑块输入及确认/取消交互。
 * @author 鸡哥
 */

import { useState } from 'react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import type { SliderCaptchaContentProps } from './config/sliderCaptchaTypes';
import { useSliderCaptchaDerived } from './hooks/useSliderCaptchaDerived';
import '../../../styles/slider-captcha.css';
import eislandLogo from '../../../../../resources/icon/eisland.svg';

/**
 * 渲染滑块验证码弹层组件。
 * @param challenge - 服务端下发的滑块挑战参数。
 * @param onCancel - 用户取消验证时的回调。
 * @param onConfirm - 用户确认验证时的回调，参数为当前滑块值。
 * @returns 滑块验证界面节点。
 */
export function SliderCaptchaContent({ challenge, onCancel, onConfirm }: SliderCaptchaContentProps): ReactElement {
  const { t } = useTranslation();
  const [value, setValue] = useState(challenge.minValue);
  const [closing, setClosing] = useState(false);
  const { sliderStyle, challengeExpression, traceCode } = useSliderCaptchaDerived(challenge, value);

  const closeWithAnimation = (handler: () => void): void => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(() => { handler(); }, 180);
  };

  return (
    <div
      className={`slider-captcha-overlay${closing ? ' is-closing' : ''}`}
      onMouseDown={(event) => { event.stopPropagation(); }}
      onClick={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget) closeWithAnimation(onCancel);
      }}
    >
      <div className={`slider-captcha-card slider-captcha-card--danger${closing ? ' is-closing' : ''}`}>
        <div className="slider-captcha-brand">
          <img className="slider-captcha-brand-logo" src={eislandLogo} alt="eIsland" />
          <div className="slider-captcha-brand-texts">
            <div className="slider-captcha-title">{t('sliderCaptcha.title', { defaultValue: '滑块验证' })}</div>
            <div className="slider-captcha-subtitle">{t('sliderCaptcha.subtitle', { defaultValue: '由 Pyisland Server & eIsland 提供质询服务' })}</div>
          </div>
        </div>
        <div className="slider-captcha-hint">{t('sliderCaptcha.hint', { defaultValue: '请先计算下方算式结果，再将滑块拖到对应值' })}</div>
        <div className="slider-captcha-subtitle slider-captcha-trace-code" title={challenge.challengeId || undefined}>
          {t('sliderCaptcha.traceCode', { defaultValue: 'traceCode: {{code}}', code: traceCode })}
        </div>
        <div className="slider-captcha-equation-row">
          <span className="slider-captcha-equation-label">{t('sliderCaptcha.equationLabel', { defaultValue: '算式挑战' })}</span>
          <span className="slider-captcha-equation-value">{challengeExpression}</span>
        </div>
        <div className="slider-captcha-value" aria-live="polite">
          <span className="slider-captcha-value-label">{t('sliderCaptcha.currentValueLabel', { defaultValue: '当前值' })}</span>
          <span className="slider-captcha-value-number">{value}</span>
          <span className="slider-captcha-value-range">{t('sliderCaptcha.valueRange', { defaultValue: '范围 {{min}} - {{max}}', min: challenge.minValue, max: challenge.maxValue })}</span>
        </div>
        <input
          className="slider-captcha-range"
          type="range"
          min={challenge.minValue}
          max={challenge.maxValue}
          step={1}
          value={value}
          style={sliderStyle}
          onChange={(event) => setValue(Number(event.target.value))}
        />
        <div className="slider-captcha-actions">
          <button
            className="slider-captcha-btn slider-captcha-btn-cancel"
            type="button"
            onClick={() => closeWithAnimation(onCancel)}
          >
            {t('sliderCaptcha.actions.cancel', { defaultValue: '取消' })}
          </button>
          <button
            className="slider-captcha-btn slider-captcha-btn-confirm"
            type="button"
            onClick={() => closeWithAnimation(() => onConfirm(value))}
          >
            {t('sliderCaptcha.actions.confirm', { defaultValue: '确认' })}
          </button>
        </div>
      </div>
    </div>
  );
}
