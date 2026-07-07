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
| POST | [/v1/user/ai/agent/stream](./stream.md) | Open SSE stream for AI chat |
| POST | [/v1/user/ai/agent/web-access/resolve](./web-access-resolve.md) | Resolve web access authorization |
| POST | [/v1/user/ai/agent/local-tool/resolve](./local-tool-resolve.md) | Resolve local tool authorization |
| POST | [/v1/user/ai/agent/tool-result](./tool-result.md) | Submit local tool execution result |
| POST | [/v1/user/ai/agent/prompt](./prompt.md) | Build system prompt |

:::tip
The `/stream` endpoint returns Server-Sent Events (SSE). Use `text/event-stream` content type to consume the response.
:::
