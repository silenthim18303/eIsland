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

```typescript
// Example return value
[
  {
    id: 42,
    appUserModelId: 'Microsoft.WindowsTerminal_8wekyb3d8bbwe!App',
    appDisplayName: 'Windows Terminal',
    title: 'Build Complete',
    body: 'Project compiled successfully.',
    texts: ['Build Complete', 'Project compiled successfully.'],
    createdAt: 1719984000000,
  },
]
```

## Example

```typescript
import { getNotifications } from '@eisland/windows-toast-listener';

const notifications = getNotifications();
console.log(`${notifications.length} notification(s)`);

notifications.forEach(n => {
  console.log(`  [${n.appDisplayName}] ${n.title}: ${n.body}`);
});
```
