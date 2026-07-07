---
title: STT WebSocket
---

# STT WebSocket

:::info
Real-time speech-to-text WebSocket endpoint at `/v1/user/ai/stt/realtime`. Uses binary WebSocket frames for audio and JSON text frames for control.
:::

## Overview

The STT WebSocket handler provides real-time speech-to-text relay via Tencent Cloud ASR. Audio bytes are streamed from the client to the server, which relays them to Tencent's WebSocket API. Transcription results are streamed back as JSON events.

## Articles

| Article | Description |
|---|---|
| [Realtime STT WebSocket](./realtime-stt.md) | Full WebSocket protocol documentation |

:::warning
This endpoint authenticates via a `token` query parameter (JWT). The token is validated by `AgentRealtimeSttAuthService`.
:::
