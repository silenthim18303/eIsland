---
watermark: true
title: stop
icon: fa6-solid:code
---

# stop

:::info
Sends a stop command to the active media session through Windows SMTC (System Media Transport Controls). This function terminates the current playback entirely, unlike [pause](pause.md) which only suspends it. The media player will typically unload the current track and release playback resources.
:::

## Signature

```typescript
function stop(): CommandResult
```

## Usage

Call `stop()` when you need to fully terminate media playback — not merely pause it. A stopped session generally cannot be resumed from the same position; the player will need to restart the track.

:::tip
Use `stop()` when the user explicitly requests to end playback (e.g., closing a media overlay or dismissing the now-playing widget). If the intent is to temporarily suspend playback, prefer [pause](pause.md) instead, which preserves the playback position.
:::

:::note
The `stop` command is sent to whichever media session Windows considers active (the most recently interacted with). If no media session is available or the active session does not support the stop control, the returned [CommandResult](command-result.md) will indicate failure.
:::

## Return Value

Returns a [CommandResult](command-result.md) object indicating whether the command was delivered successfully.

| Field   | Type                        | Description                                       |
|---------|-----------------------------|---------------------------------------------------|
| `success` | `boolean`                 | `true` if the stop command was sent successfully. |
| `error`   | `string \| null`          | Error message if the command failed; `null` on success. |

:::warning
A return value of `{ success: true, error: null }` only means the command was delivered to the media session — it does not guarantee that the player has fully stopped. Some players may have a slight delay before transitioning to the `stopped` state. Use [getStatus](get-status.md) to verify the actual playback status if timing matters.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { stop, getStatus } from '@eisland/windows-smtc-helper';

// Send the stop command to the active media session
const result = stop();

// Check whether the command was delivered
if (result.success) {
  // Command sent — verify the player actually stopped
  const status = getStatus();
  console.log(`Playback status: ${status.playbackStatus}`); // Expected: 'stopped'
} else {
  // Command failed — log the error reason
  console.error(`Stop failed: ${result.error}`);
}
```

@tab JavaScript

```js
const { stop, getStatus } = require('@eisland/windows-smtc-helper');

// Send the stop command to the active media session
const result = stop();

// Check whether the command was delivered
if (result.success) {
  // Command sent — verify the player actually stopped
  const status = getStatus();
  console.log(`Playback status: ${status.playbackStatus}`); // Expected: 'stopped'
} else {
  // Command failed — log the error reason
  console.error(`Stop failed: ${result.error}`);
}
```

:::

## Notes

:::note
The stop command targets the **active** media session as determined by Windows. If multiple media players are running, only the most recently active one receives the command. Use the [SmtcMonitor](smtc-monitor.md) class if you need to manage sessions from specific applications.
:::

:::tip
Combine `stop()` with [getStatus](get-status.md) to build robust UI state management. After sending stop, poll or listen for the `playbackStatus` to transition to `'stopped'` before updating your UI, rather than assuming immediate effect.
:::

:::note
The [CommandResult](command-result.md) interface is shared across all SMTC command functions (`play`, `pause`, `next`, `previous`, `stop`, `seek`, `setShuffle`, `setRepeatMode`, `setPlaybackRate`). You can use the same error-handling pattern for all of them.
:::

## Danger Avoidance

:::danger
Do not call `stop()` in a tight loop or repeatedly in quick succession. Each call sends a system-level command to the Windows media session. Rapid-fire calls can cause the media player to behave unpredictably or become unresponsive. Always wait for a [CommandResult](command-result.md) before sending another command.
:::

:::danger
Do not assume `stop()` will work when no media is actively playing. If `getStatus().isAvailable` is `false`, there is no active media session and calling `stop()` will return a failure result. Always check session availability before sending commands to avoid confusing error states in your application.
:::
