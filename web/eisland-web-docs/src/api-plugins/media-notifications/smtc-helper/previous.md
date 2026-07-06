---
watermark: true
title: previous
icon: fa6-solid:code
---

# previous

:::info
Sends a previous-track command to the active SMTC media session. This function triggers Windows System Media Transport Controls to skip to the previous track, functioning identically to pressing the media "previous" key on a keyboard.
:::

## Signature

```typescript
function previous(): CommandResult
```

## Usage

This function is typically used in media control UIs where users want to go back to the previous track. It requires an active SMTC session from a media player (e.g. Spotify, Windows Media Player) to be running on the system.

:::tip
Call [getStatus()](get-status.md) after `previous()` to verify the track change was applied and retrieve updated media metadata.
:::

:::note
The `previous()` command is sent to the system-wide active SMTC session. If multiple media players are running, only the one currently registered as the active session will receive the command.
:::

## Return Value

Returns a [CommandResult](command-result.md) object indicating whether the command was sent successfully.

| Property | Type | Description |
| --- | --- | --- |
| `success` | `boolean` | `true` if the command was dispatched successfully |
| `error` | `string \| null` | Error message if the command failed, `null` on success |

:::warning
A return value of `success: true` only means the command was sent — it does not guarantee the media player actually skipped to the previous track. Some players may ignore the command or have no previous track available.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { previous, getStatus } from '@eisland/windows-smtc-helper';

// Send previous-track command to the active media session
const result = previous();

// Check if the command was dispatched successfully
if (result.success) {
  // Retrieve updated media status after the track change
  const status = getStatus();
  console.log(`Now playing: ${status.title ?? 'Unknown'}`);
} else {
  // Log the error if the command failed
  console.error(`Failed to skip to previous track: ${result.error}`);
}
```

@tab JavaScript

```js
const { previous, getStatus } = require('@eisland/windows-smtc-helper');

// Send previous-track command to the active media session
const result = previous();

// Check if the command was dispatched successfully
if (result.success) {
  // Retrieve updated media status after the track change
  const status = getStatus();
  console.log(`Now playing: ${status.title ?? 'Unknown'}`);
} else {
  // Log the error if the command failed
  console.error(`Failed to skip to previous track: ${result.error}`);
}
```

:::

## Notes

:::note
This function is a fire-and-forget command. There is no callback or promise to indicate when the media player has finished processing the command. Use polling with [getStatus()](get-status.md) or the [SmtcMonitor](smtc-monitor.md) event-driven approach to detect when the track actually changes.
:::

:::tip
If you need to detect track changes reactively rather than polling, consider using the [SmtcMonitor](smtc-monitor.md) class which emits `session-media-changed` events when the active session's track info updates.
:::

## Danger Avoidance

:::danger
Do not call `previous()` in a tight loop or rapid succession. Sending multiple media commands in quick succession can cause unpredictable behavior in media players, such as skipping multiple tracks or becoming unresponsive. Always wait for user interaction or a reasonable debounce interval between commands.
:::

:::danger
Do not assume a media session is active before calling `previous()`. If no media player is running or no session is registered with SMTC, the command will fail. Always check the return value's `success` field — never ignore it.
:::
