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
 * @file FeedbackMessage.tsx
 * @description 反馈消息展示组件
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import type { Feedback } from '../config/registerConstants';

interface FeedbackMessageProps {
  feedback: Feedback | null;
}

/**
 * 渲染反馈消息（成功/错误/信息）。
 * @param props - 反馈数据。
 * @returns 反馈消息元素，无反馈返回 null。
 */
export function FeedbackMessage({ feedback }: FeedbackMessageProps): ReactElement | null {
  if (!feedback) return null;
  return <div className={`settings-user-feedback settings-user-feedback--${feedback.type}`}>{feedback.text}</div>;
}
