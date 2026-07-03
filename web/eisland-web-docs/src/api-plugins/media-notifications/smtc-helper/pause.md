---
watermark: true
title: pause
icon: fa6-solid:code
---

# pause

:::info
Sends a pause command to the active media session.
:::

## Signature

```typescript
function pause(): CommandResult
```

## Return Value

[CommandResult](command-result.md) indicating success or failure.

## Example

```typescript
import { pause } from '@eisland/windows-smtc-helper';

const result = pause();
if (result.success) {
  console.log('⏸️ Playback paused');
} else {
  console.error(`Pause failed: ${result.error}`);
}
```
