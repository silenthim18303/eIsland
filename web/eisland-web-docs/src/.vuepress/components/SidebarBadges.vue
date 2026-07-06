<!--
  eIsland - A sleek, Apple Dynamic Island inspired floating widget for Windows, built with Electron.
  https://github.com/JNTMTMTM/eIsland

  Copyright (C) 2026 JNTMTMTM
  Copyright (C) 2026 pyisland.com

  Original author: JNTMTMTM[](https://github.com/JNTMTMTM)

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
-->

/**
 * @file SidebarBadges.vue
 * @description 侧边栏 API 类型徽章注入组件
 * @description 为插件 API 文档侧边栏项自动注入 Interface/Enum/Function/Monitor 徽章
 * @author 鸡哥
 */

<script setup lang="ts">
import { onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vuepress/client'

// ── name → badge type mapping ────────────────────────────────────
const BADGE_MAP: Record<string, string> = {
  // Brightness Helper
  BrightnessInfo: 'interface',
  BrightnessMonitor: 'monitor',
  // Fullscreen Detector
  NativeRect: 'interface',
  NativeMonitorInfo: 'interface',
  FullscreenWindowInfo: 'interface',
  // Bluetooth Helper
  BluetoothDeviceInfo: 'interface',
  BluetoothMonitor: 'monitor',
  // WiFi Helper
  ConnectivityLevel: 'enum',
  WifiInfo: 'interface',
  WifiMonitor: 'monitor',
  // Power Helper
  BatteryStatus: 'enum',
  PowerSupplyStatus: 'enum',
  EnergySaverStatus: 'enum',
  PowerInfo: 'interface',
  PowerMonitor: 'monitor',
  // Performance Monitor
  TemperatureCategory: 'enum',
  CpuSnapshot: 'interface',
  MemorySnapshot: 'interface',
  TemperatureReading: 'interface',
  TemperatureSnapshot: 'interface',
  HardwareDevice: 'interface',
  HardwareListSnapshot: 'interface',
  // Processes Attacker
  ProcessCloseResult: 'interface',
  ProcessFailure: 'interface',
  // SMTC Helper
  TimelineProperties: 'interface',
  PlaybackControls: 'interface',
  MediaStatus: 'enum',
  CommandResult: 'enum',
  TimestampInfo: 'interface',
  MediaProps: 'interface',
  PlaybackInfo: 'interface',
  TimelineProps: 'interface',
  SessionSnapshot: 'interface',
  SmtcMonitor: 'monitor',
  // Toast Listener
  ToastAccessStatus: 'enum',
  ToastNotificationChangeKind: 'enum',
  ToastNotificationChangedEvent: 'interface',
  ToastNotificationSnapshot: 'interface',
}

// ── badge label text ─────────────────────────────────────────────
const BADGE_LABEL: Record<string, string> = {
  interface: 'Interface',
  enum: 'Enum',
  function: 'Function',
  monitor: 'Monitor',
}

// ── infer badge type from link path ──────────────────────────────
function inferTypeFromLink(link: string): string | null {
  if (!link.includes('/api-plugins/')) return null
  const file = link.split('/').pop()?.replace('.md', '') ?? ''
  // monitor files
  if (file.endsWith('-monitor')) return 'monitor'
  // get/set/close/start/stop/is/enable/disable/request = function
  if (/^(get|set|close|start|stop|is|enable|disable|request|play|pause|next|previous|seek)\b/.test(file))
    return 'function'
  return null
}

function injectBadges(): void {
  const links = document.querySelectorAll<HTMLAnchorElement>(
    '.vp-sidebar .vp-sidebar-link',
  )
  for (const link of links) {
    // skip if badge already injected
    if (link.querySelector('.sidebar-badge')) continue

    const text = link.textContent?.trim() ?? ''
    // try explicit map first, then infer from URL
    const badgeType = BADGE_MAP[text] ?? inferTypeFromLink(link.getAttribute('href') ?? '')
    if (!badgeType) continue

    const badge = document.createElement('span')
    badge.className = `sidebar-badge sidebar-badge--${badgeType}`
    badge.textContent = BADGE_LABEL[badgeType] ?? badgeType
    // insert between icon and text
    const icon = link.querySelector('.vp-icon')
    if (icon?.nextSibling) {
      link.insertBefore(badge, icon.nextSibling)
    } else {
      link.insertBefore(badge, link.firstChild)
    }
  }
}

// ── lifecycle ────────────────────────────────────────────────────
const route = useRoute()
let observer: MutationObserver | null = null
let clickHandler: ((e: Event) => void) | null = null

onMounted(() => {
  nextTick(injectBadges)

  const sidebar = document.querySelector('.vp-sidebar')
  if (sidebar) {
    // MutationObserver as secondary safeguard — use rAF to defer
    // until after Vue's DOM update cycle completes
    observer = new MutationObserver(() => requestAnimationFrame(injectBadges))
    observer.observe(sidebar, { childList: true, subtree: true })

    // Primary trigger for collapsible group expand/collapse:
    // click callbacks are macrotasks that fire after Vue re-renders,
    // so the new .vp-sidebar-link elements are guaranteed to be in the DOM
    clickHandler = () => requestAnimationFrame(injectBadges)
    sidebar.addEventListener('click', clickHandler)
  }
})

onUnmounted(() => {
  observer?.disconnect()
  observer = null
  if (clickHandler) {
    document.querySelector('.vp-sidebar')?.removeEventListener('click', clickHandler)
    clickHandler = null
  }
})

watch(
  () => route.path,
  () => nextTick(injectBadges),
)
</script>

<template>
  <!-- renders nothing — side-effect only component -->
</template>
