---
watermark: true
title: PlaybackControls
icon: fa6-solid:table
---

# PlaybackControls

:::info Introduction
`PlaybackControls` is an interface that describes which media playback commands are currently available from the active SMTC (System Media Transport Controls) session. It is a sub-object of [MediaStatus](media-status.md), returned by the [`getStatus()`](./get-status.md) function. Each boolean flag corresponds to a specific transport control button exposed by the Windows media session.
:::

## Interface Introduction

The `PlaybackControls` interface surfaces the capability flags of the current media source application. Not all media players support every control — for example, a podcast app may disable fast-forward or a radio app may disable next/previous. By inspecting these flags, your UI can dynamically show or hide playback buttons to match what the active player actually supports.

You encounter this interface when reading the `controls` property from a `MediaStatus` object:

```ts
const status = getStatus();
const controls: PlaybackControls | null = status.controls;
```

:::note
The `controls` field on `MediaStatus` can be `null` when no media session is available (i.e. `status.isAvailable` is `false`). Always null-check before accessing any flag.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `isPlayEnabled` | `boolean` | Whether the play command is available. |
| `isPauseEnabled` | `boolean` | Whether the pause command is available. |
| `isNextEnabled` | `boolean` | Whether skipping to the next track is available. |
| `isPreviousEnabled` | `boolean` | Whether returning to the previous track is available. |
| `isStopEnabled` | `boolean` | Whether the stop command is available. |
| `isRecordEnabled` | `boolean` | Whether the record command is available (rarely used by most apps). |
| `isFastForwardEnabled` | `boolean` | Whether fast-forward is available. |
| `isRewindEnabled` | `boolean` | Whether rewind is available. |
| `isChannelUpEnabled` | `boolean` | Whether channel-up is available (used by TV/radio-style apps). |
| `isChannelDownEnabled` | `boolean` | Whether channel-down is available (used by TV/radio-style apps). |

:::tip
Most music players only enable `isPlayEnabled`, `isPauseEnabled`, `isNextEnabled`, `isPreviousEnabled`, and `isStopEnabled`. The channel and record flags are mainly relevant for specialized media sources like TV or radio applications.
:::

:::note
These flags reflect the capabilities reported by the media source application at the OS level. They can change dynamically — for example, a player may disable "next" when the playlist reaches its end.
:::

## Usage

You typically read `PlaybackControls` when building a media-control UI that should adapt to what the current player supports. The workflow is:

1. Call [`getStatus()`](./get-status.md) to obtain the full `MediaStatus`.
2. Check `status.isAvailable` — if `false`, there is no active media session.
3. Read `status.controls` to determine which buttons to render.
4. Call the corresponding command function ([`play()`](./play.md), [`next()`](./next.md), etc.) only if the flag is `true`.

:::tip
If you need real-time updates when control availability changes, use the [`SmtcMonitor`](smtc-monitor.md) class and listen for the `session-playback-changed` event. This avoids polling `getStatus()` repeatedly.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getStatus, play, pause, next, previous } from '@eisland/windows-smtc-helper';

// Fetch the current media status from SMTC
const status = getStatus();

// Guard: no media session is active
if (!status.isAvailable || !status.controls) {
  console.log('No active media session');
  process.exit(0);
}

// Read the control flags
const { controls } = status;

// Conditionally enable UI buttons based on what the player supports
if (controls.isPlayEnabled) {
  // Send the play command — safe because the flag is true
  play();
}

if (controls.isNextEnabled) {
  // Skip to the next track
  next();
}

if (controls.isPreviousEnabled) {
  // Return to the previous track
  previous();
}

// Log all control flags for debugging
console.log('Play:', controls.isPlayEnabled);
console.log('Pause:', controls.isPauseEnabled);
console.log('Stop:', controls.isStopEnabled);
console.log('Fast Forward:', controls.isFastForwardEnabled);
console.log('Rewind:', controls.isRewindEnabled);
```

@tab JavaScript

```js
const { getStatus, play, pause, next, previous } = require('@eisland/windows-smtc-helper');

// Fetch the current media status from SMTC
const status = getStatus();

// Guard: no media session is active
if (!status.isAvailable || !status.controls) {
  console.log('No active media session');
  process.exit(0);
}

// Read the control flags
const controls = status.controls;

// Conditionally enable UI buttons based on what the player supports
if (controls.isPlayEnabled) {
  // Send the play command — safe because the flag is true
  play();
}

if (controls.isNextEnabled) {
  // Skip to the next track
  next();
}

if (controls.isPreviousEnabled) {
  // Return to the previous track
  previous();
}

// Log all control flags for debugging
console.log('Play:', controls.isPlayEnabled);
console.log('Pause:', controls.isPauseEnabled);
console.log('Stop:', controls.isStopEnabled);
console.log('Fast Forward:', controls.isFastForwardEnabled);
console.log('Rewind:', controls.isRewindEnabled);
```

:::

## Notes

:::note
The `isRecordEnabled`, `isChannelUpEnabled`, and `isChannelDownEnabled` flags are almost always `false` for standard music and video players. They exist because the SMTC protocol supports a full set of transport controls, but most applications only implement a subset.
:::

:::note
A flag being `true` does not guarantee the command will succeed — it only means the media source reported that control as available. The [`CommandResult`](./command-result.md) object returned by each command function should still be checked for the actual `success` status.
:::

:::tip
When building a UI, consider showing disabled buttons for unavailable controls rather than hiding them entirely. This gives users a consistent layout and communicates which actions the current player does not support.
:::

## Danger Avoidance

:::danger
Do not call command functions ([`play()`](./play.md), [`next()`](./next.md), [`seek()`](./seek.md), etc.) without first checking the corresponding control flag. While calling an unsupported command will not crash the application (it returns a failed `CommandResult`), repeatedly issuing unsupported commands can cause unexpected behavior in some media players and generates unnecessary IPC overhead to the Windows SMTC subsystem.
:::

:::danger
Never cache a `PlaybackControls` reference and assume it stays valid across time. The flags are a snapshot of the media session's capabilities at the moment `getStatus()` was called. The active player can change (e.g. user switches from Spotify to a browser), and control availability can change mid-session (e.g. playlist ends and "next" becomes disabled). Always re-query via `getStatus()` or use [`SmtcMonitor`](smtc-monitor.md) for live updates.
:::
