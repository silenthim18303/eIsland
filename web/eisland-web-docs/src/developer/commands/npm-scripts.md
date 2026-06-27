---
title: NPM Scripts Reference
icon: list-check
---

# NPM Scripts Reference

:::info
This document provides a complete reference for all npm scripts in `web/package.json`. For environment setup and prerequisites, see [Frontend Setup](/developer/environment-setup/frontend-setup.md). For a quick command overview, see [Frontend Setup — Development Commands](/developer/environment-setup/frontend-setup.md#development-commands).
:::

## Quick Reference

All commands are run from the `web/` directory:

```bash
cd web
npm run <script>
```

| Script | Command | Category |
|--------|---------|----------|
| `dev` | `electron-vite dev` | Development |
| `build` | `electron-vite build` | Development |
| `preview` | `electron-vite preview` | Development |
| `test` | `vitest run` | Testing |
| `test:preload` | `vitest run src/preload/index.test.ts` | Testing |
| `test:coverage` | `vitest run --coverage` | Testing |
| `postinstall` | `electron-builder install-app-deps` | Lifecycle |
| `package` | `electron-vite build && electron-builder` | Packaging |
| `comment:check` | `scripts/check-comment-standards.ts` | Code Quality |
| `i18n:check` | `scripts/check-i18n-completeness.ts` | Code Quality |
| `release:notes` | `scripts/generate-incremental-release-notes.ts` | Release |
| `changelog:generate` | `scripts/generate-changelog.ts` | Release |
| `release:upload` | `npm run package && scripts/upload-release-to-cos-oss.ts` | Release |
| `release:upload-only` | `scripts/upload-release-to-cos-oss.ts` | Release |
| `release:upload-minio` | `scripts/upload-release-to-cos-oss.ts --minio-only` | Release |

:::warning
All scripts that invoke `.ts` files use `node --experimental-strip-types` for native TypeScript execution. This requires **Node.js 22+**. See [Frontend Setup — Prerequisites](/developer/environment-setup/frontend-setup.md#prerequisites) for installation instructions.
:::

## Development

### `npm run dev`

Starts the application in development mode with hot reload.

```bash
npm run dev
```

**Under the hood:**

| Step | Process | Output |
|------|---------|--------|
| 1 | Compiles `src/main/` with electron-vite | `out/main/` |
| 2 | Compiles `src/preload/` with electron-vite | `out/preload/` |
| 3 | Starts Vite dev server for `src/renderer/` | `http://localhost:5173` |
| 4 | Launches Electron pointing at the dev server | Desktop window |

:::tip
The renderer uses **React Fast Refresh** — component state is preserved across edits. Main process changes trigger an automatic Electron restart.
:::

**Common issues:**

| Problem | Cause | Solution |
|---------|-------|----------|
| Port 5173 in use | Another process占用了端口 | `netstat -ano \| findstr :5173` then `taskkill /PID <pid> /F` |
| White screen | Renderer dev server not ready | Wait a few seconds; Vite needs time to bundle on first run |
| Native module errors | Modules not rebuilt for Electron | Run `npx electron-builder install-app-deps` |

### `npm run build`

Builds all three targets (main, preload, renderer) into the `out/` directory.

```bash
npm run build
```

**Output structure:**

```text
out/
├── main/          # Compiled main process (Node.js)
├── preload/       # Compiled preload scripts
└── renderer/      # Compiled React UI (3 HTML entries)
```

:::info
This command produces a production-ready build but does **not** create an installer. Use `npm run package` to produce a distributable `.exe` installer.
:::

**When to use:**
- Before running `npm run preview` to verify the production build
- When CI needs a clean build artifact
- To debug production-only issues locally

### `npm run preview`

Previews the built application without the Vite dev server.

```bash
npm run preview
```

:::important
You must run `npm run build` first. `npm run preview` serves the pre-built files from `out/` — it does not rebuild.
:::

**When to use:**
- Verify the production build works correctly before packaging
- Debug issues that only appear outside of dev mode (e.g., CSP violations, missing assets)

## Testing

### `npm run test`

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

### `npm run test:preload`

Runs only the preload bridge test file.

```bash
npm run test:preload
```

**Under the hood:** `vitest run src/preload/index.test.ts`

:::note
This is a subset of `npm run test`. Use it when modifying preload code for faster feedback — it skips all other test files.
:::

### `npm run test:coverage`

Runs the full test suite with an Istanbul coverage report.

```bash
npm run test:coverage
```

**Output:** Coverage report in the terminal and `coverage/` directory with HTML reports.

**When to use:**
- Before opening a PR to verify coverage thresholds
- Periodically to audit test gaps
- When adding new features to ensure they are tested

## Packaging

### `npm run package`

Builds the application and packages it into a Windows NSIS installer.

```bash
npm run package
```

**Under the hood:**

```text
1. electron-vite build        → out/
2. electron-builder           → dist/eIsland-{version}-Setup.exe
```

**Output:** `dist/eIsland-{version}-Setup.exe`

:::warning
This command requires **Visual Studio Build Tools 2022** with the "Desktop development with C++" workload for compiling native modules. See [Frontend Setup — Install Dependencies](/developer/environment-setup/frontend-setup.md#install-dependencies).
:::

**When to use:**
- Local testing — verify the installer builds correctly on your machine
- Before a release — ensure the installer is functional

## Code Quality

### `comment:check`

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

### `i18n:check`

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

## Release

:::danger
Release commands (`release:upload`, `release:upload-only`, `release:upload-minio`) are for **maintainer use only**. Regular developers do not have permission to upload build artifacts to remote storage (COS / MinIO). Use `npm run package` locally to verify the installer build, but do not run `release:upload*` commands.
:::

### `release:notes`

Generates incremental release notes from git history since the last tag.

```bash
npm run release:notes
```

**Under the hood:** `node --experimental-strip-types scripts/generate-incremental-release-notes.ts -o RELEASE_NOTES_SINCE_LAST_TAG.md`

**Output:** `RELEASE_NOTES_SINCE_LAST_TAG.md` in the project root.

**When to use:**
- After merging PRs, before creating a release
- To review what changes will be included in the next release

### `changelog:generate`

Generates a full changelog from the entire git history.

```bash
npm run changelog:generate
```

**Under the hood:** `node --experimental-strip-types scripts/generate-changelog.ts -o docs/CHANGE_LOG.md`

**Output:** `docs/CHANGE_LOG.md`

:::note
Unlike `release:notes` (incremental), this regenerates the complete changelog. Use it for periodic maintenance, not for every release.
:::

### `release:upload`

Packages the application and uploads release artifacts to COS (Cloud Object Storage).

```bash
npm run release:upload
```

**Under the hood:** `npm run package && node --experimental-strip-types scripts/upload-release-to-cos-oss.ts`

**When to use:**
- **Maintainer only** — publish a new release to CDN

### `release:upload-only`

Uploads existing build artifacts to COS without rebuilding.

```bash
npm run release:upload-only
```

**Under the hood:** `node --experimental-strip-types scripts/upload-release-to-cos-oss.ts`

**When to use:**
- **Maintainer only** — re-upload a previously built package (e.g., after a CDN issue)

:::tip
Use this instead of `release:upload` when you have already built the package and just need to re-upload. It skips the build step, saving time.
:::

### `release:upload-minio`

Uploads artifacts to MinIO storage for internal/self-hosted distribution.

```bash
npm run release:upload-minio
```

**Under the hood:** `node --experimental-strip-types scripts/upload-release-to-cos-oss.ts --minio-only`

**When to use:**
- **Maintainer only** — internal/self-hosted release distribution

## Lifecycle Hooks

### `postinstall`

Runs automatically after `npm install`. You should never run this manually.

```bash
# This runs automatically — do not invoke manually
npm run postinstall
```

**Under the hood:** `electron-builder install-app-deps`

**What it does:**
- Rebuilds native modules (e.g., `windows-smtc-monitor`, `windows-fullscreen-detector`) for Electron's Node.js version
- Ensures native addons are ABI-compatible with the Electron runtime

:::warning
If you see native module errors after `npm install`, the `postinstall` hook may have failed. Run `npx electron-builder install-app-deps` manually to rebuild. See [Frontend Setup — Native Module Errors](/developer/environment-setup/frontend-setup.md#native-module-errors).
:::

## Typical Workflows

### Daily Development

```bash
# Start the app in dev mode
npm run dev

# In another terminal — run tests in watch mode
npx vitest

# Before committing
npm run test
npm run comment:check
npm run i18n:check
```

### Before Opening a PR

```bash
# Run the full test suite with coverage
npm run test:coverage

# Verify the production build
npm run build
npm run preview

# Package and verify the installer (optional)
npm run package
```

### After Pulling New Changes

```bash
# Install any new dependencies (triggers postinstall)
npm install

# Verify nothing is broken
npm run test

# If you see native module errors
npx electron-builder install-app-deps
```

## Troubleshooting

### `npm run dev` Fails to Start

**Port already in use:**

```bash
netstat -ano | findstr :5173
taskkill /PID <process-id> /F
npm run dev
```

**Native module errors:**

```bash
npx electron-builder install-app-deps
npm run dev
```

### `npm run test` Fails After Pull

**Stale build artifacts:**

```bash
rm -rf out/ node_modules/
npm install
npm run test
```

### `npm run package` Fails

**Missing build tools:**

:::warning
`npm run package` requires Visual Studio Build Tools 2022 with the "Desktop development with C++" workload and .NET 10 SDK. See [Frontend Setup — Install Dependencies](/developer/environment-setup/frontend-setup.md#install-dependencies).
:::

```bash
# Verify build tools are installed
# 1. Open Visual Studio Installer
# 2. Check "Desktop development with C++" workload is installed
# 3. Install .NET 10 SDK from https://dotnet.microsoft.com/download/dotnet/10.0

# Then retry
npm run package
```

### `comment:check` or `i18n:check` Fails with Syntax Error

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
