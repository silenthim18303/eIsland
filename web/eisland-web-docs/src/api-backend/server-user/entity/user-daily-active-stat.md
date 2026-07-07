---
title: UserDailyActiveStat
---

# UserDailyActiveStat

:::info
Entity representing a daily active user statistics data point.
:::

## Overview

A lightweight DTO returned by daily active user queries. Each instance represents the active user count for a specific date.

## Fields

| Field | Type | Description |
|---|---|---|
| `statDate` | `LocalDate` | The date being measured |
| `activeCount` | `Long` | Number of unique active users on that date |
