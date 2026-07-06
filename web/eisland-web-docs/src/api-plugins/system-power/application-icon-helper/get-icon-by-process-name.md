---
watermark: true
title: getIconByProcessName
icon: fa6-solid:code
---

# getIconByProcessName

:::info
Retrieves the application icon for a running process by its name. This function searches for a process with the given name in the system process list and extracts the icon from its executable file. Returns the icon as a PNG `Buffer`, or `null` if the process is not found.
:::

## Signature

```typescript
function getIconByProcessName(processName: string): Buffer | null;
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `processName` | `string` | Process name (with or without `.exe` extension) |

## Usage

The `getIconByProcessName` function is the simplest way to get an application icon when you know the process name. It is part of the Application Icon Helper plugin.

Typical workflow:

1. Call `getIconByProcessName('processName')` with the target process name.
2. Check if the result is `null` (process not found or no permission).
3. Use the returned `Buffer` as PNG image data.

:::note
The `.exe` extension is optional. Both `'chrome'` and `'chrome.exe'` produce the same result.
:::

:::tip
The process name is case-insensitive. You can pass either `'explorer'` or `'Explorer'` — both work.
:::

## Return Value

| Type | Description |
|------|-------------|
| `Buffer \| null` | PNG icon data, or `null` if process not found |

The buffer contains raw PNG image data. You can save it directly to a file or convert it to a data URL for display.

:::warning
This function only works for processes you have permission to access. System processes (e.g., `csrss`, `lsass`) may return `null` due to access restrictions.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getIconByProcessName } from '@eisland/windows-application-icon-helper';

// Get icon for Windows Explorer
const icon = getIconByProcessName('explorer');

if (icon) {
  console.log(`Explorer icon: ${icon.length} bytes`);
  // Convert to data URL for display in HTML
  const dataUrl = `data:image/png;base64,${icon.toString('base64')}`;
} else {
  console.log('Process not found or inaccessible');
}

// Also works with .exe extension
const icon2 = getIconByProcessName('chrome.exe');

// Returns null for non-running processes
const icon3 = getIconByProcessName('nonexistent');
```

@tab JavaScript

```js
const { getIconByProcessName } = require('@eisland/windows-application-icon-helper');

// Get icon for Windows Explorer
const icon = getIconByProcessName('explorer');

if (icon) {
  console.log(`Explorer icon: ${icon.length} bytes`);
  // Convert to data URL for display in HTML
  const dataUrl = `data:image/png;base64,${icon.toString('base64')}`;
} else {
  console.log('Process not found or inaccessible');
}

// Also works with .exe extension
const icon2 = getIconByProcessName('chrome.exe');

// Returns null for non-running processes
const icon3 = getIconByProcessName('nonexistent');
```

:::

## Notes

:::note
The process must be currently running. This function does not look up installed applications — only active processes in the system process list.
:::

:::tip
If you have the process ID (PID) instead of the name, use [getIconByPid](get-icon-by-pid.md) for direct lookup without iterating the process list.
:::

:::important
For the best performance when you already know the executable path, use [getIconByPath](get-icon-by-path.md) instead. It avoids the process enumeration step.
:::

## Danger Avoidance

:::danger
Do not call `getIconByProcessName` in a tight loop for the same process. The function enumerates processes each time, which is expensive. Cache the result if you need to use it multiple times.
:::
