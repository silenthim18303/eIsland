---
watermark: true
title: stop
icon: fa6-solid:code
---

# stop

:::info
Sends a stop command to the active media session.
:::

## Signature

```typescript
function stop(): CommandResult
```

## Return Value

[CommandResult](command-result.md) indicating success or failure.

## Example

```typescript
import { stop } from '@eisland/windows-smtc-helper';

const result = stop();
if (result.success) {
  console.log('⏹️ Playback stopped');
}
```
