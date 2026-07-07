---
title: AgentBillingDeductMessage
---

# AgentBillingDeductMessage

:::info
RabbitMQ message DTO for async billing deduction persistence.
:::

## Definition

:::details Source — `AgentBillingDeductMessage.java`
```java
public record AgentBillingDeductMessage(
    String username,
    String amountFen,
    String modelName,
    int inputTokens,
    int outputTokens,
    String lastError
) {
    // Convenience constructor (omits lastError)
    public AgentBillingDeductMessage(
        String username, String amountFen,
        String modelName, int inputTokens, int outputTokens
    ) { this(username, amountFen, modelName, inputTokens, outputTokens, null); }
}
```
:::

## Fields

| Field | Type | Description |
|---|---|---|
| `username` | String | User identifier |
| `amountFen` | String | Amount in fen (8 decimal places) |
| `modelName` | String | AI model identifier |
| `inputTokens` | int | Input tokens consumed |
| `outputTokens` | int | Output tokens generated |
| `lastError` | String | Error message carried during retries |

## Queue

- **Exchange:** `eisland.agent.billing.exchange`
- **Routing Key:** `eisland.agent.billing.deduct`
- **Queue:** `eisland.agent.billing.deduct.queue`
- **Retry:** Up to 5 retries with 5s delay
- **DLQ:** `eisland.agent.billing.dlq`

:::tip
The `amountFen` field is a String to preserve 8 decimal place precision (BigDecimal serialization).
:::

## Source

- `AgentBillingDeductMessage.java`
- `AgentBillingDeductConsumer.java`
