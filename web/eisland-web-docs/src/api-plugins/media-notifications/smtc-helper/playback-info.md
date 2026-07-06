---
watermark: true
title: PlaybackInfo
icon: fa6-solid:table
---

# PlaybackInfo

:::info Introduction
`PlaybackInfo` is a lightweight interface that carries the playback status and playback type for a media session. It is emitted as a callback parameter when the [`SmtcMonitor`](./smtc-monitor.md) fires the `session-playback-changed` event, giving your application real-time updates on play/pause/stop state transitions and the category of media being played.
:::

## Interface Introduction

`PlaybackInfo` is a data structure you never construct yourself — it arrives via the `session-playback-changed` event listener on [`SmtcMonitor`](./smtc-monitor.md). Unlike the richer [`MediaStatus`](./media-status.md) returned by `getStatus()`, this interface contains only the two numeric codes that changed, making it extremely lightweight and suitable for high-frequency event handling.

:::note Relationship to MediaStatus
If you need full metadata (title, artist, album art, timeline, etc.) alongside playback state, use [`getStatus()`](./get-status.md) or [`MediaStatus`](./media-status.md) instead. `PlaybackInfo` is optimized for event-driven scenarios where you only need to react to state changes.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `playbackStatus` | `number` | Numeric playback status code (see table below) |
| `playbackType` | `number` | Numeric media type code (see table below) |

### Playback Status Codes

| Value | State | Description |
|-------|-------|-------------|
| `0` | Closed | Session closed, no media available |
| `1` | Opened | Session opened but playback has not started |
| `2` | Changing | Playback is transitioning (e.g., loading next track) |
| `3` | Stopped | Playback is stopped |
| `4` | Playing | Media is actively playing |
| `5` | Paused | Playback is paused |
| `6` | Unknown | Status could not be determined |

:::tip
The most common values you will encounter are `4` (Playing) and `5` (Paused). Use these to toggle a play/pause button icon in your UI.
:::

### Playback Type Codes

| Value | Type | Description |
|-------|------|-------------|
| `0` | Unknown | Media type not specified |
| `1` | Music | Audio/music content |
| `2` | Video | Video content |
| `3` | Image | Image/photo slideshow content |

## Usage

You interact with `PlaybackInfo` exclusively through the [`SmtcMonitor`](./smtc-monitor.md) event system. The typical workflow is:

1. Create an [`SmtcMonitor`](./smtc-monitor.md) instance and call `start()`.
2. Register a `session-playback-changed` listener.
3. The listener receives the source app's `sourceAppId` and a `PlaybackInfo` object whenever the playback state changes.

:::tip Use Constants for Readability
Define constants for the status and type values in your codebase instead of using raw magic numbers. This makes your event handlers self-documenting:
```ts
const PLAYING = 4;
const PAUSED = 5;
const MUSIC = 1;
```
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { SmtcMonitor, PlaybackInfo } from '@eisland/windows-smtc-helper';

// Create a monitor instance to listen for SMTC session events
const monitor = new SmtcMonitor();

// Register a listener for playback state changes
monitor.on('session-playback-changed', (sourceAppId: string, playback: PlaybackInfo) => {
  // Log the source application that triggered the change
  console.log(`App: ${sourceAppId}`);

  // Check if the media is now playing (status code 4)
  if (playback.playbackStatus === 4) {
    console.log('Media is now playing');
  }
  // Check if the media is now paused (status code 5)
  else if (playback.playbackStatus === 5) {
    console.log('Media is now paused');
  }

  // Check the type of media (1 = Music, 2 = Video, 3 = Image)
  if (playback.playbackType === 1) {
    console.log('Media type: Music');
  } else if (playback.playbackType === 2) {
    console.log('Media type: Video');
  }
});

// Start monitoring SMTC sessions from all media apps
monitor.start();
```

@tab JavaScript

```js
const { SmtcMonitor } = require('@eisland/windows-smtc-helper');

// Create a monitor instance to listen for SMTC session events
const monitor = new SmtcMonitor();

// Register a listener for playback state changes
monitor.on('session-playback-changed', (sourceAppId, playback) => {
  // Log the source application that triggered the change
  console.log(`App: ${sourceAppId}`);

  // Check if the media is now playing (status code 4)
  if (playback.playbackStatus === 4) {
    console.log('Media is now playing');
  }
  // Check if the media is now paused (status code 5)
  else if (playback.playbackStatus === 5) {
    console.log('Media is now paused');
  }

  // Check the type of media (1 = Music, 2 = Video, 3 = Image)
  if (playback.playbackType === 1) {
    console.log('Media type: Music');
  } else if (playback.playbackType === 2) {
    console.log('Media type: Video');
  }
});

// Start monitoring SMTC sessions from all media apps
monitor.start();
```

:::

## Notes

:::note Raw Numeric Codes
The `playbackStatus` and `playbackType` values are raw numeric enumerations from the Windows SMTC (System Media Transport Controls) API. They are **not** string labels like the `playbackStatus` field on [`MediaStatus`](./media-status.md). If you need a human-readable status string, use [`getStatus()`](./get-status.md) instead.
:::

:::note High-Frequency Events
The `session-playback-changed` event can fire rapidly — for example, when a user rapidly taps play/pause, or when an app transitions between tracks. If you update UI in this listener, consider debouncing or throttling to avoid unnecessary re-renders.
:::

:::tip Complementary Events
Pair `session-playback-changed` with other [`SmtcMonitor`](./smtc-monitor.md) events for a complete picture:
- `session-media-changed` — fires when the track title, artist, or album art changes.
- `session-timeline-changed` — fires when the playback position updates.
- `session-added` / `session-removed` — fires when media apps open or close.
:::

## Danger Avoidance

:::danger Do Not Assume Status Codes Are Stable Across Windows Versions
While the numeric status codes currently align with the `GlobalSystemMediaTransportControlsSessionPlaybackStatus` WinRT enum, Microsoft may introduce new values in future Windows releases. Always include a fallback branch (`else` / `default`) when processing `playbackStatus` or `playbackType` to avoid silent bugs when an unexpected value appears.
:::

:::danger Do Not Block the Event Listener
The `session-playback-changed` callback executes on the SMTC event thread. Performing synchronous heavy computation, file I/O, or network requests directly inside this listener will block SMTC event delivery and may cause the monitor to miss subsequent events. Offload heavy work to an async queue or worker.
:::
