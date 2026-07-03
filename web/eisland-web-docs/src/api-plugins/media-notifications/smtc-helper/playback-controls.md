---
watermark: true
title: PlaybackControls
icon: fa6-solid:table
---

# PlaybackControls

:::info
Flags indicating which playback controls are currently available.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `isPlayEnabled` | `boolean` | Play button available |
| `isPauseEnabled` | `boolean` | Pause button available |
| `isNextEnabled` | `boolean` | Next track available |
| `isPreviousEnabled` | `boolean` | Previous track available |
| `isStopEnabled` | `boolean` | Stop available |
| `isRecordEnabled` | `boolean` | Record available |
| `isFastForwardEnabled` | `boolean` | Fast forward available |
| `isRewindEnabled` | `boolean` | Rewind available |
| `isChannelUpEnabled` | `boolean` | Channel up available |
| `isChannelDownEnabled` | `boolean` | Channel down available |

## Example

```typescript
import { getStatus } from '@eisland/windows-smtc-helper';

const status = getStatus();
if (status.controls) {
  console.log(`Play: ${status.controls.isPlayEnabled}`);
  console.log(`Pause: ${status.controls.isPauseEnabled}`);
  console.log(`Next: ${status.controls.isNextEnabled}`);
  console.log(`Previous: ${status.controls.isPreviousEnabled}`);
}
```
