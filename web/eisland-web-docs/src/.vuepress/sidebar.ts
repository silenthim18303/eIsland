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
      text: "Getting Started",
      icon: "rocket",
      collapsible: false,
      children: [
        "getting-started/environment-setup.md",
        "getting-started/project-setup.md",
      ],
    },
    {
      text: "Guides",
      icon: "book",
      collapsible: false,
      children: [
        "guides/development-workflow.md",
        "guides/plugin-development.md",
        "guides/debugging-guide.md",
      ],
    },
    {
      text: "Standards",
      icon: "scale-balanced",
      collapsible: false,
      children: [
        "standards/coding-standards.md",
        "standards/documentation-standards.md",
        "standards/commit-conventions.md",
      ],
    },
    {
      text: "Testing",
      icon: "vial",
      collapsible: false,
      children: [
        "testing/testing-overview.md",
        "testing/frontend-testing.md",
        "testing/backend-testing.md",
      ],
    },
  ],
});
