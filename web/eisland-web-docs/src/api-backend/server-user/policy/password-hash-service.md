---
title: PasswordHashService
---

# PasswordHashService

:::info
`@Component` providing BCrypt password hashing with backward-compatible SHA-256 verification for legacy accounts.
:::

## Overview

New passwords are hashed with BCrypt via Spring Security's `PasswordEncoder`. For backward compatibility, `matches()` also supports legacy SHA-256 hashes using constant-time comparison to prevent timing attacks. `UserService` automatically upgrades SHA-256 hashes to BCrypt on successful login.

## Methods

| Method | Return | Description |
|---|---|---|
| `hash(rawPassword)` | `String` | Generate BCrypt hash |
| `matches(rawPassword, storedHash)` | `boolean` | Verify password against BCrypt or SHA-256 hash |
| `isBcrypt(storedHash)` | `boolean` | Check if hash starts with `$2a$`, `$2b$`, or `$2y$` |

## Hash Format Detection

| Prefix | Algorithm | Action |
|---|---|---|
| `$2a$`, `$2b$`, `$2y$` | BCrypt | Use `PasswordEncoder.matches()` |
| (other) | SHA-256 (legacy) | SHA-256 the input, then constant-time compare |

## Security Notes

- SHA-256 comparison uses constant-time XOR to prevent timing side-channel attacks
- Legacy SHA-256 hashes are automatically upgraded to BCrypt on successful authentication (handled by `UserService.authenticateUser()`)
- The BCrypt `PasswordEncoder` is injected via Spring Security configuration

## Dependencies

- `PasswordEncoder` (Spring Security) -- BCrypt encoding and matching
