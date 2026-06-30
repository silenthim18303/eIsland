---
title: MediaStatus
icon: circle-info
---

# MediaStatus

> Placeholder — content to be added.

```ts
interface MediaStatus {
  isAvailable: boolean;
  title: string | null;
  artist: string | null;
  albumTitle: string | null;
  albumArtist: string | null;
  trackNumber: number | null;
  genres: string[];
  playbackStatus: number;
  isShuffleActive: boolean;
  repeatMode: number;
  playbackRate: number;
  sourceAppUserModelId: string | null;
  thumbnail: string | null;
  timeline: TimelineProperties;
  controls: PlaybackControls;
}
```
