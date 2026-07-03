---
watermark: true
title: TimelineProps
icon: fa6-solid:table
---

# TimelineProps

:::info
Simplified timeline position and duration for SmtcMonitor events.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `position` | `number` | Current playback position in seconds |
| `duration` | `number` | Total duration in seconds |

:::tip
This is a simplified version of [TimelineProperties](timeline-properties.md) used by SmtcMonitor events. Use `getStatus()` for full timeline data.
:::

## Example

```typescript
import { SmtcMonitor } from '@eisland/windows-smtc-helper';

const monitor = new SmtcMonitor();
monitor.start();

monitor.on('session-timeline-changed', (appId, timeline) => {
  const pct = ((timeline.position / timeline.duration) * 100).toFixed(1);
  console.log(`[${appId}] ${timeline.position.toFixed(1)}s / ${timeline.duration.toFixed(1)}s (${pct}%)`);
});
```
