---
name: eisland-dev-update-docs
description: >
  Update or create documentation in the eIsland VuePress docs site (web/eisland-web-docs).
  Use this skill whenever the user asks to update docs, add documentation, write a doc article,
  document a feature, update the tech stack docs, update plugin docs, update command docs,
  or any task involving files under web/eisland-web-docs/src/. This skill ensures all documentation
  follows the project's CLAUDE.md constraints, uses correct admonition syntax, maintains consistent
  style with existing articles, and properly updates sidebar.ts and README.md indexes.
---

# Update Docs

This skill guides documentation updates for the eIsland VuePress docs site located at `web/eisland-web-docs/`.

## Core Rules

These rules come from the project's `CLAUDE.md` and must be followed strictly:

1. **Language**: All documentation content must be written in **English**. No Chinese text allowed.
2. **Admonitions**: Every documentation file MUST use admonition syntax. Each file should include at least one admonition block (`:::tip`, `:::info`, `:::note`, `:::important`, `:::warning`, `:::danger`, or `:::details`). Use a variety of admonition types — do not rely on a single type.
3. **Sidebar**: Do NOT register `README.md` files in the sidebar. VuePress automatically uses each subdirectory's `README.md` as the category index page.
4. **Frontmatter**: Every doc file must have YAML frontmatter with `title` and `icon` fields.
5. **Test Statistics**: When documenting test coverage, use accurate numbers from the latest test run: **125 test files**, **2068 tests**. Update these numbers when new test results show different counts.

## Documentation Structure

```
src/
├── introduction/                # Project introduction and architecture
│   ├── intro/                   # Project introduction
│   ├── tech-stack/              # Technology stack
│   ├── frontend-arch/           # Frontend architecture
│   └── backend-arch/            # Backend architecture
└── developer/                   # Developer guide
    ├── environment-setup/       # Environment configuration
    ├── guides/                  # Development workflows
    ├── standards/               # Coding and documentation standards
    ├── testing/                 # Testing strategies
    ├── commands/                # npm script reference
    └── git-operations/          # Git workflows
```

## Adding New Documentation

Follow these steps in order:

1. Place the file in the appropriate subdirectory under `web/eisland-web-docs/src/`
2. Add the file path to `src/.vuepress/sidebar.ts` under the correct group
3. Add a link to the file in the subdirectory's `README.md`
4. If creating a new subdirectory, create a `README.md` index for it

## File Template

Every new documentation file must follow this template:

```markdown
---
title: Document Title
icon: icon-name
---

# Document Title

:::info
This document covers [brief description of what this document explains]. For related information, see [Related Document](related-doc.md).
:::

## Section Heading

Content here with tables, code blocks, and admonitions.

:::tip
Helpful tips and best practices.
:::

:::warning
Important notices and cautions.
:::
```

## Style Guide

### Tables

Use tables for structured data — commands, configurations, comparisons, file listings:

```markdown
| Command | Script | Description |
|---------|--------|-------------|
| `npm run build` | `vite build` | Build for production |
```

### Code Blocks

Always specify the language:

````markdown
```bash
npm run build
```

```typescript
const x: string = "hello";
```

```json
{ "key": "value" }
```
````

### Admonition Types

Use the right admonition for the right context:

| Type | Use For |
|------|---------|
| `:::info` | Document introduction, general explanations |
| `:::tip` | Best practices, helpful shortcuts |
| `:::note` | Supplementary information, side notes |
| `:::important` | Key information users must be aware of |
| `:::warning` | Cautions, potential issues, breaking changes |
| `:::danger` | Critical security notes, destructive operations |
| `:::details` | Collapsible sections, long code references |

### Cross-References

Link to other documents using relative paths:

```markdown
See [Frontend Setup](/developer/environment-setup/frontend-setup.md) for details.
```

### Section Pattern for Command/Plugin Docs

For documents that describe commands or plugins, follow this pattern:

```markdown
## Feature Name

**Brief description** of what this feature does.

### Build / Usage

| Command | Script | Description |
|---------|--------|-------------|
| `npm run build` | `...` | Build description |

### Test

| Command | Script | Description |
|---------|--------|-------------|
| `npm test` | `vitest run` | Run all tests |

### Source Files

| File | Responsibility |
|------|---------------|
| `src/file.ts` | What this file does |
```

## Workflow

When updating documentation:

1. Read the existing file (if updating) or the target directory's README.md (if creating new)
2. Read `web/eisland-web-docs/CLAUDE.md` for constraints
3. Read 1-2 existing articles in the same directory for style reference
4. Write or update the content following the style guide above
5. Update `sidebar.ts` if adding a new file
6. Update the parent `README.md` if adding a new file
7. Verify all admonition blocks are properly closed
8. Verify no Chinese text is present in the content
