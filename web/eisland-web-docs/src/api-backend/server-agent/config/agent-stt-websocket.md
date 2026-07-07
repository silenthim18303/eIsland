---
title: Agent STT WebSocket Config
---

# Agent STT WebSocket Config

:::info
WebSocket endpoint configuration for real-time speech-to-text.
:::

## Configuration

| Property | Value |
|---|---|
| Endpoint | /v1/user/ai/stt/realtime |
| Auth | Query parameter (token) |
| Audio Format | Binary frames |
| Control | JSON text frames |

## WebSocket Handler

| Component | Description |
|---|---|
| AgentRealtimeSttWebSocketHandler | WebSocket endpoint handler |
| AgentRealtimeSttAuthService | JWT token validation |

## Message Types

| Direction | Type | Format |
|---|---|---|
| Client → Server | Audio bytes | Binary |
| Client → Server | Control commands | JSON text |
| Server → Client | Transcription results | JSON text |
| Server → Client | Status updates | JSON text |

:::warning
The token query parameter is required for authentication. Tokens are validated on connection.
:::
