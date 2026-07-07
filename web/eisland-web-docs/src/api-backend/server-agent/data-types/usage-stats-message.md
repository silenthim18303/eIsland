---
title: AgentUsageStatsMessage
---

# AgentUsageStatsMessage

:::info
RabbitMQ message DTO for async usage statistics persistence.
:::

## Definition

:::details Source — `AgentUsageStatsMessage.java`
```java
public record AgentUsageStatsMessage(
    String modelName,
    int inputTokens,
    int cachedTokens,
    int outputTokens,
    int reasoningTokens,
    long costMicroFen
) {}
```
:::

## Fields

| Field | Type | Description |
|---|---|---|
| `modelName` | String | AI model identifier |
| `inputTokens` | int | Input tokens consumed |
| `cachedTokens` | int | Cached input tokens used |
| `outputTokens` | int | Output tokens generated |
| `reasoningTokens` | int | Reasoning tokens |
| `costMicroFen` | long | Cost in micro-fen (1 micro-fen = 0.00000001 fen) |

## Queue

- **Exchange:** `eisland.agent.billing.exchange`
- **Routing Key:** `eisland.agent.usage.stats`
- **Queue:** `eisland.agent.usage.stats.queue`

:::note
This queue has no retry/DLQ mechanism. Failed messages are logged only.
:::

## Source

- `AgentUsageStatsMessage.java`
- `AgentUsageStatsConsumer.java`
