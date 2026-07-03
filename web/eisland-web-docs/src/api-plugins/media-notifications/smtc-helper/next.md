---
watermark: true
title: next
icon: fa6-solid:code
---

# next

:::info
Sends a next-track command to the active media session.
:::

## Signature

```typescript
function next(): CommandResult
```

## Return Value

[CommandResult](command-result.md) indicating success or failure.

```typescript
// Example return value
{ success: true, error: null }
```

## Example

```typescript
import { next, getStatus } from '@eisland/windows-smtc-helper';

const result = next();
if (result.success) {
  const status = getStatus();
  console.log(`⏭️ Now playing: ${status.title ?? 'Unknown'}`);
}
```
