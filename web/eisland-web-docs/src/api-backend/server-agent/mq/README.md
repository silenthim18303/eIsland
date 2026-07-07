---
title: Agent Message Queue
---

# Agent Message Queue

:::info
RabbitMQ consumers for billing deduction and usage statistics.
:::

## Consumers

| Consumer | Queue | Description |
|---|---|---|
| AgentBillingDeductConsumer | agent.billing.deduct | Persist billing deductions to MySQL |
| AgentUsageStatsConsumer | agent.usage.stats | Persist usage statistics to MySQL |

## Message Types

| Message | Description |
|---|---|
| AgentBillingDeductMessage | Billing deduction details (username, amount, model, tokens) |
| AgentUsageStatsMessage | Usage statistics (model, tokens, cost) |

## Retry Policy

- Max retries: 5
- Failed messages are routed to retry queue with incremented retry count
- After max retries, messages enter DLQ and are persisted to agent_billing_dlq_log table

:::warning
DLQ entries should be monitored and resolved manually via the admin API.
:::
