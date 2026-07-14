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
 * @file BindEmailContent.tsx
 * @description 绑定邮箱状态内容组件（OAuth 新用户绑定邮箱）
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useBindEmail } from './hooks/useBindEmail';
import { BindEmailForm } from './components/BindEmailForm';
import '../../../styles/settings/settings.css';
import '../../../styles/auth/auth.css';

/** 绑定邮箱状态内容 */
export function BindEmailContent(): ReactElement {
  const be = useBindEmail();
  return (
    <BindEmailForm
      email={be.email}
      setEmail={be.setEmail}
      emailCode={be.emailCode}
      setEmailCode={be.setEmailCode}
      sendingCode={be.sendingCode}
      sendCooldownSeconds={be.sendCooldownSeconds}
      submitting={be.submitting}
      feedback={be.feedback}
      handleSendCode={be.handleSendCode}
      handleSubmit={be.handleSubmit}
      setLogin={be.setLogin}
      t={be.t}
    />
  );
}
