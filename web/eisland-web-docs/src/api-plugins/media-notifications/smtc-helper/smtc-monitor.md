---
watermark: true
title: SmtcMonitor
icon: fa6-solid:cubes
---

# SmtcMonitor

:::info
Real-time System Media Transport Controls monitor. Uses .NET NativeAOT DLL via koffi FFI to subscribe to WinRT SMTC session events.
:::

## Constructor

```typescript
constructor()
```

## Methods

| Method | Return | Description |
|--------|--------|-------------|
| `start()` | `void` | Start monitoring (idempotent) |
| `stop()` | `void` | Stop monitoring (idempotent) |
| `getMediaSessions()` | [SessionSnapshot](session-snapshot.md)`[]` | Get all current media sessions |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `session-added` | `sourceAppId: string, mediaProps: MediaProps` | New media session appeared |
| `session-removed` | `sourceAppId: string` | Media session closed |
| `session-media-changed` | `sourceAppId: string, mediaProps: MediaProps` | Track metadata changed |
| `session-playback-changed` | `sourceAppId: string, playbackInfo: PlaybackInfo` | Playback state changed |
| `session-timeline-changed` | `sourceAppId: string, timelineProps: TimelineProps` | Timeline position updated |
| `error` | `err: Error` | Monitor error |

:::tip
Use `getMediaSessions()` to get an immediate snapshot of all active media sessions. Events update this state incrementally.
:::

:::note
Multiple media sessions can coexist (e.g., browser + Spotify). Each session is identified by its `sourceAppId`.
:::

## Example

```typescript
import { SmtcMonitor } from '@eisland/windows-smtc-helper';

const monitor = new SmtcMonitor();

monitor.on('session-added', (appId, media) => {
  console.log(`🎵 New session: ${appId} — ${media.title}`);
});

monitor.on('session-media-changed', (appId, media) => {
  console.log(`🔄 [${appId}] Now playing: ${media.title} — ${media.artist}`);
});

monitor.on('session-playback-changed', (appId, playback) => {
  console.log(`⏯️ [${appId}] Status: ${playback.playbackStatus}`);
});

monitor.on('session-removed', (appId) => {
  console.log(`❌ Session closed: ${appId}`);
});

monitor.on('error', (err) => {
  console.error('SMTC error:', err);
});

monitor.start();

// List current sessions
const sessions = monitor.getMediaSessions();
console.log(`${sessions.length} active session(s)`);

// ... later
monitor.stop();
```
