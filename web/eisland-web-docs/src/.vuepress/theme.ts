import { hopeTheme } from "vuepress-theme-hope";

import navbar from "./navbar.js";
import sidebar from "./sidebar.js";

export default hopeTheme({
  hostname: "https://docs.eisland.dev",

  author: {
    name: "eIsland",
  },

  logo: "/dark.png",
  logoDark: "/light.png",
  favicon: "/favicon.svg",

  docsDir: "src",

  navbar,
  sidebar,

  footer: false,
  displayFooter: false,

  encrypt: {},

  metaLocales: {
    editLink: "在 GitHub 上编辑此页",
  },

  markdown: {},

  plugins: {
    components: {
      components: ["Badge", "VPCard"],
    },

    icon: {
      prefix: "fa6-solid:",
    },
  },
});
