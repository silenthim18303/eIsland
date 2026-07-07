---
title: UserMapper
---

# UserMapper

:::info
MyBatis `@Mapper` interface for the unified `user_account` table, covering user CRUD, role management, balance operations, and daily active tracking.
:::

## Overview

Provides all database operations for the `User` entity. Supports query by username, email, or ID; paginated role-based listing; profile updates; Pro subscription management; Agent balance operations; and daily active user statistics.

## Query Methods

| Method | Return | Description |
|---|---|---|
| `selectByUsername(username)` | `User` | Lookup by username |
| `selectByEmail(email)` | `User` | Lookup by email |
| `selectById(id)` | `User` | Lookup by ID |
| `selectByRole(role)` | `List<User>` | List all users by role (null = all), ordered by created_at DESC |
| `selectByRolePage(role, offset, limit)` | `List<User>` | Paginated role query |
| `selectByRolesPage(roles, offset, limit)` | `List<User>` | Paginated multi-role query |
| `countByRole(role)` | `int` | Count users by role |
| `countByRoles(roles)` | `int` | Count users by role set |
| `selectUsersWithPositiveBalance()` | `List<User>` | List users with balance > 0 (for reconciliation) |

## Mutation Methods

| Method | Return | Description |
|---|---|---|
| `insert(user)` | `int` | Create new user |
| `deleteByUsername(username)` | `int` | Delete user by username |
| `updateProfile(username, password, avatar)` | `int` | Update password and avatar |
| `updatePassword(username, password)` | `int` | Update password only |
| `updateAvatar(username, avatar)` | `int` | Update avatar only |
| `updateExtras(username, gender, genderCustom, birthday)` | `int` | Update gender and birthday |
| `updateSessionToken(username, sessionToken)` | `int` | Set or clear session token |
| `updateTotpSecret(username, ciphertext, updatedAt)` | `int` | Update TOTP seed ciphertext |
| `updateRole(username, role)` | `int` | Change user role |
| `updateProExpireAt(username, proExpireAt)` | `int` | Set Pro expiry |
| `demoteExpiredProUsers(now)` | `int` | Batch downgrade expired Pro users |
| `updateEnabled(username, enabled)` | `int` | Enable/disable account |
| `updateEmail(username, email)` | `int` | Change email |

## Balance Methods

| Method | Return | Description |
|---|---|---|
| `deductBalance(username, amountFen)` | `int` | Atomic deduction (only if sufficient balance) |
| `addBalance(username, amountFen)` | `int` | Add to balance |
| `addBalanceForRoles(amountFen, roleUser, rolePro)` | `int` | Batch add balance for role set |
| `setBalanceFen(username, balanceFen)` | `int` | Directly set balance (admin operation) |

## Daily Active Methods

| Method | Return | Description |
|---|---|---|
| `insertDailyActive(username, role, activeDate, activeAt)` | `int` | Record daily active (deduplicated by user+role+date) |
| `countDailyActive(activeDate, role)` | `long` | Count active users for a date |
| `selectDailyActiveRange(startDate, endDate, role)` | `List<UserDailyActiveStat>` | Query date range stats |
| `countNewUsersGroupedByDate(startDate, role)` | `List<Map>` | Daily new user growth by date and role |
