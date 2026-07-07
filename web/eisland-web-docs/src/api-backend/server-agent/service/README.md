---
title: Agent Service Layer
---

# Agent Service Layer

:::info
Core business logic services for the agent module.
:::

## Services

| Service | Description |
|---|---|
| AgentBalanceRedisService | Redis DB12 atomic balance deduction via Lua script |
| AgentModelPricingService | Model pricing CRUD, token-based billing |
| AgentUsageStatsRedisService | Redis Hash usage statistics |
| AgentChatGatewayService | Unified LLM gateway interface |
| LangChain4jChatGatewayService | LangChain4j implementation with streaming |
| AiProviderRouterService | LLM provider routing |
| MihtnelisAgentOrchestratorService | ReAct loop orchestration |
| MihtnelisAgentStreamService | SSE stream management |
| AgentToolExecutionService | Tool dispatcher and execution |
| AgentLocalToolRelayService | Client-local tool relay |
| AgentWebAuthorizationService | URL access authorization |
| AgentRealtimeSttAuthService | STT WebSocket authentication |
| LangChainWorkflowService | Prompt construction |
| TencentRealtimeAsrRelayService | Tencent ASR relay |
| TencentTmtTranslateService | Tencent TMT translation |
| ToolboxTranslatePricingService | Translation pricing CRUD |

## Architecture

The services follow a layered architecture:
- **Redis Services** — Atomic operations with Lua scripts
- **Gateway Services** — LLM provider abstraction
- **Orchestration** — ReAct loop and stream management
- **Tool Services** — Tool execution and relay
- **External Services** — Tencent Cloud integration
