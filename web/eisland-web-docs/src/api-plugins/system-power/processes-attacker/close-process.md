---
watermark: true
title: closeProcess
icon: fa6-solid:code
---

# closeProcess

:::info
Terminates all processes matching a single target. Accepts a process name (string) or PID (number).
:::

## Signature

```typescript
function closeProcess(target: string | number): ProcessCloseResult
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `target` | `string \| number` | Process name (kills all matching) or PID |

## Return Value

[ProcessCloseResult](process-close-result.md) with termination details.

:::warning
Terminating system processes may require elevated privileges. The function uses `OpenProcess` + `TerminateProcess` internally.
:::

## Example

```typescript
import { closeProcess } from '@eisland/windows-processes-attacker';

// By process name (kills all instances)
const result = closeProcess('notepad.exe');
console.log(`Terminated ${result.terminatedCount} of ${result.matchedCount} process(es)`);

// By PID
const pidResult = closeProcess(12345);
console.log(`Terminated: ${pidResult.terminatedCount > 0}`);
```
