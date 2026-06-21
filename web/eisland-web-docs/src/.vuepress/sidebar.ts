import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/": [
    "",
  ],
  "/introduction/": [
    {
      text: "Introduction",
      icon: "info",
      collapsible: true,
      children: [
        "README.md",
        "coc.md",
      ],
    },
    {
      text: "Tech Stack",
      icon: "layer-group",
      collapsible: true,
      children: [
        "frontend-tech-stack.md",
        "backend-tech-stack.md",
        "plugins-tech-stack.md"
      ],
    },
  ],
});
