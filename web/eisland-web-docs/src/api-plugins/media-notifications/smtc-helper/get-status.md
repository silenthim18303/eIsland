---
watermark: true
title: getStatus
icon: fa6-solid:code
---

# getStatus

:::info
`getStatus()` is a synchronous function that returns a complete snapshot of the current Windows SMTC (System Media Transport Controls) media session. It retrieves all available media metadata, playback state, timeline position, and control capabilities in a single call. This is the primary way to query what the user is currently listening to or watching.
:::

## Signature

```typescript
function getStatus(): MediaStatus
```

The function takes no parameters and returns a [MediaStatus](media-status.md) object. If no media session is active, the returned object will have `isAvailable` set to `false` and all other fields will be `null` or default values.

## Usage

Call `getStatus()` whenever you need a point-in-time snapshot of the current media session. Common use cases include:

- Initializing UI elements with current media info when your component mounts
- Polling for media state in intervals where event-driven updates are not available
- Checking whether a media session exists before sending playback commands

:::tip
If you only need the playback position (e.g. for lyrics synchronization), use [getTimestamp()](get-timestamp.md) instead. It returns a lightweight [TimestampInfo](timestamp-info.md) object without media metadata, resulting in lower overhead.
:::

:::tip
For real-time reactive updates, consider using the [SmtcMonitor](smtc-monitor.md) class which emits events when media properties, playback state, or timeline change. `getStatus()` is best for one-shot queries rather than continuous polling.
:::

## Return Value

Returns a [MediaStatus](media-status.md) object with the following structure:

| Property | Type | Description |
|---|---|---|
| `isAvailable` | `boolean` | Whether an active media session exists |
| `title` | `string \| null` | Track title |
| `artist` | `string \| null` | Track artist |
| `albumTitle` | `string \| null` | Album title |
| `albumArtist` | `string \| null` | Album artist |
| `trackNumber` | `number \| null` | Track number within the album |
| `genres` | `string[] \| null` | Array of genre tags |
| `playbackStatus` | `string \| null` | One of: `'playing'`, `'paused'`, `'stopped'`, `'closed'`, `'opened'`, `'changing'`, `'unknown'` |
| `isShuffleActive` | `boolean \| null` | Whether shuffle mode is on |
| `repeatMode` | `number \| null` | `0` = None, `1` = Track, `2` = List |
| `playbackRate` | `number \| null` | Playback speed (`1.0` = normal) |
| `sourceAppUserModelId` | `string \| null` | App User Model ID of the media source (e.g. Spotify) |
| `thumbnail` | `string \| null` | Album art as a data URI (`data:image/jpeg;base64,...`) |
| `timeline` | [TimelineProperties](timeline-properties.md)` \| null` | Start/end time, position, and seek bounds |
| `controls` | [PlaybackControls](playback-controls.md)` \| null` | Which playback commands are currently enabled |

:::warning
When no media session is active, `isAvailable` is `false` and fields like `title`, `artist`, `thumbnail`, `timeline`, and `controls` will be `null`. Always check `isAvailable` before accessing other properties to avoid reading `null` values.
:::

:::note
The `thumbnail` field is a base64-encoded data URI. Decoding it for display is straightforward (use it directly as an `<img>` source), but the string can be large. Avoid logging it to the console in production.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getStatus, MediaStatus } from '@eisland/windows-smtc-helper';

// Query the current media session state
const status: MediaStatus = getStatus();

// Check if any media app is actively reporting status
if (status.isAvailable) {
  // Display the track title and artist
  console.log(`Now playing: ${status.title} — ${status.artist}`);

  // Show the current playback state (playing, paused, stopped, etc.)
  console.log(`Playback status: ${status.playbackStatus}`);

  // Access timeline info if available (position, duration, seek bounds)
  if (status.timeline) {
    const { position, endTime } = status.timeline;
    console.log(`Progress: ${position}s / ${endTime}s`);
  }

  // Check which transport controls the media app supports
  if (status.controls) {
    console.log(`Next enabled: ${status.controls.isNextEnabled}`);
    console.log(`Previous enabled: ${status.controls.isPreviousEnabled}`);
  }

  // Use the source app ID to identify the media player
  console.log(`Source: ${status.sourceAppUserModelId}`);
} else {
  // No media session is currently active
  console.log('No active media session found.');
}
```

@tab JavaScript

```js
const { getStatus } = require('@eisland/windows-smtc-helper');

// Query the current media session state
const status = getStatus();

// Check if any media app is actively reporting status
if (status.isAvailable) {
  // Display the track title and artist
  console.log(`Now playing: ${status.title} — ${status.artist}`);

  // Show the current playback state (playing, paused, stopped, etc.)
  console.log(`Playback status: ${status.playbackStatus}`);

  // Access timeline info if available (position, duration, seek bounds)
  if (status.timeline) {
    const { position, endTime } = status.timeline;
    console.log(`Progress: ${position}s / ${endTime}s`);
  }

  // Check which transport controls the media app supports
  if (status.controls) {
    console.log(`Next enabled: ${status.controls.isNextEnabled}`);
    console.log(`Previous enabled: ${status.controls.isPreviousEnabled}`);
  }

  // Use the source app ID to identify the media player
  console.log(`Source: ${status.sourceAppUserModelId}`);
} else {
  // No media session is currently active
  console.log('No active media session found.');
}
```

:::

## Notes

:::note
`getStatus()` is a synchronous, blocking call that queries the Windows SMTC subsystem via native FFI. While the call is fast, avoid invoking it in a tight loop. For continuous monitoring, prefer the event-driven [SmtcMonitor](smtc-monitor.md) class instead.
:::

:::note
The `playbackStatus` field uses string values (`'playing'`, `'paused'`, `'stopped'`, etc.) rather than numeric enums. This differs from the `playbackStatus` field in [PlaybackInfo](playback-info.md) used by [SmtcMonitor](smtc-monitor.md), which returns a raw numeric value.
:::

:::note
The `sourceAppUserModelId` follows the Windows App User Model ID format (e.g. `SpotifyAB.SpotifyMusic_zpdnekdrzrea0!Spotify`). This string is stable for a given app and can be used to identify which application is the media source.
:::

## Danger Avoidance

:::danger
Do not call `getStatus()` in a `setInterval` or tight loop to simulate real-time updates. Each call invokes native code to query the Windows SMTC subsystem. Excessive polling wastes CPU and may cause contention with the media session. Use [SmtcMonitor](smtc-monitor.md) for event-driven updates instead.
:::

:::danger
Never assume `timeline`, `controls`, `title`, or other nullable fields are non-null even when `isAvailable` is `true`. Some media apps report an active session but do not populate all fields. Always perform null checks before accessing nested properties such as `status.timeline.position` or `status.controls.isPlayEnabled`. Accessing a property on `null` will throw a `TypeError` and crash your application.
:::
