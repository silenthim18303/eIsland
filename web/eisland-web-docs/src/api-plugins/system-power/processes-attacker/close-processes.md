---
watermark: true
title: closeProcesses
icon: fa6-solid:code
---

# closeProcesses

:::info
Terminates processes for each target in an array. Processes targets sequentially.
:::

## Signature

```typescript
function closeProcesses(targets: (string | number)[]): ProcessCloseResult[]
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `targets` | `(string \| number)[]` | Array of process names or PIDs |

## Return Value

Array of [ProcessCloseResult](process-close-result.md), one per target.

```typescript
// Example return value
[
  { target: 'notepad.exe', matchedCount: 2, terminatedCount: 2, failedCount: 0, failures: [] },
  { target: 12345, matchedCount: 1, terminatedCount: 0, failedCount: 1, failures: [
    { pid: 12345, name: 'svchost.exe', errorCode: 5 },
  ]},
]
```

:::tip
Targets are processed sequentially. Use this over multiple `closeProcess()` calls for batch operations.
:::

## Example

```typescript
import { closeProcesses } from '@eisland/windows-processes-attacker';

// Batch terminate multiple targets
const results = closeProcesses(['notepad.exe', 'calc.exe', 5678]);

results.forEach(r => {
  const label = typeof r.target === 'string' ? r.target : `PID ${r.target}`;
  console.log(`${label}: ${r.terminatedCount} terminated, ${r.failedCount} failed`);
});
```
