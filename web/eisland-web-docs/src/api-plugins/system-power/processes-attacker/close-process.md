---
watermark: true
title: closeProcess
icon: fa6-solid:code
---

# closeProcess

:::info Introduction
Terminates all running processes that match a single target. The target can be a process name (string), which kills every instance of that process, or a process ID (number), which kills only that specific process. Internally uses Windows `CreateToolhelp32Snapshot` for enumeration and `TerminateProcess` for termination.
:::

## Signature

```typescript
function closeProcess(target: string | number): ProcessCloseResult
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `target` | `string \| number` | A process name (string) to kill all matching instances, or a PID (number) to kill a single process |

:::tip Name Matching
When passing a string, the name comparison is **case-insensitive**. If you omit the `.exe` extension, it is appended automatically — for example, `'notepad'` and `'notepad.exe'` both match the same processes.
:::

## Return Value

Returns a [ProcessCloseResult](process-close-result.md) object containing termination details.

| Property | Type | Description |
|----------|------|-------------|
| `target` | `string \| number` | Echoes back the original target you passed in |
| `matchedCount` | `number` | Total number of processes found that matched the target |
| `terminatedCount` | `number` | Number of processes successfully terminated |
| `failedCount` | `number` | Number of processes that failed to terminate |
| `failures` | [ProcessFailure[]](process-failure.md) | Array of failure details, each containing `pid`, `name`, and `errorCode` |

:::warning Zero Matches
If no running processes match the target, `matchedCount` will be `0` and the function returns normally without throwing. Always check the return value to confirm whether any processes were actually terminated.
:::

## Usage

Call `closeProcess` when you need to terminate one or more instances of a single process by name, or a single process by PID. This is the simpler of the two exported functions — if you need to terminate multiple different processes at once, use [closeProcesses](close-processes.md) instead.

:::tip Checking Results
Always inspect `terminatedCount` and `failedCount` after calling. A process may fail to terminate if it is protected by the system, requires elevated privileges, or has already exited between enumeration and termination.
:::

## Example

::: code-tabs

@tab TypeScript

```typescript
import { closeProcess } from '@eisland/windows-processes-attacker';

// Terminate all running Notepad instances by name
const result = closeProcess('notepad.exe');
console.log(`Matched: ${result.matchedCount}`);       // Number of notepad processes found
console.log(`Terminated: ${result.terminatedCount}`);   // Number successfully killed
console.log(`Failed: ${result.failedCount}`);           // Number that failed to terminate

// Name matching is case-insensitive and .exe is optional
const result2 = closeProcess('Notepad');  // Same effect as 'notepad.exe'

// Terminate a specific process by PID
const pidResult = closeProcess(12345);
if (pidResult.terminatedCount > 0) {
  console.log('Process terminated successfully');
}

// Inspect failures if any occurred
if (result.failedCount > 0) {
  for (const failure of result.failures) {
    console.error(`Failed to kill PID ${failure.pid}: error code ${failure.errorCode}`);
  }
}
```

@tab JavaScript

```js
const { closeProcess } = require('@eisland/windows-processes-attacker');

// Terminate all running Notepad instances by name
const result = closeProcess('notepad.exe');
console.log(`Matched: ${result.matchedCount}`);       // Number of notepad processes found
console.log(`Terminated: ${result.terminatedCount}`);   // Number successfully killed
console.log(`Failed: ${result.failedCount}`);           // Number that failed to terminate

// Name matching is case-insensitive and .exe is optional
const result2 = closeProcess('Notepad');  // Same effect as 'notepad.exe'

// Terminate a specific process by PID
const pidResult = closeProcess(12345);
if (pidResult.terminatedCount > 0) {
  console.log('Process terminated successfully');
}

// Inspect failures if any occurred
if (result.failedCount > 0) {
  for (const failure of result.failures) {
    console.error(`Failed to kill PID ${failure.pid}: error code ${failure.errorCode}`);
  }
}
```

:::

## Notes

:::note Exit Code
Processes terminated by this function exit with code `1` (the `EXIT_CODE_TERMINATED_BY_EISLAND` constant). This distinguishes an eIsland-initiated termination from a normal exit or a crash.
:::

:::note Snapshot-Based Enumeration
The function takes a snapshot of all running processes at call time via `CreateToolhelp32Snapshot`. Processes that start or exit after the snapshot is taken will not be affected. This means the function is safe from race conditions with process creation, but a process could exit on its own between snapshot and termination — in that case it simply will not appear in the results.
:::

:::note Name Normalization
When you pass a process name string, the function normalizes it: it appends `.exe` if the extension is missing. Both the original and normalized forms are compared against running processes. The comparison is case-insensitive (`_wcsicmp` on Windows).
:::

:::tip Batch Termination
If you need to terminate multiple **different** processes in one call, use [closeProcesses](close-processes.md) which accepts an array of targets and returns an array of results.
:::

## Danger Avoidance

:::danger System Process Termination
Terminating critical system processes (e.g., `csrss.exe`, `wininit.exe`, `services.exe`) will cause an immediate **blue screen of death (BSOD)**. Always verify the target process name before calling this function. There is no built-in safeguard — the function will attempt to terminate any process it can access.
:::

:::danger Elevated Privileges Required
This function calls `OpenProcess` with `PROCESS_TERMINATE` access. Terminating processes owned by other users or by the system requires administrator privileges. If the calling process does not have sufficient rights, the target process will appear in the `failures` array with a Windows access-denied error code (`5`). Run your application as administrator if you need to terminate protected processes.
:::

:::danger Target Parameter Validation
Passing a non-string, non-number value, an empty string, or zero as the PID will throw a `TypeError`. Passing a negative number or a non-integer will also throw. Always ensure the target is a non-empty string or a positive integer.
:::
