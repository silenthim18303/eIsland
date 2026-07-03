---
watermark: true
title: isListening
icon: fa6-solid:code
---

# isListening

:::info
Checks whether the notification listener is currently active.
:::

## Signature

```typescript
function isListening(): boolean
```

## Return Value

`true` if listening, `false` otherwise.

## Example

```typescript
import { isListening, startListening, stopListening } from '@eisland/windows-toast-listener';

console.log(`Listening: ${isListening()}`); // false

startListening(() => {});
console.log(`Listening: ${isListening()}`); // true

stopListening();
console.log(`Listening: ${isListening()}`); // false
```
