---
title: Agent Utilities
---

# Agent Utilities

:::info
Utility classes for the agent module.
:::

## Utilities

| Utility | Description |
|---|---|
| AgentIpUtils | IP address sanitization and normalization |
| AgentJsonUtils | JSON repair and safe serialization |
| AgentStreamChunkUtils | Text splitting for SSE streaming |
| AgentStringUtils | String trimming and normalization |
| AgentToolUtils | Tool implementations (weather, web search, etc.) |

## Key Functions

### AgentIpUtils
- `sanitizeIp(value)` — Clean and normalize IP addresses

### AgentJsonUtils
- `repairLiteralNewlinesInStrings(json)` — Fix unescaped newlines in JSON strings
- `toSafeJson(objectMapper, obj, maxLength)` — Safe JSON serialization with length limit

### AgentStreamChunkUtils
- `splitForStreaming(text)` — Split text into chunks for SSE streaming

### AgentStringUtils
- `trimToEmpty(value)` — Trim string, return empty if null
- `trimToDefault(value, default)` — Trim string, return default if null/blank
- `lowerTrim(value)` — Lowercase and trim

### AgentToolUtils
- Weather queries, web search, IP geolocation, time, session context
