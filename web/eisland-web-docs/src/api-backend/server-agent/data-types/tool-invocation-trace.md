---
title: ToolInvocationTrace
---

# ToolInvocationTrace

:::info
Records a single tool invocation during agent execution.
:::

## Definition

:::details Source — `MihtnelisAgentOrchestratorService.java`
```java
public record ToolInvocationTrace(
    int turn,
    String tool,
    Map<String, Object> arguments,
    boolean success,
    String error,
    Object result
) {}
```
:::

## Fields

| Field | Type | Description |
|---|---|---|
| `turn` | int | ReAct turn number (1-based) |
| `tool` | String | Tool name (e.g., `web.search`, `file.read`) |
| `arguments` | Map\<String, Object\> | Tool arguments |
| `success` | Boolean | Whether the tool execution succeeded |
| `error` | String | Error message (when `success` is `false`) |
| `result` | Object | Tool execution output |

## Used By

- `AgentExecutionResult.toolInvocations` — list of traces
