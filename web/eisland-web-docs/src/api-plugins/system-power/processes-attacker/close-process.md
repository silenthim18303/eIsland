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
