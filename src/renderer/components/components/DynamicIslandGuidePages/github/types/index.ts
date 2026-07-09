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
 * @description 引导开源信息步骤类型定义
 * @author 鸡哥
 */

/** GithubStep 组件属性 */
export interface GithubStepProps {
  /** 确认后进入下一步的回调 */
  onNext: () => void;
  /** 返回上一步的回调 */
  onPrev: () => void;
}

/** 项目链接条目 */
export interface ProjectLink {
  /** 链接标识 */
  key: string;
  /** 链接地址 */
  url: string;
  /** 图标路径 */
  icon: string;
}
