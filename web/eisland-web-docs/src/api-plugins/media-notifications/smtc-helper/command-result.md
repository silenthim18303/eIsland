---
watermark: true
title: CommandResult
icon: fa6-solid:table
---

# CommandResult

:::info Introduction
`CommandResult` is the standard return type for all media control command functions in `@eisland/windows-smtc-helper`. Every command that sends an instruction to the Windows System Media Transport Controls (SMTC) — such as play, pause, seek, or shuffle — returns this interface to indicate whether the operation succeeded or failed.
:::

## Interface Introduction

The `CommandResult` interface provides a uniform way to check the outcome of any media control command. You will encounter this type as the return value of the following functions:

- [play()](./play.md)
- [pause()](./pause.md)
- [next()](./next.md)
- [previous()](./previous.md)
- [stop()](./stop.md)
- [seek()](./seek.md)
- [setShuffle()](./set-shuffle.md)
- [setRepeatMode()](./set-repeat-mode.md)
- [setPlaybackRate()](./set-playback-rate.md)

:::tip Checking Results
Always check the `success` property before assuming a command took effect. A command can fail silently — for example, calling `next()` when there is no active media session will return `{ success: false, error: '...' }` without throwing an exception.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `success` | `boolean` | `true` if the command was executed successfully, `false` otherwise. |
| `error` | `string \| null` | A human-readable error message when `success` is `false`. `null` when the command succeeded. |

:::note Error Handling
When `success` is `true`, the `error` field is guaranteed to be `null`. When `success` is `false`, `error` contains a descriptive string explaining the failure — for example, `"No active media session"` or `"Invalid parameter"`.
:::

## Usage

All media control commands in the SMTC helper return a `CommandResult`. The typical workflow is:

1. Call a command function (e.g. `play()`, `seek()`, `setShuffle()`).
2. Check the returned `success` field.
3. If `false`, read the `error` field for diagnostics.

:::tip Batch Operations
When chaining multiple commands, check each result independently. A failed `pause()` does not prevent a subsequent `next()` from succeeding — each command is evaluated against the current system state.
:::

:::note Synchronous Execution
All command functions that return `CommandResult` are **synchronous**. They block until the SMTC command is dispatched to the system. This means you do not need `await` or `.then()` — the result is available immediately after the call.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { play, pause, next, seek, setShuffle, setRepeatMode } from '@eisland/windows-smtc-helper';
import type { CommandResult } from '@eisland/windows-smtc-helper';

// Helper function to handle command results uniformly
function handleResult(commandName: string, result: CommandResult): void {
  if (result.success) {
    // Command succeeded — error is null
    console.log(`${commandName} succeeded`);
  } else {
    // Command failed — error contains the reason
    console.error(`${commandName} failed: ${result.error}`);
  }
}

// Send a play command and check the result
handleResult('play', play());

// Send a pause command
handleResult('pause', pause());

// Skip to the next track
handleResult('next', next());

// Seek to 30 seconds into the track
const seekResult: CommandResult = seek(30);
if (seekResult.success) {
  console.log('Seeked to 30 seconds');
} else {
  console.error(`Seek failed: ${seekResult.error}`);
}

// Enable shuffle mode
handleResult('setShuffle', setShuffle(true));

// Set repeat mode: 0 = None, 1 = Track, 2 = List
handleResult('setRepeatMode', setRepeatMode(2));
```

@tab JavaScript

```js
const { play, pause, next, seek, setShuffle, setRepeatMode } = require('@eisland/windows-smtc-helper');

// Helper function to handle command results uniformly
function handleResult(commandName, result) {
  if (result.success) {
    // Command succeeded — error is null
    console.log(`${commandName} succeeded`);
  } else {
    // Command failed — error contains the reason
    console.error(`${commandName} failed: ${result.error}`);
  }
}

// Send a play command and check the result
handleResult('play', play());

// Send a pause command
handleResult('pause', pause());

// Skip to the next track
handleResult('next', next());

// Seek to 30 seconds into the track
const seekResult = seek(30);
if (seekResult.success) {
  console.log('Seeked to 30 seconds');
} else {
  console.error(`Seek failed: ${seekResult.error}`);
}

// Enable shuffle mode
handleResult('setShuffle', setShuffle(true));

// Set repeat mode: 0 = None, 1 = Track, 2 = List
handleResult('setRepeatMode', setRepeatMode(2));
```

:::

## Notes

:::note Null Error on Success
The `error` field is explicitly typed as `string | null`. On success it is always `null`, never an empty string. You can safely use `result.error` directly in error messages without additional null guards when you have already checked `result.success === false`.
:::

:::tip Lightweight Result Object
`CommandResult` is a plain object with no methods or hidden state. It is safe to pass around, store in variables, or collect into arrays for deferred inspection without worrying about references or lifecycle.
:::

:::note No Exceptions Thrown
Command functions return a `CommandResult` instead of throwing exceptions on failure. This means you will not see unhandled promise rejections or try/catch blocks — all errors are captured in the `error` field. This design makes error handling explicit and predictable.
:::

## Danger Avoidance

:::danger Ignoring the Result
Never call a command function without checking its return value. Commands like `next()` or `seek()` can fail when no media session is active or when the media app does not support that operation. Ignoring the result can lead to a confusing UI state where the user believes an action was taken but nothing happened.
:::

:::danger Assuming Success Based on Previous State
Do not assume a command will succeed just because a previous command in the same session succeeded. The media session may be closed, the active app may change, or the user may have switched tracks between calls. Always check each `CommandResult` independently.
:::
