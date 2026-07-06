---
watermark: true
title: TimelineProperties
icon: fa6-solid:table
---

# TimelineProperties

:::info Introduction
`TimelineProperties` describes the playback timeline of the currently active media. It carries the start/end boundaries, the current playback position, and the seekable range. You encounter this interface as the `timeline` field on [MediaStatus](media-status.md) (returned by `getStatus()`) and [TimestampInfo](timestamp-info.md) (returned by `getTimestamp()`).
:::

## Interface Introduction

The timeline is the backbone for any progress-bar or lyric-sync feature. When Windows SMTC reports a timeline change, the helper parses the native `TimeSpan` values into plain seconds so you can work with them directly in JavaScript/TypeScript without manual conversion.

:::tip Lightweight alternative
If you only need the current position and playback status (e.g. for lyric calibration), prefer `getTimestamp()` over `getStatus()`. It skips media metadata and returns a smaller `TimestampInfo` object that still carries `TimelineProperties`.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `startTime` | `number` | Start time of the media timeline, in seconds. Usually `0`. |
| `endTime` | `number` | End time (total duration) of the media, in seconds. |
| `position` | `number` | Current playback position, in seconds. |
| `minSeekTime` | `number` | Minimum seekable time, in seconds. Typically equals `startTime`. |
| `maxSeekTime` | `number` | Maximum seekable time, in seconds. Typically equals `endTime`. |

:::note Seek range
Some streaming apps may restrict the seekable range to a window smaller than the full timeline (e.g. live radio with a short replay buffer). Always use `minSeekTime` / `maxSeekTime` instead of hard-coding `startTime` / `endTime` when building seek controls.
:::

:::note Units
All time values are in **seconds** (floating-point). Windows internally uses 100-nanosecond `TimeSpan` ticks; the plugin converts them for you.
:::

## Usage

You access `TimelineProperties` through one of two paths:

1. **`getStatus()`** -- returns a full [MediaStatus](media-status.md) object. Read `status.timeline` for the timeline. This call also gives you metadata, album art, and playback controls.
2. **`getTimestamp()`** -- returns a lightweight [TimestampInfo](timestamp-info.md) object. Read `timestamp.timeline` for the timeline. This is cheaper when you only need position tracking.

Both return `null` for the `timeline` field when no media session is active or the session has not reported timeline info yet.

:::tip Progress calculation
Use `position / endTime` to compute a 0-1 progress fraction. Guard against `endTime === 0` to avoid division-by-zero on edge-case media sessions.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getStatus } from '@eisland/windows-smtc-helper';

// Fetch the full media status (includes timeline, metadata, controls)
const status = getStatus();

// Guard: timeline may be null when no media is active
if (status.timeline) {
  const { position, endTime, minSeekTime, maxSeekTime } = status.timeline;

  // Calculate playback progress as a percentage
  const progress = endTime > 0
    ? ((position / endTime) * 100).toFixed(1)
    : '0.0';

  // Format seconds into m:ss display string
  console.log(`${formatTime(position)} / ${formatTime(endTime)} (${progress}%)`);

  // Log the seekable range (may differ from full timeline on some apps)
  console.log(`Seek range: ${formatTime(minSeekTime)} - ${formatTime(maxSeekTime)}`);
}

/** Convert a duration in seconds to "m:ss" format */
function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
```

@tab JavaScript

```js
const { getStatus } = require('@eisland/windows-smtc-helper');

// Fetch the full media status (includes timeline, metadata, controls)
const status = getStatus();

// Guard: timeline may be null when no media is active
if (status.timeline) {
  const { position, endTime, minSeekTime, maxSeekTime } = status.timeline;

  // Calculate playback progress as a percentage
  const progress = endTime > 0
    ? ((position / endTime) * 100).toFixed(1)
    : '0.0';

  // Format seconds into m:ss display string
  console.log(`${formatTime(position)} / ${formatTime(endTime)} (${progress}%)`);

  // Log the seekable range (may differ from full timeline on some apps)
  console.log(`Seek range: ${formatTime(minSeekTime)} - ${formatTime(maxSeekTime)}`);
}

/** Convert a duration in seconds to "m:ss" format */
function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
```

:::

## Notes

:::note Nullable timeline
Both `getStatus().timeline` and `getTimestamp().timeline` can be `null`. This happens when the media source has not reported timeline data yet (e.g. an internet radio stream that only reports playback status). Always null-check before accessing properties.
:::

:::tip Real-time updates via SmtcMonitor
If you need continuous position updates without polling `getStatus()`, use the [`SmtcMonitor`](smtc-monitor.md) class. Its `session-timeline-changed` event fires whenever the OS reports a timeline change, giving you a `TimelineProps` object with `position` and `duration` without repeated IPC overhead.
:::

:::note Difference from SmtcMonitor TimelineProps
The `TimelineProperties` interface returned by `getStatus()` / `getTimestamp()` has five fields (`startTime`, `endTime`, `position`, `minSeekTime`, `maxSeekTime`). The `TimelineProps` used in `SmtcMonitor` events has only two fields (`position`, `duration`). They are distinct types for distinct contexts.
:::

## Danger Avoidance

:::danger Do not assume timeline is always available
Accessing `timeline.position` without null-checking `timeline` first will throw a `TypeError: Cannot read properties of null`. Media sources like web browsers or some music players may not report timeline info at all. Always guard with `if (status.timeline) { ... }`.
:::

:::danger Do not use timeline values for seeking without validation
Passing an out-of-range value to `seek()` can produce undefined behavior depending on the media source. Always clamp the target position between `minSeekTime` and `maxSeekTime` before calling `seek()`.
:::
