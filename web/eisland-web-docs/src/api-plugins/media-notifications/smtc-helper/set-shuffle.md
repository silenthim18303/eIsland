---
watermark: true
title: setShuffle
icon: fa6-solid:code
---

# setShuffle

:::info
Enables or disables shuffle mode.
:::

## Signature

```typescript
function setShuffle(active: boolean): CommandResult
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `active` | `boolean` | `true` to enable shuffle, `false` to disable |

## Return Value

[CommandResult](command-result.md) indicating success or failure.

## Example

```typescript
import { setShuffle, getStatus } from '@eisland/windows-smtc-helper';

// Enable shuffle
setShuffle(true);
console.log(`Shuffle: ${getStatus().isShuffleActive}`);

// Disable shuffle
setShuffle(false);
```
