---
watermark: true
title: play
icon: fa6-solid:code
---

# play

:::info
Sends a play command to the active media session.
:::

## Signature

```typescript
function play(): CommandResult
```

## Return Value

[CommandResult](command-result.md) indicating success or failure.

```typescript
// Example return value
{ success: true, error: null }
```

## Example

```typescript
import { play } from '@eisland/windows-smtc-helper';

const result = play();
if (result.success) {
  console.log('▶️ Playback resumed');
} else {
  console.error(`Play failed: ${result.error}`);
}
```
