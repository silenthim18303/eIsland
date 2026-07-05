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
 * @file MihtnelisAgentStreamEvent.ts
 * @description mihtnelis agent 流式事件类型定义
 * @author 鸡哥
 */

/** mihtnelis agent 流式事件类型 */
export type MihtnelisAgentStreamEventType =
  | 'meta'
  | 'tool'
  | 'tool_call_request'
  | 'tool_call_result'
  | 'think'
  | 'chunk'
  | 'chunk_reset'
  | 'billing'
  | 'web_access_request'
  | 'web_access_resolved'
  | 'todo'
  | 'final'
  | 'error';

/** mihtnelis agent 流式事件 */
export interface MihtnelisAgentStreamEvent {
  /** 事件类型 */
  type: MihtnelisAgentStreamEventType;
  /** 事件负载 */
  payload: unknown;
}
