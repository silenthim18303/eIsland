---
title: MihtnelisStreamRequest
---

# MihtnelisStreamRequest

:::info
Request DTO for the agent chat stream endpoint.
:::

## Definition

:::details Source — `MihtnelisAgentStreamService.java`
```java
public record MihtnelisStreamRequest(
    String sessionId,
    String message,
    String provider,
    String model,
    String agentMode,
    String context,
    List<String> workspaces,
    List<SkillEntry> skills,
    Boolean thinking,
    String reasoningEffort,
    String timestamp,
    String location,
    Boolean snapshotMode,
    String customApiKey,
    String customEndpoint
) {}
```
:::

## Fields

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `sessionId` | String | Yes | — | Unique session identifier |
| `message` | String | Yes | — | User message content |
| `provider` | String | No | `null` | AI provider override |
| `model` | String | No | `null` | Model name override |
| `agentMode` | String | No | `mihtnelis` | Agent mode (`mihtnelis`, `edoc`, `r1pxc`) |
| `context` | String | No | `null` | Additional context for the prompt |
| `workspaces` | List\<String\> | No | `null` | Workspace paths for sandboxing |
| `skills` | List\<SkillEntry\> | No | `null` | User-defined skill injections |
| `thinking` | Boolean | No | `null` | Enable thinking/reasoning output |
| `reasoningEffort` | String | No | `null` | Reasoning effort level |
| `timestamp` | String | No | `null` | Client timestamp |
| `location` | String | No | `null` | Client location |
| `snapshotMode` | Boolean | No | `null` | Enable snapshot mode |
| `customApiKey` | String | No | `null` | Custom API key |
| `customEndpoint` | String | No | `null` | Custom endpoint URL |

## Used By

- `POST /v1/user/ai/agent/stream` — [Agent Stream Chat](../agent-chat-api/stream.md)
