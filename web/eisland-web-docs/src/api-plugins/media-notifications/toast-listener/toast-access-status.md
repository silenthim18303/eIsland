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
