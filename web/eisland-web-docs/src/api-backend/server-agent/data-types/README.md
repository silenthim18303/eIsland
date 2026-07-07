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
| MihtnelisStreamRequest | Agent chat stream request |
| AgentPromptRequest | System prompt build request |
| AgentWebAccessResolveRequest | Web access authorization |
| AgentLocalToolAccessResolveRequest | Local tool authorization |
| AgentLocalToolResolveRequest | Local tool result |
| TranslateRequest | Translation request |
| ModelPricingRequest | Model pricing upsert |
| TranslatePricingRequest | Translation pricing upsert |
| ServiceEnabledRequest | Service toggle request |
| GiftBalanceAllRequest | Gift balance request |
| DlqResolveRequest | DLQ resolve request |

## MQ Message Types

| Type | Description |
|---|---|
| AgentBillingDeductMessage | Billing deduction MQ message |
| AgentUsageStatsMessage | Usage statistics MQ message |

## Service Result Types

| Type | Description |
|---|---|
| AgentExecutionResult | Agent orchestration result |
| ToolInvocationTrace | Tool call trace record |
| ChatRequestOptions | Chat gateway request options |
| ExecutionContext | Tool execution context |
| AuthResult | STT authentication result |
| TranslateResult | Translation result |
