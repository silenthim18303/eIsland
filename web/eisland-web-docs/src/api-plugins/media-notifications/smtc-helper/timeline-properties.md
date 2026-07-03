---
watermark: true
title: TimelineProperties
icon: fa6-solid:table
---

# TimelineProperties

:::info
Media playback timeline bounds and current position.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `startTime` | `number` | Timeline start time in seconds |
| `endTime` | `number` | Timeline end time in seconds |
| `position` | `number` | Current playback position in seconds |
| `minSeekTime` | `number` | Minimum seekable time in seconds |
| `maxSeekTime` | `number` | Maximum seekable time in seconds |

## Example

```typescript
import { getStatus } from '@eisland/windows-smtc-helper';

const status = getStatus();
if (status.timeline) {
  const { position, endTime } = status.timeline;
  const progress = ((position / endTime) * 100).toFixed(1);
  console.log(`${formatTime(position)} / ${formatTime(endTime)} (${progress}%)`);
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
```
