---
watermark: true
title: ScreenshotResult
icon: fa6-solid:table
---

# ScreenshotResult

:::info
Represents the result of a screen capture operation. This interface provides a structured way to access screenshot data, its size, and the image format. The `capturePrimaryDisplayPng` function returns `ScreenshotResult | null`.
:::

## Interface Definition

```typescript
interface ScreenshotResult {
  data: Buffer;
  size: number;
  format: 'png';
}
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `data` | `Buffer` | Raw PNG image data of the captured screen |
| `size` | `number` | Screenshot data size in bytes |
| `format` | `'png'` | Image format (always `'png'`) |

## Usage

The `ScreenshotResult` interface is returned by the [capturePrimaryDisplayPng](capture-primary-display-png.md) function.

When the capture fails (e.g., GDI resource exhaustion or invalid display context), the function returns `null` instead of a `ScreenshotResult` object. Use [getLastError](get-last-error.md) to retrieve the error message in that case.

:::tip
Use the `size` property to check the screenshot data size without accessing the `data` buffer directly. This is useful for logging or validation before processing.
:::

:::note
The `format` property is always `'png'`. The PNG encoding happens inside the Native AOT DLL before the data crosses the FFI boundary.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { capturePrimaryDisplayPng, ScreenshotResult } from '@eisland/windows-screenshot-helper';

const result: ScreenshotResult | null = capturePrimaryDisplayPng();

if (result) {
  console.log(`Screenshot size: ${result.size} bytes`);
  console.log(`Format: ${result.format}`);

  // Convert to data URL for HTML display
  const dataUrl = `data:image/png;base64,${result.data.toString('base64')}`;

  // Or save to file
  import * as fs from 'fs';
  fs.writeFileSync('screenshot.png', result.data);
} else {
  console.log('Capture failed');
}
```

@tab JavaScript

```js
const { capturePrimaryDisplayPng } = require('@eisland/windows-screenshot-helper');

const result = capturePrimaryDisplayPng();

if (result) {
  console.log(`Screenshot size: ${result.size} bytes`);
  console.log(`Format: ${result.format}`);

  // Convert to data URL for HTML display
  const dataUrl = `data:image/png;base64,${result.data.toString('base64')}`;

  // Or save to file
  const fs = require('fs');
  fs.writeFileSync('screenshot.png', result.data);
} else {
  console.log('Capture failed');
}
```

:::

## Notes

:::important
Always check if the result is `null` before accessing properties. Screen capture can fail due to GDI resource exhaustion, restricted desktop contexts (e.g., secure desktop), or DLL loading errors.
:::

:::warning
The `data` buffer contains raw PNG bytes of the **entire primary display**. The buffer size depends on screen resolution and content complexity — it is not a fixed size.
:::

## Danger Avoidance

:::danger
Do not call `capturePrimaryDisplayPng` in a tight loop without delay. Each call allocates GDI resources (device context, bitmap) inside the DLL. Rapid successive calls can exhaust GDI handle limits and cause subsequent captures to fail. Add a reasonable delay (e.g., 100ms+) between captures.
:::
