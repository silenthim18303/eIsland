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
 * @file processIndicatorSegments.ts
 * @description 分段进度条状态计算
 * @author 鸡哥
 */

import type { ProcessSegment, RenderedProgress, SegmentMotion, SegmentStatus } from '../types';

/**
 * 获取指定索引的分段状态
 * @param index - 分段索引
 * @param current - 当前激活索引
 * @returns 分段状态
 */
function getSegmentStatus(index: number, current: number): SegmentStatus {
  if (index < current) return 'completed';
  if (index === current) return 'active';
  return 'inactive';
}

/**
 * 获取指定索引的分段动画类型
 * @param index - 分段索引
 * @param current - 当前激活索引
 * @param previous - 上一次渲染进度
 * @returns 动画类型
 */
function getSegmentMotion(index: number, current: number, previous: RenderedProgress | null): SegmentMotion {
  if (previous === null) return 'none';
  if (current > previous.current && index > previous.current && index <= current) return 'enter';
  if (current < previous.current && index > current && index <= previous.current) return 'exit';
  return 'none';
}

/**
 * 创建进度分段数组
 * @param total - 总分段数
 * @param current - 当前激活索引
 * @param previous - 上一次渲染进度
 * @returns 分段状态数组
 */
export function createProcessSegments(total: number, current: number, previous: RenderedProgress | null): ProcessSegment[] {
  return Array.from({ length: total }, (_, index) => ({
    status: getSegmentStatus(index, current),
    motion: getSegmentMotion(index, current, previous),
  }));
}