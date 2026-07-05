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
 * @file UserCaptcha.ts
 * @description 用户验证码相关数据结构定义
 * @author 鸡哥
 */

/** 验证码配置 */
export interface UserCaptchaConfig {
  /** 是否启用 */
  enabled: boolean;
  /** 验证码提供商 */
  provider?: string;
  /** 最小值 */
  minValue?: number;
  /** 最大值 */
  maxValue?: number;
  /** 容差 */
  tolerance?: number;
  /** 挑战有效期（秒） */
  challengeTtlSeconds?: number;
}

/** 验证码挑战 */
export interface UserCaptchaChallenge {
  /** 挑战ID */
  challengeId: string;
  /** 最小值 */
  minValue: number;
  /** 最大值 */
  maxValue: number;
  /** 目标值 */
  targetValue: number;
  /** 容差 */
  tolerance: number;
  /** 验证码签名 */
  captchaSign: string;
}

/** 验证码载荷 */
export interface UserCaptchaPayload {
  /** 验证码票据 */
  ticket: string;
  /** 随机字符串 */
  randstr: string;
  /** 签名 */
  sign: string;
}
