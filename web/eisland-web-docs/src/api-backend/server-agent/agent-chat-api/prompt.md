---
title: Build System Prompt
---

# POST /v1/user/ai/agent/prompt

:::info
Builds and returns the system prompt for the AI agent. Used by the client to display or inspect the current agent configuration.
:::

## Request

**Method:** `POST`
**Path:** `/v1/user/ai/agent/prompt`
**Content-Type:** `application/json`
**Authentication:** Required (JWT)

### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `agentMode` | String | No | Agent mode (`mihtnelis`, `edoc`, `r1pxc`). Default: `mihtnelis` |
| `snapshotMode` | Boolean | No | Enable snapshot mode (short responses) |
| `localMode` | Boolean | No | Enable local mode (no internet access) |
| `workspaces` | String[] | No | Workspace paths for sandboxing |
| `skills` | SkillEntry[] | No | User-defined skill injections |

:::details SkillEntry — `SkillEntry.java`
Source: `server-agent/.../MihtnelisAgentStreamService.java`

```java
public record SkillEntry(String name, String content) {}
```
:::

## Response

```json
{
  "success": true,
  "systemPrompt": "You are Mihtnelis, the eIsland AI assistant..."
}
```

| Field | Type | Description |
|---|---|---|
| `success` | Boolean | Whether the prompt was built successfully |
| `systemPrompt` | String | The generated system prompt |
| `error` | String | Error message (when `success` is `false`) |

:::details Agent Modes
- **mihtnelis** — Default eIsland AI assistant with full tool access
- **edoc** — Code-focused programming assistant ("vibe coding" partner)
- **r1pxc** — Roleplay character with tsundere personality
:::

## Source

- `MihtnelisAgentController.java` — `buildPrompt()`
- `LangChainWorkflowService.java` — `buildSystemPrompt()`
