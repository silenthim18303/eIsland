---
title: Realtime STT WebSocket
---

# WebSocket /v1/user/ai/stt/realtime

:::info
Real-time speech-to-text WebSocket endpoint. Relays audio to Tencent Cloud ASR and streams back transcription results.
:::

## Connection

**Endpoint:** `ws://<host>/v1/user/ai/stt/realtime?token=<jwt>`
**Protocol:** WebSocket (binary + text frames)
**Authentication:** JWT token via `token` query parameter

:::warning
The token must be a valid JWT with an active session. The `AgentRealtimeSttAuthService` validates the token on connection.
:::

## Control Messages (JSON Text Frames)

### Client → Server

| Event | Description |
|---|---|
| `stt_start` | Start a new STT session |
| `stt_stop` | Stop the current session |

### Server → Client

| Event | Description |
|---|---|
| `stt_ready` | Session started, ready for audio |
| `stt_partial` | Partial transcription result |
| `stt_final` | Final transcription result |
| `stt_error` | Error occurred |

## Audio Data (Binary Frames)

- Raw audio bytes (PCM format)
- Forwarded directly to Tencent ASR relay
- No framing or header required

## Billing

- **Rate:** 5 fen per minute
- **Deduction:** From `AgentBalanceRedisService` balance
- **Auto-cutoff:** Session stops automatically at 60 seconds

:::details Session Lifecycle
1. Client sends `stt_start` text message
2. Server validates balance and starts Tencent ASR session
3. Server responds with `stt_ready`
4. Client sends binary audio frames
5. Server relays audio to Tencent and forwards `stt_partial`/`stt_final` events
6. Client sends `stt_stop` or session auto-cutoff at 60s
7. Server deducts billing based on session duration
:::

:::note
Only one active STT session is allowed per user. Starting a new session while one is active will return an error.
:::

## Source

- `AgentRealtimeSttWebSocketHandler.java` — WebSocket handler
- `AgentRealtimeSttAuthService.java` — Token authentication
- `TencentRealtimeAsrRelayService.java` — ASR relay
