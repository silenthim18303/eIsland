---
title: UserService
---

# UserService

:::info
Centralized `@Service` for user authentication, registration, profile management, role adjustments, Agent balance operations, and daily active tracking.
:::

## Overview

`UserService` is the single entry point for all user-domain business logic. It handles login (by username or email), password hash upgrades (SHA-256 to BCrypt on successful login), registration, profile CRUD, Pro subscription lifecycle, Agent balance management, and daily active user statistics.

## Key Methods

### Authentication

| Method | Description |
|---|---|
| `authenticate(account, password)` | Try username first, then email; returns `User` or `null` |
| `authenticateByUsername(username, password)` | Authenticate by username; auto-upgrades legacy SHA-256 to BCrypt |
| `authenticateByEmail(email, password)` | Authenticate by email; auto-upgrades legacy SHA-256 to BCrypt |

### Registration & Queries

| Method | Description |
|---|---|
| `register(username, email, password, role)` | Register a new user; returns `null` on username/email conflict |
| `getByUsername(username)` | Lookup by username |
| `getById(id)` | Lookup by ID |
| `getByEmail(email)` | Lookup by email |
| `getAvatarByUsername(username)` | Cached avatar URL lookup (Redis DB1) |

### Profile Updates

| Method | Description |
|---|---|
| `updateProfile(username, rawPassword, avatar)` | Update password and avatar; evicts avatar cache |
| `updatePassword(username, rawPassword)` | Update password only |
| `updateAvatar(username, avatar)` | Update avatar only; evicts avatar cache |
| `updateExtras(username, gender, genderCustom, birthday)` | Update extended profile fields |
| `updateSessionToken(username, sessionToken)` | Set or clear session JWT |
| `updateTotpSecret(username, ciphertext)` | Store AES-GCM encrypted TOTP seed |
| `updateRole(username, role)` | Change user role |
| `updateEnabled(username, enabled)` | Enable/disable account |
| `updateEmail(username, email)` | Change email |

### Pro Subscription

| Method | Description |
|---|---|
| `grantProOneMonth(username)` | Extend Pro by one calendar month; auto-grants 10 yuan Agent bonus; publishes `ProBalanceGrantEvent` |
| `updateProExpireAt(username, proExpireAt)` | Directly set Pro expiry |
| `demoteExpiredProUsers(now)` | Batch downgrade expired Pro users to regular role |

### Agent Balance

| Method | Description |
|---|---|
| `addAgentBalance(username, amountFen)` | Recharge Agent balance (fen); publishes event |
| `getAgentBalanceYuan(username)` | Query balance in yuan (string) |
| `setBalanceFen(username, balanceFen)` | Admin: directly set balance |
| `addBalanceForAllAppUsers(amountFen)` | Batch grant balance to all user/pro roles |

### Daily Active

| Method | Description |
|---|---|
| `recordDailyActive(username, role)` | Record one active event per user per day |
| `countDailyActive(activeDate, role)` | Count active users for a date |
| `listDailyActiveRange(startDate, endDate, role)` | Query daily active stats for a date range |
| `listDailyGrowth(startDate, role)` | Query daily new user growth |

## Constants

| Constant | Value | Description |
|---|---|---|
| `PRO_AGENT_BONUS_FEN` | `1000` | Agent balance bonus (10 yuan) granted on Pro activation |

## Cache Integration

- Avatar lookups use `@Cacheable(cacheNames = "avatar-data", cacheManager = "avatarCacheManager")`.
- Avatar-evicting mutations use `@CacheEvict` on the same cache.

## Dependencies

- `UserMapper` -- data access
- `PasswordHashService` -- BCrypt hashing and legacy SHA-256 validation
- `ApplicationEventPublisher` -- publishes `ProBalanceGrantEvent`
