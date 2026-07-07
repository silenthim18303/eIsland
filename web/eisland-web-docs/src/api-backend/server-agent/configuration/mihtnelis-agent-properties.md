---
title: Mihtnelis Agent Properties
---

# Mihtnelis Agent Properties

:::info
Externalized configuration properties for the Mihtnelis AI agent LLM providers and settings.
:::

## Class

`MihtnelisAgentProperties` — `@ConfigurationProperties(prefix = "mihtnelis.agent")`

## Top-Level Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `mihtnelis.agent.default-provider` | String | `deepseek` | Default AI provider |
| `mihtnelis.agent.allowed-providers` | String[] | `[deepseek, mimo, minimax]` | Allowed provider list |
| `mihtnelis.agent.max-input-chars` | int | `8000` | Max input characters (16–32768) |

## LLM Gateway

| Property | Type | Default | Description |
|---|---|---|---|
| `mihtnelis.agent.llm.gateway` | String | `spring-ai` | LLM gateway implementation (`spring-ai`, `langchain4j`) |

## Provider Configuration

Each provider (`deepseek`, `mimo`, `minimax`) has:

| Property | Type | Description |
|---|---|---|
| `enabled` | Boolean | Whether the provider is active |
| `baseUrl` | String | API base URL |
| `apiKey` | String | API key |
| `model` | String | Model name |
| `thinking` | Boolean | Enable thinking mode |
| `reasoningEffort` | String | Reasoning effort level (default: `medium`) |

:::details Example Configuration
```yaml
mihtnelis:
  agent:
    default-provider: deepseek
    allowed-providers:
      - deepseek
      - mimo
      - minimax
    max-input-chars: 8000
    llm:
      gateway: spring-ai
      deepseek:
        enabled: true
        base-url: https://api.deepseek.com
        api-key: ${DEEPSEEK_API_KEY}
        model: deepseek-chat
        thinking: false
        reasoning-effort: medium
```
:::

## OSS Vector Storage

| Property | Type | Default | Description |
|---|---|---|---|
| `mihtnelis.agent.oss-vector.enabled` | Boolean | `true` | Enable OSS vector storage |
| `mihtnelis.agent.oss-vector.endpoint` | String | — | OSS endpoint |
| `mihtnelis.agent.oss-vector.access-key-id` | String | — | OSS access key ID |
| `mihtnelis.agent.oss-vector.access-key-secret` | String | — | OSS access key secret |
| `mihtnelis.agent.oss-vector.bucket-name` | String | — | OSS bucket name |
| `mihtnelis.agent.oss-vector.domain` | String | — | OSS domain |

## Source

- `MihtnelisAgentProperties.java`
- `MihtnelisAgentConfiguration.java`
