---
watermark: true
title: Windows Application Icon Helper
icon: icons
---

# Windows Application Icon Helper

`@eisland/windows-application-icon-helper` · v26.0.0

:::info
Extract Windows application and process icons by name, PID, path, or shortcut via .NET NativeAOT DLL (koffi FFI). This plugin provides a unified interface for retrieving application icons as PNG buffers using Windows Shell32 APIs.
:::

## Interfaces

| Interface | Description |
|-----------|-------------|
| [IconResult](application-icon-helper/icon-result.md) | Icon data structure |

## Functions

| Function | Description |
|----------|-------------|
| [getIconByProcessName](application-icon-helper/get-icon-by-process-name.md) | Get icon by running process name |
| [getIconByPid](application-icon-helper/get-icon-by-pid.md) | Get icon by process ID |
| [getIconByPath](application-icon-helper/get-icon-by-path.md) | Get icon by executable file path |
| [getIconByShortcutPath](application-icon-helper/get-icon-by-shortcut-path.md) | Get icon by shortcut (.lnk) path |

:::tip
All icon functions return `IconResult | null`. The result contains PNG image data, size, and format. Returns `null` when the icon cannot be found or the target doesn't exist.
:::

## Build

| Command | Script | Description |
|---------|--------|-------------|
| `npm run build` | `dotnet publish -c Release -r win-x64` | Build Native AOT DLL |
| `npm run clean` | `dotnet clean` | Clean build artifacts |
| `npm run rebuild` | `npm run clean && npm run build` | Clean and rebuild |

:::tip
This plugin is automatically built when running `npm run plugins:build` from the project root. You do not need to build it separately unless working on the plugin in isolation.
:::

:::warning
The build requires .NET 10 SDK and Visual Studio Build Tools with C++ workload installed. The Windows SDK path must be correctly configured.
:::

## Test

| Command | Script | Description |
|---------|--------|-------------|
| `npm test` | `vitest run` | Run all unit tests |
| `npm run test:icon` | `vitest run test/icon.test.ts` | Run icon tests only |
| `npm run smoke` | `node test/icon.smoke.ts` | Run all smoke tests |
| `npm run smoke:process-name` | `node test/icon.by-process-name.smoke.ts` | Test process name lookup |
| `npm run smoke:pid` | `node test/icon.by-pid.smoke.ts` | Test PID lookup |
| `npm run smoke:path` | `node test/icon.by-path.smoke.ts` | Test path lookup |
| `npm run smoke:shortcut` | `node test/icon.by-shortcut.smoke.ts` | Test shortcut lookup |

:::note
Smoke tests require manual execution and display results in the console. Unit tests run automatically via Vitest.
:::

## Source Files

| File | Responsibility |
|------|---------------|
| `index.js` | Main entry point, exports all functions |
| `index.d.ts` | TypeScript type declarations |
| `ffi-loader.js` | koffi FFI bridge to Native AOT DLL |
| `src/IconExtractor.cs` | Core icon extraction logic (Win32 APIs) |
| `src/Exports.cs` | C ABI exports for FFI |
| `src/eIslandAppIconHelper.csproj` | .NET 10 Native AOT project |

:::important
The DLL uses `ExtractAssociatedIconW` from Shell32 for icon extraction and COM `IShellLink` for shortcut resolution.
:::
