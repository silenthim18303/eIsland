---
watermark: true
title: seek
icon: fa6-solid:code
---

# seek

:::info
`seek` sends a seek command to the active SMTC (System Media Transport Controls) media session, jumping the playback position to a specified time in seconds. It returns a [CommandResult](command-result.md) indicating whether the Windows media session accepted the command.
:::

## Signature

```typescript
function seek(positionSeconds: number): CommandResult
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `positionSeconds` | `number` | Target position in seconds. The value is clamped to `[minSeekTime, maxSeekTime]` from the current session's [TimelineProperties](timeline-properties.md). |

:::note
`positionSeconds` accepts fractional values (e.g. `12.5`). The actual resolution depends on the media application — some apps only support integer-second seeking.
:::

## Return Value

Returns a [CommandResult](command-result.md) object:

| Field | Type | Description |
|-------|------|-------------|
| `success` | `boolean` | `true` if the seek command was accepted by the media session. |
| `error` | `string \| null` | Error message when the command fails; `null` on success. |

:::warning
A `success: true` return does **not** guarantee the playback position has already updated. The media app processes the command asynchronously. Call [getStatus](./getStatus.md) or [getTimestamp](./getTimestamp.md) after a short delay to confirm the new position.
:::

## Usage

Call `seek` when you need to jump to a specific time in the currently playing media — for example, jumping to a bookmark position, skipping to a chapter, or syncing playback with lyrics.

:::tip
Before seeking, read the `timeline.minSeekTime` and `timeline.maxSeekTime` fields from [getStatus](./getStatus.md) to know the valid range. Passing a value outside this range is safe (it gets clamped), but checking first lets you present meaningful UI feedback to the user.
:::

:::note
If no media session is active or available, `seek` returns `{ success: false, error: "..." }`. Always check the return value before assuming the seek succeeded.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { seek, getStatus } from '@eisland/windows-smtc-helper';

// Get the current media status to inspect the timeline
const status = getStatus();
if (status.isAvailable && status.timeline) {
  // Calculate the midpoint of the track
  const midPoint = (status.timeline.startTime + status.timeline.endTime) / 2;

  // Seek to the midpoint
  const result = seek(midPoint);
  if (result.success) {
    console.log(`Seeked to ${midPoint}s`);
  } else {
    // Log the error if the seek command failed
    console.error(`Seek failed: ${result.error}`);
  }
}
```

@tab JavaScript

```js
const { seek, getStatus } = require('@eisland/windows-smtc-helper');

// Get the current media status to inspect the timeline
const status = getStatus();
if (status.isAvailable && status.timeline) {
  // Calculate the midpoint of the track
  const midPoint = (status.timeline.startTime + status.timeline.endTime) / 2;

  // Seek to the midpoint
  const result = seek(midPoint);
  if (result.success) {
    console.log(`Seeked to ${midPoint}s`);
  } else {
    // Log the error if the seek command failed
    console.error(`Seek failed: ${result.error}`);
  }
}
```

:::

## Notes

:::note
The seekable range is defined by `minSeekTime` and `maxSeekTime` in [TimelineProperties](timeline-properties.md). Values outside this range are silently clamped to the nearest boundary — no error is thrown.
:::

:::tip
For real-time position tracking (e.g. syncing lyrics), prefer [getTimestamp](./getTimestamp.md) over [getStatus](./getStatus.md). `getTimestamp` returns a lightweight [TimestampInfo](timestamp-info.md) object without media metadata, making it faster for frequent polling.
:::

:::note
`seek` is a fire-and-forget command sent through the Windows SMTC COM interface. The function returns immediately; it does not block until the media app finishes seeking.
:::

## Danger Avoidance

:::danger
Do **not** call `seek` in a tight loop (e.g. on every slider drag event) without debouncing. Each call sends a command through the Windows SMTC pipeline. Flooding the pipeline can cause the media application to become unresponsive or queue commands unpredictably. Debounce seek calls to at most once every 200-300ms.
:::

:::danger
Do **not** assume `seek` will work when `playbackStatus` is `"stopped"` or `"closed"`. Some media applications reject seek commands when not in an active playback state. Always check `getStatus().playbackStatus` before issuing a seek command, and handle the `false` return gracefully.
:::
