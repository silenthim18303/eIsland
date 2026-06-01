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
 * @file useSliderCaptchaDerived.ts
 * @description 滑块验证码派生数据 Hook
 * @author 鸡哥
 */

import { useMemo, type CSSProperties } from 'react';
import type { UserCaptchaChallenge } from '../../../../api/user/userAccountApi';

interface UseSliderCaptchaDerivedResult {
  sliderProgress: number;
  sliderStyle: CSSProperties;
  challengeExpression: string;
  traceCode: string;
}

/**
 * 计算滑块验证码的派生数据（进度、样式、算式、traceCode）。
 * @param challenge - 服务端下发的滑块挑战参数。
 * @param value - 当前滑块值。
 * @returns 派生数据对象。
 */
export function useSliderCaptchaDerived(
  challenge: UserCaptchaChallenge,
  value: number,
): UseSliderCaptchaDerivedResult {
  const sliderProgress = useMemo(() => {
    const range = challenge.maxValue - challenge.minValue;
    if (range <= 0) return 0;
    const progress = ((value - challenge.minValue) / range) * 100;
    return Math.max(0, Math.min(100, progress));
  }, [challenge.maxValue, challenge.minValue, value]);

  const sliderStyle = useMemo(() => ({
    '--slider-progress': `${sliderProgress}%`,
  }) as CSSProperties, [sliderProgress]);

  const challengeExpression = useMemo(() => {
    const target = challenge.targetValue;
    const left = Math.floor(Math.random() * (target + 1));
    const right = target - left;
    return `${left} + ${right}`;
  }, [challenge.challengeId, challenge.targetValue]);

  const traceCode = useMemo(() => {
    const challengeId = challenge.challengeId?.trim();
    if (!challengeId) return '--';
    return challengeId.toUpperCase();
  }, [challenge.challengeId]);

  return { sliderProgress, sliderStyle, challengeExpression, traceCode };
}
