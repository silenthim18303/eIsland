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
 * @file ResetPasswordContent.tsx
 * @description 独立重置密码状态内容组件
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useResetPassword } from './hooks/useResetPassword';
import { ResetPasswordForm } from './components/ResetPasswordForm';
import '../../../styles/settings/settings.css';
import '../../../styles/auth/auth.css';

/** 独立重置密码状态内容 */
export function ResetPasswordContent(): ReactElement {
  const rp = useResetPassword();
  return (
    <ResetPasswordForm
      email={rp.email}
      setEmail={rp.setEmail}
      emailCode={rp.emailCode}
      setEmailCode={rp.setEmailCode}
      newPassword={rp.newPassword}
      setNewPassword={rp.setNewPassword}
      confirmPassword={rp.confirmPassword}
      setConfirmPassword={rp.setConfirmPassword}
      newPasswordVisible={rp.newPasswordVisible}
      setNewPasswordVisible={rp.setNewPasswordVisible}
      confirmPasswordVisible={rp.confirmPasswordVisible}
      setConfirmPasswordVisible={rp.setConfirmPasswordVisible}
      sendingCode={rp.sendingCode}
      sendCooldownSeconds={rp.sendCooldownSeconds}
      submitting={rp.submitting}
      feedback={rp.feedback}
      handleSendCode={rp.handleSendCode}
      handleSubmit={rp.handleSubmit}
      setLogin={rp.setLogin}
      setRegister={rp.setRegister}
      t={rp.t}
    />
  );
}
