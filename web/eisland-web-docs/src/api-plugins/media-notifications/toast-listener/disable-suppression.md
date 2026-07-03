---
watermark: true
title: disableSuppression
icon: fa6-solid:code
---

# disableSuppression

:::info
Disables toast notification suppression.
:::

## Signature

```typescript
function disableSuppression(): boolean
```

## Return Value

`true` if suppression was disabled, `false` if already disabled.

## Example

```typescript
import { disableSuppression, getNotifications } from '@eisland/windows-toast-listener';

// Restore normal notification behavior
disableSuppression();

const notifs = getNotifications();
console.log(`Notifications: ${notifs.length}`); // actual count
```
