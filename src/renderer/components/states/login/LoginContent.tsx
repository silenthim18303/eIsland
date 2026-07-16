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
 * @file LoginContent.tsx
 * @description 独立登录状态内容组件
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useLogin } from './hooks/useLogin';
import { LoginForm } from './components/LoginForm';
import '../../../styles/settings/settings.css';
import '../../../styles/auth/auth.css';

/** 独立登录状态内容 */
export function LoginContent(): ReactElement {
  const login = useLogin();
  return (
    <LoginForm
      account={login.account}
      setAccount={login.setAccount}
      verificationEmail={login.verificationEmail}
      maskedVerificationEmail={login.maskedVerificationEmail}
      emailCode={login.emailCode}
      setEmailCode={login.setEmailCode}
      password={login.password}
      setPassword={login.setPassword}
      passwordVisible={login.passwordVisible}
      setPasswordVisible={login.setPasswordVisible}
      submitting={login.submitting}
      sendingCode={login.sendingCode}
      sendCooldownSeconds={login.sendCooldownSeconds}
      needsEmailVerification={login.needsEmailVerification}
      isEmailAccount={login.isEmailAccount}
      feedback={login.feedback}
      handleSendCode={login.handleSendCode}
      handleSubmit={login.handleSubmit}
      setRegister={login.setRegister}
      setResetPassword={login.setResetPassword}
      returnFromAuth={login.returnFromAuth}
      githubLoading={login.githubLoading}
      handleGitHubLogin={login.handleGitHubLogin}
      microsoftLoading={login.microsoftLoading}
      handleMicrosoftLogin={login.handleMicrosoftLogin}
      wechatLoading={login.wechatLoading}
      handleWechatLogin={login.handleWechatLogin}
      giteeLoading={login.giteeLoading}
      handleGiteeLogin={login.handleGiteeLogin}
      kookLoading={login.kookLoading}
      handleKookLogin={login.handleKookLogin}
      disabledProviders={login.disabledProviders}
      t={login.t}
    />
  );
}
