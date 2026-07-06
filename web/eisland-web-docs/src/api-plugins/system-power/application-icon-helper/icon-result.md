---
watermark: true
title: IconResult
icon: fa6-solid:table
---

# IconResult

:::info
Represents the result of an icon retrieval operation. This interface provides a structured way to access icon data, its size, and the image format. All icon retrieval functions return `IconResult | null`.
:::

## Interface Definition

```typescript
interface IconResult {
  data: Buffer;
  size: number;
  format: 'png';
}
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `data` | `Buffer` | Raw PNG image data |
| `size` | `number` | Icon data size in bytes |
| `format` | `'png'` | Image format (always `'png'`) |

## Usage

The `IconResult` interface is returned by all icon retrieval functions:

- [getIconByProcessName](get-icon-by-process-name.md)
- [getIconByPid](get-icon-by-pid.md)
- [getIconByPath](get-icon-by-path.md)
- [getIconByShortcutPath](get-icon-by-shortcut-path.md)

When the icon cannot be found, these functions return `null` instead of an `IconResult` object.

:::tip
Use the `size` property to display the icon data size without accessing the `data` buffer directly.
:::

:::note
The `format` property is always `'png'`. Future versions may support additional formats.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getIconByPath, IconResult } from '@eisland/windows-application-icon-helper';

const result: IconResult | null = getIconByPath(process.execPath);

if (result) {
  console.log(`Icon size: ${result.size} bytes`);
  console.log(`Format: ${result.format}`);

  // Convert to data URL for HTML display
  const dataUrl = `data:image/png;base64,${result.data.toString('base64')}`;

  // Or save to file
  const fs = require('fs');
  fs.writeFileSync('icon.png', result.data);
} else {
  console.log('Icon not found');
}
```

@tab JavaScript

```js
const { getIconByPath } = require('@eisland/windows-application-icon-helper');

const result = getIconByPath(process.execPath);

if (result) {
  console.log(`Icon size: ${result.size} bytes`);
  console.log(`Format: ${result.format}`);

  // Convert to data URL for HTML display
  const dataUrl = `data:image/png;base64,${result.data.toString('base64')}`;

  // Or save to file
  const fs = require('fs');
  fs.writeFileSync('icon.png', result.data);
} else {
  console.log('Icon not found');
}
```

:::

## Notes

:::important
Always check if the result is `null` before accessing properties. Icon retrieval can fail if the target process doesn't exist, the file path is invalid, or you lack permission to access the process.
:::

:::warning
The `data` buffer contains raw PNG bytes. Do not assume a specific icon size or resolution — the actual dimensions depend on the application's embedded icon resources.
:::

## Danger Avoidance

:::danger
Do not modify the `data` buffer in place. If you need to transform the icon (e.g., resize or convert format), create a copy of the buffer first.
:::
