---
watermark: true
title: SessionSnapshot
icon: fa6-solid:table
---

# SessionSnapshot

:::info
`SessionSnapshot` is an interface that represents a point-in-time snapshot of a single SMTC (System Media Transport Controls) media session. It is the element type returned by [SmtcMonitor.getMediaSessions()](smtc-monitor.md), giving you a complete picture of which app is playing media, what track is playing, and the current playback/timeline state — all bundled in one object.
:::

## Interface Introduction

When you call `getMediaSessions()` on an [SmtcMonitor](smtc-monitor.md) instance, it returns an array of `SessionSnapshot` objects. Each snapshot corresponds to one active media session registered with Windows SMTC. A session appears when a media app (e.g., Spotify, Chrome, Windows Media Player) begins reporting its playback state to the OS, and disappears when the app closes or stops reporting.

The snapshot is a lightweight, read-only data structure — it captures state at the moment `getMediaSessions()` is called and does not update automatically. For real-time updates, subscribe to [SmtcMonitor](smtc-monitor.md) events instead.

## Usage

The typical workflow is:

1. Create an [SmtcMonitor](smtc-monitor.md) and start it.
2. Call `getMediaSessions()` to obtain an array of `SessionSnapshot` objects.
3. Inspect each snapshot to read media metadata, playback state, and timeline position.

:::tip Calling getMediaSessions() at the right time
`getMediaSessions()` reflects the current state of all sessions *at the instant of the call*. It is ideal for building an initial UI layout (e.g., populating a list of active media sources). For ongoing changes, combine it with [SmtcMonitor](smtc-monitor.md) event listeners so you can update your UI incrementally.
:::

:::tip Null fields are expected
The `media`, `playback`, and `timeline` fields can each be `null` independently. A newly added session may not have reported all its metadata yet. Always perform a null check before reading sub-properties.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `sourceAppId` | `string` | The App User Model ID of the media source application. This uniquely identifies which app owns the session. |
| `media` | [MediaProps](media-props.md) `\| null` | Media metadata (title, artist, album art, etc.), or `null` if the session has not yet reported media properties. |
| `playback` | [PlaybackInfo](playback-info.md) `\| null` | Playback state (playing, paused, stopped, etc.), or `null` if the session has not yet reported playback info. |
| `timeline` | [TimelineProps](timeline-props.md) `\| null` | Timeline data (current position, duration), or `null` if the session has not yet reported a timeline. |

:::note sourceAppId format
The `sourceAppId` string follows the Windows App User Model ID format (e.g., `Microsoft.ZuneMusic_8wekyb3d8bbwe!Microsoft.ZuneMusic`). Use this value to identify and filter sessions by source application.
:::

:::note Null vs. missing
A `null` field does **not** mean the session is invalid — it simply means the app has not (yet) reported that particular data to SMTC. The field may become non-null after a `session-media-changed`, `session-playback-changed`, or `session-timeline-changed` event fires.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { SmtcMonitor, SessionSnapshot } from '@eisland/windows-smtc-helper';

// Create and start the monitor
const monitor = new SmtcMonitor();
monitor.start();

// Retrieve a snapshot of all active media sessions
const sessions: SessionSnapshot[] = monitor.getMediaSessions();

// Iterate over each session and log its details
sessions.forEach((session: SessionSnapshot) => {
  // Log the source app identifier
  console.log(`App: ${session.sourceAppId}`);

  // Media metadata may be null if not yet reported
  if (session.media) {
    console.log(`  Track: ${session.media.title}`);
    console.log(`  Artist: ${session.media.artist}`);
  }

  // Playback state may be null if not yet reported
  if (session.playback) {
    console.log(`  Playback status: ${session.playback.playbackStatus}`);
  }

  // Timeline may be null if not yet reported
  if (session.timeline) {
    console.log(`  Position: ${session.timeline.position}s / ${session.timeline.duration}s`);
  }
});

// Remember to stop the monitor when done
monitor.stop();
```

@tab JavaScript

```js
const { SmtcMonitor } = require('@eisland/windows-smtc-helper');

// Create and start the monitor
const monitor = new SmtcMonitor();
monitor.start();

// Retrieve a snapshot of all active media sessions
const sessions = monitor.getMediaSessions();

// Iterate over each session and log its details
sessions.forEach((session) => {
  // Log the source app identifier
  console.log(`App: ${session.sourceAppId}`);

  // Media metadata may be null if not yet reported
  if (session.media) {
    console.log(`  Track: ${session.media.title}`);
    console.log(`  Artist: ${session.media.artist}`);
  }

  // Playback state may be null if not yet reported
  if (session.playback) {
    console.log(`  Playback status: ${session.playback.playbackStatus}`);
  }

  // Timeline may be null if not yet reported
  if (session.timeline) {
    console.log(`  Position: ${session.timeline.position}s / ${session.timeline.duration}s`);
  }
});

// Remember to stop the monitor when done
monitor.stop();
```

:::

## Notes

:::note Snapshot vs. live data
`SessionSnapshot` objects are **point-in-time copies**, not live references. Once `getMediaSessions()` returns, the snapshot will not reflect subsequent playback changes. If you need real-time tracking, combine `getMediaSessions()` with [SmtcMonitor](smtc-monitor.md) events (`session-media-changed`, `session-playback-changed`, `session-timeline-changed`).
:::

:::note Multiple sessions from one app
Some applications may register multiple SMTC sessions (e.g., a browser with multiple media tabs). Each session will appear as a separate `SessionSnapshot` with its own `sourceAppId`. Use `sourceAppId` to group or filter sessions by application.
:::

:::tip Combining snapshot with events
A common pattern is to call `getMediaSessions()` once on startup to build the initial state, then use [SmtcMonitor](smtc-monitor.md) `session-added` and `session-removed` events to keep your data model in sync without re-querying the full list.
:::

## Danger Avoidance

:::danger Always call getMediaSessions() after start()
Calling `getMediaSessions()` before `monitor.start()` will return an **empty array**, because no sessions are being tracked yet. Always ensure the monitor is started before querying sessions.
:::

:::danger Do not assume non-null fields
Accessing `session.media.title`, `session.playback.playbackStatus`, or `session.timeline.position` without a null check will throw a `TypeError` at runtime if the respective field is `null`. Always guard with an `if` check or optional chaining (`session.media?.title`).
:::
