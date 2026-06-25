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
  ],
});
