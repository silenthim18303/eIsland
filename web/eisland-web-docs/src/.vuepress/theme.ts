import { hopeTheme } from "vuepress-theme-hope";

import navbar from "./navbar.js";
import sidebar from "./sidebar.js";

export default hopeTheme({
  hostname: "https://dev.pyisland.com",
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
