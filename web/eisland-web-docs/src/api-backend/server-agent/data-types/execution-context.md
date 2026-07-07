---
title: ExecutionContext
---

# ExecutionContext

:::info
Context passed to tool execution for user identification and event observation.
:::

## Definition

:::details Source — `AgentToolExecutionService.java`
```java
public record ExecutionContext(
    String username,
    String clientIp,
    ToolExecutionObserver toolExecutionObserver
) {}
```
:::

## Fields

| Field | Type | Description |
|---|---|---|
| `username` | String | Authenticated user identifier |
| `clientIp` | String | Client IP address |
| `toolExecutionObserver` | ToolExecutionObserver | Observer for tool events |

## ToolExecutionObserver Interface

```java
public interface ToolExecutionObserver {
    void onToolCallRequested(String tool, Map<String, Object> args, String riskLevel);
    void onToolCallCompleted(String tool, boolean success, Object result, String error);
    void onThinking(int count, String reasoning);
    void onThinkingDelta(String delta, boolean isThinking);
    void onContentDelta(String delta, boolean isThinking);
    void onContentReset();
    void onTodoUpdate(List<Map<String, Object>> items);
}
```

## Used By

- `AgentToolExecutionService.execute()` — tool dispatch
- `MihtnelisAgentOrchestratorService.orchestrate()` — orchestration
