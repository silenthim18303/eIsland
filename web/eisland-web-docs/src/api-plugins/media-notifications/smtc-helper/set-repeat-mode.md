---
watermark: true
title: setRepeatMode
icon: fa6-solid:code
---

# setRepeatMode

:::info
Sets the repeat mode for media playback.
:::

## Signature

```typescript
function setRepeatMode(mode: number): CommandResult
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `mode` | `number` | `0` = None, `1` = Track, `2` = List |

## Return Value

[CommandResult](command-result.md) indicating success or failure.

```typescript
// Example return value
{ success: true, error: null }
```

## Example

```typescript
import { setRepeatMode } from '@eisland/windows-smtc-helper';

setRepeatMode(0); // None — no repeat
setRepeatMode(1); // Track — repeat current track
setRepeatMode(2); // List  — repeat entire playlist
```
