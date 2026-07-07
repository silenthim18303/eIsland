---
title: Data Types
---

# Data Types

:::info
DTOs, records, message types, and enumerations used across the server-agent module.
:::

## API Request Types

| Type | Description |
|---|---|
| [MihtnelisStreamRequest](./mihtnelis-stream-request.md) | Agent chat stream request |
| [AgentPromptRequest](./agent-prompt-request.md) | System prompt build request |
| [AgentWebAccessResolveRequest](./web-access-resolve-request.md) | Web access authorization |
| [AgentLocalToolAccessResolveRequest](./local-tool-access-resolve-request.md) | Local tool authorization |
| [AgentLocalToolResolveRequest](./local-tool-resolve-request.md) | Local tool result |
| [TranslateRequest](./translate-request.md) | Translation request |
| [ModelPricingRequest](./model-pricing-request.md) | Model pricing upsert |
| [TranslatePricingRequest](./translate-pricing-request.md) | Translation pricing upsert |
| [ServiceEnabledRequest](./service-enabled-request.md) | Service toggle request |
| [GiftBalanceAllRequest](./gift-balance-all-request.md) | Gift balance request |
| [DlqResolveRequest](./dlq-resolve-request.md) | DLQ resolve request |

## MQ Message Types

| Type | Description |
|---|---|
| [AgentBillingDeductMessage](./billing-deduct-message.md) | Billing deduction MQ message |
| [AgentUsageStatsMessage](./usage-stats-message.md) | Usage statistics MQ message |

## Service Result Types

| Type | Description |
|---|---|
| [AgentExecutionResult](./agent-execution-result.md) | Agent orchestration result |
| [ToolInvocationTrace](./tool-invocation-trace.md) | Tool call trace record |
| [ChatRequestOptions](./chat-request-options.md) | Chat gateway request options |
| [ExecutionContext](./execution-context.md) | Tool execution context |
| [AuthResult](./auth-result.md) | STT authentication result |
| [TranslateResult](./translate-result.md) | Translation result |
