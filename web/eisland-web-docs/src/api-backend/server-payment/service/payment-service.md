---
title: PaymentService
---

# PaymentService

:::info
Core payment service handling order creation, completion, reconciliation, and pricing management.
:::

## Overview

`PaymentService` is the central orchestrator for the payment module. It manages the full order lifecycle from creation through payment completion, handles Redis-based deduplication and locking, coordinates with WeChat Pay and Alipay SDK clients, dispatches receipt emails via MQ, and maintains pricing configuration with a Redis-then-DB cache strategy.

## Product Codes

| Constant | Value | Description |
|---|---|---|
| `PRODUCT_PRO_MONTH` | `PRO_MONTH` | Pro monthly subscription |
| `PRODUCT_AGENT_RECHARGE` | `AGENT_RECHARGE` | Agent balance recharge |
| `PRODUCT_TEST_PAY` | `TEST_PAY` | Admin test payment |

## Order Creation Methods

| Method | Description |
|---|---|
| `createProMonthOrder(username)` | Create Pro month order with default WeChat channel |
| `createProMonthOrder(username, channel)` | Create Pro month order with specified channel |
| `createProMonthOrder(username, channel, receiptEmail)` | Create Pro month order with receipt email |
| `createAgentRechargeOrder(username, channel, amountFen, receiptEmail)` | Create agent balance recharge order |
| `createAdminTestOrder(username, channel, amountFen, subject)` | Create admin test order |

## Order Lifecycle Methods

| Method | Description |
|---|---|
| `findOrder(outTradeNo)` | Look up order by merchant order number |
| `refreshOrderIfNeeded(order)` | Query payment provider to refresh stale PAYING orders |
| `completeOrderIfPending(channel, outTradeNo, ...)` | Mark order as SUCCESS and grant entitlements |
| `closeOrderForUser(username, outTradeNo)` | User-initiated order close |
| `adminCloseOrder(outTradeNo)` | Admin-initiated order close |

## Scheduled Operations

| Method | Description |
|---|---|
| `closeExpiredOrders()` | Close all expired PAYING orders (batch) |
| `reconcilePendingByQuery()` | Query providers for pending orders created > 2 min ago |

## Pricing Management

| Method | Description |
|---|---|
| `getProMonthAmountFen()` | Get current Pro month price (Redis cache → DB → memory fallback) |
| `setProMonthAmountFen(amount)` | Update Pro month price |
| `getFreePlanDesc()` / `setFreePlanDesc(value)` | Get/set free plan description |
| `getProPlanDesc()` / `setProPlanDesc(value)` | Get/set Pro plan description |
| `getFreePlanFeatures()` / `setFreePlanFeatures(features)` | Get/set free plan feature list |
| `getProPlanFeatures()` / `setProPlanFeatures(features)` | Get/set Pro plan feature list |

## Order Number Format

```
EI + ChannelCode + Username(8 chars max) + UUID(18 chars)
```

| Channel | ChannelCode | Example |
|---|---|---|
| WeChat | W | EIWSMITH1234567890AB |
| Alipay | A | EIASMITH1234567890AB |

## Concurrency Control

- **Order creation**: Redis `SETNX` lock per user with 15s TTL prevents duplicate orders
- **Order operations**: Redis `SETNX` lock per `outTradeNo` with 15s TTL prevents concurrent modifications
- **Notify deduplication**: Redis `SETNX` per channel+order+transaction with 30-day TTL prevents duplicate completions
- **Active order binding**: Redis key per user ensures only one active PAYING order exists

:::warning
All order mutations use distributed Redis locks to ensure thread-safety across multiple server instances.
:::
