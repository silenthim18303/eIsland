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
