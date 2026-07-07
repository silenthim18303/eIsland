---
title: User
---

# User

:::info
Unified user entity consolidating admin and app users into a single `user_account` table, differentiated by the `role` field.
:::

## Overview

Represents all user types in the system. Role-based access control uses the `role` field with three values: `user` (regular), `pro` (premium), and `admin`.

## Role Constants

| Constant | Value | Description |
|---|---|---|
| `ROLE_USER` | `"user"` | Regular user |
| `ROLE_PRO` | `"pro"` | Pro (premium) user |
| `ROLE_ADMIN` | `"admin"` | Administrator |

## Fields

| Field | Type | Description |
|---|---|---|
| `id` | `Long` | Primary key |
| `username` | `String` | Unique username |
| `email` | `String` | Unique email address |
| `password` | `String` | Password hash (BCrypt or legacy SHA-256) |
| `role` | `String` | User role (`user`/`pro`/`admin`) |
| `proExpireAt` | `LocalDateTime` | Pro subscription expiry timestamp |
| `avatar` | `String` | Avatar URL |
| `gender` | `String` | Gender identifier (`male`/`female`/`custom`/`undisclosed`) |
| `genderCustom` | `String` | Custom gender description (when `gender == "custom"`) |
| `birthday` | `LocalDate` | Date of birth |
| `enabled` | `Boolean` | Account enabled flag |
| `sessionToken` | `String` | Current JWT session token |
| `totpSecretCiphertext` | `String` | AES-GCM encrypted TOTP seed (Base64) |
| `totpSecretUpdatedAt` | `LocalDateTime` | Last TOTP seed update time |
| `balanceFen` | `BigDecimal` | Agent balance in fen (8 decimal precision) |
| `createdAt` | `LocalDateTime` | Account creation timestamp |

## Utility Methods

| Method | Return | Description |
|---|---|---|
| `isAdmin()` | `boolean` | Returns `true` if role is `ROLE_ADMIN` |
