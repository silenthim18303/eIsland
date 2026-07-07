---
title: AgentBillingDlqLog
---

# AgentBillingDlqLog

:::info
Entity recording dead-letter queue (DLQ) entries for failed Agent billing operations that require manual resolution.
:::

## Overview

When an Agent billing deduction message fails all retry attempts and lands in the DLQ, a record is created here for manual investigation and resolution.

## Fields

| Field | Type | Description |
|---|---|---|
| `id` | `Long` | Primary key |
| `username` | `String` | User whose billing failed |
| `amountFen` | `String` | Deduction amount in fen (stored as string for precision) |
| `modelName` | `String` | AI model that triggered the billing |
| `inputTokens` | `Integer` | Input token count for the request |
| `outputTokens` | `Integer` | Output token count for the request |
| `retryCount` | `Integer` | Number of retry attempts before DLQ |
| `lastError` | `String` | Last error message |
| `status` | `String` | Resolution status: `pending`/`resolved`/`ignored` |
| `resolvedBy` | `String` | Admin who resolved the record |
| `resolvedAt` | `LocalDateTime` | Resolution timestamp |
| `createdAt` | `LocalDateTime` | Record creation timestamp |

## Database Table

Corresponds to `agent_billing_dlq_log`.
