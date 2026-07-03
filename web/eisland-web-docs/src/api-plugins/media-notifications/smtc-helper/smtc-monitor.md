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
