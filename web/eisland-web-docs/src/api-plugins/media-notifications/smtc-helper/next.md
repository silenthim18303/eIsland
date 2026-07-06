---
watermark: true
title: next
icon: fa6-solid:code
---

# next

:::info
Sends a next-track command to the active Windows SMTC (System Media Transport Controls) media session. This function is a convenience wrapper that tells the currently active media source to skip to the next track in its playlist or queue.
:::

## Signature

```typescript
function next(): CommandResult
```

## Usage

The `next()` function is a fire-and-forget command. Call it when the user wants to skip the current track. It operates on whichever media session Windows considers active — you do not need to identify the source app yourself.

Typical workflow:

1. Call `next()` to issue the skip command.
2. Check the returned [CommandResult](command-result.md) to confirm the command was accepted.
3. Optionally call [getStatus](get-status.md) afterward to read the updated media metadata.

:::tip
If you are building a UI with a next-track button, you can optimistically update the UI and then reconcile with the actual state by listening to `session-media-changed` events on the [SmtcMonitor](smtc-monitor.md) instead of polling `getStatus()`.
:::

:::note
The command is sent to the **active** media session. If multiple apps are playing media, Windows determines which session is active. Use [SmtcMonitor](smtc-monitor.md) to observe all sessions and identify the source.
:::

## Return Value

A [CommandResult](command-result.md) object indicating whether the command was accepted by the system.

| Field   | Type      | Description                                          |
| ------- | --------- | ---------------------------------------------------- |
| `success` | `boolean` | `true` if the command was delivered successfully.    |
| `error`   | `string \| null` | A human-readable error message, or `null` on success. |

:::warning
A `success: true` return does **not** guarantee that the track actually changed. The media app may be at the end of its playlist, or it may ignore the command. Call [getStatus](get-status.md) or listen for `session-media-changed` events to verify the actual state.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { next, getStatus } from '@eisland/windows-smtc-helper';

// Send the next-track command to the active media session
const result = next();

// Check if the command was accepted
if (result.success) {
  // Read the updated media status
  const status = getStatus();
  // Display the new track title, or 'Unknown' if unavailable
  console.log(`Now playing: ${status.title ?? 'Unknown'}`);
} else {
  // Log the error if the command failed
  console.error(`Skip failed: ${result.error}`);
}
```

@tab JavaScript

```js
const { next, getStatus } = require('@eisland/windows-smtc-helper');

// Send the next-track command to the active media session
const result = next();

// Check if the command was accepted
if (result.success) {
  // Read the updated media status
  const status = getStatus();
  // Display the new track title, or 'Unknown' if unavailable
  console.log(`Now playing: ${status.title ?? 'Unknown'}`);
} else {
  // Log the error if the command failed
  console.error(`Skip failed: ${result.error}`);
}
```

:::

## Notes

:::note
This function communicates with the Windows SMTC subsystem via a native addon. It does **not** require elevated privileges, but it only works on Windows 10 (build 17763+) and later where SMTC is available.
:::

:::note
If no media session is currently active (no app is playing or has played media), the command will likely return `success: false` with an appropriate error message. Always check the return value.
:::

:::tip
For scenarios where you only need the current playback position (e.g., lyric synchronization), prefer [getTimestamp](get-timestamp.md) over [getStatus](get-status.md) — it is lighter because it omits media metadata like title, artist, and album art.
:::

## Danger Avoidance

:::danger
Do **not** call `next()` in a tight loop or spam it rapidly. Each call sends a system-level command to the active media app. Rapid repeated calls may cause the media app to behave unpredictably or become unresponsive. Debounce user input (e.g., button clicks) to at least 200-300 ms between invocations.
:::

:::danger
Do **not** assume the return value of `next()` reflects the final playback state. The command is asynchronous from the media app's perspective — the track change may not be immediate. Always verify by reading [getStatus](get-status.md) or subscribing to [SmtcMonitor](smtc-monitor.md) events before updating your UI with new track information.
:::
