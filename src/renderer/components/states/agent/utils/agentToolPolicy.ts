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

const CLIENT_LOCAL_TOOL_PREFIXES = [
  'file.', 'cmd.', 'sys.', 'win.', 'clipboard.', 'notification.', 'net.',
  'monitor.', 'volume.', 'brightness.', 'display.', 'power.', 'wifi.',
  'registry.', 'service.', 'schedule.', 'firewall.', 'defender.', 'island.', 'alarm.', 'todolist.',
] as const;

const CLIENT_LOCAL_TOOL_EXACT_NAMES = new Set(['web.search']);

const HIGH_RISK_LOCAL_TOOL_PREFIXES = [
  'file.delete', 'file.rename', 'file.trash', 'cmd.exec', 'cmd.powershell',
  'win.close', 'win.minimize', 'win.maximize', 'win.restore', 'power.',
  'registry.write', 'registry.delete', 'service.start', 'service.stop',
  'service.restart', 'schedule.task.create', 'net.proxy', 'net.hosts',
  'defender.scan', 'island.settings.write', 'island.theme.set',
  'island.opacity.set', 'island.restart', 'alarm.delete', 'todolist.delete',
] as const;

export function isClientLocalToolName(tool: string): boolean {
  const n = tool.trim().toLowerCase();
  return CLIENT_LOCAL_TOOL_EXACT_NAMES.has(n) || CLIENT_LOCAL_TOOL_PREFIXES.some((p) => n.startsWith(p));
}

export function isHighRiskLocalToolName(tool: string): boolean {
  const n = tool.trim().toLowerCase();
  return HIGH_RISK_LOCAL_TOOL_PREFIXES.some((p) => n.startsWith(p));
}
