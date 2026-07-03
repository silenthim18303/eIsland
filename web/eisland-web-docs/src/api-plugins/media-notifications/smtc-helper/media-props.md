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

## Example

```typescript
import { SmtcMonitor } from '@eisland/windows-smtc-helper';

const monitor = new SmtcMonitor();
monitor.start();

monitor.on('session-media-changed', (appId, media) => {
  console.log(`[${appId}] Now playing: ${media.title} — ${media.artist}`);
  if (media.thumbnail) {
    console.log(`  Album art: ${media.thumbnail.substring(0, 50)}...`);
  }
});
```
