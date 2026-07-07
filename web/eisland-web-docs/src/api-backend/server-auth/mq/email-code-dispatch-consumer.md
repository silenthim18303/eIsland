---
title: EmailCodeDispatchConsumer
---

# EmailCodeDispatchConsumer

:::info
RabbitMQ consumer that dispatches verification code emails via Resend with retry and dead-letter queue support.
:::

## Overview

Listens on the main dispatch queue and DLQ. The main listener validates the message scene, calls `ResendEmailService` to send the email, and routes failures to the retry queue or DLQ based on retry count. The DLQ listener persists permanently failed messages to MySQL via `EmailVerificationService.logDispatchDlq()`.

## Main Queue Processing (`onMessage`)

1. **Validation** -- Rejects messages with null/invalid scene (ack and drop)
2. **Email Dispatch** -- Calls `ResendEmailService.sendVerificationCode()`
3. **On Success** -- Logs dispatch completion
4. **On Failure** -- Routes to retry or DLQ via `routeToRetryOrDlq()`

## DLQ Processing (`onDeadLetter`)

- Persists a `EmailDispatchDlqLog` record with trace ID, email, scene, retry count, and last error
- Logs the DLQ entry

## Retry Routing

| Condition | Action |
|---|---|
| `retryCount < emailNotifyMaxRetries` | Route to retry queue (TTL-based delay) |
| `retryCount >= emailNotifyMaxRetries` | Route to DLQ |

## Retry Message

On failure, the consumer creates a new `EmailCodeDispatchMessage` with the error message appended as `lastError` and sets the `x-email-retry-count` header to `nextRetry`.

## Configuration

| Property | Default | Description |
|---|---|---|
| `email.notify-max-retries` | `3` | Maximum retry attempts before DLQ |

## Dependencies

- `ResendEmailService` -- actual email sending
- `EmailVerificationService` -- DLQ log persistence
- `RabbitTemplate` -- retry/DLQ message routing

---

## EmailCodeDispatchMessage

:::info
Java `record` representing an email verification code dispatch message in the RabbitMQ queue.
:::

### Fields

| Field | Type | Description |
|---|---|---|
| `traceId` | `String` | Unique trace identifier |
| `email` | `String` | Target email address |
| `scene` | `String` | Verification scene (e.g. `REGISTER`, `LOGIN`) |
| `code` | `String` | Plain-text verification code |
| `createdAtEpochSeconds` | `long` | Message creation timestamp (seconds) |
| `lastError` | `String` | Last error message (null on first attempt) |

### Constructors

| Constructor | Description |
|---|---|
| `EmailCodeDispatchMessage(traceId, email, scene, code, createdAtEpochSeconds)` | Initial dispatch (lastError = null) |
| `EmailCodeDispatchMessage(traceId, email, scene, code, createdAtEpochSeconds, lastError)` | Retry dispatch with error info |
