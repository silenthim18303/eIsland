---
watermark: true
title: previous
icon: fa6-solid:code
---

# previous

:::info
Sends a previous-track command to the active media session.
:::

## Signature

```typescript
function previous(): CommandResult
```

## Return Value

[CommandResult](command-result.md) indicating success or failure.

## Example

```typescript
import { previous, getStatus } from '@eisland/windows-smtc-helper';

const result = previous();
if (result.success) {
  const status = getStatus();
  console.log(`⏮️ Now playing: ${status.title ?? 'Unknown'}`);
}
```
