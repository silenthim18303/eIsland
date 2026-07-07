---
title: Agent Billing MQ Config
---

# Agent Billing MQ Config

:::info
RabbitMQ configuration for billing and usage message queues.
:::

## Exchange

| Property | Value |
|---|---|
| Exchange | agent.billing.exchange |
| Type | Topic |

## Queues

| Queue | Routing Key | Description |
|---|---|---|
| agent.billing.deduct | agent.billing.deduct | Billing deduction |
| agent.billing.deduct.retry | agent.billing.deduct.retry | Retry queue |
| agent.billing.deduct.dlq | agent.billing.deduct.dlq | Dead letter queue |
| agent.usage.stats | agent.usage.stats | Usage statistics |

## Message Flow

```
Producer → Exchange → Queue → Consumer
                ↓
        Retry Queue (on failure)
                ↓
        DLQ (after max retries)
```

:::warning
DLQ messages are persisted to MySQL for manual resolution.
:::
