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
 * @file SubmitUserIssueFeedbackPayload.ts
 * @description 提交用户问题反馈负载类型定义
 * @author 鸡哥
 */

/** 提交用户问题反馈负载 */
export interface SubmitUserIssueFeedbackPayload {
  /** 反馈类型 */
  feedbackType: string;
  /** 标题 */
  title: string;
  /** 内容 */
  content: string;
  /** 联系方式 */
  contact?: string;
  /** 反馈日志 URL */
  feedbackLogUrl?: string;
  /** 反馈截图 URL */
  feedbackScreenshotUrl?: string;
  /** 客户端版本 */
  clientVersion?: string;
  /** 验证码票据 */
  captchaTicket: string;
  /** 验证码随机字符串 */
  captchaRandstr: string;
  /** 验证码签名 */
  captchaSign: string;
}
