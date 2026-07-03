---
watermark: true
title: seek
icon: fa6-solid:code
---

# seek

:::info
Seeks to the specified position in the current media track.
:::

## Signature

```typescript
function seek(positionSeconds: number): CommandResult
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `positionSeconds` | `number` | Target position in seconds |

## Return Value

[CommandResult](command-result.md) indicating success or failure.

:::note
The position is clamped to the range `[minSeekTime, maxSeekTime]` from [TimelineProperties](timeline-properties.md).
:::
