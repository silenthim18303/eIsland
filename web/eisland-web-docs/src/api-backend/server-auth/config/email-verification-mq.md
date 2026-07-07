---
title: EmailVerificationMqConfig
---

# EmailVerificationMqConfig

:::info
Spring `@Configuration` that declares the RabbitMQ exchange, queues, and bindings for asynchronous email verification code dispatch.
:::

## Overview

Configures a durable `DirectExchange` with three queues: a main dispatch queue, a retry queue (with configurable TTL dead-lettering back to the main queue), and a dead-letter queue (DLQ) for permanently failed messages. Uses `JacksonJsonMessageConverter` for JSON serialization.

## Constants

| Constant | Value | Description |
|---|---|---|
| `EMAIL_CODE_EXCHANGE` | `eisland.email.verify.exchange` | Direct exchange name |
| `EMAIL_CODE_QUEUE` | `eisland.email.verify.dispatch.queue` | Main dispatch queue |
| `EMAIL_CODE_ROUTING_KEY` | `eisland.email.verify.dispatch` | Main queue routing key |
| `EMAIL_CODE_RETRY_QUEUE` | `eisland.email.verify.retry.queue` | Retry queue |
| `EMAIL_CODE_RETRY_ROUTING_KEY` | `eisland.email.verify.retry` | Retry routing key |
| `EMAIL_CODE_DLQ` | `eisland.email.verify.dlq` | Dead-letter queue |
| `EMAIL_CODE_DLQ_ROUTING_KEY` | `eisland.email.verify.dlq` | DLQ routing key |
| `EMAIL_RETRY_HEADER` | `x-email-retry-count` | Header tracking retry attempts |

## Retry Strategy

| Parameter | Env / YAML Key | Default | Description |
|---|---|---|---|
| Retry Delay | `email.notify-retry-delay-ms` | `10000` | TTL (ms) on retry queue before dead-lettering back to main |
| Max Retries | `email.notify-max-retries` | `3` | Enforced by `EmailCodeDispatchConsumer` |

## Beans

- `emailCodeExchange` -- durable, non-auto-delete `DirectExchange`
- `emailCodeQueue` -- durable main dispatch queue
- `emailCodeRetryQueue` -- durable retry queue with TTL and DLX
- `emailCodeDlqQueue` -- durable dead-letter queue
- Three `Binding` beans wiring exchange to queues
- `rabbitJsonMessageConverter` -- `JacksonJsonMessageConverter` for JSON serialization
- `rabbitTemplate` -- `RabbitTemplate` configured with JSON converter
- `rabbitAdmin` -- `RabbitAdmin` for automatic queue/exchange declaration
