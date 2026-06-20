import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  lang: "zh-CN",
  title: "eIsland 文档",
  description: "eIsland 文档站",

  theme,
});
