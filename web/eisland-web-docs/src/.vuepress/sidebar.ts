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
  ],
});
