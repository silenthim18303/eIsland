---
watermark: true
title: SessionSnapshot
icon: fa6-solid:table
---

# SessionSnapshot

:::info
Snapshot of a media session returned by SmtcMonitor.getMediaSessions().
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `sourceAppId` | `string` | Source app identifier |
| `media` | [MediaProps](media-props.md) `\| null` | Media metadata |
| `playback` | [PlaybackInfo](playback-info.md) `\| null` | Playback state |
| `timeline` | [TimelineProps](timeline-props.md) `\| null` | Timeline data |

:::note
Media, playback, and timeline fields may be `null` if the session has not yet reported that information.
:::

## Example

```typescript
import { SmtcMonitor } from '@eisland/windows-smtc-helper';

const monitor = new SmtcMonitor();
monitor.start();

// Get all active sessions
const sessions = monitor.getMediaSessions();
sessions.forEach(s => {
  console.log(`App: ${s.sourceAppId}`);
  if (s.media) console.log(`  Track: ${s.media.title}`);
  if (s.timeline) console.log(`  Position: ${s.timeline.position}s`);
});
```
