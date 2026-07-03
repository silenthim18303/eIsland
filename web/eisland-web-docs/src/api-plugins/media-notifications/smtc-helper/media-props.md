---
watermark: true
title: MediaProps
icon: fa6-solid:table
---

# MediaProps

:::info
Media metadata properties emitted by SmtcMonitor events.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `title` | `string` | Track title |
| `artist` | `string` | Artist name |
| `albumTitle` | `string` | Album title |
| `albumArtist` | `string` | Album artist |
| `genres` | `string[]` | Genre tags |
| `albumTrackCount` | `number` | Total tracks in album |
| `trackNumber` | `number` | Track number |
| `thumbnail` | `string \| null` | Album art as data URI |

:::note
The `thumbnail` field is a data URI (`data:image/jpeg;base64,...`) when available, or `null` if no album art exists.
:::
