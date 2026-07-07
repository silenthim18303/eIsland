---
title: Agent Stream Chat
---

# POST /v1/user/ai/agent/stream

:::info
Opens a Server-Sent Events (SSE) stream for AI agent chat. This is the primary endpoint for interacting with the Mihtnelis AI agent.
:::

## Request

**Method:** `POST`
**Path:** `/v1/user/ai/agent/stream`
**Content-Type:** `application/json`
**Authentication:** Required (JWT)

### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `sessionId` | String | Yes | Unique session identifier |
| `message` | String | Yes | User message content |
| `provider` | String | No | AI provider (`deepseek`, `mimo`, `minimax`, `custom`) |
| `model` | String | No | Model name override |
| `agentMode` | String | No | Agent mode (`mihtnelis`, `edoc`, `r1pxc`) |
| `context` | String | No | Additional context for the prompt |
| `workspaces` | String[] | No | Workspace paths for sandboxing |
| `skills` | SkillEntry[] | No | User-defined skill injections |
| `thinking` | Boolean | No | Enable thinking/reasoning output |
| `reasoningEffort` | String | No | Reasoning effort level |
| `timestamp` | String | No | Client timestamp |
| `location` | String | No | Client location |
| `snapshotMode` | Boolean | No | Enable snapshot mode (short responses) |
| `customApiKey` | String | No | Custom API key (when provider is `custom`) |
| `customEndpoint` | String | No | Custom endpoint URL (when provider is `custom`) |

:::details SkillEntry — `SkillEntry.java`
Source: `server-agent/.../MihtnelisAgentStreamService.java`

```java
public record SkillEntry(String name, String content) {}
```
:::

## Response

**Content-Type:** `text/event-stream`

The response is an SSE stream with the following event types:

| Event | Data | Description |
|---|---|---|
| `thinking` | `{reasoning: String}` | Reasoning/thinking content |
| `thinking_delta` | `{reasoning: String}` | Incremental thinking content |
| `chunk` | `{content: String}` | Answer text chunk |
| `tool_call` | `{tool: String, arguments: Map}` | Tool invocation request |
| `todo` | `{items: [{id, content, status}]}` | Todo list update |
| `error` | `{message: String}` | Error message |
| `done` | `{provider, answer, tokenUsage, ...}` | Stream completion |

:::tip
The `done` event includes full token usage statistics: `totalPromptTokens`, `totalCompletionTokens`, `totalReasoningTokens`, `totalCachedTokens`.
:::

## Flow

1. Client opens SSE connection with request body
2. Server pre-checks user balance via `AgentBalanceRedisService`
3. Server orchestrates the agent via `MihtnelisAgentOrchestratorService` (up to 5 ReAct turns)
4. If web access is needed, the stream pauses and emits a `web_access_pending` event
5. If local tool execution is needed, the stream pauses and emits a `local_tool_pending` event
6. On completion, billing is deducted and the `done` event is emitted

:::warning
The stream has a timeout. If the agent exceeds the maximum turn limit (5 turns), it returns the best answer so far.
:::

## Source

- `MihtnelisAgentController.java` — `openStream()`
- `MihtnelisAgentStreamService.java` — `openStream()`
- `MihtnelisAgentOrchestratorService.java` — `orchestrate()`
