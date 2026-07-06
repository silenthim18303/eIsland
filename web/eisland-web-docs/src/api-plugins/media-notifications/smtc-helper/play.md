---
watermark: true
title: play
icon: fa6-solid:code
---

# play

:::info
Sends a play command to the active Windows SMTC (System Media Transport Controls) media session. This function resumes playback on the currently active media source — such as Spotify, a browser tab, or any other app that registers with the Windows media transport layer. It returns a [CommandResult](command-result.md) object indicating whether the command was delivered successfully.
:::

## Signature

```typescript
function play(): CommandResult
```

The function takes no parameters. It targets whichever media session is currently active in the system.

## Usage

The `play` function is part of the SMTC command family — a set of synchronous functions that send transport-control commands to the active media session. Use it when you want to programmatically resume paused media.

Typical workflow:

1. Check the current media state with [getStatus](get-status.md) to confirm the session is paused.
2. Call `play()` to resume.
3. Inspect the returned [CommandResult](command-result.md) to verify success.

:::tip
If the media is already playing, calling `play()` is a no-op that still returns `{ success: true }`. You do not need to guard against double-play calls.
:::

:::note
This function targets the **active** SMTC session. If multiple apps are producing media, the active session is the one that last held or acquired the SMTC transport. Use the [SmtcMonitor](smtc-monitor.md) to track which app owns the active session.
:::

## Return Value

Returns a [CommandResult](command-result.md) object:

| Field | Type | Description |
|-------|------|-------------|
| `success` | `boolean` | `true` if the play command was delivered to the SMTC session |
| `error` | `string \| null` | Error message if the command failed, otherwise `null` |

:::warning
A `success: true` return means the command was **delivered** to the media session — not that playback has actually started. The app controlling the session may ignore or delay the command. Use [getStatus](get-status.md) or the [SmtcMonitor](smtc-monitor.md) `session-playback-changed` event to confirm the actual playback state.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { play, getStatus } from '@eisland/windows-smtc-helper';

// Check if media is currently paused
const status = getStatus();

if (status.isAvailable && status.playbackStatus === 'paused') {
  // Send the play command to resume playback
  const result = play();

  if (result.success) {
    console.log('Playback resumed');
  } else {
    // Command delivery failed — inspect the error string
    console.error(`Play command failed: ${result.error}`);
  }
}
```

@tab JavaScript

```js
const { play, getStatus } = require('@eisland/windows-smtc-helper');

// Check if media is currently paused
const status = getStatus();

if (status.isAvailable && status.playbackStatus === 'paused') {
  // Send the play command to resume playback
  const result = play();

  if (result.success) {
    console.log('Playback resumed');
  } else {
    // Command delivery failed — inspect the error string
    console.error(`Play command failed: ${result.error}`);
  }
}
```

:::

## Notes

:::note
All SMTC command functions (`play`, `pause`, `next`, `previous`, `stop`, `seek`, `setShuffle`, `setRepeatMode`, `setPlaybackRate`) are synchronous and return a [CommandResult](command-result.md). They do not return Promises.
:::

:::tip
For real-time playback state tracking — for example, keeping a UI in sync — prefer listening to the [SmtcMonitor](smtc-monitor.md) `session-playback-changed` event instead of polling `getStatus()` repeatedly. The monitor uses WinRT event callbacks through native FFI and is more efficient.
:::

:::note
If no media session is active (no app is playing or has played media), `play()` will return `{ success: false, error: ... }`. Always check `isAvailable` via [getStatus](get-status.md) or handle the failure case in your code.
:::

## Danger Avoidance

:::danger
Do not call `play()` in a tight loop or rapid-fire pattern (e.g., retrying on every failure without delay). The underlying WinRT command interface is not designed for high-frequency invocations. Rapid repeated calls may cause the target media app to behave unexpectedly or become unresponsive.
:::

:::danger
Do not assume that `success: true` means the user's media is now audible. The user may have system-level mute active, the app may have its own mute state, or the playback may have been intercepted by another SMTC session. Always use [getStatus](get-status.md) or the [SmtcMonitor](smtc-monitor.md) to verify the actual state rather than relying solely on the command result.
:::
