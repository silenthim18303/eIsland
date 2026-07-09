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
 * @file projectLinks.ts
 * @description 引导开源信息步骤 — 项目链接配置
 * @author 鸡哥
 */

import { SvgIcon } from '../../../../../utils/SvgIcon';
import type { ProjectLink } from '../types';

/** 项目链接配置 */
export const PROJECT_LINKS: ProjectLink[] = [
  { key: 'repo', url: 'https://github.com/JNTMTMTM/eIsland', icon: SvgIcon.GITHUB },
  { key: 'website', url: 'https://pyisland.com', icon: SvgIcon.WEBSITE },
  { key: 'docs', url: 'https://docs.pyisland.com', icon: SvgIcon.DOCS },
  { key: 'devDocs', url: 'https://dev.electronisland.com', icon: SvgIcon.DEVELOPER },
];

