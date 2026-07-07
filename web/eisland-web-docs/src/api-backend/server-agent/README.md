---
title: Server Agent
icon: robot
---

# Server Agent

:::info
The `server-agent` module provides AI agent capabilities for the eIsland platform, including chat completions, real-time speech-to-text, translation tools, billing, and admin management.
:::

## Overview

The server-agent module is the core AI service module of eisland-server. It exposes REST APIs and WebSocket endpoints for:

- **Agent Chat** — streaming AI chat with tool-calling, web access authorization, and local tool relay
- **Admin Agent Management** — model pricing, service toggle, billing DLQ, usage statistics
- **Admin TMT Management** — translation pricing and monthly quota management
- **Toolbox** — translation tool for end users
- **Realtime STT** — WebSocket-based speech-to-text relay via Tencent ASR

:::tip
All admin endpoints require `ROLE_ADMIN` authorization. User endpoints require valid JWT authentication.
:::

## Module Structure

| Layer | Description |
|---|---|
| [Agent Chat API](./agent-chat-api/) | User-facing AI agent endpoints |
| [Admin Agent API](./admin-agent-api/) | Agent billing and model management |
| [Admin TMT API](./admin-tmt-api/) | Translation service management |
| [Toolbox API](./toolbox-api/) | Translation tool endpoint |
| [STT WebSocket](./stt-websocket/) | Real-time speech-to-text WebSocket |
| [Data Types](./data-types/) | DTOs, records, and message types |
| [Configuration](./configuration/) | Redis, MQ, WebSocket, and prompt configs |
