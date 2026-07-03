---
watermark: true
title: MediaStatus
icon: fa6-solid:table
---

# MediaStatus

:::info
Complete media status snapshot including metadata, playback state, and timeline.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `isAvailable` | `boolean` | Whether media is currently available |
| `title` | `string \| null` | Track title |
| `artist` | `string \| null` | Artist name |
| `albumTitle` | `string \| null` | Album title |
| `albumArtist` | `string \| null` | Album artist |
| `trackNumber` | `number \| null` | Track number |
| `genres` | `string[] \| null` | Genre tags |
| `playbackStatus` | `"playing" \| "paused" \| "stopped" \| "closed" \| "opened" \| "changing" \| "unknown"` | Current playback state |
| `isShuffleActive` | `boolean \| null` | Shuffle mode state |
| `repeatMode` | `number \| null` | Repeat mode (0=None, 1=Track, 2=List) |
| `playbackRate` | `number \| null` | Playback rate (1.0 = normal) |
| `sourceAppUserModelId` | `string \| null` | Source app identifier |
| `thumbnail` | `string \| null` | Album art as data URI |
| `timeline` | [TimelineProperties](timeline-properties.md) `\| null` | Timeline data |
| `controls` | [PlaybackControls](playback-controls.md) `\| null` | Available controls |

:::note
Fields returning `null` indicate the media source has not provided that information.
:::
