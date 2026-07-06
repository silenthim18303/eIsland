---
watermark: true
title: setPlaybackRate
icon: fa6-solid:code
---

# setPlaybackRate

:::info
`setPlaybackRate` is a command function that adjusts the playback speed of the currently active SMTC (System Media Transport Controls) media session. It sends a playback rate command to the media source application. A rate of `1.0` represents normal speed, values above `1.0` speed up playback, and values below `1.0` slow it down.
:::

## Signature

```typescript
function setPlaybackRate(rate: number): CommandResult
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `rate` | `number` | Playback rate multiplier (`1.0` = normal speed, `2.0` = double speed, `0.5` = half speed) |

:::tip
The rate value is a multiplier relative to normal playback. Common values:
- `0.5` — half speed (slow motion)
- `0.75` — slightly slower
- `1.0` — normal speed
- `1.25` — slightly faster (good for spoken content)
- `1.5` — 1.5x speed
- `2.0` — double speed
:::

:::note
Whether the media source application actually supports variable playback rates depends on the app. If the app does not support rate changes, the returned [CommandResult](command-result.md) will indicate failure. Windows does not enforce a universal rate range — check the result to confirm the command was accepted.
:::

## Return Value

Returns a [CommandResult](command-result.md) object indicating whether the rate change command was successfully sent.

```typescript
// Successful result
{ success: true, error: null }

// Failed result (e.g., no active session or unsupported rate)
{ success: false, error: "..." }
```

:::warning
A `success: true` return only means the command was sent to the media session — it does not guarantee the media source actually applied the new rate. Some applications may silently ignore rate change requests or snap to their own supported rate values.
:::

## Usage

`setPlaybackRate` is used when you want to programmatically control playback speed. This is useful for building custom media control UIs, implementing speed presets, or integrating playback speed into accessibility features.

:::tip
Before calling `setPlaybackRate`, you can use [getStatus](get-status.md) to check the current `playbackRate` value and verify that a media session is active. This avoids sending commands when no media is playing.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { setPlaybackRate, getStatus } from '@eisland/windows-smtc-helper';

// Check if a media session is currently active
const status = getStatus();
if (status.isAvailable) {
  // Set playback speed to 1.5x
  const result = setPlaybackRate(1.5);
  if (result.success) {
    console.log('Playback rate changed to 1.5x');
  } else {
    console.error('Failed to set playback rate:', result.error);
  }
}
```

@tab JavaScript

```js
const { setPlaybackRate, getStatus } = require('@eisland/windows-smtc-helper');

// Check if a media session is currently active
const status = getStatus();
if (status.isAvailable) {
  // Set playback speed to 1.5x
  const result = setPlaybackRate(1.5);
  if (result.success) {
    console.log('Playback rate changed to 1.5x');
  } else {
    console.error('Failed to set playback rate:', result.error);
  }
}
```

:::

## Notes

:::note
The `setPlaybackRate` function interacts with the Windows SMTC subsystem through DLL FFI. It sends the command to whatever media session the OS currently considers active. If multiple media apps are running, the command targets the session that Windows is tracking.
:::

:::tip
If you need to monitor playback rate changes in real time (e.g., to reflect the current speed in your UI), use the [SmtcMonitor](smtc-monitor.md) class and listen to the `session-playback-changed` event. This way you can react when the user changes speed from within the media app itself.
:::

## Danger Avoidance

:::danger
Do not call `setPlaybackRate` with extreme values (e.g., `0` or negative numbers) expecting predictable behavior. A rate of `0` may pause playback or be rejected entirely. Negative values are not supported by SMTC and will likely cause the command to fail. Always stick to positive numeric values.
:::

:::danger
Do not assume `setPlaybackRate` works for all media sources. Some applications (e.g., certain video players or browser-based media) may not support playback rate control via SMTC. Always check the returned `CommandResult` and handle the failure case gracefully — do not ignore the return value.
:::
