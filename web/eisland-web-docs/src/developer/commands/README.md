---
title: Development Commands
icon: terminal
---

# Development Commands

:::info
This section provides detailed documentation for the npm scripts defined in `package.json`, organized by functionality: development, testing, packaging, code quality, and release workflows.
:::

## Overview

The eIsland frontend uses **npm scripts** as the primary interface for development tasks. All scripts are defined in `web/package.json` and executed via `npm run <script>`.

:::note
For a quick reference of all commands, see [Frontend Setup — Development Commands](/developer/environment-setup/frontend-setup.md#development-commands). The documents below provide in-depth coverage of each command group.
:::

## Documents

| Document | Description |
|----------|-------------|
| [Development Commands](dev-commands.md) | `dev`, `build`, `preview` — building, running, and previewing the application |
| [Testing Commands](test-commands.md) | `test`, `test:preload`, `test:coverage` — running tests and measuring coverage |
| [Package Commands](package-commands.md) | `package`, `postinstall` — building installers and managing native modules |
| [Code Quality Commands](quality-commands.md) | `comment:check`, `i18n:check` — validating comment standards and i18n completeness |
| [Release Commands](release-commands.md) | `release:notes`, `changelog:generate`, `release:upload*` — changelogs and artifact uploads |
