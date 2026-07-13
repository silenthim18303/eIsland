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
 * @file SetPasswordContent.tsx
 * @description 设置密码状态内容组件（OAuth 新用户注册）
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useSetPassword } from './hooks/useSetPassword';
import { SetPasswordForm } from './components/SetPasswordForm';
import '../../../styles/settings/settings.css';
import '../../../styles/auth/auth.css';

/** 设置密码状态内容 */
export function SetPasswordContent(): ReactElement {
  const sp = useSetPassword();
  return (
    <SetPasswordForm
      username={sp.username}
      setUsername={sp.setUsername}
      password={sp.password}
      setPassword={sp.setPassword}
      confirmPassword={sp.confirmPassword}
      setConfirmPassword={sp.setConfirmPassword}
      passwordVisible={sp.passwordVisible}
      setPasswordVisible={sp.setPasswordVisible}
      confirmPasswordVisible={sp.confirmPasswordVisible}
      setConfirmPasswordVisible={sp.setConfirmPasswordVisible}
      submitting={sp.submitting}
      feedback={sp.feedback}
      handleSubmit={sp.handleSubmit}
      setLogin={sp.setLogin}
      email={sp.email}
      t={sp.t}
    />
  );
}
