---
title: Agent Billing Reconcile Job
---

# Agent Billing Reconcile Job

:::info
Scheduled job for billing reconciliation between Redis and MySQL.
:::

## Overview

The billing reconciliation job runs every 30 minutes to ensure consistency between Redis DB12 balance cache and MySQL user_account.balance_fen.

## Job

| Job | Schedule | Description |
|---|---|---|
| AgentBillingReconcileJob | Every 30 minutes | Compare Redis and MySQL balances, fix discrepancies |

## Reconciliation Logic

- Redis balance should be <= MySQL balance (due to async MQ persistence)
- If Redis > MySQL: MQ may have failed, log warning (don't auto-fix)
- If Redis < MySQL - tolerance: Reset Redis to MySQL value

:::warning
The tolerance threshold is 0.01 fen to account for normal async delay.
:::
