---
watermark: true
title: setPlaybackRate
icon: fa6-solid:code
---

# setPlaybackRate

:::info
Sets the playback speed rate.
:::

## Signature

```typescript
function setPlaybackRate(rate: number): CommandResult
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `rate` | `number` | Playback rate (`1.0` = normal speed) |

## Return Value

[CommandResult](command-result.md) indicating success or failure.

```typescript
// Example return value
{ success: true, error: null }
```

## Example

```typescript
import { setPlaybackRate } from '@eisland/windows-smtc-helper';

setPlaybackRate(1.0); // Normal speed
setPlaybackRate(1.5); // 1.5× speed
setPlaybackRate(2.0); // Double speed
setPlaybackRate(0.5); // Half speed
```
