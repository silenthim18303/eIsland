---
watermark: true
title: TimelineProps
icon: fa6-solid:table
---

# TimelineProps

:::info
`TimelineProps` is a lightweight snapshot of media playback position and total duration. It is emitted by the [`SmtcMonitor`](smtc-monitor.md) on the `session-timeline-changed` event whenever a media session's timeline updates. Compared to the full [`TimelineProperties`](timeline-properties.md) returned by `getStatus()`, this interface carries only the two fields most commonly needed for progress tracking.
:::

## Interface Introduction

You encounter `TimelineProps` as the second argument of the `session-timeline-changed` listener on a [`SmtcMonitor`](smtc-monitor.md) instance, paired with the source app's `sourceAppId` string. It is also the shape of the `timeline` field inside a [`SessionSnapshot`](session-snapshot.md) returned by `getMediaSessions()`.

This interface is intentionally minimal — it omits `startTime`, `endTime`, `minSeekTime`, and `maxSeekTime` from the full [`TimelineProperties`](timeline-properties.md). If you need seek boundaries or start/end times, call `getStatus()` instead.

## Usage

The primary use case for `TimelineProps` is rendering a real-time progress indicator (e.g., a seek bar or percentage display) for the currently playing media. The monitor delivers timeline updates at a high frequency, so your listener should be lightweight.

:::tip
When building a progress bar, guard against `duration` being `0` to avoid division-by-zero. Some media sources report `0` briefly before the timeline is fully initialized.
:::

:::note
`position` and `duration` are both in **seconds** as floating-point numbers. The precision depends on the reporting media app — some apps update once per second, others more frequently.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `position` | `number` | Current playback position in seconds |
| `duration` | `number` | Total media duration in seconds |

:::tip
To compute a percentage, use `(position / duration) * 100`. Always check `duration > 0` before dividing.
:::

:::note
The `session-timeline-changed` event continues to fire even when playback is paused (the position stays constant). Filter by `playbackStatus` from [`PlaybackInfo`](playback-info.md) if you only want updates during active playback.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { SmtcMonitor, TimelineProps } from '@eisland/windows-smtc-helper';

// Create and start the SMTC session monitor
const monitor = new SmtcMonitor();
monitor.start();

// Listen for timeline updates from any media session
monitor.on('session-timeline-changed', (sourceAppId: string, timeline: TimelineProps) => {
  // Guard against zero duration to avoid NaN
  if (timeline.duration <= 0) return;

  // Calculate playback progress as a percentage
  const percent = ((timeline.position / timeline.duration) * 100).toFixed(1);

  // Log the progress for this session
  console.log(`[${sourceAppId}] ${timeline.position.toFixed(1)}s / ${timeline.duration.toFixed(1)}s (${percent}%)`);
});
```

@tab JavaScript

```js
const { SmtcMonitor } = require('@eisland/windows-smtc-helper');

// Create and start the SMTC session monitor
const monitor = new SmtcMonitor();
monitor.start();

// Listen for timeline updates from any media session
monitor.on('session-timeline-changed', (sourceAppId, timeline) => {
  // Guard against zero duration to avoid NaN
  if (timeline.duration <= 0) return;

  // Calculate playback progress as a percentage
  const percent = ((timeline.position / timeline.duration) * 100).toFixed(1);

  // Log the progress for this session
  console.log(`[${sourceAppId}] ${timeline.position.toFixed(1)}s / ${timeline.duration.toFixed(1)}s (${percent}%)`);
});
```

:::

## Notes

:::note
`TimelineProps` does **not** include seek boundaries. If you need to implement a seek operation, use the full [`TimelineProperties`](timeline-properties.md) from `getStatus()` which provides `minSeekTime` and `maxSeekTime`.
:::

:::tip
If you only need the current position without media metadata (e.g., for lyric synchronization), consider `getTimestamp()` which returns a lightweight [`TimestampInfo`](timestamp-info.md) object. It is a synchronous call rather than an event-driven update.
:::

:::note
When a session is removed or the media source changes, the `timeline` field inside a [`SessionSnapshot`](session-snapshot.md) may become `null`. Always null-check when reading from `getMediaSessions()`.
:::

## Danger Avoidance

:::danger
**Do not perform heavy computation inside the `session-timeline-changed` listener.** The monitor fires this event at high frequency (often multiple times per second). Expensive operations like DOM updates, network requests, or file I/O inside this callback will cause UI lag and excessive CPU usage. Debounce or throttle any downstream processing.
:::

:::danger
**Do not forget to call `monitor.stop()` when done.** Failing to stop the monitor leaks the underlying native WinRT event listener. In an Electron app, this prevents clean shutdown and may cause the process to hang. Always stop the monitor when the component or window that uses it is destroyed.
:::
