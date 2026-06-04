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
 * @file useSendCooldown.ts
 * @description 验证码发送冷却倒计时 Hook
 * @author 鸡哥
 */

import { useEffect, useState } from 'react';

interface UseSendCooldownResult {
  cooldownSeconds: number;
  setCooldown: (seconds: number) => void;
}

/**
 * 维护验证码发送冷却倒计时（每秒递减）。
 * @returns 冷却秒数与设置函数。
 */
export function useSendCooldown(): UseSendCooldownResult {
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = window.setTimeout(() => {
      setCooldownSeconds((v) => (v > 0 ? v - 1 : 0));
    }, 1000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [cooldownSeconds]);

  return { cooldownSeconds, setCooldown: setCooldownSeconds };
}
