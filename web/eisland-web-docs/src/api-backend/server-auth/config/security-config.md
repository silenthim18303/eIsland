---
title: SecurityConfig
---

# SecurityConfig

:::info
Spring `@Configuration` for stateless JWT-based security with CORS, BCrypt password encoding, and a three-filter security chain.
:::

## Overview

Configures the Spring Security filter chain for stateless JWT authentication. All session state is managed via tokens and DB `session_token` validation -- no HTTP Session is used. Enables `@EnableMethodSecurity` for annotation-based authorization.

## Beans

| Bean | Type | Description |
|---|---|---|
| `passwordEncoder` | `BCryptPasswordEncoder` | BCrypt hasher with strength 12 |
| `corsConfigurationSource` | `CorsConfigurationSource` | CORS config from `app.cors.allowed-origin-patterns` |
| `securityFilterChain` | `SecurityFilterChain` | Main security filter chain |

## Filter Chain Order

| Position | Filter | Description |
|---|---|---|
| Before `UsernamePasswordAuthenticationFilter` | `ClientVersionGateFilter` | Enforces client version header on `/v1/user/**` |
| Before `UsernamePasswordAuthenticationFilter` | `JwtAuthenticationFilter` | Parses JWT, validates session, sets `SecurityContext` |
| After `UsernamePasswordAuthenticationFilter` | `ReplayProtectionFilter` | Rejects replayed requests via nonce + timestamp |

## Authorization Rules

| Path Pattern | Method | Access |
|---|---|---|
| `/auth/**` | ALL | Public |
| `/error` | ALL | Public |
| `/v1/version`, `/v1/version/**` | GET | Public |
| `/v1/service-status`, `/v1/service-status/**` | GET | Public |
| `/v1/announcement/current` | GET | Public |
| `/v1/toolbox/software/list` | GET | Public |
| `/v1/payment/wechat/notify`, `/v1/payment/alipay/notify` | POST | Public |
| `/v1/user/ai/stt/realtime` | GET | Public |
| `/v1/toolbox/translate` | POST | USER, PRO, ADMIN |
| `/v1/upload/user-avatar`, `/v1/upload/feedback-log`, `/v1/upload/feedback-screenshot` | POST | USER, PRO, ADMIN |
| `/v1/mini-game/**` | ALL | USER, PRO, ADMIN |
| `/v1/user/**` | ALL | USER, PRO, ADMIN |
| All other paths | ALL | ADMIN only |

## Configuration Properties

| Property | Env / YAML Key | Default | Description |
|---|---|---|---|
| CORS Origins | `app.cors.allowed-origin-patterns` | `*` | Comma-separated allowed origin patterns |

:::warning
CSRF is disabled (stateless API). The password encoder uses BCrypt strength 12 for strong hashing.
:::
