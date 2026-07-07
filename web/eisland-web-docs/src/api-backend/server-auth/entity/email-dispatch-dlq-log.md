---
title: EmailDispatchDlqLog
---

# EmailDispatchDlqLog

:::info
Persistent entity representing a dead-letter queue log entry for failed email verification code dispatches.
:::

## Overview

`EmailDispatchDlqLog` maps to the email dispatch DLQ log table. Each row records a permanently failed email dispatch attempt, including the trace ID, target email, verification scene, retry count, and error message. Written by `EmailCodeDispatchConsumer.onDeadLetter()`.

## Fields

| Field | Type | Description |
|---|---|---|
| `id` | `Long` | Primary key |
| `traceId` | `String` | Unique trace identifier for the dispatch attempt |
| `email` | `String` | Target email address |
| `scene` | `String` | Verification scene (e.g. `REGISTER`, `LOGIN`) |
| `retryCount` | `Integer` | Number of retry attempts before DLQ |
| `errorMessage` | `String` | Last error message from the failed dispatch |
| `createdAt` | `LocalDateTime` | Log creation timestamp |
