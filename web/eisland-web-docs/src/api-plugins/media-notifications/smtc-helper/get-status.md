---
watermark: true
title: getStatus
icon: fa6-solid:code
---

# getStatus

:::info
Returns a complete snapshot of the current media status including metadata, playback state, and timeline.
:::

## Signature

```typescript
function getStatus(): MediaStatus
```

## Return Value

[MediaStatus](media-status.md) object.

:::tip
For lyrics synchronization or other position-only use cases, prefer [getTimestamp()](get-timestamp.md) for lower latency.
:::

## Example

```typescript
import { getStatus } from '@eisland/windows-smtc-helper';

const status = getStatus();
if (status.isAvailable) {
  console.log(`🎵 ${status.title} — ${status.artist}`);
  console.log(`Status: ${status.playbackStatus}`);
  console.log(`Shuffle: ${status.isShuffleActive}, Repeat: ${status.repeatMode}`);
} else {
  console.log('No active media session');
}
```
