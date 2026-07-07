---
title: Agent Chat API
---

# Agent Chat API

:::info
User-facing AI agent endpoints under `/v1/user/ai/agent/`. All require JWT authentication.
:::

## Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/v1/user/ai/agent/stream` | Open SSE stream for AI chat |
| POST | `/v1/user/ai/agent/web-access/resolve` | Resolve web access authorization |
| POST | `/v1/user/ai/agent/local-tool/resolve` | Resolve local tool authorization |
| POST | `/v1/user/ai/agent/tool-result` | Submit local tool execution result |
| POST | `/v1/user/ai/agent/prompt` | Build system prompt |

:::tip
The `/stream` endpoint returns Server-Sent Events (SSE). Use `text/event-stream` content type to consume the response.
:::
