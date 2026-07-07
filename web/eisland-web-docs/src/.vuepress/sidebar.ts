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
 * @file sidebar.ts
 * @description VuePress 侧边栏配置
 * @author 鸡哥
 */

import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/": [
    "",
  ],
  "/introduction/": [
    {
      text: "Introduction",
      icon: "info",
      collapsible: false,
      children: [
        "intro/project-overview.md",
        "intro/dependencies.md",
        "intro/backend-dependencies.md",
        "intro/coc.md",
      ],
    },
    {
      text: "Tech Stack",
      icon: "book-atlas",
      collapsible: false,
      children: [
        "tech-stack/frontend-tech-stack.md",
        "tech-stack/backend-tech-stack.md",
        "tech-stack/plugins-tech-stack.md",
      ],
    },
    {
      text: "Frontend Architecture",
      icon: "building",
      collapsible: false,
      children: [
        "frontend-arch/process-model.md",
        "frontend-arch/states.md",
        "frontend-arch/electron-windows.md",
      ],
    },
    {
      text: "Backend Architecture",
      icon: "server",
      collapsible: false,
      children: [
        "backend-arch/server-model.md",
        "backend-arch/mysql-schema.md",
        "backend-arch/redis-schema.md",
        "backend-arch/rabbitmq-schema.md",
      ],
    },
  ],
  "/api-plugins/": [
    {
      text: "Windows Brightness Helper",
      icon: "sun",
      collapsible: true,
      children: [
        "display-graphics/brightness-helper/brightness-info.md",
        "display-graphics/brightness-helper/get-brightness.md",
        "display-graphics/brightness-helper/set-brightness.md",
        "display-graphics/brightness-helper/brightness-monitor.md",
      ],
    },
    {
      text: "Windows Fullscreen Detector",
      icon: "maximize",
      collapsible: true,
      children: [
        "display-graphics/fullscreen-detector/native-rect.md",
        "display-graphics/fullscreen-detector/native-monitor-info.md",
        "display-graphics/fullscreen-detector/fullscreen-window-info.md",
        "display-graphics/fullscreen-detector/get-foreground-fullscreen-window.md",
        "display-graphics/fullscreen-detector/get-fullscreen-windows.md",
        "display-graphics/fullscreen-detector/is-any-fullscreen-window.md",
      ],
    },
    {
      text: "Windows Bluetooth Helper",
      icon: "server",
      collapsible: true,
      children: [
        "connectivity/bluetooth-helper/bluetooth-device-info.md",
        "connectivity/bluetooth-helper/get-paired-devices.md",
        "connectivity/bluetooth-helper/get-connected-devices.md",
        "connectivity/bluetooth-helper/get-all-devices.md",
        "connectivity/bluetooth-helper/get-device.md",
        "connectivity/bluetooth-helper/bluetooth-monitor.md",
      ],
    },
    {
      text: "Windows WiFi Helper",
      icon: "wifi",
      collapsible: true,
      children: [
        "connectivity/wifi-helper/connectivity-level.md",
        "connectivity/wifi-helper/wifi-info.md",
        "connectivity/wifi-helper/get-wifi-info.md",
        "connectivity/wifi-helper/wifi-monitor.md",
      ],
    },
    {
      text: "Windows Power Helper",
      icon: "battery-half",
      collapsible: true,
      children: [
        "system-power/power-helper/battery-status.md",
        "system-power/power-helper/power-supply-status.md",
        "system-power/power-helper/energy-saver-status.md",
        "system-power/power-helper/power-info.md",
        "system-power/power-helper/get-power-info.md",
        "system-power/power-helper/power-monitor.md",
      ],
    },
    {
      text: "Windows Performance Monitor",
      icon: "gauge-high",
      collapsible: true,
      children: [
        "system-power/performance-monitor/temperature-category.md",
        "system-power/performance-monitor/cpu-snapshot.md",
        "system-power/performance-monitor/memory-snapshot.md",
        "system-power/performance-monitor/temperature-reading.md",
        "system-power/performance-monitor/temperature-snapshot.md",
        "system-power/performance-monitor/hardware-device.md",
        "system-power/performance-monitor/hardware-list-snapshot.md",
        "system-power/performance-monitor/get-cpu.md",
        "system-power/performance-monitor/get-memory.md",
        "system-power/performance-monitor/get-temperature.md",
        "system-power/performance-monitor/get-hardware-list.md",
      ],
    },
    {
      text: "Windows Processes Attacker",
      icon: "skull-crossbones",
      collapsible: true,
      children: [
        "system-power/processes-attacker/process-close-result.md",
        "system-power/processes-attacker/process-failure.md",
        "system-power/processes-attacker/close-process.md",
        "system-power/processes-attacker/close-processes.md",
      ],
    },
    {
      text: "Windows Application Icon Helper",
      icon: "icons",
      collapsible: true,
      children: [
        "system-power/application-icon-helper/icon-result.md",
        "system-power/application-icon-helper/get-icon-by-process-name.md",
        "system-power/application-icon-helper/get-icon-by-pid.md",
        "system-power/application-icon-helper/get-icon-by-path.md",
        "system-power/application-icon-helper/get-icon-by-shortcut-path.md",
      ],
    },
    {
      text: "Windows SMTC Helper",
      icon: "music",
      collapsible: true,
      children: [
        "media-notifications/smtc-helper/timeline-properties.md",
        "media-notifications/smtc-helper/playback-controls.md",
        "media-notifications/smtc-helper/media-status.md",
        "media-notifications/smtc-helper/command-result.md",
        "media-notifications/smtc-helper/timestamp-info.md",
        "media-notifications/smtc-helper/media-props.md",
        "media-notifications/smtc-helper/playback-info.md",
        "media-notifications/smtc-helper/timeline-props.md",
        "media-notifications/smtc-helper/session-snapshot.md",
        "media-notifications/smtc-helper/play.md",
        "media-notifications/smtc-helper/pause.md",
        "media-notifications/smtc-helper/next.md",
        "media-notifications/smtc-helper/previous.md",
        "media-notifications/smtc-helper/get-status.md",
        "media-notifications/smtc-helper/get-timestamp.md",
        "media-notifications/smtc-helper/seek.md",
        "media-notifications/smtc-helper/stop.md",
        "media-notifications/smtc-helper/set-shuffle.md",
        "media-notifications/smtc-helper/set-repeat-mode.md",
        "media-notifications/smtc-helper/set-playback-rate.md",
        "media-notifications/smtc-helper/smtc-monitor.md",
      ],
    },
    {
      text: "Windows Toast Listener",
      icon: "bell",
      collapsible: true,
      children: [
        "media-notifications/toast-listener/toast-access-status.md",
        "media-notifications/toast-listener/toast-notification-change-kind.md",
        "media-notifications/toast-listener/toast-notification-changed-event.md",
        "media-notifications/toast-listener/toast-notification-snapshot.md",
        "media-notifications/toast-listener/request-access.md",
        "media-notifications/toast-listener/get-access-status.md",
        "media-notifications/toast-listener/get-notifications.md",
        "media-notifications/toast-listener/start-listening.md",
        "media-notifications/toast-listener/stop-listening.md",
        "media-notifications/toast-listener/is-listening.md",
        "media-notifications/toast-listener/enable-suppression.md",
        "media-notifications/toast-listener/disable-suppression.md",
        "media-notifications/toast-listener/is-suppression-enabled.md",
      ],
    },
  ],
  "/api-backend/": [
    {
      text: "Server Agent",
      icon: "robot",
      collapsible: true,
      children: [
        {
          text: "API",
          icon: "plug",
          collapsible: true,
          children: [
            "server-agent/agent-chat-api/stream.md",
            "server-agent/agent-chat-api/prompt.md",
            "server-agent/admin-agent-api/delete-model-pricing.md",
            "server-agent/admin-tmt-api/delete-tmt-pricing.md",
            "server-agent/admin-agent-api/get-billing-dlq.md",
            "server-agent/admin-agent-api/get-dlq-pending-count.md",
            "server-agent/admin-agent-api/get-model-pricing.md",
            "server-agent/admin-agent-api/get-service-enabled.md",
            "server-agent/admin-tmt-api/get-tmt-pricing.md",
            "server-agent/admin-tmt-api/get-tmt-quota.md",
            "server-agent/admin-agent-api/get-usage-stats.md",
            "server-agent/admin-agent-api/gift-balance-all.md",
            "server-agent/agent-chat-api/local-tool-resolve.md",
            "server-agent/stt-websocket/realtime-stt.md",
            "server-agent/admin-agent-api/resolve-billing-dlq.md",
            "server-agent/admin-agent-api/set-service-enabled.md",
            "server-agent/agent-chat-api/tool-result.md",
            "server-agent/toolbox-api/translate.md",
            "server-agent/admin-agent-api/upsert-model-pricing.md",
            "server-agent/admin-tmt-api/upsert-tmt-pricing.md",
            "server-agent/agent-chat-api/web-access-resolve.md",
          ],
        },
        {
          text: "Data Types",
          icon: "database",
          collapsible: true,
          children: [
            "server-agent/data-types/agent-execution-result.md",
            "server-agent/data-types/agent-prompt-request.md",
            "server-agent/data-types/billing-deduct-message.md",
            "server-agent/data-types/local-tool-access-resolve-request.md",
            "server-agent/data-types/local-tool-resolve-request.md",
            "server-agent/data-types/usage-stats-message.md",
            "server-agent/data-types/web-access-resolve-request.md",
            "server-agent/data-types/auth-result.md",
            "server-agent/data-types/chat-request-options.md",
            "server-agent/data-types/dlq-resolve-request.md",
            "server-agent/data-types/execution-context.md",
            "server-agent/data-types/gift-balance-all-request.md",
            "server-agent/data-types/mihtnelis-stream-request.md",
            "server-agent/data-types/model-pricing-request.md",
            "server-agent/data-types/service-enabled-request.md",
            "server-agent/data-types/tool-invocation-trace.md",
            "server-agent/data-types/translate-pricing-request.md",
            "server-agent/data-types/translate-request.md",
            "server-agent/data-types/translate-result.md",
          ],
        },
        {
          text: "Configuration",
          icon: "gear",
          collapsible: true,
          children: [
            "server-agent/configuration/agent-billing-mq.md",
            "server-agent/configuration/agent-billing-redis.md",
            "server-agent/configuration/agent-pricing-redis.md",
            "server-agent/configuration/agent-stt-websocket.md",
            "server-agent/configuration/agent-usage-redis.md",
            "server-agent/configuration/edoc-prompt-builder.md",
            "server-agent/configuration/mihtnelis-agent-properties.md",
            "server-agent/configuration/mihtnelis-prompt-builder.md",
            "server-agent/configuration/r1pxc-prompt-builder.md",
          ],
        },
      ],
    },
  ],
  "/api-frontend/": [
    {
      text: "API Frontend",
      icon: "display",
      collapsible: false,
      children: [],
    },
  ],
  "/developer/": [
    {
      text: "Environment Setup",
      icon: "globe",
      collapsible: false,
      children: [
        "environment-setup/frontend-setup.md",
        "environment-setup/backend-setup.md",
        "environment-setup/plugin-setup.md",
      ],
    },
    {
      text: "Git Operations",
      icon: "code-branch",
      collapsible: false,
      children: [
        "git-operations/local-operations.md",
        "git-operations/github-operations.md",
      ],
    },
    {
      text: "Development Commands",
      icon: "terminal",
      collapsible: false,
      children: [
        "commands/dev-commands.md",
        "commands/test-commands.md",
        "commands/package-commands.md",
        "commands/quality-commands.md",
        "commands/release-commands.md",
        "commands/plugin-commands.md",
      ],
    },
    {
      text: "Code Quality",
      icon: "check-double",
      collapsible: false,
      children: [
        "code-quality/code-review.md",
        "code-quality/comment-quality.md",
      ],
    },
  ],
});
