---
watermark: true
title: TimestampInfo
icon: fa6-solid:table
---

# TimestampInfo

:::info Introduction
`TimestampInfo` is a lightweight data interface returned by the [`getTimestamp()`](get-timestamp.md) function. It contains only playback state and timeline position data — no media metadata (title, artist, album art, etc.). This makes it ideal for high-frequency polling scenarios such as lyrics synchronization, seek-bar rendering, and playback progress tracking where fetching full metadata would be wasteful.
:::

## Interface Introduction

`TimestampInfo` is the return type of [`getTimestamp()`](get-timestamp.md). You encounter this interface whenever you call `getTimestamp()` to read the current playback position without incurring the overhead of fetching album art, track names, or control states.

Compared to [`MediaStatus`](media-status.md) (returned by [`getStatus()`](get-status.md)), `TimestampInfo` strips away all metadata and control information, leaving only what is needed to answer the question: *"Where is playback right now?"*

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `isAvailable` | `boolean` | Whether any media session is currently active and timestamp data is available |
| `playbackStatus` | `"playing" \| "paused" \| "stopped" \| "closed" \| "opened" \| "changing" \| "unknown"` | Current playback state of the active session |
| `timeline` | [`TimelineProperties`](timeline-properties.md) `\| null` | Timeline data with position and bounds, or `null` if unavailable |

:::note `timeline` can be `null`
Even when `isAvailable` is `true`, the `timeline` field may be `null` if the media source has not yet reported timeline data. Always null-check `timeline` before accessing its properties.
:::

:::tip Use `getTimestamp()` for polling loops
If you are building a lyrics sync engine or progress bar that polls at 100–500 ms intervals, prefer `getTimestamp()` over `getStatus()`. The former skips album art decoding and metadata aggregation, resulting in lower latency and reduced memory pressure.
:::

## Usage

`TimestampInfo` is not constructed directly — it is obtained by calling [`getTimestamp()`](get-timestamp.md). The typical workflow is:

1. Call `getTimestamp()` to receive a `TimestampInfo` object.
2. Check `isAvailable` to confirm an active media session exists.
3. Check `timeline` for `null` before reading `position`, `endTime`, etc.
4. Use `playbackStatus` to determine whether the media is actively playing.

:::tip Combining with full status
Use `getTimestamp()` for frequent position polling and [`getStatus()`](get-status.md) for one-time metadata reads (e.g., when a track changes). This hybrid approach keeps your UI responsive while still showing rich track info.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getTimestamp } from '@eisland/windows-smtc-helper';

// Call getTimestamp() to receive lightweight playback data
const ts = getTimestamp();

// Check if a media session is active
if (ts.isAvailable) {
  // Check if timeline data is available
  if (ts.timeline) {
    // Read the current playback position in seconds
    const pos = ts.timeline.position;
    // Read the total duration in seconds
    const dur = ts.timeline.endTime;
    // Calculate progress as a percentage
    const pct = dur > 0 ? ((pos / dur) * 100).toFixed(1) : '0.0';
    // Log formatted progress
    console.log(`Position: ${pos.toFixed(1)}s / ${dur.toFixed(1)}s (${pct}%)`);
  }
  // Log the current playback state (playing, paused, stopped, etc.)
  console.log(`Status: ${ts.playbackStatus}`);
} else {
  // No media session is active
  console.log('No media session available');
}
```

@tab JavaScript

```js
const { getTimestamp } = require('@eisland/windows-smtc-helper');

// Call getTimestamp() to receive lightweight playback data
const ts = getTimestamp();

// Check if a media session is active
if (ts.isAvailable) {
  // Check if timeline data is available
  if (ts.timeline) {
    // Read the current playback position in seconds
    const pos = ts.timeline.position;
    // Read the total duration in seconds
    const dur = ts.timeline.endTime;
    // Calculate progress as a percentage
    const pct = dur > 0 ? ((pos / dur) * 100).toFixed(1) : '0.0';
    // Log formatted progress
    console.log(`Position: ${pos.toFixed(1)}s / ${dur.toFixed(1)}s (${pct}%)`);
  }
  // Log the current playback state (playing, paused, stopped, etc.)
  console.log(`Status: ${ts.playbackStatus}`);
} else {
  // No media session is active
  console.log('No media session available');
}
```

:::

## Notes

:::note Playback status values
The `playbackStatus` string matches the Windows System Media Transport Controls state machine. Possible values are: `"playing"`, `"paused"`, `"stopped"`, `"closed"`, `"opened"`, `"changing"`, and `"unknown"`. Only `"playing"` and `"paused"` are typical for active media; `"stopped"` / `"closed"` indicate the session is ending.
:::

:::note Relationship to TimelineProperties
The `timeline` field, when non-null, is a full [`TimelineProperties`](timeline-properties.md) object containing `startTime`, `endTime`, `position`, `minSeekTime`, and `maxSeekTime`. All time values are in seconds.
:::

:::tip Null-safe timeline access pattern
A common pattern is to destructure with a guard: `const { position, endTime } = ts.timeline ?? { position: 0, endTime: 0 };` — this avoids runtime errors when `timeline` is `null`.
:::

## Danger Avoidance

:::danger Do not assume `timeline` is non-null
Accessing `ts.timeline.position` without checking for `null` will throw a `TypeError` at runtime if no timeline data has been reported yet. Always guard with `if (ts.timeline)` or use optional chaining (`ts.timeline?.position`).
:::

:::danger Do not use `TimestampInfo` for metadata or controls
`TimestampInfo` intentionally omits title, artist, album art, and playback controls. If you need any of those, use [`getStatus()`](get-status.md) which returns the full [`MediaStatus`](media-status.md) object. Polling `getStatus()` at high frequency (e.g., every 100 ms) is wasteful due to album art decoding overhead — use `getTimestamp()` for position polling instead.
:::
