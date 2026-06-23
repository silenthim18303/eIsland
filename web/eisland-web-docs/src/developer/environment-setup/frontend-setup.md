---
title: Frontend Setup
icon: layer-group
---

# Frontend Setup

:::info
This guide covers the environment configuration for eIsland frontend development, including toolchain installation, project setup, and IDE configuration.
:::

## Prerequisites

The eIsland frontend is an **Electron + React + TypeScript** desktop application. The following tools are required:

| Tool | Version | Purpose | Recommended |
|------|---------|---------|---------|
| **Node.js** | >= 22.x | JavaScript runtime | 25.6.0 |
| **npm** | >= 10.x | Package manager | 11.15.0 |
| **Git** | Latest | Version control | 2.53.0.windows.2 |

:::warning
Node.js 22+ is required because the project uses `--experimental-strip-types` for native TypeScript execution in build scripts.
:::

### Installing Node.js

**Windows (recommended — using nvm-windows):**

```bash
# Install nvm-windows from https://github.com/coreybutler/nvm-windows
nvm install 25
nvm use 25
node -v  # Should print v25.x.x
```

**Windows (alternative — direct download):**
:::note
Download the recommended version's installer from [nodejs.org v25.6.0](https://nodejs.org/en/blog/release/v25.6.0) and run it.
:::
:::important
Directly download Node.js v25.6.0 from [node-v25.6.0-x64.msi](https://nodejs.org/dist/v25.6.0/node-v25.6.0-x64.msi) and run it.
:::

**Verify installation:**

```bash
node -v   # v25.6.0 or later
npm -v    # 11.x.x or later
```

## Project Setup

### Clone and Install

```bash
# Clone the repository
git clone https://github.com/JNTMTMTM/eIsland.git
cd eIsland

# Switch to dev branch
git checkout dev

# Install dependencies
npm install
```

:::tip
The `postinstall` script automatically runs `electron-builder install-app-deps` to rebuild native modules for Electron's Node.js version.
:::

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development mode with hot reload |
| `npm run build` | Build all three targets (main, preload, renderer) |
| `npm run preview` | Preview the built application |
| `npm run test` | Run all tests with Vitest |
| `npm run test:preload` | Run preload script tests only |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run package` | Build and package into installer (NSIS) |

### Development Mode

```bash
npm run dev
```

This starts **electron-vite** which:

1. Compiles the main process with Vite
2. Compiles the preload scripts
3. Starts a Vite dev server for the renderer with React Fast Refresh
4. Launches Electron with hot reload

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npx vitest

# Run with coverage
npm run test:coverage
```

The project uses **Vitest** with `node` environment. Test files follow the pattern `src/**/*.test.ts`.

## Build System

### Electron-Vite Configuration

The project uses **electron-vite** to manage three separate build targets:

| Target | Entry | Output | Description |
|--------|-------|--------|-------------|
| **main** | `src/main/index.ts`, `src/main/smtcWorker.ts` | `out/main` | Node.js main process |
| **preload** | `src/preload/index.ts` | `out/preload` | Context bridge |
| **renderer** | `index.html`, `standalone.html`, `AIbackground.html` | `out/renderer` | React UI (3 HTML entries) |

### Key Build Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `electron-vite` | ^3.0.0 | Unified build toolchain |
| `vite` | ^6.3.5 | Build engine |
| `@vitejs/plugin-react` | ^4.5.2 | React Fast Refresh |
| `@tailwindcss/vite` | ^4.2.2 | Tailwind CSS v4 integration |
| `electron-builder` | ^26.0.12 | Application packaging |

### Packaging

```bash
npm run package
```

This runs `electron-vite build` followed by `electron-builder` to produce a Windows NSIS installer in the `dist/` directory.

**Output:** `dist/eIsland-{version}-Setup.exe`

## TypeScript Configuration

The project uses a **multi-config** setup with project references:

| Config | Scope | Description |
|--------|-------|-------------|
| `tsconfig.json` | Root | References `tsconfig.node.json` and `tsconfig.web.json` |
| `tsconfig.node.json` | Main + Preload | Node.js target, CommonJS modules |
| `tsconfig.web.json` | Renderer | Browser target, `react-jsx`, bundler module resolution |

**Renderer path alias:**

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/renderer/*"]
    }
  }
}
```

Usage in renderer code:

```ts
import { useIslandStore } from '@/store/useIslandStore';
```

## Key Dependencies

### Runtime

| Package | Purpose |
|---------|---------|
| `electron` | Desktop application shell |
| `react`, `react-dom` | UI framework |
| `zustand` | Global state management |
| `gsap`, `@gsap/react` | Programmatic animations |
| `tailwindcss` | Utility-first CSS |
| `i18next`, `react-i18next` | Internationalization |
| `highcharts` | Data visualization |
| `react-markdown`, `remark-gfm` | Markdown rendering |
| `dompurify` | XSS prevention |
| `electron-updater` | Auto-update |

### Development

| Package | Purpose |
|---------|---------|
| `typescript` | Static type checking |
| `vitest` | Unit testing |
| `@types/react`, `@types/react-dom` | React type definitions |
| `lucide-react` | Icon library |

## IDE Configuration

### VS Code (Recommended)

**Required extensions:**

| Extension | Purpose |
|-----------|---------|
| [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) | JavaScript/TypeScript linting |
| [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) | Code formatting |
| [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) | Tailwind class autocomplete |
| [Vitest](https://marketplace.visualstudio.com/items?itemName=ZixuanChen.vitest-explorer) | Test runner UI |

**Recommended settings (`.vscode/settings.json`):**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Verifying the Setup

After completing the setup, verify everything works:

```bash
# 1. Check Node.js version
node -v  # Should be v22+ (project uses v25.6.0)

# 2. Install dependencies
npm install

# 3. Run tests
npm run test

# 4. Start development mode
npm run dev
```

:::tip
If `npm run dev` launches the Electron window with the dynamic island visible, your frontend development environment is ready.
:::

## Troubleshooting

### Native Module Errors

If you see errors about native modules (e.g., `@coooookies/windows-smtc-monitor`):

```bash
# Rebuild native modules for Electron
npx electron-builder install-app-deps
```

### TypeScript Errors After Pull

If you see TypeScript errors after pulling new changes:

```bash
# Clean build artifacts and reinstall
rm -rf out/ node_modules/
npm install
npm run build
```

### Electron Launch Fails

If Electron fails to launch in dev mode:

```bash
# Check if port is in use (default: 5173 for renderer)
netstat -ano | findstr :5173

# Kill the process if needed, then retry
npm run dev
```
