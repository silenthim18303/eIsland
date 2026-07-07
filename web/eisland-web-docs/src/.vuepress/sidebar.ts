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
      text: "eisland Agent Services Server",
      icon: "robot",
      collapsible: true,
      children: [
        {
          text: "eASS Config",
          icon: "gear",
          collapsible: true,
          children: [
            "server-agent/configuration/agent-billing-redis.md",
            "server-agent/configuration/agent-pricing-redis.md",
            "server-agent/configuration/agent-usage-redis.md",
            "server-agent/configuration/agent-billing-mq.md",
            "server-agent/configuration/agent-stt-websocket.md",
            "server-agent/configuration/mihtnelis-agent-properties.md",
            "server-agent/configuration/mihtnelis-prompt-builder.md",
            "server-agent/configuration/edoc-prompt-builder.md",
            "server-agent/configuration/r1pxc-prompt-builder.md",
          ],
        },
        {
          text: "eASS Controller",
          icon: "plug",
          collapsible: true,
          children: [
            "server-agent/agent-chat-api/README.md",
            "server-agent/admin-agent-api/README.md",
            "server-agent/admin-tmt-api/README.md",
            "server-agent/toolbox-api/README.md",
            "server-agent/stt-websocket/README.md",
          ],
        },
        {
          text: "eASS Job",
          icon: "clock",
          collapsible: true,
          children: [
            "server-agent/job/README.md",
          ],
        },
        {
          text: "eASS Message Queue",
          icon: "envelope",
          collapsible: true,
          children: [
            "server-agent/mq/README.md",
          ],
        },
        {
          text: "eASS Service",
          icon: "server",
          collapsible: true,
          children: [
            "server-agent/service/README.md",
          ],
        },
        {
          text: "eASS Utils",
          icon: "wrench",
          collapsible: true,
          children: [
            "server-agent/utils/README.md",
          ],
        },
        {
          text: "eASS Data Types",
          icon: "database",
          collapsible: true,
          children: [
            "server-agent/data-types/README.md",
          ],
        },
      ],
    },
    {
      text: "eisland Auth Services Server",
      icon: "key",
      collapsible: true,
      children: [
        {
          text: "eAuSS Controller",
          icon: "plug",
          collapsible: true,
          children: [
            "server-auth/auth-api/README.md",
            "server-auth/email-verification-api/README.md",
            "server-auth/feedback-api/README.md",
            "server-auth/admin-email-dlq-api/README.md",
          ],
        },
      ],
    },
    {
      text: "eisland Payment Services Server",
      icon: "credit-card",
      collapsible: true,
      children: [
        {
          text: "ePSS Controller",
          icon: "plug",
          collapsible: true,
          children: [
            "server-payment/user-payment-api/README.md",
            "server-payment/admin-payment-api/README.md",
            "server-payment/alipay-notify-api/README.md",
            "server-payment/wechat-pay-notify-api/README.md",
          ],
        },
      ],
    },
    {
      text: "eisland User Services Server",
      icon: "users",
      collapsible: true,
      children: [
        {
          text: "eUSS Controller",
          icon: "plug",
          collapsible: true,
          children: [
            "server-user/user-api/README.md",
            "server-user/user-admin-api/README.md",
            "server-user/app-user-api/README.md",
            "server-user/announcement-api/README.md",
            "server-user/identity-verification-api/README.md",
            "server-user/identity-admin-api/README.md",
            "server-user/toolbox-software-api/README.md",
            "server-user/wallpaper-user-api/README.md",
            "server-user/wallpaper-admin-api/README.md",
            "server-user/wallpaper-tag-api/README.md",
          ],
        },
      ],
    },
    {
      text: "eisland Mini Game Services Server",
      icon: "gamepad",
      collapsible: true,
      children: [
        {
          text: "eMGSS Controller",
          icon: "plug",
          collapsible: true,
          children: [
            "server-mini-game/mini-game-score-api/README.md",
          ],
        },
      ],
    },
    {
      text: "eisland Service Status Server",
      icon: "server",
      collapsible: true,
      children: [
        {
          text: "eSSS Controller",
          icon: "plug",
          collapsible: true,
          children: [
            "server-service-status/service-status-api/README.md",
          ],
        },
      ],
    },
    {
      text: "eisland Upload Services Server",
      icon: "upload",
      collapsible: true,
      children: [
        {
          text: "eUpSS Controller",
          icon: "plug",
          collapsible: true,
          children: [
            "server-upload/upload-api/README.md",
          ],
        },
      ],
    },
    {
      text: "eisland Version Services Server",
      icon: "tag",
      collapsible: true,
      children: [
        {
          text: "eVSS Controller",
          icon: "plug",
          collapsible: true,
          children: [
            "server-version/version-api/README.md",
          ],
        },
      ],
    },
    {
      text: "eisland Weather Services Server",
      icon: "cloud",
      collapsible: true,
      children: [
        {
          text: "eWSS Controller",
          icon: "plug",
          collapsible: true,
          children: [
            "server-weather/user-weather-api/README.md",
            "server-weather/admin-weather-api/README.md",
          ],
        },
      ],
    },
    {
      text: "eisland App Services Server",
      icon: "server",
      collapsible: true,
      children: [
        {
          text: "eApSS Config",
          icon: "gear",
          collapsible: true,
          children: [
            "server-app/README.md",
          ],
        },
      ],
    },
    {
      text: "eisland Common Services Server",
      icon: "toolbox",
      collapsible: true,
      children: [
        {
          text: "eCSS Utils",
          icon: "wrench",
          collapsible: true,
          children: [
            "server-common/README.md",
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
