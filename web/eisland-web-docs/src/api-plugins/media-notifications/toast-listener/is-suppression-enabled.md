---
watermark: true
title: isSuppressionEnabled
icon: fa6-solid:code
---

# isSuppressionEnabled

:::info
Checks whether toast notification suppression is currently active.
:::

## Signature

```typescript
function isSuppressionEnabled(): boolean
```

## Return Value

`true` if suppression is enabled, `false` otherwise.

```typescript
// Example return value
false
```

## Example

```typescript
import { isSuppressionEnabled, enableSuppression, disableSuppression } from '@eisland/windows-toast-listener';

console.log(`Suppressed: ${isSuppressionEnabled()}`); // false

enableSuppression();
console.log(`Suppressed: ${isSuppressionEnabled()}`); // true

disableSuppression();
console.log(`Suppressed: ${isSuppressionEnabled()}`); // false
```
