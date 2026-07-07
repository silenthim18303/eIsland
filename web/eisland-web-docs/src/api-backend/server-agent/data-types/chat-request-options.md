---
title: ChatRequestOptions
---

# ChatRequestOptions

:::info
Options for configuring the AI chat gateway request.
:::

## Definition

:::details Source — `AgentChatGatewayService.java`
```java
public record ChatRequestOptions(
    boolean thinkingEnabled,
    String reasoningEffort,
    String model,
    String customApiKey,
    String customEndpoint
) {}
```
:::

## Fields

| Field | Type | Description |
|---|---|---|
| `thinkingEnabled` | Boolean | Enable thinking/reasoning output |
| `reasoningEffort` | String | Reasoning effort level |
| `model` | String | Model name override |
| `customApiKey` | String | Custom API key (for `custom` provider) |
| `customEndpoint` | String | Custom endpoint URL |

## Used By

- `AgentChatGatewayService.chat()` — all overloads
- `LangChain4jChatGatewayService` — implementation
