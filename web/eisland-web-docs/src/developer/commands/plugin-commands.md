---
title: Plugin Commands
icon: plug
---

# Plugin Commands

:::info
This document covers all build, test, and smoke commands for eIsland native plugins. Each plugin lives under `plugins/` and has its own `package.json` with independent scripts.
:::

## Overview

All commands are run from the individual plugin directory:

```bash
cd plugins/<plugin-name>
npm run <script>
```

| Plugin | Directory | Language | Build Tool | Tests | Smoke |
|--------|-----------|----------|------------|-------|-------|
| **Fullscreen Detector** | `windows-fullscreen-detector` | C | node-gyp | ✅ | ✅ |
| **Performance Monitor** | `windows-performance-monitor` | C + C# | node-gyp + dotnet | ✅ | ✅ |
| **Processes Attacker** | `eisland-windows-processes-attacker` | C | node-gyp | ❌ | ❌ |
| **Toast Listener** | `eisland-windows-toast-listener` | C++ | node-gyp | ✅ | ✅ |
| **SMTC Helper** | `eisland-windows-smtc-helper` | C# | dotnet | ✅ | ✅ |

## Common Commands

All plugins share these three build commands:

| Command | Description | When to Use |
|---------|-------------|-------------|
| `npm run build` | Build the plugin | First build, or after source code changes |
| `npm run clean` | Remove build artifacts | Free disk space, or troubleshoot build issues |
| `npm run rebuild` | Clean + build | After modifying `binding.gyp`, `.csproj`, or adding new source files |

:::warning
After modifying `binding.gyp` (e.g., adding a new source file or library), always run `npm run rebuild` — a regular `npm run build` may use cached artifacts.
:::

---

## Windows Fullscreen Detector

**Directory:** `plugins/windows-fullscreen-detector` &nbsp;|&nbsp; **Language:** C &nbsp;|&nbsp; **Build:** `node-gyp rebuild`

### Build

| Command | Script | Description |
|---------|--------|-------------|
| `npm run build` | `node-gyp rebuild` | Compile the native addon |
| `npm run clean` | `node-gyp clean` | Remove `build/` directory |
| `npm run rebuild` | `node-gyp clean && node-gyp rebuild` | Full clean build |

### Test

| Command | Script | Description |
|---------|--------|-------------|
| `npm test` | `vitest run` | All tests — shape validation, export verification |
| `npm run test:polling` | `vitest run test/fullscreen-detector.polling.test.ts` | Polling-mode tests only |

### Smoke

| Command | Script | Description |
|---------|--------|-------------|
| `npm run smoke` | `node --experimental-strip-types test/fullscreen-detector.smoke.ts` | Full smoke — `getFullscreenWindows()`, `isAnyFullscreenWindow()` |
| `npm run smoke:polling` | `node --experimental-strip-types test/fullscreen-detector.polling.smoke.ts` | Polling smoke — multiple reads over time |

---

## Windows Performance Monitor

**Directory:** `plugins/windows-performance-monitor` &nbsp;|&nbsp; **Language:** C + C# &nbsp;|&nbsp; **Build:** `node-gyp rebuild && dotnet build`

:::note
This plugin has a dual build: the C addon is compiled by node-gyp, and the .NET temperature helper is compiled by `dotnet build`.
:::

### Build

| Command | Script | Description |
|---------|--------|-------------|
| `npm run build` | `node-gyp rebuild && dotnet build temperature-helper/...csproj -c Release` | Build C addon + .NET helper |
| `npm run clean` | `node-gyp clean && dotnet clean temperature-helper/...csproj` | Remove all build artifacts |
| `npm run rebuild` | `node-gyp clean && node-gyp rebuild && dotnet build temperature-helper/...csproj -c Release` | Full clean build |

### Test

| Command | Script | Description |
|---------|--------|-------------|
| `npm test` | `vitest run` | All tests — CPU, memory, temperature, hardware shape validation |

### Smoke

| Command | Script | Description |
|---------|--------|-------------|
| `npm run smoke` | `node --experimental-strip-types test/performance-monitor.smoke.ts` | Full smoke — `getCpu()`, `getMemory()`, `getTemperature()`, `getHardwareList()` |
| `npm run smoke:polling` | `node --experimental-strip-types test/performance-monitor.polling.smoke.ts` | Polling smoke — multiple reads over time |

---

## Windows Processes Attacker

**Directory:** `plugins/eisland-windows-processes-attacker` &nbsp;|&nbsp; **Language:** C &nbsp;|&nbsp; **Build:** `node-gyp rebuild`

:::warning
This plugin has no automated tests or smoke scripts. Test manually by running the built module.
:::

### Build

| Command | Script | Description |
|---------|--------|-------------|
| `npm run build` | `node-gyp rebuild` | Compile the native addon |
| `npm run clean` | `node-gyp clean` | Remove `build/` directory |
| `npm run rebuild` | `node-gyp clean && node-gyp rebuild` | Full clean build |

---

## Windows Toast Listener

**Directory:** `plugins/eisland-windows-toast-listener` &nbsp;|&nbsp; **Language:** C++ &nbsp;|&nbsp; **Build:** `node-gyp rebuild`

### Build

| Command | Script | Description |
|---------|--------|-------------|
| `npm run build` | `node-gyp rebuild` | Compile the native addon |
| `npm run clean` | `node-gyp clean` | Remove `build/` directory |
| `npm run rebuild` | `node-gyp clean && node-gyp rebuild` | Full clean build |

### Test

| Command | Script | Description |
|---------|--------|-------------|
| `npm test` | `vitest run` | All tests (polling mode) |
| `npm run test:polling` | `vitest run test/windows-toast-listener.polling.test.ts` | Polling-mode tests only |

### Smoke

| Command | Script | Description |
|---------|--------|-------------|
| `npm run smoke` | `node --experimental-strip-types test/windows-toast-listener.smoke.ts` | Basic smoke — `getNotifications()`, access status |
| `npm run smoke:polling` | `node --experimental-strip-types test/windows-toast-listener.polling.smoke.ts` | Polling smoke — watch for notification changes |
| `npm run smoke:event` | `node --experimental-strip-types test/windows-toast-listener.event.smoke.ts` | Event-driven smoke — `startListening()` callback |
| `npm run smoke:suppression` | `node --experimental-strip-types test/windows-toast-listener.suppression.smoke.ts` | Suppression smoke — `enableSuppression()`/`disableSuppression()` |

### CLI Tools

| Command | Script | Description |
|---------|--------|-------------|
| `npm run cli:suppression` | `node --experimental-strip-types test/windows-toast-listener.suppression.cli.ts` | Interactive CLI for toast suppression testing |

---

## Windows SMTC Helper

**Directory:** `plugins/eisland-windows-smtc-helper` &nbsp;|&nbsp; **Language:** C# (.NET) &nbsp;|&nbsp; **Build:** `dotnet build` / `dotnet publish`

:::info
This is a pure .NET plugin with two build targets: a console exe (for Node.js) and a NativeAOT DLL (for Python ctypes / FFI).
:::

### Build

| Command | Script | Description |
|---------|--------|-------------|
| `npm run build` | `dotnet build src/eIslandSmtcHelper.csproj -c Release` | Build the .NET console exe |
| `npm run build:ctypes` | `dotnet publish smtc-ctypes/eIslandSmtcCtypes.csproj -c Release -r win-x64` | Build the NativeAOT DLL for ctypes |
| `npm run build:all` | `npm run build && npm run build:ctypes` | Build both exe and DLL |
| `npm run clean` | `dotnet clean src/... + dotnet clean smtc-ctypes/...` | Remove all build artifacts |
| `npm run rebuild` | `npm run clean && npm run build:all` | Full clean build (exe + DLL) |

### Test

| Command | Script | Description |
|---------|--------|-------------|
| `npm test` | `vitest run` | All tests — export verification, status shape, all commands |
| `npm run test:play` | `vitest run test/smtc-helper.play.test.ts` | Play command tests only |
| `npm run test:pause` | `vitest run test/smtc-helper.pause.test.ts` | Pause command tests only |
| `npm run test:next` | `vitest run test/smtc-helper.next.test.ts` | Next command tests only |
| `npm run test:previous` | `vitest run test/smtc-helper.previous.test.ts` | Previous command tests only |
| `npm run test:ctypes` | `python test/smtc_ctypes_test.py` | Python ctypes test (requires `build:ctypes` first) |

### Smoke

| Command | Script | Description |
|---------|--------|-------------|
| `npm run smoke` | `node --experimental-strip-types test/smtc-helper.smoke.ts` | Full smoke — all 5 commands + formatted output |
| `npm run smoke:play` | `node --experimental-strip-types test/smtc-helper.play.smoke.ts` | Play smoke — `getStatus()` → `play()` → `getStatus()` |
| `npm run smoke:pause` | `node --experimental-strip-types test/smtc-helper.pause.smoke.ts` | Pause smoke — `getStatus()` → `pause()` → `getStatus()` |
| `npm run smoke:next` | `node --experimental-strip-types test/smtc-helper.next.smoke.ts` | Next smoke — `getStatus()` → `next()` → `getStatus()` |
| `npm run smoke:previous` | `node --experimental-strip-types test/smtc-helper.previous.smoke.ts` | Previous smoke — `getStatus()` → `previous()` → `getStatus()` |
| `npm run smoke:status` | `node --experimental-strip-types test/smtc-helper.status.smoke.ts` | Status-only smoke — `getStatus()` with formatted output |
| `npm run smoke:seek` | `node --experimental-strip-types test/smtc-helper.seek.smoke.ts` | Seek + extended controls — seek, stop, shuffle, repeat, rate |
| `npm run smoke:monitor` | `node --experimental-strip-types test/smtc-helper.monitor.smoke.ts` | Monitor smoke — event-driven session tracking for 8s |

---

## Quick Reference

### All Build Commands

| Plugin | Command |
|--------|---------|
| Fullscreen Detector | `cd plugins/windows-fullscreen-detector && npm run build` |
| Performance Monitor | `cd plugins/windows-performance-monitor && npm run build` |
| Processes Attacker | `cd plugins/eisland-windows-processes-attacker && npm run build` |
| Toast Listener | `cd plugins/eisland-windows-toast-listener && npm run build` |
| SMTC Helper (exe) | `cd plugins/eisland-windows-smtc-helper && npm run build` |
| SMTC Helper (DLL) | `cd plugins/eisland-windows-smtc-helper && npm run build:ctypes` |
| SMTC Helper (all) | `cd plugins/eisland-windows-smtc-helper && npm run build:all` |
| **All plugins** | `npm install` (from root — triggers `electron-builder install-app-deps`) |

### All Test Commands

| Plugin | Commands |
|--------|----------|
| Fullscreen Detector | `npm test` · `npm run test:polling` |
| Performance Monitor | `npm test` |
| Processes Attacker | _(no tests)_ |
| Toast Listener | `npm test` · `npm run test:polling` |
| SMTC Helper | `npm test` · `npm run test:play` · `npm run test:pause` · `npm run test:next` · `npm run test:previous` · `npm run test:ctypes` |

### All Smoke Commands

| Plugin | Commands |
|--------|----------|
| Fullscreen Detector | `npm run smoke` · `npm run smoke:polling` |
| Performance Monitor | `npm run smoke` · `npm run smoke:polling` |
| Processes Attacker | _(no smoke)_ |
| Toast Listener | `npm run smoke` · `npm run smoke:polling` · `npm run smoke:event` · `npm run smoke:suppression` |
| SMTC Helper | `npm run smoke` · `npm run smoke:play` · `npm run smoke:pause` · `npm run smoke:next` · `npm run smoke:previous` · `npm run smoke:status` · `npm run smoke:seek` · `npm run smoke:monitor` |
