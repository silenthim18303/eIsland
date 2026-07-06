---
watermark: true
title: setShuffle
icon: fa6-solid:code
---

# setShuffle

:::info Introduction
`setShuffle` sends a command to the currently active System Media Transport Controls (SMTC) session to enable or disable shuffle (random) playback mode. It is a synchronous function that returns a [CommandResult](command-result.md) indicating whether the command was delivered successfully. This function is part of the `@eisland/windows-smtc-helper` package.
:::

## Signature

```typescript
function setShuffle(active: boolean): CommandResult
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `active` | `boolean` | `true` to enable shuffle mode, `false` to disable it |

## Return Value

Returns a [CommandResult](command-result.md) object indicating whether the command was sent successfully.

| Property | Type | Description |
|----------|------|-------------|
| `success` | `boolean` | `true` if the command was delivered to the media session |
| `error` | `string \| null` | Error message if the command failed, `null` on success |

:::warning Null sessions
If no media session is active or the current session does not support shuffle, `success` will be `false` and `error` will contain a descriptive message. Always check the return value before assuming the shuffle state has changed.
:::

## Usage

`setShuffle` is typically called when the user toggles a shuffle button in your UI. It sends the command to the underlying SMTC session managed by the active media player (e.g. Spotify, Windows Media Player).

:::tip Verify the result
After calling `setShuffle`, use [getStatus](get-status.md) to confirm that `isShuffleActive` reflects the desired state. The command may be rejected by the media player if it does not support shuffle.
:::

:::note Async propagation
The shuffle command is delivered to the media player asynchronously. The `CommandResult.success` only indicates that the command was sent, not that the player has finished applying it. The `isShuffleActive` field in the next [getStatus](get-status.md) call will reflect the updated state.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { setShuffle, getStatus } from '@eisland/windows-smtc-helper';

// Enable shuffle mode
const result = setShuffle(true);
// Check if the command was delivered successfully
if (result.success) {
  // Read back the current status to verify the change
  const status = getStatus();
  console.log(`Shuffle active: ${status.isShuffleActive}`);
} else {
  // Log the error if the command failed
  console.error(`Failed to set shuffle: ${result.error}`);
}
```

@tab JavaScript

```js
const { setShuffle, getStatus } = require('@eisland/windows-smtc-helper');

// Enable shuffle mode
const result = setShuffle(true);
// Check if the command was delivered successfully
if (result.success) {
  // Read back the current status to verify the change
  const status = getStatus();
  console.log(`Shuffle active: ${status.isShuffleActive}`);
} else {
  // Log the error if the command failed
  console.error(`Failed to set shuffle: ${result.error}`);
}
```

:::

## Notes

:::note Shuffle support varies by player
Not all media players support shuffle mode. If the active player does not support it, `setShuffle` will return `success: false`. Check the [PlaybackControls](playback-controls.md) interface from [getStatus](get-status.md) for capability information.
:::

:::tip Combine with getStatus
`setShuffle` only sends a command; it does not return the updated shuffle state. Use [getStatus](get-status.md) to read `isShuffleActive` and confirm the change took effect.
:::

:::note Repeat mode is separate
Shuffle and repeat mode are independent controls. Use [setRepeatMode](set-repeat-mode.md) to change the repeat mode (none, track, or list). Toggling shuffle does not affect the current repeat setting.
:::

## Danger Avoidance

:::danger Do not assume immediate state change
`setShuffle` returns a `CommandResult` indicating the command was sent, not that the media player has applied it. Calling [getStatus](get-status.md) immediately after may still show the old value. Wait for a status update or add a short delay before reading back the state.
:::

:::danger No active session
Calling `setShuffle` when no media player is active will return `success: false`. Always handle the error case gracefully to avoid a broken UI state where the shuffle toggle appears enabled but no media is playing.
:::
