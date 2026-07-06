---
watermark: true
title: ProcessFailure
icon: fa6-solid:table
---

# ProcessFailure

:::info
`ProcessFailure` is an interface describing a single process termination failure. When [closeProcess](close-process.md) or [closeProcesses](close-processes.md) attempts to terminate a matched process and the Windows `TerminateProcess` call fails, a `ProcessFailure` record is created and appended to the [`failures`](process-close-result.md) array of the returned [ProcessCloseResult](process-close-result.md).
:::

## Interface Introduction

You do not construct `ProcessFailure` objects yourself. They are produced by the native addon when a termination attempt fails. Each failure record captures which process could not be killed, and the Windows system error code explaining why.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `pid` | `number` | The process ID that failed to terminate |
| `name` | `string` | The process name (e.g. `"svchost.exe"`) |
| `errorCode` | `number` | The Windows system error code returned by `GetLastError` after the failed `TerminateProcess` call |

:::note
`errorCode` is a raw Windows error code, not an HTTP status or Node.js error code. Common values include `5` (ERROR_ACCESS_DENIED) and `87` (ERROR_INVALID_PARAMETER). Refer to the [Windows System Error Codes documentation](https://learn.microsoft.com/en-us/windows/win32/debug/system-error-codes) for a full list.
:::

## Usage

`ProcessFailure` objects appear inside the `failures` array of a [ProcessCloseResult](process-close-result.md). Check this array after calling [closeProcess](close-process.md) or [closeProcesses](close-processes.md) to see which processes could not be terminated and why.

:::tip
If `failedCount` is `0`, you can safely skip inspecting `failures` entirely. Always check `failedCount` first to avoid unnecessary iteration.
:::

:::note
The `name` field may differ slightly in casing from the target you passed in. The native addon stores the name exactly as reported by the Windows process snapshot, not the string you provided.
:::

## Example

::: code-tabs

@tab TypeScript

```typescript
import { closeProcess, ProcessCloseResult, ProcessFailure } from '@eisland/windows-processes-attacker';

// Attempt to terminate all svchost.exe instances
const result: ProcessCloseResult = closeProcess('svchost.exe');

// Check for failures
if (result.failedCount > 0) {
  // Iterate over each failure record
  result.failures.forEach((f: ProcessFailure) => {
    // Log the PID, name, and Windows error code
    console.error(`Failed to terminate PID ${f.pid} (${f.name}): error code ${f.errorCode}`);
  });
}
```

@tab JavaScript

```javascript
const { closeProcess } = require('@eisland/windows-processes-attacker');

// Attempt to terminate all svchost.exe instances
const result = closeProcess('svchost.exe');

// Check for failures
if (result.failedCount > 0) {
  // Iterate over each failure record
  result.failures.forEach((f) => {
    // Log the PID, name, and Windows error code
    console.error(`Failed to terminate PID ${f.pid} (${f.name}): error code ${f.errorCode}`);
  });
}
```

:::

## Notes

:::note
`ProcessFailure` is a plain data object with no methods. It is not a class instance and has no prototype chain — treat it as a simple read-only record.
:::

:::tip
When debugging termination failures, map `errorCode` to a human-readable message using Node.js `os.constants.errno` or a Windows error lookup utility. Displaying raw numeric error codes to end users is rarely helpful.
:::

:::note
The `failures` array is allocated and freed by the native addon internally. You do not need to (and cannot) manually release it. The array is valid only for the lifetime of the returned `ProcessCloseResult` object.
:::

## Danger Avoidance

:::danger
Do not attempt to mutate or reassign properties on `ProcessFailure` objects. The native addon returns these as plain objects, but modifying them has no effect on the underlying process state and may cause confusion when logging or retrying.
:::

:::danger
Never ignore the `failures` array when terminating critical processes. If you call `closeProcess` on a security-sensitive process and silently discard failures, your application may proceed under the assumption the process is gone — when it is still running. Always check `failedCount` and handle failures explicitly.
:::
