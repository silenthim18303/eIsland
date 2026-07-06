---
watermark: true
title: setRepeatMode
icon: fa6-solid:code
---

# setRepeatMode

:::info
`setRepeatMode` controls the repeat/loop behavior of the currently active SMTC (System Media Transport Controls) media session. It sends a repeat mode command to the media source application, allowing you to cycle between no repeat, single-track repeat, and full-list repeat.
:::

## Signature

```typescript
function setRepeatMode(mode: number): CommandResult
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `mode` | `number` | The repeat mode to set. `0` = None (no repeat), `1` = Track (repeat current track), `2` = List (repeat entire playlist) |

:::note
The `mode` parameter accepts raw numeric values rather than an enum. The three valid values map directly to Windows `MediaPlaybackAutoRepeatMode`: `0` (None), `1` (Track), `2` (List). Any other value will be sent as-is to the system and may result in an error or undefined behavior.
:::

## Return Value

Returns a [CommandResult](command-result.md) object indicating whether the command was delivered successfully.

| Field | Type | Description |
|-------|------|-------------|
| `success` | `boolean` | `true` if the repeat mode command was sent successfully |
| `error` | `string \| null` | Error message if the command failed, `null` on success |

:::warning
A `success: true` result means the command was delivered to the SMTC session. It does not guarantee that the media source application honored the request. Some applications may ignore or override repeat mode commands.
:::

## Usage

Call `setRepeatMode` when you want to programmatically control loop behavior for the current media session. Common use cases include building custom media control UIs, automating playback behavior, or syncing repeat state across multiple interfaces.

:::tip
To read the current repeat mode without changing it, use [getStatus](get-status.md) and inspect the `repeatMode` field of the returned [MediaStatus](media-status.md) object.
:::

:::note
The repeat mode change is applied to whichever media session the OS considers active. If multiple media sessions exist, this command targets the one currently in the foreground or most recently active.
:::

## Example

::: code-tabs

@tab TypeScript

```typescript
import { setRepeatMode, getStatus } from '@eisland/windows-smtc-helper';

// Set repeat mode to "repeat list" (loop entire playlist)
const result = setRepeatMode(2);
if (result.success) {
  console.log('Repeat mode set to List');
} else {
  console.error('Failed to set repeat mode:', result.error);
}

// Toggle through all repeat modes: None -> Track -> List -> None
const status = getStatus();
if (status.repeatMode !== null) {
  const nextMode = (status.repeatMode + 1) % 3; // Cycle 0 -> 1 -> 2 -> 0
  setRepeatMode(nextMode);
}
```

@tab JavaScript

```js
const { setRepeatMode, getStatus } = require('@eisland/windows-smtc-helper');

// Set repeat mode to "repeat list" (loop entire playlist)
const result = setRepeatMode(2);
if (result.success) {
  console.log('Repeat mode set to List');
} else {
  console.error('Failed to set repeat mode:', result.error);
}

// Toggle through all repeat modes: None -> Track -> List -> None
const status = getStatus();
if (status.repeatMode !== null) {
  const nextMode = (status.repeatMode + 1) % 3; // Cycle 0 -> 1 -> 2 -> 0
  setRepeatMode(nextMode);
}
```

:::

## Notes

:::note
`setRepeatMode` is a synchronous, fire-and-forget command. It does not wait for the media source application to confirm the mode change. Use [getStatus](get-status.md) afterward if you need to verify the resulting state.
:::

:::tip
When building a repeat mode toggle button in your UI, read the current mode with [getStatus](get-status.md), compute the next mode with modulo arithmetic (`(current + 1) % 3`), and then call `setRepeatMode` with the result. This avoids maintaining duplicate state.
:::

:::note
This function interacts with the Windows SMTC subsystem. If no media session is currently active, the command will still return a `CommandResult`, but no actual repeat mode change will occur.
:::

## Danger Avoidance

:::danger
Do not pass values outside the range `0`, `1`, `2` to `setRepeatMode`. Invalid numeric values are forwarded directly to the Windows SMTC API and may cause unexpected behavior in the media source application or be silently ignored.
:::

:::danger
Avoid calling `setRepeatMode` in a tight loop (e.g., rapidly toggling modes in response to user input debouncing failures). Each call sends a system-level IPC command to the media source process. Excessive calls can cause UI lag in the media player or trigger rate limiting by the OS.
:::
