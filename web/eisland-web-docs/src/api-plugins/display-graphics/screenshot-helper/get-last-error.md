---
watermark: true
title: getLastError
icon: fa6-solid:code
---

# getLastError

:::info
Retrieves the last error message from the Native AOT DLL. This function calls `sc_get_last_error` via koffi FFI to return a human-readable error string describing why the most recent capture operation failed. Returns an empty string if no error has occurred.
:::

## Signature

```typescript
function getLastError(): string;
```

## Parameters

This function takes no parameters.

## Usage

The `getLastError` function is used to diagnose capture failures. It is part of the Screenshot Helper plugin.

Typical workflow:

1. Call [capturePrimaryDisplayPng](capture-primary-display-png.md) and check if the result is `null`.
2. If `null`, call `getLastError()` to retrieve the error description.
3. Log or display the error message for debugging.

:::note
The error message is set internally by the DLL when `sc_capture_primary_display_png` encounters an exception. It is stored in a static field and persists until the next capture attempt.
:::

:::tip
Always call `getLastError` immediately after a failed capture. The error state may be overwritten by subsequent DLL calls.
:::

## Return Value

| Type | Description |
|------|-------------|
| `string` | The last error message, or an empty string if no error |

Returns a UTF-8 string describing the last error. Returns an empty string `""` if no error has occurred since the last capture.

:::warning
The returned string is freed after the call completes in some FFI configurations. If you need to retain the value, copy it to a JavaScript string variable immediately (which happens automatically in normal usage).
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { capturePrimaryDisplayPng, getLastError } from '@eisland/windows-screenshot-helper';

const result = capturePrimaryDisplayPng();

if (!result) {
  const error: string = getLastError();
  console.error(`Screenshot capture failed: ${error}`);
} else {
  console.log(`Capture succeeded: ${result.size} bytes`);
}
```

@tab JavaScript

```js
const { capturePrimaryDisplayPng, getLastError } = require('@eisland/windows-screenshot-helper');

const result = capturePrimaryDisplayPng();

if (!result) {
  const error = getLastError();
  console.error(`Screenshot capture failed: ${error}`);
} else {
  console.log(`Capture succeeded: ${result.size} bytes`);
}
```

:::

## Notes

:::note
This function calls `sc_get_last_error` via koffi FFI, which returns the content of a static `lastError` string field inside the DLL. The field is set when `sc_capture_primary_display_png` catches an exception.
:::

:::tip
When building error-handling logic, pair this function with [capturePrimaryDisplayPng](capture-primary-display-png.md) — always attempt the capture first, then check the error only if it returns `null`.
:::

:::important
The error message is stored per-DLL-load, not per-thread. In multi-threaded scenarios, the error from the most recent failed capture across all threads will be returned.
:::

## Danger Avoidance

:::danger
Do not call `getLastError` speculatively without first attempting a capture. If no capture has been attempted, the function returns an empty string — this is not an error condition, just the absence of a prior error.
:::
