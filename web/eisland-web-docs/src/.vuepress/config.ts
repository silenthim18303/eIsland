import { defineUserConfig } from "vuepress";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  lang: "en-US",
  title: "eIsland developers docs",
  description: "Make eisland greater again",

  theme,
});
