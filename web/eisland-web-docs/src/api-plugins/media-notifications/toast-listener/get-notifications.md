---
watermark: true
title: getNotifications
icon: fa6-solid:code
---

# getNotifications

:::info
Returns all current toast notifications as snapshots. Returns an empty array if suppression is enabled.
:::

## Signature

```typescript
function getNotifications(): ToastNotificationSnapshot[]
```

## Return Value

Array of [ToastNotificationSnapshot](toast-notification-snapshot.md) objects.

## Example

```typescript
import { getNotifications } from '@eisland/windows-toast-listener';

const notifications = getNotifications();
console.log(`${notifications.length} notification(s)`);

notifications.forEach(n => {
  console.log(`  [${n.appDisplayName}] ${n.title}: ${n.body}`);
});
```
