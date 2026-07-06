---
watermark: true
title: MediaStatus
icon: fa6-solid:table
---

# MediaStatus

:::info Introduction
`MediaStatus` is an interface representing a complete snapshot of the current media session state. It includes track metadata (title, artist, album), playback state, timeline information, and available playback controls. You obtain this object by calling [`getStatus()`](./index.md) from `@eisland/windows-smtc-helper`.
:::

## Interface Introduction

The `MediaStatus` interface is the primary data structure returned by the `getStatus()` function. It aggregates all available information about the currently active Windows SMTC (System Media Transport Controls) media session in a single object.

You encounter this interface whenever you need to query the current media playback state -- for example, displaying "now playing" information in a UI widget, checking whether media is active before sending playback commands, or reading the current playback position for lyric synchronization.

:::note
Many properties in this interface can be `null`. A `null` value means the media source application has not provided that particular piece of information. Always check for `null` before accessing nested properties.
:::

## Usage

The typical workflow is straightforward: call `getStatus()` to obtain a `MediaStatus` object, then inspect its properties to determine what media is playing and its current state.

:::tip Best Practice
Always check `isAvailable` first before reading other properties. When `isAvailable` is `false`, the other fields will contain default or null values and should not be relied upon.
:::

:::tip Performance Consideration
`getStatus()` performs a synchronous native call. Avoid calling it in a tight loop. For real-time position tracking, consider using the [`SmtcMonitor`](./smtc-monitor.md) class with `session-timeline-changed` events instead of polling `getStatus()` repeatedly.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `isAvailable` | `boolean` | Whether a media session is currently active and available |
| `title` | `string \| null` | Track title |
| `artist` | `string \| null` | Artist name |
| `albumTitle` | `string \| null` | Album title |
| `albumArtist` | `string \| null` | Album artist (may differ from track artist on compilations) |
| `trackNumber` | `number \| null` | Track number within the album |
| `genres` | `string[] \| null` | Array of genre tags |
| `playbackStatus` | `'playing' \| 'paused' \| 'stopped' \| 'closed' \| 'opened' \| 'changing' \| 'unknown'` | Current playback state |
| `isShuffleActive` | `boolean \| null` | Whether shuffle mode is enabled |
| `repeatMode` | `number \| null` | Repeat mode: `0` = None, `1` = Track, `2` = List |
| `playbackRate` | `number \| null` | Playback speed (`1.0` = normal speed) |
| `sourceAppUserModelId` | `string \| null` | App User Model ID of the media source application |
| `thumbnail` | `string \| null` | Album art encoded as a data URI (`data:image/jpeg;base64,...`) |
| `timeline` | [`TimelineProperties`](./timeline-properties.md) `\| null` | Start time, end time, position, and seek bounds |
| `controls` | [`PlaybackControls`](./playback-controls.md) `\| null` | Flags indicating which playback commands the source app supports |

:::note Behavioral Details
- `playbackStatus` uses lowercase string values. Compare against literal strings like `'playing'`, not numeric enums.
- `playbackRate` is `1.0` for normal speed, `2.0` for double speed, `0.5` for half speed, etc. The media source controls the supported range.
- `sourceAppUserModelId` identifies which application is providing the media (e.g., Spotify, Chrome). Use this to filter or identify specific media sources.
- `thumbnail` is a full data URI string suitable for use directly in an `<img>` tag's `src` attribute.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getStatus } from '@eisland/windows-smtc-helper';

// Query the current media session status
const status = getStatus();

// Check if any media session is active
if (status.isAvailable) {
  // Display track metadata
  console.log(`Now playing: ${status.title} — ${status.artist}`);
  console.log(`Album: ${status.albumTitle}`);

  // Check the playback state
  console.log(`Status: ${status.playbackStatus}`);

  // Display timeline information if available
  if (status.timeline) {
    const pos = status.timeline.position.toFixed(1);
    const dur = status.timeline.endTime.toFixed(1);
    console.log(`Position: ${pos}s / ${dur}s`);
  }

  // Display album art thumbnail if available
  if (status.thumbnail) {
    console.log(`Album art: ${status.thumbnail.substring(0, 50)}...`);
  }

  // Check which controls are supported
  if (status.controls) {
    console.log(`Can skip: ${status.controls.isNextEnabled}`);
  }
} else {
  console.log('No media session active');
}
```

@tab JavaScript

```js
const { getStatus } = require('@eisland/windows-smtc-helper');

// Query the current media session status
const status = getStatus();

// Check if any media session is active
if (status.isAvailable) {
  // Display track metadata
  console.log(`Now playing: ${status.title} — ${status.artist}`);
  console.log(`Album: ${status.albumTitle}`);

  // Check the playback state
  console.log(`Status: ${status.playbackStatus}`);

  // Display timeline information if available
  if (status.timeline) {
    const pos = status.timeline.position.toFixed(1);
    const dur = status.timeline.endTime.toFixed(1);
    console.log(`Position: ${pos}s / ${dur}s`);
  }

  // Display album art thumbnail if available
  if (status.thumbnail) {
    console.log(`Album art: ${status.thumbnail.substring(0, 50)}...`);
  }

  // Check which controls are supported
  if (status.controls) {
    console.log(`Can skip: ${status.controls.isNextEnabled}`);
  }
} else {
  console.log('No media session active');
}
```

:::

## Notes

:::note Null Safety
Nearly every property except `isAvailable` and `playbackStatus` can be `null`. Always perform null checks before accessing nested objects like `timeline` or `controls`, or before calling methods like `.toFixed()` on numeric values.
:::

:::note Media Source Behavior
Different media applications provide different levels of metadata. A browser playing a YouTube video may not provide `albumTitle` or `trackNumber`, while a desktop music player like Spotify or foobar2000 typically provides all fields. Design your UI to gracefully handle missing fields.
:::

:::tip Combining with Playback Commands
Use `getStatus()` to inspect the current state, then use command functions like `play()`, `pause()`, `next()`, `previous()`, `seek()`, `setShuffle()`, and `setRepeatMode()` to control playback. Check `controls` to know which commands the current source app supports before sending them.
:::

:::tip Album Art Usage
The `thumbnail` field is a base64-encoded data URI. To display it in an HTML element, assign it directly to the `src` attribute of an `<img>` tag. Be aware that large album art images can produce very long data URI strings.
:::

## Danger Avoidance

:::danger Do Not Poll getStatus() in a Tight Loop
`getStatus()` is a synchronous native call. Calling it in a `setInterval` with a very short interval (e.g., every 16ms) will block the main thread and degrade application performance. For real-time position tracking, use the `SmtcMonitor` class with `session-timeline-changed` event listeners instead.
:::

:::danger Always Check isAvailable Before Accessing Properties
When no media session is active (`isAvailable` is `false`), properties like `title`, `artist`, and `timeline` will contain `null` or empty values. Accessing nested properties (e.g., `status.timeline.position`) without checking both `isAvailable` and the nested property for null will throw a runtime error.
:::

:::danger Do Not Assume playbackStatus Values
The `playbackStatus` field can be any of seven string values: `'playing'`, `'paused'`, `'stopped'`, `'closed'`, `'opened'`, `'changing'`, or `'unknown'`. Never assume it is only `'playing'` or `'paused'`. Handle all possible states, especially `'changing'` (which indicates a transition between tracks) and `'unknown'` (which indicates the source has not reported its state).
:::
