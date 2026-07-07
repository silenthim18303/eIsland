---
title: Agent Billing MQ Config
---

# Agent Billing MQ Config

:::info
RabbitMQ configuration for agent billing async deduction and usage statistics.
:::

## Class

`AgentBillingMqConfig` — `@Configuration`, `@EnableRabbit`

## Exchange

| Name | Type |
|---|---|
| `eisland.agent.billing.exchange` | `DirectExchange` |

## Queues

### Billing Deduction

| Queue | Routing Key | Purpose |
|---|---|---|
| `eisland.agent.billing.deduct.queue` | `eisland.agent.billing.deduct` | Main billing deduction queue |

### Retry Queue

| Queue | Routing Key | TTL | Dead-Letter |
|---|---|---|---|
| `eisland.agent.billing.retry.queue` | `eisland.agent.billing.retry` | 5 seconds | → main queue |

### Dead-Letter Queue

| Queue | Routing Key | Purpose |
|---|---|---|
| `eisland.agent.billing.dlq` | `eisland.agent.billing.dlq` | Failed deductions after 5 retries |

### Usage Statistics

| Queue | Routing Key | Purpose |
|---|---|---|
| `eisland.agent.usage.stats.queue` | `eisland.agent.usage.stats` | Async usage stats persistence |

## Retry Logic

:::details Retry Flow
1. Message consumed from main queue
2. On failure, check `x-agent-billing-retry-count` header
3. If retry count < 5: publish to retry queue (5s TTL → dead-letter back to main)
4. If retry count >= 5: publish to DLQ
5. DLQ consumer persists failed record to `AgentBillingDlqLog` table
:::

## Beans

| Bean | Type | Description |
|---|---|---|
| `agentBillingExchange` | `DirectExchange` | Exchange |
| `agentBillingQueue` | `Queue` | Main billing queue |
| `agentBillingRetryQueue` | `Queue` | Retry queue (5s TTL) |
| `agentBillingDlqQueue` | `Queue` | Dead-letter queue |
| `agentUsageStatsQueue` | `Queue` | Usage stats queue |
| + bindings | `Binding` | Queue-to-exchange bindings |

## Source

- `AgentBillingMqConfig.java`
