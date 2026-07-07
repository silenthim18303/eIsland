---
title: AuthResult
---

# AuthResult

:::info
Result of STT WebSocket authentication.
:::

## Definition

:::details Source — `AgentRealtimeSttAuthService.java`
```java
public record AuthResult(
    boolean success,
    String username,
    String message
) {}
```
:::

## Fields

| Field | Type | Description |
|---|---|---|
| `success` | Boolean | Whether authentication succeeded |
| `username` | String | Authenticated username (when `success` is `true`) |
| `message` | String | Error message (when `success` is `false`) |

## Validation

The authentication performs:
1. JWT token parsing and validation
2. Role verification (must have valid role)
3. User enabled check
4. Session token validation

## Used By

- `AgentRealtimeSttWebSocketHandler` — WebSocket auth
- `AgentRealtimeSttAuthService.authenticate()`
