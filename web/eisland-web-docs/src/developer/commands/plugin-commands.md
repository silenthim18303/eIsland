---
title: Plugin Commands
icon: toolbox
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

| Plugin | Directory | Build Tool | Has Tests |
|--------|-----------|------------|-----------|
| **Fullscreen Detector** | `windows-fullscreen-detector` | node-gyp (C) | ✅ |
| **Performance Monitor** | `windows-performance-monitor` | node-gyp (C) + dotnet (.NET) | ✅ |
| **Processes Attacker** | `eisland-windows-processes-attacker` | node-gyp (C) | ❌ |
| **Toast Listener** | `eisland-windows-toast-listener` | node-gyp (C++) | ✅ |
| **SMTC Helper** | `eisland-windows-smtc-helper` | dotnet (.NET) | ✅ |

## Common Commands

All plugins share these three build commands:

| Command | Description |
|---------|-------------|
| `npm run build` | Build the plugin (compile native code / .NET project) |
| `npm run clean` | Remove build artifacts |
| `npm run rebuild` | Clean + build (required after changing `binding.gyp` or `.csproj`) |

:::warning
After modifying `binding.gyp` (e.g., adding a new source file or library), always run `npm run rebuild` — a regular `npm run build` may use cached artifacts.
:::

---

## Windows Fullscreen Detector

**Directory:** `plugins/windows-fullscreen-detector`

**Build command:** `node-gyp rebuild`

### Build

```bash
npm run build       # node-gyp rebuild
npm run clean       # node-gyp clean
npm run rebuild     # node-gyp clean && node-gyp rebuild
```

### Test

```bash
npm test            # vitest run — shape validation, export verification
npm run test:polling # vitest run — polling-mode tests
```

### Smoke

```bash
npm run smoke          # Full smoke test — getFullscreenWindows(), isAnyFullscreenWindow()
npm run smoke:polling  # Polling smoke test — multiple reads over time
```

---

## Windows Performance Monitor

**Directory:** `plugins/windows-performance-monitor`

**Build command:** `node-gyp rebuild && dotnet build temperature-helper/eIslandTemperatureReader.csproj -c Release`

:::note
This plugin has a dual build: the C addon is compiled by node-gyp, and the .NET temperature helper is compiled by `dotnet build`.
:::

### Build

```bash
npm run build       # node-gyp rebuild + dotnet build
npm run clean       # node-gyp clean + dotnet clean
npm run rebuild     # node-gyp clean + rebuild + dotnet build
```

### Test

```bash
npm test            # vitest run — CPU, memory, temperature, hardware shape validation
```

### Smoke

```bash
npm run smoke          # Full smoke test — getCpu(), getMemory(), getTemperature(), getHardwareList()
npm run smoke:polling  # Polling smoke test — multiple reads over time
```

---

## Windows Processes Attacker

**Directory:** `plugins/eisland-windows-processes-attacker`

**Build command:** `node-gyp rebuild`

:::warning
This plugin has no automated tests or smoke scripts. Test manually by running the built module.
:::

### Build

```bash
npm run build       # node-gyp rebuild
npm run clean       # node-gyp clean
npm run rebuild     # node-gyp clean && node-gyp rebuild
```

---

## Windows Toast Listener

**Directory:** `plugins/eisland-windows-toast-listener`

**Build command:** `node-gyp rebuild`

### Build

```bash
npm run build       # node-gyp rebuild
npm run clean       # node-gyp clean
npm run rebuild     # node-gyp clean && node-gyp rebuild
```

### Test

```bash
npm test            # vitest run — all tests (polling mode)
npm run test:polling # vitest run — polling-mode tests only
```

### Smoke

```bash
npm run smoke              # Basic smoke test — getNotifications(), access status
npm run smoke:polling      # Polling smoke test — watch for notification changes
npm run smoke:event        # Event-driven smoke test — startListening() callback
npm run smoke:suppression  # Toast suppression test — enableSuppression()/disableSuppression()
```

### CLI Tools

```bash
npm run cli:suppression    # CLI tool for interactive toast suppression testing
```

---

## Windows SMTC Helper

**Directory:** `plugins/eisland-windows-smtc-helper`

**Build command:** `dotnet build src/eIslandSmtcHelper.csproj -c Release`

:::info
This is a pure .NET plugin — no native addon or `node-gyp`. Uses `Windows.Media.Control` WinRT APIs.
:::

### Build

```bash
npm run build       # dotnet build -c Release
npm run clean       # dotnet clean
npm run rebuild     # dotnet clean + dotnet build -c Release
```

### Test

```bash
npm test            # vitest run — all tests (export, status shape, commands)
npm run test:play     # vitest run — play command tests only
npm run test:pause    # vitest run — pause command tests only
npm run test:next     # vitest run — next command tests only
npm run test:previous # vitest run — previous command tests only
```

### Smoke

```bash
npm run smoke           # Full smoke test — getStatus(), play(), pause(), next(), previous()
npm run smoke:play      # Play smoke — getStatus → play → getStatus
npm run smoke:pause     # Pause smoke — getStatus → pause → getStatus
npm run smoke:next      # Next smoke — getStatus → next → getStatus
npm run smoke:previous  # Previous smoke — getStatus → previous → getStatus
npm run smoke:status    # Status-only smoke — getStatus() with formatted output
```

---

## Quick Reference

### All Build Commands

```bash
# Build all plugins (from root)
npm install    # triggers electron-builder install-app-deps → node-gyp rebuild for each

# Build individual plugins
cd plugins/windows-fullscreen-detector && npm run build
cd plugins/windows-performance-monitor && npm run build
cd plugins/eisland-windows-processes-attacker && npm run build
cd plugins/eisland-windows-toast-listener && npm run build
cd plugins/eisland-windows-smtc-helper && npm run build
```

### All Test Commands

```bash
# Fullscreen Detector
cd plugins/windows-fullscreen-detector
npm test && npm run test:polling

# Performance Monitor
cd plugins/windows-performance-monitor
npm test

# Toast Listener
cd plugins/eisland-windows-toast-listener
npm test && npm run test:polling

# SMTC Helper
cd plugins/eisland-windows-smtc-helper
npm test && npm run test:play && npm run test:pause && npm run test:next && npm run test:previous
```

### All Smoke Commands

```bash
# Fullscreen Detector
cd plugins/windows-fullscreen-detector
npm run smoke && npm run smoke:polling

# Performance Monitor
cd plugins/windows-performance-monitor
npm run smoke && npm run smoke:polling

# Toast Listener
cd plugins/eisland-windows-toast-listener
npm run smoke && npm run smoke:polling && npm run smoke:event && npm run smoke:suppression

# SMTC Helper
cd plugins/eisland-windows-smtc-helper
npm run smoke && npm run smoke:status && npm run smoke:play && npm run smoke:pause && npm run smoke:next && npm run smoke:previous
```
