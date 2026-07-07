---
title: AgentPromptRequest
---

# AgentPromptRequest

:::info
Request DTO for the system prompt build endpoint.
:::

## Definition

:::details Source — `MihtnelisAgentController.java`
```java
public record AgentPromptRequest(
    String agentMode,
    Boolean snapshotMode,
    Boolean localMode,
    List<String> workspaces,
    List<SkillEntry> skills
) {}
```
:::

## Fields

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `agentMode` | String | No | `mihtnelis` | Agent mode (`mihtnelis`, `edoc`, `r1pxc`) |
| `snapshotMode` | Boolean | No | `false` | Enable snapshot mode (short responses) |
| `localMode` | Boolean | No | `false` | Enable local mode (no internet access) |
| `workspaces` | List\<String\> | No | `null` | Workspace paths for sandboxing |
| `skills` | List\<SkillEntry\> | No | `null` | User-defined skill injections |

## Used By

- `POST /v1/user/ai/agent/prompt` — [Build System Prompt](../agent-chat-api/prompt.md)
