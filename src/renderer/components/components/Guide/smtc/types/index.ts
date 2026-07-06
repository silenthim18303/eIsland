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
 * @file types/index.ts
 * @description 引导 SMTC 模块 — 类型定义
 * @author 鸡哥
 */

import type { ReactNode } from 'react';

/** SmtcStep 组件属性 */
export interface SmtcStepProps {
  /** 确认后进入下一步的回调 */
  onNext: () => void;
  /** 返回上一步的回调 */
  onPrev: () => void;
}

/** SMTC 测试状态 */
export type SmtcTestStatus = 'loading' | 'success' | 'no-media';

/** 媒体元数据 */
export interface SmtcMediaMeta {
  title: string;
  artist: string;
  album: string;
  coverImage: string | null;
  dominantColor: [number, number, number];
  isPlaying: boolean;
  sourceAppId: string;
}

/** useSmtcTest 返回值 */
export interface UseSmtcTestReturn {
  status: SmtcTestStatus;
  meta: SmtcMediaMeta | null;
}

/** MarqueeText 组件属性 */
export interface MarqueeTextProps {
  children: ReactNode;
  className?: string;
}
