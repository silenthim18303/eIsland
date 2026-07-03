---
watermark: true
title: PlaybackInfo
icon: fa6-solid:table
---

# PlaybackInfo

:::info
Playback state information emitted by SmtcMonitor events.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `playbackStatus` | `number` | Playback status code |
| `playbackType` | `number` | Playback type code |

:::note
Status and type values are raw numeric codes from the Windows SMTC API.
:::

## Example

```typescript
import { SmtcMonitor } from '@eisland/windows-smtc-helper';

const monitor = new SmtcMonitor();
monitor.start();

monitor.on('session-playback-changed', (appId, playback) => {
  console.log(`[${appId}] Playback status: ${playback.playbackStatus}`);
  console.log(`  Type: ${playback.playbackType}`);
});
```
