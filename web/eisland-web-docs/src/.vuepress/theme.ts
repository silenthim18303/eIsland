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
 * @file theme.ts
 * @description VuePress 主题配置
 * @author 鸡哥
 */

import { hopeTheme } from "vuepress-theme-hope";

import navbar from "./navbar.js";
import sidebar from "./sidebar.js";

export default hopeTheme({
  hostname: "https://eisland-dev.pyisland.com",
  docsRepo: "JNTMTMTM/eIsland",
  docsDir: "web/eisland-web-docs/src",
  docsBranch: "dev",

  contributors: true,
  changelog: true,

  author: {
    name: "JNTMTMTM",
    url: "https://github.com/JNTMTMTM",
    email: "work@mail.shicthrs.com",
  },

  logo: "/dark.png",
  logoDark: "/light.png",
  favicon: "/favicon.svg",
  darkmode: "enable",

  navbar,
  sidebar,

  footer: '苏ICP备2026009305号-2  |  <img src="/gabatb.png" alt="" style="height:1em;vertical-align:middle;margin-right:4px">苏公网安备32011502013770号',
  displayFooter: true,

  encrypt: {},

  metaLocales: {
    editLink: "Edit this page on GitHub",
  },

  markdown: {
    spoiler: true,
  },

  plugins: {
    components: {
      components: ["Badge", "VPCard"],
    },

    icon: {
      prefix: "fa6-solid:",
    },

    copyright: {
      global: true,
      triggerLength: 40,
      author: "JNTMTMTM",
      license: "GPL-3.0",
    },

    watermark: {
      enabled: false,
      watermarkOptions: {
        content: "eIsland developers docs",
      },
    },

    git: {
      createdTime: true,
      updatedTime: true,
      contributors: true,
      changelog: true,
    },

    slimsearch: true
  },
});
