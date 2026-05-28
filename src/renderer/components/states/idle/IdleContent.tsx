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

import type { ReactElement } from 'react';
import type { IdleContentProps } from './config/idleConfig';
import { useIdle } from './hooks/useIdle';
import { IdleForm } from './components/IdleForm';
import '../../../styles/shell/shell.css';

/** Idle 状态内容组件 */
export function IdleContent(props: IdleContentProps): ReactElement {
  const idle = useIdle(props);
  return <IdleForm {...idle} />;
}
