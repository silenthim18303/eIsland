---
watermark: true
title: getIconByShortcutPath
icon: fa6-solid:code
---

# getIconByShortcutPath

:::info
Retrieves the application icon by resolving a Windows shortcut (.lnk) file. This function reads the shortcut to find its target executable path using COM `IShellLink` interface, then extracts the icon from the target. Returns the icon as a PNG `Buffer`, or `null` if the shortcut cannot be resolved.
:::

## Signature

```typescript
function getIconByShortcutPath(lnkPath: string): IconResult | null;
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `lnkPath` | `string` | Full path to the `.lnk` shortcut file |

## Usage

The `getIconByShortcutPath` function is useful when working with desktop shortcuts, Start Menu entries, or any `.lnk` files. It handles the shortcut resolution internally, so you don't need to manually resolve the target path.

Typical workflow:

1. Obtain the full path to a `.lnk` file (e.g., from desktop or Start Menu).
2. Call `getIconByShortcutPath(lnkPath)` with the absolute path.
3. Check if the result is `null` (shortcut not found or target missing).
4. Use the returned `Buffer` as PNG image data.

:::note
The file must have a `.lnk` extension. Passing a non-`.lnk` file returns `null` even if the file exists.
:::

:::tip
This function uses COM interop internally. It initializes COM with apartment threading model automatically — no external setup required.
:::

## Return Value

| Type | Description |
|------|-------------|
| `IconResult \| null` | Icon result object, or `null` if shortcut not found |

Returns an [IconResult](icon-result.md) object containing PNG icon data, size, and format from the shortcut's target executable. Returns `null` if the shortcut cannot be resolved.

:::warning
If the target executable has been moved or deleted since the shortcut was created, this function returns `null`. The shortcut file itself must exist on disk.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getIconByShortcutPath } from '@eisland/windows-application-icon-helper';
import * as path from 'path';
import * as fs from 'fs';

// Get icon from desktop shortcut
const desktopPath = path.join(process.env.USERPROFILE!, 'Desktop');
const lnkFiles = fs.readdirSync(desktopPath)
  .filter((f: string) => f.endsWith('.lnk'))
  .map((f: string) => path.join(desktopPath, f));

if (lnkFiles.length > 0) {
  const result = getIconByShortcutPath(lnkFiles[0]);
  if (result) {
    console.log(`Shortcut icon: ${result.size} bytes`);
    // Convert to data URL for display in HTML
    const dataUrl = `data:image/png;base64,${result.data.toString('base64')}`;
  } else {
    console.log('Could not retrieve icon from shortcut');
  }
}

// Returns null for non-.lnk files
const result2 = getIconByShortcutPath('C:\\Windows\\notepad.exe');
```

@tab JavaScript

```js
const { getIconByShortcutPath } = require('@eisland/windows-application-icon-helper');
const path = require('path');
const fs = require('fs');

// Get icon from desktop shortcut
const desktopPath = path.join(process.env.USERPROFILE, 'Desktop');
const lnkFiles = fs.readdirSync(desktopPath)
  .filter((f) => f.endsWith('.lnk'))
  .map((f) => path.join(desktopPath, f));

if (lnkFiles.length > 0) {
  const result = getIconByShortcutPath(lnkFiles[0]);
  if (result) {
    console.log(`Shortcut icon: ${result.size} bytes`);
    // Convert to data URL for display in HTML
    const dataUrl = `data:image/png;base64,${result.data.toString('base64')}`;
  } else {
    console.log('Could not retrieve icon from shortcut');
  }
}

// Returns null for non-.lnk files
const result2 = getIconByShortcutPath('C:\\Windows\\notepad.exe');
```

:::

## Notes

:::note
This function resolves shortcuts using the Windows COM `IShellLink` interface. It works with all standard Windows shortcuts, including those created by installers.
:::

:::tip
If you already know the target executable path, use [getIconByPath](get-icon-by-path.md) directly. It avoids the COM shortcut resolution step and is slightly faster.
:::

:::important
The `.lnk` extension check is case-insensitive. Both `.LNK` and `.lnk` are accepted.
:::

## Danger Avoidance

:::danger
Do not call this function with paths to shortcuts on network drives in performance-critical code. Shortcut resolution over network may block if the network is unavailable.
:::

:::danger
Shortcuts can point to other shortcuts (nested shortcuts). This function resolves only one level — if the target is itself a shortcut, the icon may not match the final target.
:::
