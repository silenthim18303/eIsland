---
title: Testing Commands
icon: vial
---

# Testing Commands

:::info
This document covers the testing commands for running, filtering, and measuring test coverage in the eIsland frontend.
:::

All commands are run from the `web/` directory:

```bash
cd web
npm run <script>
```

## `npm run test`

Runs the full test suite once.

```bash
npm run test
```

**Configuration:** Vitest with:
- `environment: 'node'`
- `clearMocks: true` — mocks are cleared between tests
- `restoreMocks: true` — mocks are restored to their original implementation
- Test file pattern: `src/**/*.test.ts`

:::tip
For iterative development, use `npx vitest` (without `run`) to start Vitest in **watch mode** — it re-runs affected tests on file save.
:::

**When to use:**
- Before committing code
- In CI pipelines
- After pulling new changes to verify nothing is broken

## `npm run test:preload`

Runs only the preload bridge test file.

```bash
npm run test:preload
```

**Under the hood:** `vitest run src/preload/index.test.ts`

:::note
This is a subset of `npm run test`. Use it when modifying preload code for faster feedback — it skips all other test files.
:::

## `npm run test:coverage`

Runs the full test suite with an Istanbul coverage report.

```bash
npm run test:coverage
```

**Output:** Coverage report in the terminal and `coverage/` directory with HTML reports.

**When to use:**
- Before opening a PR to verify coverage thresholds
- Periodically to audit test gaps
- When adding new features to ensure they are tested

## Troubleshooting

### `npm run test` Fails After Pull

**Stale build artifacts:**

```bash
rm -rf out/ node_modules/
npm install
npm run test
```
