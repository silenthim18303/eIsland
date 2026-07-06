---
watermark: true
title: getIconByPid
icon: fa6-solid:code
---

# getIconByPid

:::info
Retrieves the application icon for a process by its Process ID (PID). This function resolves the executable path from the PID using both .NET Process API and Win32 `QueryFullProcessImageNameW` as fallback, then extracts the icon. Returns the icon as a PNG `Buffer`, or `null` if the process is not found.
:::

## Signature

```typescript
function getIconByPid(pid: number): IconResult | null;
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `pid` | `number` | Process ID (positive integer) |

## Usage

The `getIconByPid` function is useful when you already have the process ID from another API call, such as from `Process.GetProcesses()` or a monitoring event. It is part of the Application Icon Helper plugin.

Typical workflow:

1. Obtain the PID from process enumeration or monitoring.
2. Call `getIconByPid(pid)` with the numeric process ID.
3. Check if the result is `null` (process not found or no permission).
4. Use the returned `Buffer` as PNG image data.

:::note
PID 0 is the System Idle Process and does not have an extractable icon. This function returns `null` for PID 0.
:::

:::tip
This function tries the .NET Process API first, then falls back to the Win32 `QueryFullProcessImageNameW` API for processes that require elevated permissions.
:::

## Return Value

| Type | Description |
|------|-------------|
| `IconResult \| null` | Icon result object, or `null` if process not found |

Returns an [IconResult](icon-result.md) object containing PNG icon data, size, and format. Returns `null` if the process is not found or inaccessible.

:::warning
Access to process information may be restricted. If you don't have permission to query the process, this function returns `null`.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getIconByPid } from '@eisland/windows-application-icon-helper';

// Get icon for current Node.js process
const result = getIconByPid(process.pid);

if (result) {
  console.log(`Current process icon: ${result.size} bytes`);
  // Convert to data URL for display in HTML
  const dataUrl = `data:image/png;base64,${result.data.toString('base64')}`;
} else {
  console.log('Could not retrieve icon');
}

// Get icon for a specific PID
const result2 = getIconByPid(1234);

// Returns null for invalid PIDs
const result3 = getIconByPid(0);        // System Idle Process
const result4 = getIconByPid(99999999); // Non-existent
```

@tab JavaScript

```js
const { getIconByPid } = require('@eisland/windows-application-icon-helper');

// Get icon for current Node.js process
const result = getIconByPid(process.pid);

if (result) {
  console.log(`Current process icon: ${result.size} bytes`);
  // Convert to data URL for display in HTML
  const dataUrl = `data:image/png;base64,${result.data.toString('base64')}`;
} else {
  console.log('Could not retrieve icon');
}

// Get icon for a specific PID
const result2 = getIconByPid(1234);

// Returns null for invalid PIDs
const result3 = getIconByPid(0);        // System Idle Process
const result4 = getIconByPid(99999999); // Non-existent
```

:::

## Notes

:::note
The process must be currently running. If the process has exited between obtaining the PID and calling this function, it returns `null`.
:::

:::tip
If you have the process name instead of the PID, use [getIconByProcessName](get-icon-by-process-name.md) for a simpler API that handles the process lookup internally.
:::

:::important
For the best performance when you already know the executable path, use [getIconByPath](get-icon-by-path.md) instead. It avoids the process lookup step entirely.
:::

## Danger Avoidance

:::danger
Do not assume that a PID is valid across reboots or even across short time spans. PIDs are recycled by the operating system. Always handle the `null` return case gracefully.
:::
