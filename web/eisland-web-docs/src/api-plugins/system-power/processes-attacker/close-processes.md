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

:::tip
Targets are processed sequentially. Use this over multiple `closeProcess()` calls for batch operations.
:::
