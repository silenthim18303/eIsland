---
watermark: true
title: closeProcesses
icon: fa6-solid:code
---

# closeProcesses

:::info
Terminates processes for each target in an array. Each target can be a process name (string) or a process ID (number). When a name is provided, all running instances of that process are matched. Targets are processed sequentially, and the function returns one [ProcessCloseResult](process-close-result.md) per target.
:::

## Signature

```typescript
function closeProcesses(targets: (string | number)[]): ProcessCloseResult[]
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `targets` | `(string \| number)[]` | Array of process names (strings) or process IDs (positive integers) |

:::note
Each element in the array follows the same rules as the single-target [closeProcess](close-process.md) function: a string matches all running processes with that name (case-insensitive), while a number targets a specific PID. PID values must be positive integers; passing `0` throws a `TypeError`.
:::

## Usage

Use `closeProcesses` when you need to terminate multiple processes in a single call. The targets are evaluated one by one in array order. For each target the function enumerates all running processes via a Windows snapshot, matches them against the target, and attempts to terminate every match.

:::tip
Prefer `closeProcesses` over calling [closeProcess](close-process.md) in a loop. Both behave identically, but a single batched call is more convenient and produces a combined result array for easy inspection.
:::

:::tip
When targeting by name, the process name is normalized internally so casing differences (e.g. `Notepad.exe` vs `notepad.EXE`) do not affect matching.
:::

## Return Value

Returns an array of [ProcessCloseResult](process-close-result.md) objects, one per input target, in the same order as the input array.

Each result object contains:

| Property | Type | Description |
|----------|------|-------------|
| `target` | `string \| number` | The original target as passed in |
| `matchedCount` | `number` | Number of running processes that matched this target |
| `terminatedCount` | `number` | Number of processes successfully terminated |
| `failedCount` | `number` | Number of processes that could not be terminated |
| `failures` | [ProcessFailure](process-failure.md)`[]` | Details for each failed termination |

:::warning
If a target is not found among running processes, `matchedCount` will be `0` and `terminatedCount` will be `0`. This is not an error condition -- the function simply has nothing to terminate. Always check the counts rather than assuming failure.
:::

:::warning
If any element in the `targets` array has an invalid type (not a string or number), the function throws a `TypeError`. When this happens mid-iteration, results for successfully processed targets before the invalid entry are still returned, but remaining targets are skipped.
:::

## Example

::: code-tabs

@tab TypeScript

```typescript
import { closeProcesses } from '@eisland/windows-processes-attacker';

// Terminate multiple processes by name and PID in one call
const results: ProcessCloseResult[] = closeProcesses([
  'notepad.exe',   // Close all notepad instances
  'calc.exe',      // Close all calculator instances
  5678,            // Close the process with PID 5678
]);

// Inspect each result
results.forEach((r) => {
  // Build a human-readable label from the target
  const label = typeof r.target === 'string' ? r.target : `PID ${r.target}`;
  console.log(`${label}: matched ${r.matchedCount}, terminated ${r.terminatedCount}, failed ${r.failedCount}`);

  // Log failure details if any
  r.failures.forEach((f) => {
    console.error(`  Failed to terminate PID ${f.pid} (${f.name}), error code: ${f.errorCode}`);
  });
});
```

@tab JavaScript

```js
const { closeProcesses } = require('@eisland/windows-processes-attacker');

// Terminate multiple processes by name and PID in one call
const results = closeProcesses([
  'notepad.exe',   // Close all notepad instances
  'calc.exe',      // Close all calculator instances
  5678,            // Close the process with PID 5678
]);

// Inspect each result
results.forEach((r) => {
  // Build a human-readable label from the target
  const label = typeof r.target === 'string' ? r.target : `PID ${r.target}`;
  console.log(`${label}: matched ${r.matchedCount}, terminated ${r.terminatedCount}, failed ${r.failedCount}`);

  // Log failure details if any
  r.failures.forEach((f) => {
    console.error(`  Failed to terminate PID ${f.pid} (${f.name}), error code: ${f.errorCode}`);
  });
});
```

:::

## Notes

:::note
The underlying native implementation uses Windows `CreateToolhelp32Snapshot` to enumerate processes and `TerminateProcess` to close them. Each target triggers a full process snapshot, so calling `closeProcesses` with N targets is roughly equivalent to N individual snapshot+terminate cycles.
:::

:::note
When a process is terminated by this API, it exits with the special exit code `1` (`EXIT_CODE_TERMINATED_BY_EISLAND`). Other programs monitoring the terminated process can detect this specific exit code to distinguish eIsland-initiated terminations from normal exits.
:::

:::tip
If you only need to close a single process, use [closeProcess](close-process.md) instead for a simpler call signature.
:::

## Danger Avoidance

:::danger
**Do not pass `0` as a PID.** The PID `0` is reserved by the Windows kernel (it represents the System Idle Process). The native layer explicitly rejects `0` by throwing a `TypeError`. Passing negative numbers or non-integer numbers will also throw.
:::

:::danger
**Terminating critical system processes can destabilize or crash the system.** Processes such as `csrss.exe`, `wininit.exe`, `services.exe`, or `lsass.exe` are essential to Windows stability. Forcefully terminating them will cause a system crash (BSOD). Always filter targets carefully and avoid passing system-critical process names unless you fully understand the consequences.
:::

:::danger
**Elevated privileges may be required.** Terminating processes owned by other users or by the system requires administrator rights. If the current process does not have sufficient privileges, the termination will fail and the `failures` array will contain entries with Windows error code `5` (`ERROR_ACCESS_DENIED`). Run your application as administrator if you need to terminate protected processes.
:::
