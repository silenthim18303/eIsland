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
 * @file BindOAuthContent.tsx
 * @description 绑定 OAuth 状态内容组件（已有邮箱账号绑定第三方登录）
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useBindOAuth } from './hooks/useBindOAuth';
import { BindOAuthForm } from './components/BindOAuthForm';
import '../../../styles/settings/settings.css';
import '../../../styles/auth/auth.css';

/** 绑定 OAuth 状态内容 */
export function BindOAuthContent(): ReactElement {
  const bo = useBindOAuth();
  return (
    <BindOAuthForm
      password={bo.password}
      setPassword={bo.setPassword}
      passwordVisible={bo.passwordVisible}
      setPasswordVisible={bo.setPasswordVisible}
      submitting={bo.submitting}
      feedback={bo.feedback}
      handleSubmit={bo.handleSubmit}
      setLogin={bo.setLogin}
      username={bo.username}
      email={bo.email}
      t={bo.t}
    />
  );
}
