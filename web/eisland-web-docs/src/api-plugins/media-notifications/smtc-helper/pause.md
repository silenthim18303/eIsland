---
watermark: true
title: pause
icon: fa6-solid:code
---

# pause

:::info
Sends a pause command to the active media session on Windows via the System Media Transport Controls (SMTC) interface. This function instructs the currently playing media source (such as Spotify, Windows Media Player, or a browser tab) to pause playback. It returns a [CommandResult](command-result.md) indicating whether the command was delivered successfully.
:::

## Signature

```typescript
function pause(): CommandResult
```

The function takes no parameters. It targets whichever media session is currently active in the system-level SMTC. The return type [CommandResult](command-result.md) contains a `success` boolean and an optional `error` string.

## Usage

Call `pause()` whenever you need to programmatically pause the user's current media playback. Common scenarios include:

- Pausing music when the user enters a meeting or launches a fullscreen application
- Building custom media control widgets that mirror the Windows media overlay
- Integrating media pause into keyboard shortcut or gesture-based workflows

:::tip
If you need to know the current playback state before deciding whether to pause, call [getStatus](get-status.md) first and check the `playbackStatus` field. This avoids sending a redundant pause command when media is already paused or stopped.
:::

:::note
`pause()` targets the **active** SMTC session. If multiple media sources are running (e.g., a browser video and Spotify), the command goes to whichever session the system considers active. Use the [SmtcMonitor](smtc-monitor.md) class to enumerate and manage multiple sessions if needed.
:::

## Return Value

Returns a [CommandResult](command-result.md) object:

| Field   | Type              | Description                                      |
|---------|-------------------|--------------------------------------------------|
| `success` | `boolean`       | `true` if the pause command was sent successfully |
| `error`   | `string \| null` | Error message if the command failed, otherwise `null` |

:::warning
A return value of `{ success: true, error: null }` means the command was **delivered** to the SMTC session, not that the media has actually paused. Some media sources may ignore or delay the command. Check the playback status afterwards via [getStatus](get-status.md) if you need confirmation.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { pause, getStatus } from '@eisland/windows-smtc-helper';

// Send a pause command to the active media session
const result = pause();

// Check if the command was delivered successfully
if (result.success) {
  console.log('Pause command sent successfully');
} else {
  // Log the error message returned by the native layer
  console.error(`Pause command failed: ${result.error}`);
}

// Optionally verify the media actually paused
const status = getStatus();
if (status.isAvailable && status.playbackStatus === 'paused') {
  console.log('Media is now paused');
}
```

@tab JavaScript

```js
const { pause, getStatus } = require('@eisland/windows-smtc-helper');

// Send a pause command to the active media session
const result = pause();

// Check if the command was delivered successfully
if (result.success) {
  console.log('Pause command sent successfully');
} else {
  // Log the error message returned by the native layer
  console.error(`Pause command failed: ${result.error}`);
}

// Optionally verify the media actually paused
const status = getStatus();
if (status.isAvailable && status.playbackStatus === 'paused') {
  console.log('Media is now paused');
}
```

:::

## Notes

:::note
The `pause()` function is synchronous. It sends the command to the Windows SMTC layer and returns immediately. There is no async await required and no promise to handle.
:::

:::tip
If you are building a UI toggle that switches between play and pause, consider pairing `pause()` with [play](play.md) and checking [getStatus](get-status.md) to determine which action to trigger. This gives users a consistent experience regardless of the underlying media source.
:::

:::note
If no media session is active (no app is playing audio or video), the function will still return a [CommandResult](command-result.md). The `success` field reflects whether the native command dispatch succeeded, which may be `false` with an appropriate error message when no active session exists.
:::

## Danger Avoidance

:::danger
Do not call `pause()` in a tight loop or on a rapid timer. Repeatedly sending SMTC commands in quick succession can cause unexpected behavior in media applications, such as the media toggling between play and pause states rapidly. Space commands by at least a few hundred milliseconds, or use a debounce pattern in your application logic.
:::

:::danger
This function interacts with the system-level Windows SMTC infrastructure. On some Windows configurations or in restricted environments (such as sandboxed processes or systems with certain Group Policy restrictions), the native command dispatch may fail silently or return `success: false`. Always check the return value and handle errors gracefully rather than assuming the pause took effect.
:::
