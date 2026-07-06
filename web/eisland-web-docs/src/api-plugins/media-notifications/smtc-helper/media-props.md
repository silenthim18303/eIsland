---
watermark: true
title: MediaProps
icon: fa6-solid:table
---

# MediaProps

:::info Introduction
`MediaProps` is an interface representing the metadata of a media session tracked by the Windows System Media Transport Controls (SMTC). It contains information such as track title, artist, album details, genres, and album art. You receive this object as a callback argument from [`SmtcMonitor`](./smtc-monitor.md) events like `session-added` and `session-media-changed`, and it also appears inside [`SessionSnapshot`](./session-snapshot.md) returned by `getMediaSessions()`.
:::

## Interface Introduction

`MediaProps` is a data structure that describes the media metadata of a playing track. It is **not** something you construct yourself -- instead, the system populates it automatically whenever a media source (such as a music player app) reports metadata through the Windows SMTC framework.

You will encounter `MediaProps` in two places:

1. **SmtcMonitor event callbacks** -- the `session-added` and `session-media-changed` events provide a `MediaProps` argument alongside the source app ID.
2. **SessionSnapshot.media** -- each snapshot returned by `getMediaSessions()` contains a nullable `MediaProps` field.

:::tip When is MediaProps null?
Inside a `SessionSnapshot`, the `media` field can be `null` if the session has not yet reported any metadata. Always null-check before accessing its properties.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `title` | `string` | Track title reported by the media source. May be an empty string if the app does not provide a title. |
| `artist` | `string` | Primary artist name. May be an empty string if unknown. |
| `albumTitle` | `string` | Album title. May be an empty string if unknown. |
| `albumArtist` | `string` | Album artist name. May differ from `artist` for compilation albums. |
| `genres` | `string[]` | Array of genre tags associated with the track (e.g. `["Rock", "Alternative"]`). |
| `albumTrackCount` | `number` | Total number of tracks in the album. |
| `trackNumber` | `number` | The track's position within the album (1-based). |
| `thumbnail` | `string \| null` | Album art encoded as a data URI (`data:image/jpeg;base64,...`), or `null` if no album art is available. |

:::note
All string fields default to empty strings (not `null`) when the media source does not provide the corresponding metadata. Only `thumbnail` uses `null` to indicate absence.
:::

:::note
The `thumbnail` data URI can be large (hundreds of kilobytes). Avoid storing it in long-lived variables or passing it through frequent update paths if you only need metadata text.
:::

## Usage

`MediaProps` is a read-only data structure -- you never instantiate it yourself. The typical workflow is:

1. Create a [`SmtcMonitor`](./smtc-monitor.md) instance and call `start()`.
2. Listen for `session-media-changed` or `session-added` events.
3. In the callback, access the `MediaProps` argument to read track metadata.
4. Optionally, display the `thumbnail` in your UI by setting it as an `<img>` src.

:::tip Updating a "Now Playing" UI
The `session-media-changed` event fires every time a new track starts or the source app updates metadata. Use this event to keep your UI in sync rather than polling `getStatus()`.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { SmtcMonitor } from '@eisland/windows-smtc-helper';
import type { MediaProps } from '@eisland/windows-smtc-helper';

// Create a new SMTC session monitor
const monitor = new SmtcMonitor();

// Listen for media metadata changes across all sessions
monitor.on('session-media-changed', (appId: string, media: MediaProps) => {
  // Log the track title and artist
  console.log(`[${appId}] Now playing: ${media.title} — ${media.artist}`);

  // Log album information when available
  if (media.albumTitle) {
    console.log(`  Album: ${media.albumTitle} (Track ${media.trackNumber}/${media.albumTrackCount})`);
  }

  // Log genres if present
  if (media.genres.length > 0) {
    console.log(`  Genres: ${media.genres.join(', ')}`);
  }

  // Display album art if available
  if (media.thumbnail) {
    console.log(`  Album art available (${media.thumbnail.length} bytes as data URI)`);
  }
});

// Start listening for SMTC events
monitor.start();
```

@tab JavaScript

```js
const { SmtcMonitor } = require('@eisland/windows-smtc-helper');

// Create a new SMTC session monitor
const monitor = new SmtcMonitor();

// Listen for media metadata changes across all sessions
monitor.on('session-media-changed', (appId, media) => {
  // Log the track title and artist
  console.log(`[${appId}] Now playing: ${media.title} — ${media.artist}`);

  // Log album information when available
  if (media.albumTitle) {
    console.log(`  Album: ${media.albumTitle} (Track ${media.trackNumber}/${media.albumTrackCount})`);
  }

  // Log genres if present
  if (media.genres.length > 0) {
    console.log(`  Genres: ${media.genres.join(', ')}`);
  }

  // Display album art if available
  if (media.thumbnail) {
    console.log(`  Album art available (${media.thumbnail.length} bytes as data URI)`);
  }
});

// Start listening for SMTC events
monitor.start();
```

:::

## Notes

:::note
String fields (`title`, `artist`, `albumTitle`, `albumArtist`) return empty strings rather than `null` when the media source does not supply the value. Do not rely on truthy checks like `if (media.title)` to detect "no title" -- use `if (media.title !== '')` instead if an empty title is meaningful in your logic.
:::

:::tip
If you only need the current playback position (e.g. for lyric synchronization), prefer the lightweight `getTimestamp()` function over `getStatus()`. `getTimestamp()` returns a `TimestampInfo` object without fetching full media metadata, which is more efficient for high-frequency polling.
:::

:::note
The `thumbnail` field is always a `data:image/jpeg;base64,...` data URI when present. The image format is typically JPEG but may occasionally be PNG depending on the media source. If you need to use it in CSS, you can set it directly as the `background-image: url(...)` value.
:::

## Danger Avoidance

:::danger Memory leaks from unremoved event listeners
`SmtcMonitor` extends `EventEmitter`. If you add listeners in a component that mounts and unmounts repeatedly (e.g. a Vue or React component), always call `monitor.removeListener()` or `monitor.removeAllListeners()` in the cleanup phase, or call `monitor.stop()`. Failing to do so will accumulate stale listeners and leak memory.
:::

:::danger Accessing properties on null MediaProps
When retrieving sessions via `getMediaSessions()`, the `media` field of each `SessionSnapshot` can be `null`. Accessing `snapshot.media.title` on a null media object will throw a `TypeError`. Always null-check: `if (snapshot.media) { ... }`.
:::
