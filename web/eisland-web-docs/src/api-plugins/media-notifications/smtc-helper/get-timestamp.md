---
watermark: true
title: getTimestamp
icon: fa6-solid:code
---

# getTimestamp

:::info
Returns lightweight timestamp data for the current SMTC media session, without media metadata. Designed for high-frequency polling scenarios such as lyrics synchronization, where fetching full metadata ([getStatus()](get-status.md)) would introduce unnecessary overhead.
:::

## Signature

```typescript
function getTimestamp(): TimestampInfo
```

## Usage

`getTimestamp()` is a synchronous call that queries the Windows SMTC (System Media Transport Controls) for the current playback position and timeline bounds. Because it skips media metadata (title, artist, album art, etc.), it is faster than [getStatus()](get-status.md) and ideal for use cases that only need playback timing.

Typical workflow:

1. Call `getTimestamp()` to obtain the current position and playback state.
2. Check `isAvailable` — if `false`, no media session is active.
3. Access `timeline.position` for the current playback position in seconds.

:::tip
Use `getTimestamp()` in a polling loop (e.g. every 200-500ms) for lyrics sync. Pair it with [SmtcMonitor](smtc-monitor.md) `session-timeline-changed` events for an event-driven approach that avoids polling overhead.
:::

:::tip
If you need the track title, artist, album art, or playback controls in addition to the position, use [getStatus()](get-status.md) instead. Calling both in the same frame is redundant — choose one based on your needs.
:::

## Return Value

Returns a [TimestampInfo](timestamp-info.md) object with the following shape:

| Field | Type | Description |
|-------|------|-------------|
| `isAvailable` | `boolean` | `true` if a media session is active and data was retrieved |
| `playbackStatus` | `'playing' \| 'paused' \| 'stopped' \| 'closed' \| 'opened' \| 'changing' \| 'unknown'` | Current playback state |
| `timeline` | [TimelineProperties](timeline-properties.md) `\| null` | Timeline data, or `null` if unavailable |

```typescript
// Example return value when a media session is active
{
  isAvailable: true,
  playbackStatus: 'playing',
  timeline: {
    startTime: 0,        // Media start time in seconds
    endTime: 354,        // Media end time in seconds
    position: 127.45,    // Current playback position in seconds
    minSeekTime: 0,      // Minimum seekable position
    maxSeekTime: 354,    // Maximum seekable position
  },
}
```

```typescript
// Example return value when no media session is active
{
  isAvailable: false,
  playbackStatus: 'closed',
  timeline: null,
}
```

:::warning
`timeline` can be `null` even when `isAvailable` is `true` — for example, if the media source has not yet reported timeline data. Always null-check `timeline` before accessing its properties.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getTimestamp } from '@eisland/windows-smtc-helper';

// Query lightweight timestamp for lyrics synchronization
const ts = getTimestamp();

// Check if a media session is active
if (ts.isAvailable && ts.timeline) {
  // Current playback position in seconds
  const pos = ts.timeline.position;
  // Total duration in seconds
  const dur = ts.timeline.endTime;

  // Calculate progress percentage
  const progress = ((pos / dur) * 100).toFixed(1);
  console.log(`Position: ${pos.toFixed(2)}s / ${dur.toFixed(2)}s (${progress}%)`);
  // Log current playback state (playing, paused, stopped, etc.)
  console.log(`State: ${ts.playbackStatus}`);
} else {
  // No active media session or timeline unavailable
  console.log('No media playing or timeline unavailable');
}
```

@tab JavaScript

```js
const { getTimestamp } = require('@eisland/windows-smtc-helper');

// Query lightweight timestamp for lyrics synchronization
const ts = getTimestamp();

// Check if a media session is active
if (ts.isAvailable && ts.timeline) {
  // Current playback position in seconds
  const pos = ts.timeline.position;
  // Total duration in seconds
  const dur = ts.timeline.endTime;

  // Calculate progress percentage
  const progress = ((pos / dur) * 100).toFixed(1);
  console.log('Position: ' + pos.toFixed(2) + 's / ' + dur.toFixed(2) + 's (' + progress + '%)');
  // Log current playback state (playing, paused, stopped, etc.)
  console.log('State: ' + ts.playbackStatus);
} else {
  // No active media session or timeline unavailable
  console.log('No media playing or timeline unavailable');
}
```

:::

## Notes

:::note
All time values (`position`, `startTime`, `endTime`, `minSeekTime`, `maxSeekTime`) are in seconds with floating-point precision. The `position` value reflects the last known position reported by the media source — it may lag slightly behind the actual playback position depending on the source application's update frequency.
:::

:::note
The `playbackStatus` field uses string values (`'playing'`, `'paused'`, etc.) not numeric enums. This differs from the `SmtcMonitor` events which report `playbackStatus` as a number. See [TimestampInfo](timestamp-info.md) for the full list of possible values.
:::

:::note
This function queries the most recently active SMTC session. If multiple media apps are running, it returns data for the one that last updated its transport controls — not necessarily the one currently audible.
:::

## Danger Avoidance

:::danger
Do not call `getTimestamp()` (or [getStatus()](get-status.md)) in a tight loop without a delay. While each call is lightweight, calling it hundreds of times per second creates unnecessary CPU load and may cause the calling thread to block. Use a polling interval of 200ms or greater, or prefer the event-driven [SmtcMonitor](smtc-monitor.md) approach.
:::

:::danger
Always check `isAvailable` and null-check `timeline` before accessing `timeline.position`, `timeline.endTime`, etc. Accessing properties on `null` will throw a runtime error and crash the renderer process. See the example above for the correct pattern.
:::
