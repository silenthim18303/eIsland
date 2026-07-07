---
title: AgentExecutionResult
---

# AgentExecutionResult

:::info
Result DTO from the agent orchestration service. Contains the final answer, token usage, and tool invocation traces.
:::

## Definition

:::details Source — `MihtnelisAgentOrchestratorService.java`
```java
public record AgentExecutionResult(
    String provider,
    String answer,
    boolean proUser,
    List<ToolInvocationTrace> toolInvocations,
    PendingWebAccess pendingWebAccess,
    boolean pausedForWebAccess,
    PendingLocalTool pendingLocalTool,
    boolean pausedForLocalTool,
    String resumeScratchpad,
    int resumeTurn,
    int totalPromptTokens,
    int totalCompletionTokens,
    int totalReasoningTokens,
    int totalCachedTokens
) {}
```
:::

## Fields

| Field | Type | Description |
|---|---|---|
| `provider` | String | AI provider used |
| `answer` | String | Final answer text |
| `proUser` | Boolean | Whether the user has Pro status |
| `toolInvocations` | List\<ToolInvocationTrace\> | Tool call history |
| `pendingWebAccess` | PendingWebAccess | Pending web access request (if paused) |
| `pausedForWebAccess` | Boolean | Whether execution paused for web access |
| `pendingLocalTool` | PendingLocalTool | Pending local tool request (if paused) |
| `pausedForLocalTool` | Boolean | Whether execution paused for local tool |
| `resumeScratchpad` | String | ReAct scratchpad for resuming |
| `resumeTurn` | int | Turn number to resume from |
| `totalPromptTokens` | int | Total prompt tokens consumed |
| `totalCompletionTokens` | int | Total completion tokens generated |
| `totalReasoningTokens` | int | Total reasoning tokens |
| `totalCachedTokens` | int | Total cached input tokens |

## Static Factory Methods

| Method | Description |
|---|---|
| `done(...)` | Create a completed result |
| `paused(...)` | Create a result paused for web access |
| `pausedForLocalTool(...)` | Create a result paused for local tool |

## Used By

- `MihtnelisAgentOrchestratorService.java` — `orchestrate()`
- `MihtnelisAgentStreamService.java` — `openStream()`
