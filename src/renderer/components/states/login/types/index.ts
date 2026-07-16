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
 * @file index.ts
 * @description 登录状态组件类型定义
 * @author 鸡哥
 */

import type { Dispatch, SetStateAction } from 'react';
import type { TFunction } from 'i18next';
import type { Feedback } from '../config/loginConfig';

/** LoginForm 组件 Props */
export interface LoginFormProps {
  account: string;
  setAccount: Dispatch<SetStateAction<string>>;
  verificationEmail: string;
  maskedVerificationEmail: string;
  emailCode: string;
  setEmailCode: Dispatch<SetStateAction<string>>;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  passwordVisible: boolean;
  setPasswordVisible: Dispatch<SetStateAction<boolean>>;
  submitting: boolean;
  sendingCode: boolean;
  sendCooldownSeconds: number;
  needsEmailVerification: boolean;
  isEmailAccount: boolean;
  feedback: Feedback | null;
  handleSendCode: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  setRegister: () => void;
  setResetPassword: () => void;
  returnFromAuth: () => void;
  githubLoading: boolean;
  handleGitHubLogin: () => Promise<void>;
  microsoftLoading: boolean;
  handleMicrosoftLogin: () => Promise<void>;
  wechatLoading: boolean;
  handleWechatLogin: () => Promise<void>;
  giteeLoading: boolean;
  handleGiteeLogin: () => Promise<void>;
  disabledProviders: Set<string>;
  t: TFunction;
}
