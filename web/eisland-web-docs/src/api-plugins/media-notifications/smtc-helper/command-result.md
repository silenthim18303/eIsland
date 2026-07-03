---
watermark: true
title: CommandResult
icon: fa6-solid:table
---

# CommandResult

:::info
Result of a media control command execution.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `success` | `boolean` | Whether the command succeeded |
| `error` | `string \| null` | Error message if failed, `null` on success |

## Example

```typescript
import { play, pause, next } from '@eisland/windows-smtc-helper';

const result = play();
if (result.success) {
  console.log('Playback started');
} else {
  console.error(`Command failed: ${result.error}`);
}

// Chain commands
const nextResult = next();
if (!nextResult.success) {
  console.error(`Next failed: ${nextResult.error}`);
}
```
