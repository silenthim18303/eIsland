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
| **Fullscreen Detector** | `eisland-windows-fullscreen-detector` | C | node-gyp | ✅ | ✅ |
| **Performance Monitor** | `eisland-windows-performance-monitor` | C + C# | node-gyp + dotnet | ✅ | ✅ |
| **Processes Attacker** | `eisland-windows-processes-attacker` | C | node-gyp | ❌ | ❌ |
| **Toast Listener** | `eisland-windows-toast-listener` | C++ | node-gyp | ✅ | ✅ |
| **SMTC Helper** | `eisland-windows-smtc-helper` | C# | dotnet | ✅ | ✅ |
| **Bluetooth Helper** | `eisland-windows-bluetooth-helper` | C# | dotnet | ✅ | ✅ |
| **Brightness Helper** | `eisland-windows-brightness-helper` | C# | dotnet | ✅ | ✅ |

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

## Bulk Operations

Run from the **project root** to build or clean all plugins at once.

| Command | Description |
|---------|-------------|
| `npm run plugins:build` | Build all 9 plugins sequentially (uses `build:all` where available) |
| `npm run plugins:clean` | Clean all 9 plugins in parallel |

:::tip
`plugins:build` automatically uses `build:all` for Bluetooth, Power, SMTC, and WiFi Helpers (which include NativeAOT DLL targets). All other plugins use `build`.
:::

### Individual Plugin Commands

Each plugin also has a dedicated root-level command for targeted builds and cleans:

| Plugin | Build | Clean |
|--------|-------|-------|
| Bluetooth Helper | `npm run plugin:build:bluetooth` | `npm run plugin:clean:bluetooth` |
| Brightness Helper | `npm run plugin:build:brightness` | `npm run plugin:clean:brightness` |
| Power Helper | `npm run plugin:build:power` | `npm run plugin:clean:power` |
| Processes Attacker | `npm run plugin:build:processes` | `npm run plugin:clean:processes` |
| SMTC Helper | `npm run plugin:build:smtc` | `npm run plugin:clean:smtc` |
| Toast Listener | `npm run plugin:build:toast` | `npm run plugin:clean:toast` |
| WiFi Helper | `npm run plugin:build:wifi` | `npm run plugin:clean:wifi` |
| Fullscreen Detector | `npm run plugin:build:fullscreen` | `npm run plugin:clean:fullscreen` |
| Performance Monitor | `npm run plugin:build:perfmon` | `npm run plugin:clean:perfmon` |

:::info NativeAOT Build Requirement
Building NativeAOT DLLs (`npm run build:ctypes` for SMTC, Bluetooth, Power, WiFi helpers) requires `vswhere.exe` in PATH. If the build fails with `'vswhere.exe' is not recognized`, add it:
```bash
export PATH="/c/Program Files (x86)/Microsoft Visual Studio/Installer:$PATH"
```
:::

---

## Windows Fullscreen Detector

**Directory:** `plugins/eisland-windows-fullscreen-detector` &nbsp;|&nbsp; **Language:** C &nbsp;|&nbsp; **Build:** `node-gyp rebuild`

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

**Directory:** `plugins/eisland-windows-performance-monitor` &nbsp;|&nbsp; **Language:** C + C# &nbsp;|&nbsp; **Build:** `node-gyp rebuild && dotnet build`

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
| `npm run test:timestamp` | `vitest run test/smtc-helper.timestamp.test.ts` | Timestamp (getTimestamp) tests |
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
| `npm run smoke:timestamp` | `node --experimental-strip-types test/smtc-helper.timestamp.smoke.ts` | Timestamp smoke — lightweight timestamp query, compares with `getStatus()` |

---

## Windows Bluetooth Helper

**Directory:** `plugins/eisland-windows-bluetooth-helper` &nbsp;|&nbsp; **Language:** C# (.NET) &nbsp;|&nbsp; **Build:** `dotnet build` / `dotnet publish`

:::info
This is a pure .NET plugin with two build targets: a class library (for development) and a NativeAOT DLL (for Node.js via koffi FFI).
:::

### Build

| Command | Script | Description |
|---------|--------|-------------|
| `npm run build` | `dotnet build src/eIslandBluetoothHelper.csproj -c Release` | Build the .NET class library |
| `npm run build:ctypes` | `dotnet publish bt-ctypes/eIslandBluetoothCtypes.csproj -c Release -r win-x64` | Build the NativeAOT DLL for koffi FFI |
| `npm run build:all` | `npm run build && npm run build:ctypes` | Build both |
| `npm run clean` | `dotnet clean src/... + dotnet clean bt-ctypes/...` | Remove all build artifacts |
| `npm run rebuild` | `npm run clean && npm run build:all` | Full clean build |

### Test

| Command | Script | Description |
|---------|--------|-------------|
| `npm test` | `vitest run` | All tests — export verification, shape validation, monitor tests |
| `npm run test:query` | `vitest run test/bluetooth.test.ts` | Query function tests only |
| `npm run test:monitor` | `vitest run test/bluetooth.monitor.test.ts` | Monitor tests only |

### Smoke

| Command | Script | Description |
|---------|--------|-------------|
| `npm run smoke` | `node --experimental-strip-types test/bluetooth.smoke.ts` | Full smoke — all query functions + formatted output |
| `npm run smoke:monitor` | `node --experimental-strip-types test/bluetooth.monitor.smoke.ts` | Monitor smoke — event-driven device tracking for 8s |

---

## Windows Power Helper

**Directory:** `plugins/eisland-windows-power-helper` &nbsp;|&nbsp; **Language:** C# (.NET) &nbsp;|&nbsp; **Build:** `dotnet build` / `dotnet publish`

:::info
This plugin follows the same dual-build pattern as the Bluetooth Helper: a .NET class library for development and a NativeAOT DLL for Node.js via koffi FFI.
:::

### Build

| Command | Script | Description |
|---------|--------|-------------|
| `npm run build` | `dotnet build src/eIslandPowerHelper.csproj -c Release` | Build the .NET class library |
| `npm run build:ctypes` | `dotnet publish pw-ctypes/eIslandPowerCtypes.csproj -c Release -r win-x64` | Build the NativeAOT DLL for koffi FFI |
| `npm run build:all` | `npm run build && npm run build:ctypes` | Build both |
| `npm run clean` | `dotnet clean src/... + dotnet clean pw-ctypes/...` | Remove all build artifacts |
| `npm run rebuild` | `npm run clean && npm run build:all` | Full clean build |

### Test

| Command | Script | Description |
|---------|--------|-------------|
| `npm test` | `vitest run` | All tests — shape validation, consistency, monitor tests |
| `npm run test:query` | `vitest run test/power.test.ts` | Query function tests only |
| `npm run test:monitor` | `vitest run test/power.monitor.test.ts` | Monitor tests only |

### Smoke

| Command | Script | Description |
|---------|--------|-------------|
| `npm run smoke` | `node --experimental-strip-types test/power.smoke.ts` | Full smoke — query power info with formatted output |
| `npm run smoke:monitor` | `node --experimental-strip-types test/power.monitor.smoke.ts` | Monitor smoke — event-driven power tracking for 8s |

---

## Windows WiFi Helper

**Directory:** `plugins/eisland-windows-wifi-helper` &nbsp;|&nbsp; **Language:** C# (.NET) &nbsp;|&nbsp; **Build:** `dotnet build` / `dotnet publish`

:::info
This plugin follows the same dual-build pattern as the Bluetooth and Power Helpers: a .NET class library for development and a NativeAOT DLL for Node.js via koffi FFI.
:::

### Build

| Command | Script | Description |
|---------|--------|-------------|
| `npm run build` | `dotnet build src/eIslandWifiHelper.csproj -c Release` | Build the .NET class library |
| `npm run build:ctypes` | `dotnet publish wf-ctypes/eIslandWifiCtypes.csproj -c Release -r win-x64` | Build the NativeAOT DLL for koffi FFI |
| `npm run build:all` | `npm run build && npm run build:ctypes` | Build both |
| `npm run clean` | `dotnet clean src/... + dotnet clean wf-ctypes/...` | Remove all build artifacts |
| `npm run rebuild` | `npm run clean && npm run build:all` | Full clean build |

### Test

| Command | Script | Description |
|---------|--------|-------------|
| `npm test` | `vitest run` | All tests — shape validation, consistency, monitor tests |
| `npm run test:query` | `vitest run test/wifi.test.ts` | Query function tests only |
| `npm run test:monitor` | `vitest run test/wifi.monitor.test.ts` | Monitor tests only |

### Smoke

| Command | Script | Description |
|---------|--------|-------------|
| `npm run smoke` | `node --experimental-strip-types test/wifi.smoke.ts` | Full smoke — query WiFi info with formatted output |
| `npm run smoke:monitor` | `node --experimental-strip-types test/wifi.monitor.smoke.ts` | Monitor smoke — event-driven WiFi tracking for 8s |

---

## Windows Brightness Helper

**Directory:** `plugins/eisland-windows-brightness-helper` &nbsp;|&nbsp; **Language:** C# (.NET) &nbsp;|&nbsp; **Build:** `dotnet build`

:::info
This is a pure .NET plugin that spawns a console EXE for WMI brightness operations. Unlike the Bluetooth/Power/WiFi Helpers, it does not use NativeAOT or koffi FFI — `System.Management` (WMI) is incompatible with NativeAOT.
:::

### Build

| Command | Script | Description |
|---------|--------|-------------|
| `npm run build` | `dotnet build src/eIslandBrightnessReader.csproj -c Release` | Build the .NET console exe |
| `npm run clean` | `dotnet clean src/eIslandBrightnessReader.csproj` | Remove build artifacts |
| `npm run rebuild` | `npm run clean && npm run build` | Full clean build |

### Test

| Command | Script | Description |
|---------|--------|-------------|
| `npm test` | `vitest run` | All tests — export verification, shape validation, boundary values, monitor tests |
| `npm run test:query` | `vitest run test/brightness.test.ts` | Query function tests only |
| `npm run test:monitor` | `vitest run test/brightness.monitor.test.ts` | Monitor tests only |

### Smoke

| Command | Script | Description |
|---------|--------|-------------|
| `npm run smoke` | `node --experimental-strip-types test/brightness.smoke.ts` | Full smoke — `getBrightness()`, `setBrightness()` |
| `npm run smoke:monitor` | `node --experimental-strip-types test/brightness.monitor.smoke.ts` | Monitor smoke — WMI event tracking for 15s |

---

## Quick Reference

### All Build Commands

| Plugin | Command |
|--------|---------|
| Fullscreen Detector | `cd plugins/eisland-windows-fullscreen-detector && npm run build` |
| Performance Monitor | `cd plugins/eisland-windows-performance-monitor && npm run build` |
| Processes Attacker | `cd plugins/eisland-windows-processes-attacker && npm run build` |
| Toast Listener | `cd plugins/eisland-windows-toast-listener && npm run build` |
| SMTC Helper (exe) | `cd plugins/eisland-windows-smtc-helper && npm run build` |
| SMTC Helper (DLL) | `cd plugins/eisland-windows-smtc-helper && npm run build:ctypes` |
| SMTC Helper (all) | `cd plugins/eisland-windows-smtc-helper && npm run build:all` |
| Bluetooth Helper (exe) | `cd plugins/eisland-windows-bluetooth-helper && npm run build` |
| Bluetooth Helper (DLL) | `cd plugins/eisland-windows-bluetooth-helper && npm run build:ctypes` |
| Bluetooth Helper (all) | `cd plugins/eisland-windows-bluetooth-helper && npm run build:all` |
| Power Helper (exe) | `cd plugins/eisland-windows-power-helper && npm run build` |
| Power Helper (DLL) | `cd plugins/eisland-windows-power-helper && npm run build:ctypes` |
| Power Helper (all) | `cd plugins/eisland-windows-power-helper && npm run build:all` |
| WiFi Helper (exe) | `cd plugins/eisland-windows-wifi-helper && npm run build` |
| WiFi Helper (DLL) | `cd plugins/eisland-windows-wifi-helper && npm run build:ctypes` |
| WiFi Helper (all) | `cd plugins/eisland-windows-wifi-helper && npm run build:all` |
| Brightness Helper | `cd plugins/eisland-windows-brightness-helper && npm run build` |
| **All plugins** | `npm run plugins:build` (from root — builds all 9 plugins) |

### All Test Commands

| Plugin | Commands |
|--------|----------|
| Fullscreen Detector | `npm test` · `npm run test:polling` |
| Performance Monitor | `npm test` |
| Processes Attacker | _(no tests)_ |
| Toast Listener | `npm test` · `npm run test:polling` |
| SMTC Helper | `npm test` · `npm run test:play` · `npm run test:pause` · `npm run test:next` · `npm run test:previous` · `npm run test:timestamp` · `npm run test:ctypes` |
| Bluetooth Helper | `npm test` · `npm run test:query` · `npm run test:monitor` |
| Power Helper | `npm test` · `npm run test:query` · `npm run test:monitor` |
| WiFi Helper | `npm test` · `npm run test:query` · `npm run test:monitor` |
| Brightness Helper | `npm test` · `npm run test:query` · `npm run test:monitor` |

### All Smoke Commands

| Plugin | Commands |
|--------|----------|
| Fullscreen Detector | `npm run smoke` · `npm run smoke:polling` |
| Performance Monitor | `npm run smoke` · `npm run smoke:polling` |
| Processes Attacker | _(no smoke)_ |
| Toast Listener | `npm run smoke` · `npm run smoke:polling` · `npm run smoke:event` · `npm run smoke:suppression` |
| SMTC Helper | `npm run smoke` · `npm run smoke:play` · `npm run smoke:pause` · `npm run smoke:next` · `npm run smoke:previous` · `npm run smoke:status` · `npm run smoke:seek` · `npm run smoke:monitor` · `npm run smoke:timestamp` |
| Bluetooth Helper | `npm run smoke` · `npm run smoke:monitor` |
| Power Helper | `npm run smoke` · `npm run smoke:monitor` |
| WiFi Helper | `npm run smoke` · `npm run smoke:monitor` |
| Brightness Helper | `npm run smoke` · `npm run smoke:monitor` |
