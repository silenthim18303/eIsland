---
watermark: true
title: ProcessCloseResult
icon: fa6-solid:table
---

# ProcessCloseResult

:::info
Result of a process termination operation.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `target` | `string \| number` | The original target (process name or PID) |
| `matchedCount` | `number` | Number of processes that matched the target |
| `terminatedCount` | `number` | Number of processes successfully terminated |
| `failedCount` | `number` | Number of processes that failed to terminate |
| `failures` | [ProcessFailure](process-failure.md)`[]` | Details of each failure |

:::note
When targeting by process name, `matchedCount` may be greater than 1 if multiple instances are running.
:::

## Example

```typescript
import { closeProcess } from '@eisland/windows-processes-attacker';

const result = closeProcess('notepad.exe');
console.log(`Matched: ${result.matchedCount}`);
console.log(`Terminated: ${result.terminatedCount}`);
console.log(`Failed: ${result.failedCount}`);

if (result.failures.length > 0) {
  result.failures.forEach(f => {
    console.error(`  PID ${f.pid} (${f.name}): error ${f.errorCode}`);
  });
}
```
