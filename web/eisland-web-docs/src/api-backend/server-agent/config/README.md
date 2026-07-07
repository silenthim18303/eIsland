---
title: Configuration
---

# Configuration

:::info
Redis, RabbitMQ, WebSocket, and agent property configurations for the server-agent module.
:::

## Redis Configuration

| Config | Redis DB | Purpose |
|---|---|---|
| [Agent Billing Redis Config](./agent-billing-redis.md) | DB 12 | Billing balance cache |
| [Agent Pricing Redis Config](./agent-pricing-redis.md) | DB 13 | Model pricing cache |
| [Agent Usage Redis Config](./agent-usage-redis.md) | DB 13 | Usage statistics |

## Message Queue Configuration

| Config | Description |
|---|---|
| [Agent Billing MQ Config](./agent-billing-mq.md) | RabbitMQ exchange, queues, and bindings |

## WebSocket Configuration

| Config | Description |
|---|---|
| [Agent Realtime STT WebSocket Config](./agent-stt-websocket.md) | WebSocket endpoint registration |

## Agent Properties

| Config | Description |
|---|---|
| [Mihtnelis Agent Properties](./mihtnelis-agent-properties.md) | LLM provider settings and limits |

## Prompt Builders

| Config | Description |
|---|---|
| [Mihtnelis Prompt Builder](./mihtnelis-prompt-builder.md) | Default AI assistant prompts |
| [Edoc Prompt Builder](./edoc-prompt-builder.md) | Code-focused assistant prompts |
| [R1pxc Prompt Builder](./r1pxc-prompt-builder.md) | Roleplay character prompts |
