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
 * @description 引导更新源选择步骤类型定义
 * @author 鸡哥
 */

/** UpdateStep 组件属性 */
export interface UpdateStepProps {
  /** 确认后进入下一步的回调 */
  onNext: () => void;
  /** 返回上一步的回调 */
  onPrev: () => void;
}

/** 更新源选项条目 */
export interface UpdateSourceOption {
  /** 更新源标识 */
  key: string;
  /** 显示名称 */
  label: string;
  /** 是否仅 PRO 可用 */
  proOnly: boolean;
  /** 图标路径（可选） */
  icon?: string;
}

/** useUpdateSourceSelect Hook 返回值 */
export interface UseUpdateSourceSelectReturn {
  /** 当前选中的更新源 */
  selected: string;
  /** 选择更新源（立即持久化） */
  handleSelect: (key: string) => void;
}
