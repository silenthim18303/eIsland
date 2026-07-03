---
watermark: true
title: TimestampInfo
icon: fa6-solid:table
---

# TimestampInfo

:::info
Lightweight timestamp data without media metadata. Optimized for lyrics synchronization and similar use cases.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `isAvailable` | `boolean` | Whether timestamp data is available |
| `playbackStatus` | `"playing" \| "paused" \| "stopped" \| "closed" \| "opened" \| "changing" \| "unknown"` | Current playback state |
| `timeline` | [TimelineProperties](timeline-properties.md) `\| null` | Timeline data |

:::tip
Use `getTimestamp()` instead of `getStatus()` when you only need playback position — it skips media metadata for lower latency.
:::
