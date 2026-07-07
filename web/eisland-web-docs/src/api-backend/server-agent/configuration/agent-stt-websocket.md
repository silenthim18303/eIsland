---
title: Agent Realtime STT WebSocket Config
---

# Agent Realtime STT WebSocket Config

:::info
Registers the real-time speech-to-text WebSocket endpoint.
:::

## Class

`AgentRealtimeSttWebSocketConfig` — `@Configuration`, `@EnableWebSocket`
Implements `WebSocketConfigurer`

## Endpoint

| Path | Handler | Origins |
|---|---|---|
| `/v1/user/ai/stt/realtime` | `AgentRealtimeSttWebSocketHandler` | All (`*`) |

## Handler

The handler is a `BinaryWebSocketHandler` that:
- Validates JWT token from `?token=` query parameter
- Accepts binary frames (audio data) and text frames (JSON control messages)
- Manages STT session lifecycle via `TencentRealtimeAsrRelayService`

:::warning
All origins are allowed (`setAllowedOrigins("*")`). In production, consider restricting to known origins.
:::

## Source

- `AgentRealtimeSttWebSocketConfig.java`
- `AgentRealtimeSttWebSocketHandler.java`
