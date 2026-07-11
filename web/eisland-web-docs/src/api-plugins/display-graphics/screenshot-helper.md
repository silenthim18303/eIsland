---
watermark: true
title: Windows Screenshot Helper
icon: camera
---

# Windows Screenshot Helper

`@eisland/windows-screenshot-helper` · v26.0.0

:::info
Capture the primary display as PNG via .NET Native AOT DLL (koffi FFI). This plugin provides a lightweight, high-performance screen capture function using Windows GDI APIs (`BitBlt` with `SRCCOPY | CAPTUREBLT`).
:::

## Interfaces

| Interface | Description |
|-----------|-------------|
| [ScreenshotResult](screenshot-helper/screenshot-result.md) | Screenshot data structure |

## Functions

| Function | Description |
|----------|-------------|
| [capturePrimaryDisplayPng](screenshot-helper/capture-primary-display-png.md) | Capture the primary display as PNG |
| [getLastError](screenshot-helper/get-last-error.md) | Get the last error message from the DLL |

:::tip
`capturePrimaryDisplayPng` returns `ScreenshotResult | null`. The result contains a PNG buffer with the full primary display content. Returns `null` when the capture fails — use `getLastError` to retrieve the error message. The DLL reports specific GDI failure reasons (e.g., `GetDC failed`, `BitBlt failed`, `invalid primary display dimensions`) through `getLastError`, not just exceptions.
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
| `npm run test:screenshot` | `vitest run test/screenshot.test.ts` | Run screenshot tests only |
| `npm run smoke` | `node test/screenshot.smoke.ts` | Run smoke test |

:::note
Smoke tests require manual execution and display results in the console. Unit tests run automatically via Vitest.
:::

## Source Files

| File | Responsibility |
|------|---------------|
| `index.js` | Main entry point, exports all functions |
| `index.d.ts` | TypeScript type declarations |
| `ffi-loader.js` | koffi FFI bridge to Native AOT DLL |
| `src/ScreenCapture.cs` | Core screen capture logic (Win32 GDI APIs) |
| `src/ScExports.cs` | C ABI exports for FFI |
| `src/Program.cs` | Native AOT library entry point |
| `src/eIslandScreenshotHelper.csproj` | .NET 10 Native AOT project |

:::important
The DLL uses Win32 GDI `BitBlt` with `SRCCOPY | CAPTUREBLT` flags to capture the primary display. The result is returned as a base64-encoded PNG string through the FFI boundary, then decoded into a Node.js `Buffer`.
:::
