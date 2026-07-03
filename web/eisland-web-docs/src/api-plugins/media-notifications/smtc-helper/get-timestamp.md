---
watermark: true
title: getTimestamp
icon: fa6-solid:code
---

# getTimestamp

:::info
Returns lightweight timestamp data without media metadata. Optimized for lyrics synchronization.
:::

## Signature

```typescript
function getTimestamp(): TimestampInfo
```

## Return Value

[TimestampInfo](timestamp-info.md) object.

## Example

```typescript
import { getTimestamp } from '@eisland/windows-smtc-helper';

// Optimized for lyrics sync — no metadata overhead
const ts = getTimestamp();
if (ts.isAvailable && ts.timeline) {
  console.log(`Position: ${ts.timeline.position.toFixed(2)}s`);
  console.log(`Playback: ${ts.playbackStatus}`);
}
```
