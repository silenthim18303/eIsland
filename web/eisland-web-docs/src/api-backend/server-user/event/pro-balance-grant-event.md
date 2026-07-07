---
title: ProBalanceGrantEvent
---

# ProBalanceGrantEvent

:::info
Spring `ApplicationEvent` published when Agent balance is granted or modified, signaling downstream services to invalidate cached balance data.
:::

## Overview

Published by `UserService` after any balance-modifying operation: Pro activation (monthly bonus), manual recharge, admin balance set, or batch balance grant. Consumed by `AgentBalanceRedisService` to clear the user's cached balance in Redis.

## Fields

| Field | Type | Description |
|---|---|---|
| `source` | `Object` | Event source (typically the `UserService` instance) |
| `username` | `String` | Username whose balance was modified |

## Methods

| Method | Return | Description |
|---|---|---|
| `getUsername()` | `String` | Get the affected username |

## Publishers

- `UserService.grantProOneMonth()` -- after granting Pro bonus
- `UserService.addAgentBalance()` -- after manual recharge
- `UserService.setBalanceFen()` -- after admin balance set

## Consumers

- `AgentBalanceRedisService` -- invalidates cached balance in Redis
