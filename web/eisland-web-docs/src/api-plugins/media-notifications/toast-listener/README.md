---
watermark: true
title: Windows Toast Listener
icon: bell
---

# Windows Toast Listener

`@eisland/windows-toast-listener` · v26.0.0

:::info
Toast notification listening and suppression via C++ N-API native addon.
:::

## API Reference

| Type | Name | Description |
|------|------|-------------|
| Type | [ToastAccessStatus](toast-access-status.md) | Notification access status |
| Type | [ToastNotificationChangeKind](toast-notification-change-kind.md) | Notification change type |
| Interface | [ToastNotificationChangedEvent](toast-notification-changed-event.md) | Notification change event |
| Interface | [ToastNotificationSnapshot](toast-notification-snapshot.md) | Notification data snapshot |
| Function | [requestAccess](request-access.md) | Request notification access |
| Function | [getAccessStatus](get-access-status.md) | Check access status |
| Function | [getNotifications](get-notifications.md) | Get all current notifications |
| Function | [startListening](start-listening.md) | Start event-driven listening |
| Function | [stopListening](stop-listening.md) | Stop listening |
| Function | [isListening](is-listening.md) | Check listening state |
| Function | [enableSuppression](enable-suppression.md) | Enable toast suppression |
| Function | [disableSuppression](disable-suppression.md) | Disable toast suppression |
| Function | [isSuppressionEnabled](is-suppression-enabled.md) | Check suppression state |
