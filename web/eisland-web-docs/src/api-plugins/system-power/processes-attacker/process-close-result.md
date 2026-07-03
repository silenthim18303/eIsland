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
