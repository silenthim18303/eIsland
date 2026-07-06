---
watermark: true
title: ProcessCloseResult
icon: fa6-solid:table
---

# ProcessCloseResult

:::info
`ProcessCloseResult` is a data structure returned by [closeProcess](./close-process.md) and as individual elements of the array returned by [closeProcesses](./close-processes.md). It contains the original target that was requested, how many processes matched that target, how many were successfully terminated, and details about any failures. You never construct this object yourself — it is always produced by a process-close operation.
:::

## Interface Introduction

You encounter `ProcessCloseResult` every time you call `closeProcess()` or `closeProcesses()`. The returned object tells you which target was processed, how many running processes matched it, how many of those were terminated, and — if any failed — exactly which PIDs failed and why (via Windows error codes).

```ts
export interface ProcessCloseResult {
  /** The original target — a process name string or PID number */
  target: string | number;
  /** Number of processes that matched the target */
  matchedCount: number;
  /** Number of processes successfully terminated */
  terminatedCount: number;
  /** Number of processes that failed to terminate */
  failedCount: number;
  /** Details of each termination failure */
  failures: ProcessFailure[];
}
```

## Usage

Call [closeProcess](./close-process.md) with a process name or PID to receive a single `ProcessCloseResult`. Call [closeProcesses](./close-processes.md) with an array of targets to receive an array of `ProcessCloseResult` objects — one per target, in the same order.

:::tip Check `terminatedCount` for success
The most reliable way to verify whether a process was killed is to check `terminatedCount > 0`. A `failedCount > 0` with `matchedCount > 0` means the process was found but could not be terminated (commonly due to insufficient privileges).
:::

:::tip Iterate `failures` for diagnostics
When `failedCount` is greater than zero, the `failures` array contains one [ProcessFailure](./process-failure.md) entry per failed process. Each entry includes the PID, process name, and the Windows error code — useful for logging or displaying user-facing error messages.
:::

```ts
import { closeProcess } from '@eisland/windows-processes-attacker';

// Receive a ProcessCloseResult from closeProcess()
const result = closeProcess('notepad.exe');
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `target` | `string \| number` | The original target passed to the close function — a process name (`string`) or PID (`number`) |
| `matchedCount` | `number` | Number of running processes that matched the target at the time of the snapshot |
| `terminatedCount` | `number` | Number of matched processes that were successfully terminated |
| `failedCount` | `number` | Number of matched processes that could not be terminated |
| `failures` | [ProcessFailure](./process-failure.md)`[]` | Array of failure details; empty when `failedCount` is 0 |

:::note `target` preserves the original input type
If you passed a string (process name), `target` is that string. If you passed a number (PID), `target` is that number. The type is preserved exactly as given — the API does not normalize or convert it.
:::

:::note Name-based targets may match multiple processes
When `target` is a process name string, `matchedCount` can be greater than 1 because multiple instances of the same executable may be running simultaneously. Each instance is individually attempted for termination. When `target` is a PID, `matchedCount` is always 0 or 1 since PIDs are unique.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { closeProcess, closeProcesses } from '@eisland/windows-processes-attacker';

// --- Single target ---
// Terminate all notepad.exe instances by name
const result = closeProcess('notepad.exe');
// target echoes back the original string
console.log(`Target: ${result.target}`);
// matchedCount tells how many notepad.exe processes were found
console.log(`Matched: ${result.matchedCount}`);
// terminatedCount tells how many were successfully killed
console.log(`Terminated: ${result.terminatedCount}`);
// failedCount tells how many could not be terminated
console.log(`Failed: ${result.failedCount}`);

// Inspect individual failures if any occurred
if (result.failures.length > 0) {
  result.failures.forEach(f => {
    // Each failure has the PID, process name, and Windows error code
    console.error(`  PID ${f.pid} (${f.name}): error code ${f.errorCode}`);
  });
}

// --- PID-based target ---
// Terminate a specific process by its PID
const pidResult = closeProcess(12345);
// When targeting by PID, matchedCount is 0 or 1
console.log(`Terminated: ${pidResult.terminatedCount > 0}`);

// --- Batch targets ---
// Terminate multiple targets at once
const results = closeProcesses(['notepad.exe', 'calc.exe', 5678]);
// Each element corresponds to the target at the same index
results.forEach(r => {
  const label = typeof r.target === 'string' ? r.target : `PID ${r.target}`;
  console.log(`${label}: ${r.terminatedCount} terminated, ${r.failedCount} failed`);
});
```

@tab JavaScript

```js
const { closeProcess, closeProcesses } = require('@eisland/windows-processes-attacker');

// --- Single target ---
// Terminate all notepad.exe instances by name
const result = closeProcess('notepad.exe');
// target echoes back the original string
console.log(`Target: ${result.target}`);
// matchedCount tells how many notepad.exe processes were found
console.log(`Matched: ${result.matchedCount}`);
// terminatedCount tells how many were successfully killed
console.log(`Terminated: ${result.terminatedCount}`);
// failedCount tells how many could not be terminated
console.log(`Failed: ${result.failedCount}`);

// Inspect individual failures if any occurred
if (result.failures.length > 0) {
  result.failures.forEach(f => {
    // Each failure has the PID, process name, and Windows error code
    console.error(`  PID ${f.pid} (${f.name}): error code ${f.errorCode}`);
  });
}

// --- PID-based target ---
// Terminate a specific process by its PID
const pidResult = closeProcess(12345);
// When targeting by PID, matchedCount is 0 or 1
console.log(`Terminated: ${pidResult.terminatedCount > 0}`);

// --- Batch targets ---
// Terminate multiple targets at once
const results = closeProcesses(['notepad.exe', 'calc.exe', 5678]);
// Each element corresponds to the target at the same index
results.forEach(r => {
  const label = typeof r.target === 'string' ? r.target : `PID ${r.target}`;
  console.log(`${label}: ${r.terminatedCount} terminated, ${r.failedCount} failed`);
});
```

:::

## Notes

:::note Process name matching is case-insensitive
When you pass a process name as the target, the plugin normalizes it for case-insensitive comparison against all running processes. Passing `'Notepad.EXE'` matches the same processes as `'notepad.exe'`.
:::

:::note `matchedCount` vs `terminatedCount`
`matchedCount` reflects how many running processes matched the target at the moment the snapshot was taken. `terminatedCount` is a subset — only those that were successfully killed. A process can match but fail to terminate (e.g., access denied), so `terminatedCount` can be less than `matchedCount`.
:::

:::note `failures` array is empty when nothing failed
When `failedCount` is 0, the `failures` array is an empty array (`[]`), not `null` or `undefined`. You can safely iterate it without a null check — the loop will simply not execute.
:::

:::tip Use `closeProcesses` for batch operations
If you need to terminate multiple unrelated targets, prefer [closeProcesses](./close-processes.md) over calling [closeProcess](./close-process.md) in a loop. Both produce `ProcessCloseResult` objects, but `closeProcesses` accepts an array of targets in a single call and returns a corresponding array of results.
:::

## Danger Avoidance

:::danger Do not assume all matched processes were terminated
`matchedCount > 0` does not mean the operation succeeded. Always check `terminatedCount` or `failedCount` to know the actual outcome. A common pattern is `result.failedCount > 0` to detect partial or total failure. Ignoring this can leave zombie processes running silently.
:::

:::danger Terminating system or elevated processes requires privileges
The plugin uses Windows `OpenProcess` with `PROCESS_TERMINATE` access and `TerminateProcess` internally. Terminating processes owned by other users, system services, or elevated processes will fail with an access-denied error code (typically error 5). These failures appear in the `failures` array. Running your application without administrator privileges will cause many targets to fail silently in this way.
:::

:::danger Do not kill critical system processes
Terminating essential Windows processes (e.g., `csrss.exe`, `winlogon.exe`, `smss.exe`) can cause an immediate system crash (BSOC). The API does not block you from targeting these processes — the responsibility is on the caller to ensure safe targets. Validate process names before passing them to `closeProcess` or `closeProcesses`.
:::
