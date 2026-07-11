---
watermark: true
title: capturePrimaryDisplayPng
icon: fa6-solid:code
---

# capturePrimaryDisplayPng

:::info
Captures the primary display as a PNG image. This function calls into the Native AOT DLL which uses Win32 GDI APIs (`GetDC`, `CreateCompatibleBitmap`, `BitBlt`) to capture the full primary screen, then returns the result as a `ScreenshotResult` containing a PNG `Buffer`. Returns `null` if the capture fails.
:::

## Signature

```typescript
function capturePrimaryDisplayPng(): ScreenshotResult | null;
```

## Parameters

This function takes no parameters.

## Usage

The `capturePrimaryDisplayPng` function is the primary way to capture a screenshot of the primary display. It is part of the Screenshot Helper plugin.

Typical workflow:

1. Call `capturePrimaryDisplayPng()` with no arguments.
2. Check if the result is `null` (capture failed).
3. Use the returned [ScreenshotResult](screenshot-result.md) — `.data` contains the PNG buffer.
4. If `null`, call [getLastError](get-last-error.md) to retrieve the error message.

:::note
This function captures only the **primary display**. On multi-monitor setups, secondary displays are not included in the capture.
:::

:::tip
The PNG encoding happens inside the Native AOT DLL using `System.Drawing.Common`. The base64-encoded result is decoded into a Node.js `Buffer` by the FFI loader, so the returned `data` is ready to use as raw PNG bytes.
:::

## Return Value

| Type | Description |
|------|-------------|
| `ScreenshotResult \| null` | Screenshot result object, or `null` if capture failed |

Returns a [ScreenshotResult](screenshot-result.md) object containing PNG image data, size, and format. Returns `null` if the screen capture fails.

:::warning
When `null` is returned, call [getLastError](get-last-error.md) immediately to get the error details. The error message is stored internally and may be overwritten by subsequent calls.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { capturePrimaryDisplayPng, getLastError } from '@eisland/windows-screenshot-helper';

// Basic capture
const result = capturePrimaryDisplayPng();

if (result) {
  console.log(`Captured ${result.size} bytes of PNG data`);
  // Use result.data as a PNG Buffer
} else {
  console.error(`Capture failed: ${getLastError()}`);
}

// Save to file
import * as fs from 'fs';

const screenshot = capturePrimaryDisplayPng();
if (screenshot) {
  fs.writeFileSync('screen.png', screenshot.data);
}

// Convert to data URL for Electron BrowserWindow or HTML img
const shot = capturePrimaryDisplayPng();
if (shot) {
  const dataUrl = `data:image/png;base64,${shot.data.toString('base64')}`;
}
```

@tab JavaScript

```js
const { capturePrimaryDisplayPng, getLastError } = require('@eisland/windows-screenshot-helper');

// Basic capture
const result = capturePrimaryDisplayPng();

if (result) {
  console.log(`Captured ${result.size} bytes of PNG data`);
  // Use result.data as a PNG Buffer
} else {
  console.error(`Capture failed: ${getLastError()}`);
}

// Save to file
const fs = require('fs');

const screenshot = capturePrimaryDisplayPng();
if (screenshot) {
  fs.writeFileSync('screen.png', screenshot.data);
}

// Convert to data URL for Electron BrowserWindow or HTML img
const shot = capturePrimaryDisplayPng();
if (shot) {
  const dataUrl = `data:image/png;base64,${shot.data.toString('base64')}`;
}
```

:::

## Notes

:::note
The function internally calls `sc_capture_primary_display_png` via koffi FFI. The DLL allocates GDI resources, captures the screen with `BitBlt`, encodes to PNG, base64-encodes the result, and returns it as a CoTaskMem-allocated string. The FFI loader decodes the base64 and frees the native memory.
:::

:::tip
For repeated captures (e.g., recording or timelapse), add a delay between calls to avoid GDI resource exhaustion. A minimum interval of 100ms is recommended.
:::

:::important
This plugin is Windows-only (`os: ['win32']`). Attempting to require it on non-Windows platforms will throw an error immediately at module load time.
:::

## Danger Avoidance

:::danger
Do not ignore a `null` return value and proceed as if the capture succeeded. If you pass `null.data` to a Buffer consumer (e.g., `fs.writeFileSync`), it will throw a `TypeError`. Always check for `null` and handle the error path — use `getLastError()` to log or display the failure reason.
:::
