---
watermark: true
title: getIconByPath
icon: fa6-solid:code
---

# getIconByPath

:::info
Retrieves the application icon by its executable file path. This function uses `ExtractAssociatedIconW` from the Windows Shell32 API to extract the icon associated with any file or executable. Returns an `IconResult` containing PNG data, or `null` if the file is not found.
:::

## Signature

```typescript
function getIconByPath(exePath: string): IconResult | null;
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `exePath` | `string` | Full path to the executable or file |

## Usage

The `getIconByPath` function is the most direct way to get an icon when you know the file path. It is part of the Application Icon Helper plugin.

Typical workflow:

1. Obtain the full file path (e.g., from process enumeration or user input).
2. Call `getIconByPath(path)` with the absolute path.
3. Check if the result is `null` (file not found).
4. Use the returned `IconResult` (`.data` contains the PNG buffer).

:::note
The file must exist on disk. This function returns `null` for non-existent paths or empty strings.
:::

:::tip
This function works for any file type, not just executables. For non-exe files, it returns the icon associated with that file type (e.g., a text file icon for `.txt` files).
:::

## Return Value

| Type | Description |
|------|-------------|
| `IconResult \| null` | Icon result object, or `null` if file not found |

Returns an [IconResult](icon-result.md) object containing PNG icon data, size, and format. Returns `null` if the file is not found.

:::warning
The path must be a valid file path. Directory paths may return a folder icon or `null` depending on the system configuration.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getIconByPath } from '@eisland/windows-application-icon-helper';
import * as path from 'path';

// Get icon for the current Node.js executable
const result = getIconByPath(process.execPath);

if (result) {
  console.log(`Node.js icon: ${result.size} bytes`);
  // Convert to data URL for display in HTML
  const dataUrl = `data:image/png;base64,${result.data.toString('base64')}`;
} else {
  console.log('Could not retrieve icon');
}

// Get icon for Windows Notepad
const notepadPath = path.join(process.env.SYSTEMROOT!, 'notepad.exe');
const result2 = getIconByPath(notepadPath);

// Returns null for non-existent paths
const result3 = getIconByPath('C:\\nonexistent\\file.exe');
```

@tab JavaScript

```js
const { getIconByPath } = require('@eisland/windows-application-icon-helper');
const path = require('path');

// Get icon for the current Node.js executable
const result = getIconByPath(process.execPath);

if (result) {
  console.log(`Node.js icon: ${result.size} bytes`);
  // Convert to data URL for display in HTML
  const dataUrl = `data:image/png;base64,${result.data.toString('base64')}`;
} else {
  console.log('Could not retrieve icon');
}

// Get icon for Windows Notepad
const notepadPath = path.join(process.env.SYSTEMROOT, 'notepad.exe');
const result2 = getIconByPath(notepadPath);

// Returns null for non-existent paths
const result3 = getIconByPath('C:\\nonexistent\\file.exe');
```

:::

## Notes

:::note
This function is the underlying implementation for [getIconByProcessName](get-icon-by-process-name.md) and [getIconByPid](get-icon-by-pid.md). If you already have the path, calling this function directly is more efficient.
:::

:::tip
If you have a shortcut (.lnk) file, use [getIconByShortcutPath](get-icon-by-shortcut-path.md) instead. It resolves the shortcut target automatically.
:::

:::important
The path must be an absolute path. Relative paths may not resolve correctly.
:::

## Danger Avoidance

:::danger
Do not call this function with network paths (UNC paths) in performance-critical code. Network path resolution may block for several seconds if the network is unavailable.
:::
