---
watermark: true
title: getStatus
icon: fa6-solid:code
---

# getStatus

:::info
Returns a complete snapshot of the current media status including metadata, playback state, and timeline.
:::

## Signature

```typescript
function getStatus(): MediaStatus
```

## Return Value

[MediaStatus](media-status.md) object.

```typescript
// Example return value
{
  isAvailable: true,
  title: 'Bohemian Rhapsody',
  artist: 'Queen',
  albumTitle: 'A Night at the Opera',
  albumArtist: 'Queen',
  trackNumber: 11,
  genres: ['Rock'],
  playbackStatus: 'playing',
  isShuffleActive: false,
  repeatMode: 0,
  playbackRate: 1.0,
  sourceAppUserModelId: 'SpotifyAB.SpotifyMusic_zpdnekdrzrea0!Spotify',
  thumbnail: 'data:image/jpeg;base64,/9j/4AAQ...',
  timeline: { startTime: 0, endTime: 354, position: 127, minSeekTime: 0, maxSeekTime: 354 },
  controls: { isPlayEnabled: true, isPauseEnabled: true, isNextEnabled: true, isPreviousEnabled: true, isStopEnabled: true, isRecordEnabled: false, isFastForwardEnabled: true, isRewindEnabled: true, isChannelUpEnabled: false, isChannelDownEnabled: false },
}
```

:::tip
For lyrics synchronization or other position-only use cases, prefer [getTimestamp()](get-timestamp.md) for lower latency.
:::

## Example

```typescript
import { getStatus } from '@eisland/windows-smtc-helper';

const status = getStatus();
if (status.isAvailable) {
  console.log(`🎵 ${status.title} — ${status.artist}`);
  console.log(`Status: ${status.playbackStatus}`);
  console.log(`Shuffle: ${status.isShuffleActive}, Repeat: ${status.repeatMode}`);
} else {
  console.log('No active media session');
}
```
