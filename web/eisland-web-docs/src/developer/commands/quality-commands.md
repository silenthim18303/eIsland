---
title: Code Quality Commands
icon: check-double
---

# Code Quality Commands

:::info
This document covers the code quality commands for validating comment standards and i18n completeness in the eIsland frontend.
:::

All commands are run from the `web/` directory:

```bash
cd web
npm run <script>
```

:::warning
Both commands use `node --experimental-strip-types` for native TypeScript execution. This requires **Node.js 22+**. See [Frontend Setup — Prerequisites](/developer/environment-setup/frontend-setup.md#prerequisites).
:::

## `comment:check`

Validates that source files comply with the project's comment standards.

```bash
npm run comment:check
```

**Under the hood:** `node --experimental-strip-types scripts/check-comment-standards.ts`

**What it checks:**
- JSDoc headers on exported functions and classes
- Inline comments for complex logic
- Compliance with project documentation conventions

:::important
Run this before committing. CI will reject PRs that fail the comment check.
:::

## `i18n:check`

Validates i18n completeness — checks that all `t()` keys exist in both `zh-CN.json` and `en-US.json`.

```bash
npm run i18n:check
```

**Under the hood:** `node --experimental-strip-types scripts/check-i18n-completeness.ts`

**When to use:**
- After any UI change that adds or modifies `t()` translation calls
- Before committing to catch missing translations early

:::tip
Run this after adding new UI text. A missing translation key will show a runtime fallback (usually the key name itself), which looks broken to users.
:::

## Troubleshooting

### Fails with Syntax Error

**Node.js version too old:**

```bash
node -v  # Must be v22+

# If using nvm-windows
nvm install 25
nvm use 25
```

:::important
Both `comment:check` and `i18n:check` use `--experimental-strip-types` (Node.js 22+ native TypeScript execution). Older Node.js versions will fail with syntax errors on TypeScript annotations.
:::
