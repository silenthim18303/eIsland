---
title: PaymentJob
---

# PaymentJob

:::info
Scheduled compensation tasks for payment order lifecycle management.
:::

## Overview

`PaymentJob` is a Spring `@Component` that runs three periodic scheduled tasks to handle payment order cleanup, reconciliation, and user subscription expiration. It ensures orders that are never completed or expired are properly closed, and that successful payments missed by async notifications are caught via active querying.

## Scheduled Tasks

| Method | Cron | Description |
|---|---|---|
| `closeExpiredOrders()` | `0 * * * * *` (every minute) | Closes orders past their expiration time by calling the payment provider's close API |
| `reconcilePendingByQuery()` | `0 */3 * * * *` (every 3 minutes) | Actively queries payment providers for orders stuck in PAYING status to catch missed notifications |
| `demoteExpiredProUsers()` | `0 */10 * * * *` (every 10 minutes) | Demotes users whose Pro subscription has expired |

## Dependencies

| Dependency | Purpose |
|---|---|
| `PaymentService` | Order close, reconciliation, and DLQ operations |
| `UserService` | Pro user demotion logic |

## Reconciliation Flow

```
1. Query DB for orders in PAYING status created > 2 minutes ago
2. For each order, query the payment provider (WeChat/Alipay)
3. If provider reports SUCCESS → complete the order
4. If provider reports CLOSED → mark order as closed
5. Log and skip on query failures
```

:::tip
The reconciliation job acts as a safety net for missed async payment notifications, ensuring no successful payment goes unprocessed.
:::
