---
watermark: true
title: SmtcMonitor
icon: fa6-solid:cubes
---

# SmtcMonitor

:::info Introduction
`SmtcMonitor` is a real-time monitor for Windows System Media Transport Controls (SMTC). It subscribes to WinRT SMTC session events via a .NET NativeAOT DLL through koffi FFI, notifying your application whenever media sessions appear, change tracks, update playback state, or close. Each monitor instance maintains its own event loop and tracks all active media sessions independently.
:::

## Constructor

```typescript
new SmtcMonitor(): SmtcMonitor
```

:::note
The constructor allocates native resources and prepares the event listener. No events will fire until you call `start()`. You may create multiple `SmtcMonitor` instances, but each one consumes system resources — prefer a single instance per application.
:::

## Methods

| Method | Return | Description |
|--------|--------|-------------|
| `start()` | `void` | Start monitoring for SMTC session events. Calling `start()` on an already-running monitor is a no-op (idempotent). |
| `stop()` | `void` | Stop monitoring and release the native event subscription. Calling `stop()` on an already-stopped monitor is a no-op (idempotent). |
| `getMediaSessions()` | [SessionSnapshot](session-snapshot.md)`[]` | Return an array of snapshots for all currently active media sessions. |

:::tip
Call `getMediaSessions()` immediately after `start()` to get the current state of all active sessions before any incremental events arrive. This is useful for initializing your UI with existing media sessions on application startup.
:::

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `session-added` | `sourceAppId: string, mediaProps: MediaProps` | A new media session appeared on the system. |
| `session-removed` | `sourceAppId: string` | A media session was closed or its source app exited. |
| `session-media-changed` | `sourceAppId: string, mediaProps: MediaProps` | Track metadata changed (title, artist, album art, etc.). |
| `session-playback-changed` | `sourceAppId: string, playbackInfo: PlaybackInfo` | Playback state changed (playing, paused, stopped, etc.). |
| `session-timeline-changed` | `sourceAppId: string, timelineProps: TimelineProps` | Playback position or duration updated. |
| `error` | `err: Error` | An internal error occurred in the native monitoring layer. |

:::note
Multiple media sessions can coexist on the system (e.g., a browser tab playing audio alongside Spotify). Each session is uniquely identified by its `sourceAppId` string, which corresponds to the app's User Model ID.
:::

## Usage

`SmtcMonitor` follows a straightforward lifecycle: construct, attach listeners, start, and later stop when done.

1. **Create** a `SmtcMonitor` instance.
2. **Attach event listeners** for the events you care about.
3. **Call `start()`** to begin receiving events from the system.
4. **Call `stop()`** when you no longer need monitoring (e.g., on app shutdown) to release native resources.

:::tip
If you only need the current playback position for lyric synchronization and do not need full media metadata, consider using the standalone [`getTimestamp()`](smtc-helper.md) function instead — it is lighter weight than maintaining a full monitor.
:::

:::warning
The `session-timeline-changed` event fires frequently during active playback (roughly once per second). Avoid performing expensive operations (DOM updates, network requests) directly in this handler. Debounce or throttle your processing as needed.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { SmtcMonitor, MediaProps, PlaybackInfo, TimelineProps } from '@eisland/windows-smtc-helper';

// Create a new SMTC monitor instance
const monitor = new SmtcMonitor();

// Listen for new media sessions appearing on the system
monitor.on('session-added', (sourceAppId: string, media: MediaProps) => {
  console.log(`New session: ${sourceAppId} — ${media.title}`);
});

// Listen for track metadata changes (title, artist, album art, etc.)
monitor.on('session-media-changed', (sourceAppId: string, media: MediaProps) => {
  console.log(`[${sourceAppId}] Now playing: ${media.title} — ${media.artist}`);
});

// Listen for playback state changes (playing, paused, stopped, etc.)
monitor.on('session-playback-changed', (sourceAppId: string, playback: PlaybackInfo) => {
  console.log(`[${sourceAppId}] Playback status: ${playback.playbackStatus}`);
});

// Listen for timeline updates (position and duration changes)
monitor.on('session-timeline-changed', (sourceAppId: string, timeline: TimelineProps) => {
  console.log(`[${sourceAppId}] Position: ${timeline.position}s / ${timeline.duration}s`);
});

// Listen for sessions being removed (app closed, media stopped, etc.)
monitor.on('session-removed', (sourceAppId: string) => {
  console.log(`Session closed: ${sourceAppId}`);
});

// Handle errors from the native monitoring layer
monitor.on('error', (err: Error) => {
  console.error('SMTC monitor error:', err.message);
});

// Start monitoring — events begin firing after this call
monitor.start();

// Get an immediate snapshot of all active media sessions
const sessions = monitor.getMediaSessions();
console.log(`${sessions.length} active session(s)`);

// Stop monitoring and release native resources when done
monitor.stop();
```

@tab JavaScript

```js
const { SmtcMonitor } = require('@eisland/windows-smtc-helper');

// Create a new SMTC monitor instance
const monitor = new SmtcMonitor();

// Listen for new media sessions appearing on the system
monitor.on('session-added', (sourceAppId, media) => {
  console.log(`New session: ${sourceAppId} — ${media.title}`);
});

// Listen for track metadata changes (title, artist, album art, etc.)
monitor.on('session-media-changed', (sourceAppId, media) => {
  console.log(`[${sourceAppId}] Now playing: ${media.title} — ${media.artist}`);
});

// Listen for playback state changes (playing, paused, stopped, etc.)
monitor.on('session-playback-changed', (sourceAppId, playback) => {
  console.log(`[${sourceAppId}] Playback status: ${playback.playbackStatus}`);
});

// Listen for timeline updates (position and duration changes)
monitor.on('session-timeline-changed', (sourceAppId, timeline) => {
  console.log(`[${sourceAppId}] Position: ${timeline.position}s / ${timeline.duration}s`);
});

// Listen for sessions being removed (app closed, media stopped, etc.)
monitor.on('session-removed', (sourceAppId) => {
  console.log(`Session closed: ${sourceAppId}`);
});

// Handle errors from the native monitoring layer
monitor.on('error', (err) => {
  console.error('SMTC monitor error:', err.message);
});

// Start monitoring — events begin firing after this call
monitor.start();

// Get an immediate snapshot of all active media sessions
const sessions = monitor.getMediaSessions();
console.log(`${sessions.length} active session(s)`);

// Stop monitoring and release native resources when done
monitor.stop();
```

:::

## Notes

:::note
The `SmtcMonitor` class extends Node.js `EventEmitter`. All standard EventEmitter methods (`on`, `once`, `off`, `removeAllListeners`, etc.) are available. Use `removeAllListeners()` to bulk-detach listeners before destroying the monitor if needed.
:::

:::tip
For lyric synchronization or any use case that only needs the current playback position without full media metadata, use the standalone [`getTimestamp()`](smtc-helper.md) function. It returns a lightweight `TimestampInfo` object and avoids the overhead of maintaining a full monitor instance.
:::

:::note
The `MediaProps.thumbnail` field, when available, is a `data:image/jpeg;base64,...` data URI. You can assign it directly to an `<img>` element's `src` attribute or an Electron `nativeImage` source. It will be `null` if the media source does not provide album art.
:::

:::warning
`start()` and `stop()` are idempotent, but calling `getMediaSessions()` after `stop()` will return an empty array since the native event subscription has been released. Re-call `start()` to resume monitoring.
:::

## Danger Avoidance

:::danger
Always call `stop()` when you are done with the monitor, such as when your component unmounts or your application exits. Failing to do so leaks the native event subscription and the underlying .NET NativeAOT resources. In long-running applications, this can lead to unbounded resource growth and eventual system instability.
:::

:::danger
Do not call `start()` on a monitor whose native resources have been freed by `stop()` and then immediately rely on `getMediaSessions()` returning data. After `stop()`, the internal session state is cleared. You must call `start()` again and wait for `session-added` events (or call `getMediaSessions()` after `start()` re-initializes) to get session data.
:::

:::danger
Avoid attaching a large number of listeners to the `session-timeline-changed` event without throttling. This event fires approximately once per second per active session. With multiple sessions and unthrottled heavy handlers, this can cause significant CPU usage and degrade application performance.
:::
