---
watermark: true
title: stopListening
icon: fa6-solid:code
---

# stopListening

:::info
Stops listening for notification changes.
:::

## Signature

```typescript
function stopListening(): boolean
```

## Return Value

`true` if listening was stopped, `false` if not currently listening.

```typescript
// Example return value
true
```

## Example

```typescript
import { stopListening } from '@eisland/windows-toast-listener';

const stopped = stopListening();
console.log(stopped ? 'Stopped listening' : 'Was not listening');
```
