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

/** 引导步骤 */
export type GuideStep = 'language' | 'whitelist' | 'smtc' | 'theme' | 'update' | 'github' | 'welcome';

/** 引导步骤索引映射 */
export const GUIDE_STEP_INDEX: Record<GuideStep, number> = {
  language: 0,
  whitelist: 1,
  smtc: 2,
  theme: 3,
  update: 4,
  github: 5,
  welcome: 6,
};

/** 引导步骤总数 */
export const GUIDE_STEP_TOTAL = 7;
