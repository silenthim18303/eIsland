---
watermark: true
title: ToastAccessStatus
icon: fa6-solid:list
---

# ToastAccessStatus

:::info
Status of Windows notification listener access permission.
:::

## Values

| Value | Description |
|-------|-------------|
| `"unspecified"` | Access status not yet determined |
| `"allowed"` | Access granted — notifications can be read |
| `"denied"` | Access denied by user or policy |
| `"unknown"` | Unable to determine access status |

:::warning
Access must be granted before calling [startListening()](start-listening.md). Use [requestAccess()](request-access.md) to prompt the user.
:::

## Example

```typescript
import { getAccessStatus, requestAccess, ToastAccessStatus } from '@eisland/windows-toast-listener';

// Check without prompting
let status = getAccessStatus();
if (status === 'unspecified') {
  // Prompt user for permission
  status = requestAccess();
}

if (status === 'allowed') {
  console.log('Notification access granted');
} else {
  console.log(`Access denied: ${status}`);
}
```
