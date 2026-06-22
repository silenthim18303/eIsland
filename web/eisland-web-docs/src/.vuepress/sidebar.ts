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
        "README.md",
        "coc.md",
      ],
    },
    {
      text: "Tech Stack",
      icon: "book-atlas",
      collapsible: false,
      children: [
        "frontend-tech-stack.md",
        "backend-tech-stack.md",
        "plugins-tech-stack.md"
      ],
    },
    {
      text: "Architecture",
      icon: "building",
      collapsible: false,
      children: [
        "process-model",
        "states.md",
      ],
    },
  ],
});
