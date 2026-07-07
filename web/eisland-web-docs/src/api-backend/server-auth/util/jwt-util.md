---
title: JwtUtil
---

# JwtUtil

:::info
`@Component` for JWT token generation, parsing, and validation using HMAC-SHA signing via the JJWT library.
:::

## Overview

Provides JWT operations for the authentication subsystem. Generates tokens with username (subject) and role claims, parses claims from tokens, and validates token integrity and expiry. Uses HMAC-SHA key derived from a configurable secret.

## Key Methods

| Method | Description | Returns |
|---|---|---|
| `generateToken(username)` | Generate JWT with default `"user"` role | `String` token |
| `generateToken(username, role)` | Generate JWT with specified role | `String` token |
| `getUsernameFromToken(token)` | Extract username (subject) from token | `String` |
| `getRoleFromToken(token)` | Extract role claim (defaults to `"user"`) | `String` |
| `validateToken(token)` | Check if token is valid (signature + expiry) | `boolean` |

## Token Claims

| Claim | Type | Description |
|---|---|---|
| `sub` | `String` | Username (subject) |
| `role` | `String` | User role (e.g. `"user"`, `"admin"`) |
| `iat` | `Date` | Issued at timestamp |
| `exp` | `Date` | Expiration timestamp |

## Configuration Properties

| Property | Env / YAML Key | Default | Description |
|---|---|---|---|
| Secret | `jwt.secret` | (required) | HMAC signing key |
| Expiration | `jwt.expiration` | (required) | Token TTL in milliseconds |

## Dependencies

- JJWT library (`io.jsonwebtoken`)
