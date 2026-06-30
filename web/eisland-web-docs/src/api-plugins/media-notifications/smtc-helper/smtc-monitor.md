---
title: SmtcMonitor
icon: circle-info
---

# SmtcMonitor

> Placeholder — content to be added.

```ts
class SmtcMonitor extends EventEmitter {
  start(): void;
  stop(): void;
  getMediaSessions(): SessionSnapshot[];
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `session-added` | `sourceAppId: string, mediaProps: MediaProps` | New media session |
| `session-removed` | `sourceAppId: string` | Media session removed |
| `session-media-changed` | `sourceAppId: string, mediaProps: MediaProps` | Media metadata changed |
| `session-playback-changed` | `sourceAppId: string, playbackInfo: PlaybackInfo` | Playback state changed |
| `session-timeline-changed` | `sourceAppId: string, timelineProps: TimelineProps` | Timeline position changed |
| `error` | `err: Error` | Monitor error |
